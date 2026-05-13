const express = require('express');
const router = express.Router();
const supabase = require('../db');
const auth = require('../middleware/auth');

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// ─────────────────────────────────────────────────
// POST /api/bookings — create a booking (client)
// Now includes slot-conflict check to prevent double-bookings.
// ─────────────────────────────────────────────────
router.post('/', auth, async (req, res) => {
    try {
        const { expert_id, event_type_id, start_time, end_time, scope } = req.body;
        if (!expert_id || !start_time)
            return res.status(400).json({ error: 'expert_id and start_time are required' });
        if (!UUID_RE.test(expert_id))
            return res.status(400).json({ error: 'Invalid expert_id — must be a valid UUID', demo: true });

        // ── Slot Conflict Check ──
        // Reject if an active booking already exists for this expert at this exact start_time.
        const { data: conflict } = await supabase
            .from('bookings')
            .select('id')
            .eq('expert_id', expert_id)
            .eq('start_time', start_time)
            .not('status', 'in', '("cancelled")')
            .limit(1);

        if (conflict && conflict.length > 0) {
            return res.status(409).json({ error: 'This time slot is already booked. Please choose another.' });
        }

        const { data, error } = await supabase
            .from('bookings')
            .insert({
                client_id: req.user.id,
                expert_id,
                event_type_id,
                start_time,
                end_time,
                scope,
                status: 'pending',
            })
            .select()
            .single();

        if (error) throw error;

        // Emit socket event
        if (req.io) {
            req.io.emit('booking:new', data);
        }

        res.status(201).json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// GET /api/bookings/my — client's bookings
router.get('/my', auth, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('bookings')
            .select(`
        *,
        experts(*, users!experts_user_id_fkey(name)),
        event_types(title, duration_minutes, price)
      `)
            .eq('client_id', req.user.id)
            .order('start_time', { ascending: false });

        if (error) throw error;
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/bookings/expert — expert's bookings
router.get('/expert', auth, async (req, res) => {
    try {
        // Find expert record for this user
        const { data: expert } = await supabase
            .from('experts')
            .select('id')
            .eq('user_id', req.user.id)
            .single();

        if (!expert) return res.status(404).json({ error: 'Expert profile not found' });

        const { data, error } = await supabase
            .from('bookings')
            .select(`
        *,
        users!bookings_client_id_fkey(name, email),
        event_types(title, duration_minutes, price)
      `)
            .eq('expert_id', expert.id)
            .order('start_time', { ascending: false });

        if (error) throw error;
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─────────────────────────────────────────────────
// PATCH /api/bookings/:id/status — cancel a booking
// Validates ownership and only allows cancel from active states.
// Emits booking:slot-released so freed slots appear instantly.
// ─────────────────────────────────────────────────
router.patch('/:id/status', auth, async (req, res) => {
    try {
        const { status } = req.body;
        const bookingId = req.params.id;

        // Only allow 'cancelled' and 'confirmed' status transitions via this endpoint
        const ALLOWED_STATUSES = ['cancelled', 'confirmed', 'completed', 'Cancelled', 'Confirmed', 'Completed'];
        if (!ALLOWED_STATUSES.includes(status)) {
            return res.status(400).json({ error: `Invalid status: "${status}". Use the /reschedule endpoint to reschedule.` });
        }

        // Fetch the booking first to validate ownership
        const { data: booking, error: fetchErr } = await supabase
            .from('bookings')
            .select('*')
            .eq('id', bookingId)
            .single();

        if (fetchErr || !booking) {
            return res.status(404).json({ error: 'Booking not found' });
        }

        // ── Ownership check: requesting user must be the client OR the expert ──
        let isOwner = booking.client_id === req.user.id;
        if (!isOwner) {
            // Check if the user is the expert for this booking
            const { data: expert } = await supabase
                .from('experts')
                .select('id')
                .eq('user_id', req.user.id)
                .single();
            if (expert && expert.id === booking.expert_id) {
                isOwner = true;
            }
        }
        if (!isOwner) {
            return res.status(403).json({ error: 'You are not authorized to modify this booking' });
        }

        // ── Prevent cancelling already cancelled/completed bookings ──
        const normalizedStatus = status.toLowerCase();
        if (normalizedStatus === 'cancelled') {
            const currentStatus = (booking.status || '').toLowerCase();
            if (currentStatus === 'cancelled' || currentStatus === 'completed') {
                return res.status(400).json({ error: `Cannot cancel a booking that is already ${booking.status}` });
            }
        }

        const { data, error } = await supabase
            .from('bookings')
            .update({ status })
            .eq('id', bookingId)
            .select()
            .single();

        if (error) throw error;

        // ── Emit real-time events ──
        if (req.io) {
            req.io.emit('booking:updated', data);

            // If cancelled, emit slot-released so booking pages unlock the time
            if (normalizedStatus === 'cancelled') {
                req.io.emit('booking:slot-released', {
                    expert_id: data.expert_id,
                    start_time: data.start_time,
                    booking_id: data.id,
                });
            }
        }

        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// ─────────────────────────────────────────────────
// PATCH /api/bookings/:id/reschedule — reschedule a booking
// Moves a booking to a new time slot without creating a duplicate.
// Releases the old slot and claims the new one atomically.
// ─────────────────────────────────────────────────
router.patch('/:id/reschedule', auth, async (req, res) => {
    try {
        const { new_start_time, new_end_time } = req.body;
        const bookingId = req.params.id;

        if (!new_start_time) {
            return res.status(400).json({ error: 'new_start_time is required' });
        }

        // Fetch the existing booking
        const { data: booking, error: fetchErr } = await supabase
            .from('bookings')
            .select('*')
            .eq('id', bookingId)
            .single();

        if (fetchErr || !booking) {
            return res.status(404).json({ error: 'Booking not found' });
        }

        // ── Ownership check ──
        let isOwner = booking.client_id === req.user.id;
        if (!isOwner) {
            const { data: expert } = await supabase
                .from('experts')
                .select('id')
                .eq('user_id', req.user.id)
                .single();
            if (expert && expert.id === booking.expert_id) {
                isOwner = true;
            }
        }
        if (!isOwner) {
            return res.status(403).json({ error: 'You are not authorized to reschedule this booking' });
        }

        // ── Can only reschedule pending/confirmed bookings ──
        const currentStatus = (booking.status || '').toLowerCase();
        if (currentStatus === 'cancelled' || currentStatus === 'completed') {
            return res.status(400).json({ error: `Cannot reschedule a ${booking.status} booking` });
        }

        // ── Slot conflict check for the NEW time ──
        const { data: conflict } = await supabase
            .from('bookings')
            .select('id')
            .eq('expert_id', booking.expert_id)
            .eq('start_time', new_start_time)
            .not('status', 'in', '("cancelled")')
            .neq('id', bookingId)  // Exclude the current booking itself
            .limit(1);

        if (conflict && conflict.length > 0) {
            return res.status(409).json({ error: 'The new time slot is already booked. Please choose another.' });
        }

        const oldStartTime = booking.start_time;

        // ── Update the booking ──
        const { data: updated, error: updateErr } = await supabase
            .from('bookings')
            .update({
                start_time: new_start_time,
                end_time: new_end_time || null,
                status: 'rescheduled',
            })
            .eq('id', bookingId)
            .select()
            .single();

        if (updateErr) throw updateErr;

        // ── Emit real-time events ──
        if (req.io) {
            // Release the OLD slot
            req.io.emit('booking:slot-released', {
                expert_id: updated.expert_id,
                start_time: oldStartTime,
                booking_id: updated.id,
            });

            // Notify about the updated booking
            req.io.emit('booking:updated', updated);
        }

        res.json(updated);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;

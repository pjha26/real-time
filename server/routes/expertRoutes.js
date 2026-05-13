const express = require('express');
const router = express.Router();
const supabase = require('../db');
const auth = require('../middleware/auth');

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// GET /api/experts — list all experts
router.get('/', async (req, res) => {
    try {
        const { specialty, search } = req.query;

        let query = supabase
            .from('experts')
            .select(`
        *,
        users!experts_user_id_fkey(id, name, email)
      `);

        if (specialty) {
            query = query.contains('specialty', [specialty]);
        }

        if (search) {
            query = query.or(`bio.ilike.%${search}%,users.name.ilike.%${search}%`);
        }

        const { data, error } = await query;
        if (error) throw error;

        // Format response
        const experts = data.map(e => ({
            id: e.id,
            user_id: e.user_id,
            name: e.users?.name,
            email: e.users?.email,
            bio: e.bio,
            specialty: e.specialty || [],
            match_score: e.match_score,
            avatar_url: e.avatar_url,
            hourly_rate: e.hourly_rate,
            availability: e.availability,
            timezone: e.timezone || 'UTC',
            buffer_minutes: e.buffer_minutes || 0,
        }));

        res.json(experts);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// GET /api/experts/:id
router.get('/:id', async (req, res) => {
    try {
        // Guard: must be a UUID
        if (!UUID_RE.test(req.params.id)) {
            return res.status(404).json({ error: 'Expert not found' });
        }
        const { data, error } = await supabase
            .from('experts')
            .select(`
        *,
        users!experts_user_id_fkey(id, name, email),
        event_types(*)
      `)
            .eq('id', req.params.id)
            .single();

        if (error || !data) return res.status(404).json({ error: 'Expert not found' });

        res.json({
            id: data.id,
            user_id: data.user_id,
            name: data.users?.name,
            email: data.users?.email,
            bio: data.bio,
            specialty: data.specialty || [],
            match_score: data.match_score,
            avatar_url: data.avatar_url,
            hourly_rate: data.hourly_rate,
            availability: data.availability,
            timezone: data.timezone || 'UTC',
            buffer_minutes: data.buffer_minutes || 0,
            blocked_dates: data.blocked_dates || [],
            event_types: data.event_types || [],
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// ─────────────────────────────────────────────────
// GET /api/experts/:id/availability — get expert's weekly schedule
// ─────────────────────────────────────────────────
router.get('/:id/availability', async (req, res) => {
    try {
        if (!UUID_RE.test(req.params.id)) {
            return res.status(404).json({ error: 'Expert not found' });
        }

        const { data, error } = await supabase
            .from('expert_availability')
            .select('*')
            .eq('expert_id', req.params.id)
            .order('day_of_week', { ascending: true });

        if (error) throw error;

        // Also fetch expert's timezone, buffer, and blocked dates
        const { data: expert } = await supabase
            .from('experts')
            .select('timezone, buffer_minutes, blocked_dates')
            .eq('id', req.params.id)
            .single();

        res.json({
            schedule: data || [],
            timezone: expert?.timezone || 'UTC',
            buffer_minutes: expert?.buffer_minutes || 0,
            blocked_dates: expert?.blocked_dates || [],
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─────────────────────────────────────────────────
// PUT /api/experts/:id/availability — set expert's weekly schedule
// Expects: { schedule: [{ day_of_week, start_hour, end_hour, is_active }] }
// ─────────────────────────────────────────────────
router.put('/:id/availability', auth, async (req, res) => {
    try {
        const expertId = req.params.id;
        const { schedule } = req.body;

        if (!schedule || !Array.isArray(schedule)) {
            return res.status(400).json({ error: 'schedule array is required' });
        }

        // Verify the requesting user owns this expert profile
        const { data: expert } = await supabase
            .from('experts')
            .select('user_id')
            .eq('id', expertId)
            .single();

        if (!expert || expert.user_id !== req.user.id) {
            return res.status(403).json({ error: 'Not authorized to modify this expert profile' });
        }

        // Delete existing schedule and replace with new one
        await supabase
            .from('expert_availability')
            .delete()
            .eq('expert_id', expertId);

        const rows = schedule.map(s => ({
            expert_id: expertId,
            day_of_week: s.day_of_week,
            start_hour: s.start_hour || '09:00',
            end_hour: s.end_hour || '17:00',
            is_active: s.is_active !== false,
        }));

        const { data, error } = await supabase
            .from('expert_availability')
            .insert(rows)
            .select();

        if (error) throw error;
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─────────────────────────────────────────────────
// PUT /api/experts/:id/settings — update timezone, buffer, blocked dates
// Expects: { timezone, buffer_minutes, blocked_dates }
// ─────────────────────────────────────────────────
router.put('/:id/settings', auth, async (req, res) => {
    try {
        const expertId = req.params.id;
        const { timezone, buffer_minutes, blocked_dates } = req.body;

        // Verify ownership
        const { data: expert } = await supabase
            .from('experts')
            .select('user_id')
            .eq('id', expertId)
            .single();

        if (!expert || expert.user_id !== req.user.id) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        const updates = {};
        if (timezone !== undefined) updates.timezone = timezone;
        if (buffer_minutes !== undefined) updates.buffer_minutes = buffer_minutes;
        if (blocked_dates !== undefined) updates.blocked_dates = blocked_dates;

        const { data, error } = await supabase
            .from('experts')
            .update(updates)
            .eq('id', expertId)
            .select('timezone, buffer_minutes, blocked_dates')
            .single();

        if (error) throw error;
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─────────────────────────────────────────────────
// GET /api/experts/:id/available-slots?date=YYYY-MM-DD&duration=60
// Generates real available time slots for a given date based on:
//   1. Expert's weekly schedule (expert_availability table)
//   2. Blocked dates
//   3. Buffer time between bookings
//   4. Existing bookings on that date
// All times returned in UTC for client-side timezone conversion.
// ─────────────────────────────────────────────────
router.get('/:id/available-slots', async (req, res) => {
    try {
        const expertId = req.params.id;
        const { date, duration = 60 } = req.query;

        if (!date) return res.status(400).json({ error: 'date query parameter is required (YYYY-MM-DD)' });
        if (!UUID_RE.test(expertId)) return res.status(404).json({ error: 'Expert not found' });

        const slotDuration = parseInt(duration);
        const requestedDate = new Date(date + 'T00:00:00Z');
        const dayOfWeek = requestedDate.getUTCDay(); // 0=Sun

        // 1. Get expert settings
        const { data: expert } = await supabase
            .from('experts')
            .select('timezone, buffer_minutes, blocked_dates')
            .eq('id', expertId)
            .single();

        if (!expert) return res.status(404).json({ error: 'Expert not found' });

        const bufferMs = (expert.buffer_minutes || 0) * 60 * 1000;

        // 2. Check if date is blocked
        const blockedDates = (expert.blocked_dates || []).map(d => d.toString().split('T')[0]);
        if (blockedDates.includes(date)) {
            return res.json({ slots: [], message: 'Expert is not available on this date (blocked).' });
        }

        // 3. Get weekly schedule for this day
        const { data: scheduleRows } = await supabase
            .from('expert_availability')
            .select('*')
            .eq('expert_id', expertId)
            .eq('day_of_week', dayOfWeek)
            .eq('is_active', true);

        // If no schedule set, fall back to default 9-5
        const schedule = (scheduleRows && scheduleRows.length > 0)
            ? scheduleRows[0]
            : { start_hour: '09:00', end_hour: '17:00' };

        // 4. Parse start/end hours into UTC timestamps for the requested date
        const [startH, startM] = schedule.start_hour.split(':').map(Number);
        const [endH, endM] = schedule.end_hour.split(':').map(Number);

        const dayStart = new Date(requestedDate);
        dayStart.setUTCHours(startH, startM, 0, 0);

        const dayEnd = new Date(requestedDate);
        dayEnd.setUTCHours(endH, endM, 0, 0);

        // 5. Get existing bookings for this expert on this date
        const dayStartISO = new Date(requestedDate);
        dayStartISO.setUTCHours(0, 0, 0, 0);
        const dayEndISO = new Date(requestedDate);
        dayEndISO.setUTCHours(23, 59, 59, 999);

        const { data: existingBookings } = await supabase
            .from('bookings')
            .select('start_time, end_time')
            .eq('expert_id', expertId)
            .not('status', 'in', '("cancelled")')
            .gte('start_time', dayStartISO.toISOString())
            .lte('start_time', dayEndISO.toISOString());

        const bookedRanges = (existingBookings || []).map(b => ({
            start: new Date(b.start_time).getTime(),
            end: new Date(b.end_time || new Date(b.start_time).getTime() + slotDuration * 60 * 1000).getTime(),
        }));

        // 6. Generate slots
        const slots = [];
        let cursor = dayStart.getTime();
        const slotMs = slotDuration * 60 * 1000;

        while (cursor + slotMs <= dayEnd.getTime()) {
            const slotStart = cursor;
            const slotEnd = cursor + slotMs;

            // Check if this slot overlaps any booked range (including buffer)
            const isBooked = bookedRanges.some(br =>
                slotStart < (br.end + bufferMs) && slotEnd > (br.start - bufferMs)
            );

            // Only include future slots
            const now = Date.now();
            if (!isBooked && slotStart > now) {
                slots.push({
                    start_time: new Date(slotStart).toISOString(),
                    end_time: new Date(slotEnd).toISOString(),
                });
            }

            cursor += slotMs;
        }

        res.json({
            slots,
            expert_timezone: expert.timezone || 'UTC',
            date,
            day_of_week: dayOfWeek,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;


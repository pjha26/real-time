const express = require('express');
const router = express.Router();
const supabase = require('../db');
const auth = require('../middleware/auth');

// POST /api/bookings — create a booking (client)
router.post('/', auth, async (req, res) => {
    try {
        const { expert_id, event_type_id, start_time, end_time, scope } = req.body;
        if (!expert_id || !start_time)
            return res.status(400).json({ error: 'expert_id and start_time are required' });

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

// PATCH /api/bookings/:id/status — update booking status
router.patch('/:id/status', auth, async (req, res) => {
    try {
        const { status } = req.body;
        const { data, error } = await supabase
            .from('bookings')
            .update({ status })
            .eq('id', req.params.id)
            .select()
            .single();

        if (error) throw error;
        if (req.io) req.io.emit('booking:updated', data);
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;

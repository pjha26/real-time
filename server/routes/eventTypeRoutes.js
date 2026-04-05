const express = require('express');
const router = express.Router();
const supabase = require('../db');
const auth = require('../middleware/auth');

// GET /api/event-types/:expertId
router.get('/:expertId', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('event_types')
            .select('*')
            .eq('expert_id', req.params.expertId);

        if (error) throw error;
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/event-types
router.post('/', auth, async (req, res) => {
    try {
        const { expert_id, title, duration_minutes = 60, price = 0 } = req.body;
        const { data, error } = await supabase
            .from('event_types')
            .insert({ expert_id, title, duration_minutes, price })
            .select()
            .single();

        if (error) throw error;
        res.status(201).json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;

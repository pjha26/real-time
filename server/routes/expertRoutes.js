const express = require('express');
const router = express.Router();
const supabase = require('../db');

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
        }));

        // Filter by search term if provided
        if (search) {
            const term = search.toLowerCase();
            const filtered = experts.filter(e =>
                e.name?.toLowerCase().includes(term) ||
                e.bio?.toLowerCase().includes(term) ||
                e.specialty?.some(s => s.toLowerCase().includes(term))
            );
            return res.json(filtered);
        }

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
            event_types: data.event_types || [],
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const supabase = require('../db');
const { getAuth } = require('@clerk/express');

/**
 * POST /api/auth/sync
 * Called after Clerk sign-in to upsert user into our Supabase `users` table.
 * Clerk is the source of truth for identity; Supabase stores app-level profile data.
 */
router.post('/sync', async (req, res) => {
    try {
        const { userId, email, name, role = 'client' } = req.body;
        if (!userId || !email) return res.status(400).json({ error: 'userId and email required' });

        // Upsert: insert if not exists, update if exists
        const { data, error } = await supabase
            .from('users')
            .upsert({ clerk_id: userId, email, name, role }, { onConflict: 'clerk_id' })
            .select()
            .single();

        if (error) throw error;
        res.json({ user: data });
    } catch (err) {
        console.error('[Auth Sync Error]', err);
        res.status(500).json({ error: err.message });
    }
});

/**
 * GET /api/auth/me
 * Returns logged-in user's profile from Supabase using their Clerk userId.
 */
router.get('/me', async (req, res) => {
    try {
        const auth = getAuth(req);
        if (!auth?.userId) return res.status(401).json({ error: 'Not authenticated' });

        const { data: user, error } = await supabase
            .from('users')
            .select('id, name, email, role, created_at')
            .eq('clerk_id', auth.userId)
            .single();

        if (error || !user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;

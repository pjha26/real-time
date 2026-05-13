const supabase = require('../db');

/**
 * GET /api/admin/stats — Platform overview
 */
const getStats = async (req, res) => {
    try {
        let totalUsers = 0, totalExperts = 0, totalBookings = 0;

        try {
            const { count } = await supabase.from('users').select('*', { count: 'exact', head: true });
            totalUsers = count || 0;
        } catch (e) { }

        try {
            const { count } = await supabase.from('experts').select('*', { count: 'exact', head: true });
            totalExperts = count || 0;
        } catch (e) { }

        try {
            const { count } = await supabase.from('bookings').select('*', { count: 'exact', head: true });
            totalBookings = count || 0;
        } catch (e) { }

        res.json({
            totalUsers,
            totalExperts,
            totalBookings,
            activeToday: 0,
            revenue: '$0',
            avgSessionRating: 0,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * GET /api/admin/users — All users
 */
const getUsers = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('id, name, email, role, created_at')
            .order('created_at', { ascending: false });

        if (error) throw error;

        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * GET /api/admin/bookings — All bookings
 */
const getBookings = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('bookings')
            .select('*')
            .order('start_time', { ascending: false });

        if (error) throw error;

        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * PATCH /api/admin/users/:id/role — Update user role
 */
const updateUserRole = async (req, res) => {
    try {
        const { role } = req.body;
        if (!['client', 'expert', 'admin'].includes(role)) {
            return res.status(400).json({ error: 'Invalid role' });
        }

        const { data, error } = await supabase
            .from('users')
            .update({ role })
            .eq('id', req.params.id)
            .select()
            .single();

        if (error) throw error;
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * PATCH /api/admin/bookings/:id/status — Override booking status
 */
const updateBookingStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const { data, error } = await supabase
            .from('bookings')
            .update({ status })
            .eq('id', req.params.id)
            .select()
            .single();

        if (error) throw error;
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { getStats, getUsers, getBookings, updateUserRole, updateBookingStatus };

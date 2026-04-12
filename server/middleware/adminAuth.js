const supabase = require('../db');

/**
 * Admin-only middleware.
 * In demo mode: checks localStorage role sent via header.
 * In production: verifies role from Supabase users table.
 */
const adminAuth = async (req, res, next) => {
    try {
        // Check the x-user-role header (set by frontend from localStorage)
        const role = req.headers['x-user-role'];
        if (role === 'admin') {
            // Demo mode: trust the header
            return next();
        }

        // Production mode: verify JWT user's role in Supabase
        if (req.user && req.user.id) {
            const { data: user } = await supabase
                .from('users')
                .select('role')
                .eq('id', req.user.id)
                .single();

            if (user && user.role === 'admin') {
                return next();
            }
        }

        return res.status(403).json({ error: 'Admin access required' });
    } catch (err) {
        console.error('[Admin Auth Error]', err.message);
        return res.status(403).json({ error: 'Admin access required' });
    }
};

module.exports = adminAuth;

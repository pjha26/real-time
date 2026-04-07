const { clerkClient } = require('@clerk/express');

/**
 * Clerk-based auth middleware
 * Verifies the Bearer token from Clerk's session, 
 * then attaches user info to req.user.
 */
async function requireClerkAuth(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const token = authHeader.split(' ')[1];

        // Verify using Clerk's server-side client
        const payload = await clerkClient.verifyToken(token);
        if (!payload) return res.status(401).json({ error: 'Invalid token' });

        // Attach clerk userId to req so routes can use it
        req.auth = {
            userId: payload.sub,
            email: payload.email,
        };

        next();
    } catch (err) {
        console.error('[Clerk Auth Error]', err.message);
        return res.status(401).json({ error: 'Unauthorized' });
    }
}

module.exports = requireClerkAuth;

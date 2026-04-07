require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const { clerkMiddleware } = require('@clerk/express');

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

// ── Clerk middleware: attaches auth context to every request ──
app.use(clerkMiddleware());

const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: '*', methods: ['GET', 'POST', 'PATCH', 'DELETE'] }
});

// ── Socket.io: real-time booking notifications ──
io.on('connection', (socket) => {
    console.log('🔌 Client connected:', socket.id);

    // Expert joins their personal room to receive booking notifications
    socket.on('join:expert', (expertId) => {
        socket.join(`expert:${expertId}`);
        console.log(`Expert ${expertId} joined their room`);
    });

    // Client joins their personal room to receive booking updates
    socket.on('join:client', (clientId) => {
        socket.join(`client:${clientId}`);
    });

    socket.on('disconnect', () => console.log('🔌 Client disconnected:', socket.id));
});

// Inject io into requests so routes can emit events
app.use((req, res, next) => {
    req.io = io;
    next();
});

// ── Routes ──
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/experts', require('./routes/expertRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/event-types', require('./routes/eventTypeRoutes'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', db: 'supabase', auth: 'clerk' }));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`✅ Match & Flow server running on port ${PORT}`));

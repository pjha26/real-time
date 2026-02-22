const { writeFileSync } = require('fs');
const ics = require('ics');
const path = require('path');
const { google } = require('googleapis');
const Booking = require('../models/Booking');
const Expert = require('../models/Expert');

// @desc    Download ICS file for a booking
// @route   GET /api/bookings/:id/calendar
// @access  Private
const downloadIcs = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate('expert', 'name category email')
            .populate('eventType', 'title location description');

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Only allow user who booked it to download
        if (booking.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        // Parse date "YYYY-MM-DD" and time "HH:mm" (startTime) and calculate endTime
        const [year, month, day] = booking.date.split('-').map(Number);
        const [hour, minute] = booking.timeSlot.split(':').map(Number);

        let endHour, endMinute;
        if (booking.endTime) {
            [endHour, endMinute] = booking.endTime.split(':').map(Number);
        } else {
            // Fallback for legacy items without an endTime (assume 1 hr)
            endHour = hour + 1;
            endMinute = minute;
        }

        const event = {
            start: [year, month, day, hour, minute],
            end: [year, month, day, endHour, endMinute],
            title: `Session with ${booking.expert.name}`,
            description: booking.eventType ? booking.eventType.description : booking.notes || 'Expert Session',
            location: booking.eventType ? booking.eventType.location : 'Video Call',
            url: 'http://localhost:5173/my-bookings',
            organizer: { name: booking.expert.name, email: booking.expert.email || 'noreply@expertbook.com' },
            attendees: [
                { name: booking.name, email: booking.email, rsvp: true, role: 'REQ-PARTICIPANT' }
            ]
        };

        ics.createEvent(event, (error, value) => {
            if (error) {
                console.log(error);
                return res.status(500).json({ message: 'Failed to generate calendar event' });
            }

            res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
            res.setHeader('Content-Disposition', `attachment; filename="booking_${booking._id}.ics"`);
            res.send(value);
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc    Get Google Calendar Auth URL
// @route   GET /api/calendar/auth
// @access  Private (Expert Only)
const getAuthUrl = (req, res) => {
    // Requires GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI in env
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
        return res.status(400).json({
            message: 'Google Calendar integration is not configured on the server. Please add OAuth credentials to .env'
        });
    }

    const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5000/api/calendar/callback'
    );

    const scopes = [
        'https://www.googleapis.com/auth/calendar.events'
    ];

    const url = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes,
        state: req.user._id.toString() // Pass user ID in state to link account on callback
    });

    res.json({ url });
};

// @desc    Handle Google Calendar OAuth Callback
// @route   GET /api/calendar/callback
// @access  Public (Called by Google)
const handleCallback = async (req, res) => {
    const { code, state } = req.query;

    if (!code) return res.status(400).json({ message: 'No authorization code provided' });

    try {
        const oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5000/api/calendar/callback'
        );

        const { tokens } = await oauth2Client.getToken(code);

        // Find expert by user ID passed in state
        const expert = await Expert.findOne({ user: state });
        if (expert && tokens.refresh_token) {
            expert.googleRefreshToken = tokens.refresh_token;
            await expert.save();
        }

        // In a real app, redirect to a frontend success page.
        res.send('Google Calendar Linked Successfully! You can close this window.');
    } catch (err) {
        res.status(500).json({ message: 'Authentication failed', error: err.message });
    }
};

module.exports = { downloadIcs, getAuthUrl, handleCallback };

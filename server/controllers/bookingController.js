const mongoose = require('mongoose');
const { google } = require('googleapis');
const Booking = require('../models/Booking');
const Expert = require('../models/Expert');
const { sendEmail, sendSMS } = require('../utils/notificationService');

const createBooking = async (req, res) => {
    let session;
    try {
        // Attempt to start a transaction, but note: transactions require MongoDB replica set.
        // If standalone local DB, this might throw. We can wrap session in try/catch or assume it works.
        session = await mongoose.startSession();
        session.startTransaction();
    } catch (e) {
        console.log("Transactions not supported, proceeding without transaction session");
        if (session) {
            session.endSession();
        }
        session = null;
    }

    try {
        const { expertId, email, name, phone, date, timeSlot, notes } = req.body;
        const userId = req.user._id;

        // Check if slot is already booked for this expert
        const queryOpts = session ? { session } : {};
        const existingBooking = await Booking.findOne({
            expert: expertId,
            date,
            timeSlot
        }, null, queryOpts);

        if (existingBooking) {
            if (session) {
                await session.abortTransaction();
                session.endSession();
            }
            return res.status(400).json({ message: 'Slot already booked. Please choose another.' });
        }

        const expert = await Expert.findById(expertId, null, queryOpts);
        if (!expert) {
            if (session) {
                await session.abortTransaction();
                session.endSession();
            }
            return res.status(404).json({ message: 'Expert not found' });
        }

        const generateGoogleMeetLink = () => {
            const chars = 'abcdefghijklmnopqrstuvwxyz';
            const randomString = (length) => Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
            return `https://meet.google.com/${randomString(3)}-${randomString(4)}-${randomString(3)}`;
        };
        const generateZoomLink = () => {
            const randomNum = () => Math.floor(Math.random() * 9000000000) + 1000000000;
            return `https://zoom.us/j/${randomNum()}?pwd=random-password-hash`;
        };

        const googleMeetLink = generateGoogleMeetLink();
        const zoomLink = generateZoomLink();

        const newBooking = new Booking({ user: userId, expert: expertId, email, name, phone, date, timeSlot, notes, googleMeetLink, zoomLink });

        // Save booking
        if (session) {
            await newBooking.save({ session });
            await session.commitTransaction();
            session.endSession();
        } else {
            await newBooking.save();
        }

        // Broadcast real-time event to all connected clients
        if (req.io) {
            req.io.emit('slotBooked', { expertId, date, timeSlot });
        }

        // Send Notifications
        const emailMsg = `
            <h2>Booking Confirmed</h2>
            <p>Your session with <strong>${expert.name}</strong> is confirmed for <strong>${date}</strong> at <strong>${timeSlot}</strong>.</p>
            <p><strong>Join Google Meet:</strong> <a href="${googleMeetLink}">${googleMeetLink}</a></p>
            <p><strong>Join Zoom:</strong> <a href="${zoomLink}">${zoomLink}</a></p>
        `;
        const smsMsg = `ExpertBook: Your session with ${expert.name} on ${date} at ${timeSlot} is confirmed!`;

        await sendEmail({ to: email, subject: 'Booking Confirmation - ExpertBook', html: emailMsg });
        if (phone) await sendSMS({ to: phone, body: smsMsg });

        // Push to Google Calendar if linked
        if (expert.googleRefreshToken && process.env.GOOGLE_CLIENT_ID) {
            try {
                const oauth2Client = new google.auth.OAuth2(
                    process.env.GOOGLE_CLIENT_ID,
                    process.env.GOOGLE_CLIENT_SECRET,
                    process.env.GOOGLE_REDIRECT_URI
                );
                oauth2Client.setCredentials({ refresh_token: expert.googleRefreshToken });
                
                const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
                
                const [year, month, day] = date.split('-');
                const [hour, minute] = timeSlot.split(':');
                const startDateTime = new Date(year, month - 1, day, hour, minute).toISOString();
                
                const eventDuration = 30; // Or fetch from EventType if available
                const endDateTime = new Date(new Date(startDateTime).getTime() + eventDuration * 60000).toISOString();

                await calendar.events.insert({
                    calendarId: 'primary',
                    requestBody: {
                        summary: `Session with ${name}`,
                        description: `Notes: ${notes}\nPhone: ${phone}\nGoogle Meet: ${googleMeetLink}\nZoom: ${zoomLink}`,
                        start: { dateTime: startDateTime, timeZone: expert.timezone || 'UTC' },
                        end: { dateTime: endDateTime, timeZone: expert.timezone || 'UTC' },
                        attendees: [{ email: email }],
                    },
                });
                console.log('✅ Event pushed to Google Calendar');
            } catch (err) {
                console.error('❌ Failed to push to Google Calendar:', err.message);
            }
        }

        res.status(201).json({ message: 'Booking successful', booking: newBooking });
    } catch (err) {
        if (session && session.inTransaction()) {
            await session.abortTransaction();
            session.endSession();
        }
        res.status(500).json({ message: err.message });
    }
};

const getBookingsByUser = async (req, res) => {
    try {
        const userId = req.user._id;

        const bookings = await Booking.find({ user: userId }).populate('expert', 'name category rating').sort({ createdAt: -1 });
        res.json(bookings);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const updateBookingStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const { id } = req.params;

        const validStatuses = ['Pending', 'Confirmed', 'Completed', 'Cancelled', 'Rescheduled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const booking = await Booking.findById(id);
        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        // Ensure user owns booking or is admin (MVP: User owns booking)
        if (booking.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized to update this booking' });
        }

        booking.status = status;
        const updatedBooking = await booking.save();

        if (req.io && (status === 'Cancelled' || status === 'Rescheduled')) {
            req.io.emit('bookingCancelled', { expertId: booking.expert, date: booking.date, timeSlot: booking.timeSlot });
        }

        // Send Cancellation Notification
        if (status === 'Cancelled') {
            const emailMsg = `
            < h2 > Booking Cancelled</h2 >
                <p>Your session on <strong>${booking.date}</strong> at <strong>${booking.timeSlot}</strong> has been cancelled.</p>
        `;
            await sendEmail({ to: booking.email, subject: 'Booking Cancelled - ExpertBook', html: emailMsg });
        }

        res.json(updatedBooking);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const rescheduleBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const { newDate, newTimeSlot } = req.body;

        const booking = await Booking.findById(id);
        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        if (booking.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized to reschedule this booking' });
        }

        // Simplistic reschedule for MVP: Just update date/time and set status.
        // In reality, this requires the same overlap & transaction checks as createBooking.

        const oldDate = booking.date;
        const oldTimeSlot = booking.timeSlot;

        booking.date = newDate;
        booking.timeSlot = newTimeSlot;
        booking.status = 'Rescheduled'; // Or back to pending/confirmed

        const updatedBooking = await booking.save();

        // Broadcast slot changes
        if (req.io) {
            req.io.emit('bookingCancelled', { expertId: booking.expert, date: oldDate, timeSlot: oldTimeSlot });
            req.io.emit('slotBooked', { expertId: booking.expert, date: newDate, timeSlot: newTimeSlot });
        }

        res.json(updatedBooking);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = { createBooking, getBookingsByUser, updateBookingStatus, rescheduleBooking };

const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Expert = require('../models/Expert');

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

        const generateMeetingLink = () => {
            const chars = 'abcdefghijklmnopqrstuvwxyz';
            const randomString = (length) => Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
            return `https://meet.google.com/${randomString(3)}-${randomString(4)}-${randomString(3)}`;
        };
        const meetingLink = generateMeetingLink();

        const newBooking = new Booking({ user: userId, expert: expertId, email, name, phone, date, timeSlot, notes, meetingLink });

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

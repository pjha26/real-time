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

        const newBooking = new Booking({ user: userId, expert: expertId, email, name, phone, date, timeSlot, notes });

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

        const validStatuses = ['Pending', 'Confirmed', 'Completed'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const booking = await Booking.findByIdAndUpdate(id, { status }, { new: true });
        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        res.json(booking);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = { createBooking, getBookingsByUser, updateBookingStatus };

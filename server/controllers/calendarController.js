const { writeFileSync } = require('fs');
const ics = require('ics');
const path = require('path');
const Booking = require('../models/Booking');

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

            // Provide as a download
            res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
            res.setHeader('Content-Disposition', `attachment; filename="booking_${booking._id}.ics"`);
            res.send(value);
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = { downloadIcs };

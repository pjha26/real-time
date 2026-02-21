const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    expert: { type: mongoose.Schema.Types.ObjectId, ref: 'Expert', required: true },
    eventType: { type: mongoose.Schema.Types.ObjectId, ref: 'EventType' }, // optional for legacy support
    email: { type: String, required: true },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    date: { type: String, required: true },
    timeSlot: { type: String, required: true }, // Legacy format HH:mm, or StartTime in new format
    endTime: { type: String }, // Calculated endpoint HH:mm
    notes: { type: String },
    status: { type: String, enum: ['Pending', 'Confirmed', 'Completed', 'Cancelled', 'Rescheduled'], default: 'Pending' }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);

const mongoose = require('mongoose');

const eventTypeSchema = new mongoose.Schema({
    expert: { type: mongoose.Schema.Types.ObjectId, ref: 'Expert', required: true },
    title: { type: String, required: true },
    duration: { type: Number, required: true }, // duration in minutes
    location: { type: String, default: 'Video Call' }, // 'Video Call', 'In-Person', 'Phone'
    description: { type: String },
    urlSlug: { type: String, required: true } // for shareable link, e.g., '15min-chat'
}, { timestamps: true });

module.exports = mongoose.model('EventType', eventTypeSchema);

const mongoose = require('mongoose');

const expertSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, unique: true, sparse: true }, // for shareable URL calendly.com/username
  bio: { type: String },
  category: { type: String, required: true },
  experience: { type: Number, required: true }, // in years
  rating: { type: Number, default: 0 },
  bufferTime: { type: Number, default: 0 }, // buffer time in minutes between meetings
  availableSlots: [
    {
      date: { type: String, required: true }, // Format: YYYY-MM-DD
      time: { type: String, required: true }  // Format: HH:mm
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('Expert', expertSchema);

const mongoose = require('mongoose');

const expertSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  experience: { type: Number, required: true }, // in years
  rating: { type: Number, default: 0 },
  availableSlots: [
    {
      date: { type: String, required: true }, // Format: YYYY-MM-DD
      time: { type: String, required: true }  // Format: HH:mm
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('Expert', expertSchema);

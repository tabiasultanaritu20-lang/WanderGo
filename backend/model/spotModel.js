const mongoose = require('mongoose');

const SpotSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  photos: { type: [String], default: [] },
  country: { type: String, required: true },
  city: { type: String, default: '' },
  category: { type: String, default: '' },
  tags: { type: [String], default: [] },
  lat: { type: Number },
  lng: { type: Number },
}, { timestamps: true });

const Spot = mongoose.models.Spot || mongoose.model('Spot', SpotSchema);

module.exports = Spot;

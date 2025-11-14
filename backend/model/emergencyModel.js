const mongoose = require('mongoose');

const EmergencyContactSchema = new mongoose.Schema({
  type: { type: String, required: true }, // police, hospital, embassy
  name: { type: String, required: true },
  phone: { type: String, required: true },
  address: String,
  city: String,
  country: String,
  lat: Number,
  lng: Number,
  notes: String,
  is_emergency: { type: Boolean, default: true },
  created_at: { type: Date, default: Date.now }
});

const SafetyRatingSchema = new mongoose.Schema({
  country: String,
  city: String,
  lat: Number,
  lng: Number,
  rating: Number,
  crime_score: Number,
  medical_score: Number,
  rating_sum: { type: Number, default: 0 },
  rating_count: { type: Number, default: 0 },
  admin_rating: Number,
  updated_at: { type: Date, default: Date.now },
  source: String
});

const TravelAlertSchema = new mongoose.Schema({
  country: String,
  city: String,
  severity: { type: String, enum: ['low','medium','high'], default: 'low' },
  start_date: Date,
  end_date: Date,
  description: String,
  region_geojson: mongoose.Schema.Types.Mixed
});

const EmergencyContact = mongoose.models.EmergencyContact || mongoose.model('EmergencyContact', EmergencyContactSchema);
const SafetyRating = mongoose.models.SafetyRating || mongoose.model('SafetyRating', SafetyRatingSchema);
const TravelAlert = mongoose.models.TravelAlert || mongoose.model('TravelAlert', TravelAlertSchema);

module.exports = { EmergencyContact, SafetyRating, TravelAlert };
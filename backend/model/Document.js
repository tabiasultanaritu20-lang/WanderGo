const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['Passport', 'Visa', 'ID Card', 'Other'],
    required: true
  },
  country: {
    type: String, // For Visa
    default: ''
  },
  documentNumber: {
    type: String,
    required: true
  },
  expiryDate: {
    type: Date,
    required: true
  },
  imageUrl: {
    type: String, // URL to stored image (optional)
    default: ''
  },
  notes: {
    type: String,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('Document', documentSchema);

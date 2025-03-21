const mongoose = require('mongoose');

const CardSchema = new mongoose.Schema({
  itemName: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  phoneNumber: {
    type: String,
    required: false,
    trim: true
  },
  imageUrl: {
    type: String
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    },
    address: {
      type: String,
      required: true
    }
  },
  cardType: {
    type: String,
    enum: ['request', 'donation'],
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Add index for geospatial queries
CardSchema.index({ "location.coordinates": "2dsphere" });

module.exports = mongoose.model('Card', CardSchema);
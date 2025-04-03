const mongoose = require('mongoose');

const accommodationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  location: {
    city: String,
    country: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  type: {
    type: String,
    enum: ['hotel', 'hostel', 'guesthouse', 'eco-lodge', 'apartment'],
    required: true
  },
  priceRange: {
    min: Number,
    max: Number,
    currency: {
      type: String,
      default: 'USD'
    }
  },
  sustainability: {
    ecoRating: {
      type: Number,
      min: 0,
      max: 5
    },
    certifications: [String],
    features: [{
      name: String,
      description: String
    }]
  },
  amenities: [{
    type: String
  }],
  images: [{
    url: String,
    caption: String
  }],
  description: String,
  contactInfo: {
    email: String,
    phone: String,
    website: String
  },
  reviews: [{
    userId: String,
    rating: Number,
    comment: String,
    date: {
      type: Date,
      default: Date.now
    }
  }],
  averageRating: {
    type: Number,
    default: 0
  },
  sustainabilityScore: {
    type: Number,
    min: 0,
    max: 100,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamps on save
accommodationSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Accommodation', accommodationSchema); 
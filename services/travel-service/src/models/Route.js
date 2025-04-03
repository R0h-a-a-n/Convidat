const mongoose = require('mongoose');

const routeSchema = new mongoose.Schema({
  origin: {
    city: String,
    country: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  destination: {
    city: String,
    country: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  segments: [{
    type: {
      type: String,
      enum: ['flight', 'train', 'bus', 'ferry', 'car'],
      required: true
    },
    provider: String,
    duration: Number, // in minutes
    distance: Number, // in kilometers
    carbonEmissions: Number, // in kg CO2
    cost: {
      amount: Number,
      currency: {
        type: String,
        default: 'USD'
      }
    },
    schedule: {
      departure: Date,
      arrival: Date
    }
  }],
  totalDuration: Number, // in minutes
  totalDistance: Number, // in kilometers
  totalCost: {
    amount: Number,
    currency: {
      type: String,
      default: 'USD'
    }
  },
  totalCarbonEmissions: Number, // in kg CO2
  sustainabilityScore: {
    type: Number,
    min: 0,
    max: 100,
    required: true
  },
  ecoHighlights: [{
    type: String
  }],
  recommendations: [{
    type: String
  }],
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
routeSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Calculate totals before saving
routeSchema.pre('save', function(next) {
  if (this.segments && this.segments.length > 0) {
    this.totalDuration = this.segments.reduce((sum, segment) => sum + segment.duration, 0);
    this.totalDistance = this.segments.reduce((sum, segment) => sum + segment.distance, 0);
    this.totalCarbonEmissions = this.segments.reduce((sum, segment) => sum + segment.carbonEmissions, 0);
    this.totalCost.amount = this.segments.reduce((sum, segment) => sum + segment.cost.amount, 0);
  }
  next();
});

module.exports = mongoose.model('Route', routeSchema); 
const mongoose = require('mongoose');

const carbonFootprintSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  travelType: {
    type: String,
    required: true,
    enum: ['flight', 'car', 'train', 'bus', 'bicycle', 'walking']
  },
  distance: {
    type: Number,
    required: true,
    min: 0
  },
  unit: {
    type: String,
    required: true,
    enum: ['km', 'miles']
  },
  carbonEmission: {
    type: Number,
    required: true,
    min: 0
  },
  date: {
    type: Date,
    default: Date.now
  },
  details: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('CarbonFootprint', carbonFootprintSchema); 
const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: [true, 'Please provide your name'],
    trim: true
  },
  rating: {
    type: Number,
    required: [true, 'Please provide a rating'],
    min: 1,
    max: 5
  },
  title: {
    type: String,
    required: [true, 'Please provide a review title'],
    trim: true,
    maxlength: 100
  },
  comment: {
    type: String,
    required: [true, 'Please provide your review comment'],
    trim: true,
    maxlength: 1000
  },
  features: {
    type: [String],
    enum: ['Route Planning', 'Eco-friendly Options', 'User Interface', 'Travel Recommendations', 'Other'],
    required: [true, 'Please select at least one feature']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Add index for sorting by date
reviewSchema.index({ createdAt: -1 });

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review; 
import mongoose from 'mongoose';

const tripSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  destinations: [{
    type: String,
    trim: true,
  }],
  itinerary: [{
    day: {
      type: Number,
      required: true,
    },
    activities: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Activity',
    }],
  }],
  budget: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Budget',
  },
  packingList: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PackingList',
  },
  status: {
    type: String,
    enum: ['planning', 'in-progress', 'completed', 'cancelled'],
    default: 'planning',
  },
  isPublic: {
    type: Boolean,
    default: false,
  },
  tags: [{
    type: String,
    trim: true,
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt field before saving
tripSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Create indexes for better query performance
tripSchema.index({ userId: 1, status: 1 });
tripSchema.index({ startDate: 1, endDate: 1 });
tripSchema.index({ tags: 1 });

const Trip = mongoose.model('Trip', tripSchema);

export default Trip; 
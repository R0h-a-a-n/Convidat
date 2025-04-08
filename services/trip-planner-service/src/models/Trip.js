import mongoose from 'mongoose';

const tripSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
    maxlength: [50, 'Title cannot be more than 50 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  startDate: {
    type: Date,
    required: [true, 'Please add a start date']
  },
  endDate: {
    type: Date,
    required: [true, 'Please add an end date']
  },
  destinations: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Destination',
    required: false,
  }],
  tags: [{
    type: String,
    trim: true
  }],
  budget: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Budget'
  },
  packingList: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PackingList'
  },
  status: {
    type: String,
    enum: ['planning', 'in-progress', 'completed', 'cancelled'],
    default: 'planning'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  isPublic: {
    type: Boolean,
    default: false,
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
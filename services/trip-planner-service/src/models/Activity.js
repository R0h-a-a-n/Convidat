import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
  tripId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trip',
    required: true
  },
  day: {
    type: Number,
    required: [true, 'Please provide the day number for the activity'],
    min: 1
  },
  name: {
    type: String,
    required: [true, 'Please provide a name for the activity']
  },
  description: {
    type: String,
    required: [true, 'Please provide a description for the activity']
  },
  location: {
    type: String,
    required: [true, 'Please provide a location for the activity']
  },
  startTime: {
    type: String,
    required: [true, 'Please provide a start time for the activity'],
    validate: {
      validator: function (v) {
        return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
      },
      message: props => `${props.value} is not a valid time format! Use HH:mm format.`
    }
  },
  endTime: {
    type: String,
    required: [true, 'Please provide an end time for the activity'],
    validate: {
      validator: function (v) {
        return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
      },
      message: props => `${props.value} is not a valid time format! Use HH:mm format.`
    }
  },
  cost: {
    type: Number,
    default: 0
  },
  category: {
    type: String,
    enum: ['sightseeing', 'adventure', 'cultural', 'food', 'shopping', 'relaxation', 'transportation'],
    required: true,
  },
  ecoRating: {
    type: Number,
    min: 1,
    max: 5,
    default: 3,
  },
  bookingRequired: {
    type: Boolean,
    default: false,
  },
  bookingInfo: {
    provider: String,
    url: String,
    reference: String,
  },
  notes: {
    type: String,
    trim: true,
  },
  attachments: [{
    type: String,
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});


// Update the updatedAt field before saving
activitySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Create indexes for better query performance
activitySchema.index({ tripId: 1 });
activitySchema.index({ category: 1 });
activitySchema.index({ startTime: 1, endTime: 1 });

const Activity = mongoose.model('Activity', activitySchema);

export default Activity; 
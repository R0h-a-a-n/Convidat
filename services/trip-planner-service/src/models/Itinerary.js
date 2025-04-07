import mongoose from 'mongoose';

const itinerarySchema = new mongoose.Schema({
  trip: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trip',
    required: true,
  },
  activities: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Activity',
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
itinerarySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Itinerary = mongoose.model('Itinerary', itinerarySchema);

export default Itinerary; 
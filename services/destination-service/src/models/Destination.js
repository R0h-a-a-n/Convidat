import mongoose from 'mongoose';

const destinationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  city: {
    type: String,
    required: true,
    trim: true
  },
  country: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  ecoFeatures: [{
    type: String,
    enum: [
      'Natural Conservation',
      'Cultural Heritage',
      'Wildlife Conservation',
      'Biodiversity',
      'Sustainable Practices',
      'Community Engagement'
    ]
  }],
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: true,
      index: '2dsphere'
    }
  },
  images: [{
    type: String
  }],
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  website: {
    type: String,
    trim: true
  },
  contact: {
    phone: {
      type: String,
      trim: true
    },
    email: {
      type: String,
      trim: true
    }
  },
  openingHours: {
    type: String
  },
  admissionFee: {
    type: String
  }
}, {
  timestamps: true
});

// Create indexes for efficient querying
destinationSchema.index({ city: 1, country: 1 });
destinationSchema.index({ ecoFeatures: 1 });

const Destination = mongoose.model('Destination', destinationSchema);

export default Destination; 
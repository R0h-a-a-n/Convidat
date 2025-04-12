import mongoose from 'mongoose';

const profileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    unique: true,
    ref: 'User'
  },
  bio: {
    type: String,
    default: ''
  },
  avatar: {
    type: String,
    default: ''
  },
  location: {
    city: {
      type: String,
      default: ''
    },
    country: {
      type: String,
      default: ''
    }
  },
  preferences: {
    notifications: {
      email: {
        type: Boolean,
        default: false
      },
      push: {
        type: Boolean,
        default: false
      }
    },
    language: {
      type: String,
      default: 'en'
    },
    currency: {
      type: String,
      default: 'USD'
    },
    theme: {
      type: String,
      default: 'light'
    },
    emailUpdates: {
      type: Boolean,
      default: false
    }
  },
  travelPreferences: {
    preferredMode: {
      type: String,
      enum: ['car', 'bus', 'train', 'flight'],
      default: 'car'
    },
    routeOptimization: {
      type: String,
      enum: ['fastest', 'eco', 'balanced'],
      default: 'fastest'
    }
  },
  stats: {
    totalTrips: {
      type: Number,
      default: 0
    },
    totalDistance: {
      type: Number,
      default: 0
    },
    carbonFootprint: {
      type: Number,
      default: 0
    }
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
profileSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.model('Profile', profileSchema); 
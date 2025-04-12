import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  profile: {
    firstName: String,
    lastName: String,
    bio: String,
    avatar: String,
    location: {
      city: String,
      country: String
    },
    preferences: {
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
      notifications: {
        email: {
          type: Boolean,
          default: true
        },
        push: {
          type: Boolean,
          default: true
        }
      }
    },
    travelPreferences: {
      preferredTransport: [String],
      maxBudget: Number,
      carbonFootprintLimit: Number,
      preferredAccommodation: [String],
      interests: [String]
    },
    stats: {
      totalTrips: {
        type: Number,
        default: 0
      },
      carbonSaved: {
        type: Number,
        default: 0
      },
      moneySaved: {
        type: Number,
        default: 0
      }
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
userSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.model('User', userSchema); 
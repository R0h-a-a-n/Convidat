import User from '../models/User.js';
import Profile from '../models/Profile.js';
import mongoose from 'mongoose';

// Get user profile
export const getProfile = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get profile from profile database
    const profile = await Profile.findOne({ userId });
    if (!profile) {
      // Create a new profile if it doesn't exist
      const newProfile = await Profile.create({
        userId,
        bio: '',
        avatar: '',
        location: { city: '', country: '' },
        preferences: { notifications: false, emailUpdates: false },
        travelPreferences: { preferredMode: 'car', routeOptimization: 'fastest' },
        stats: { totalTrips: 0, totalDistance: 0, carbonFootprint: 0 }
      });
      profile = newProfile;
    }

    // Connect to trip-planner database
    const tripDb = mongoose.connection.useDb('trip-planner');
    const Trip = tripDb.model('trips', new mongoose.Schema({}, { strict: false }));
    
    // Get user's trips
    const trips = await Trip.find({ userId: userId.toString() });

    // Connect to carbon database
    const carbonDb = mongoose.connection.useDb('convidat-carbon');
    const CarbonFootprint = carbonDb.model('carbonfootprints', new mongoose.Schema({}, { strict: false }));
    
    // Get user's carbon data
    const carbonData = await CarbonFootprint.find({ userId: userId.toString() });

    // Calculate total emissions and other metrics
    const totalEmissions = carbonData.reduce((acc, data) => acc + (data.carbonEmission || 0), 0);
    const avgEmission = carbonData.length > 0 ? totalEmissions / carbonData.length : 0;
    
    // Calculate eco score (placeholder - adjust formula as needed)
    const ecoScore = Math.max(0, Math.min(100, (100 - (avgEmission * 5)).toFixed(2)));

    // Get travel history from carbon footprints
    const travelHistory = carbonData.map(entry => ({
      id: entry._id,
      type: entry.travelType,
      date: entry.date,
      carbonEmission: Number(entry.carbonEmission.toFixed(2)),
      distance: Number(entry.distance.toFixed(2)),
      unit: entry.unit
    })).sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json({
      success: true,
      data: {
        user: {
          _id: req.user._id,
          name: req.user.name,
          email: req.user.email,
          createdAt: req.user.createdAt,
          profile: {
            bio: profile.bio,
            avatar: profile.avatar,
            location: profile.location,
            preferences: profile.preferences,
            travelPreferences: profile.travelPreferences,
            stats: profile.stats
          }
        },
        metrics: {
          ecoScore: Number(ecoScore),
          totalEmissions: Number(totalEmissions.toFixed(2)),
          avgEmission: Number(avgEmission.toFixed(2)),
          tripCount: carbonData.length
        },
        travelHistory
      }
    });
  } catch (err) {
    console.error('Error fetching profile:', err);
    res.status(500).json({
      success: false,
      message: 'Error fetching profile',
      error: err.message
    });
  }
};

// Update user profile
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { profile: profileData } = req.body;

    if (!profileData) {
      return res.status(400).json({
        success: false,
        message: 'Profile data is required'
      });
    }

    // Ensure all nested objects exist with defaults
    const updateData = {
      bio: profileData.bio || '',
      avatar: profileData.avatar || '',
      location: {
        city: profileData.location?.city || '',
        country: profileData.location?.country || ''
      },
      preferences: {
        notifications: {
          email: profileData.preferences?.notifications?.email ?? false,
          push: profileData.preferences?.notifications?.push ?? false
        },
        language: profileData.preferences?.language || 'en',
        currency: profileData.preferences?.currency || 'USD',
        theme: profileData.preferences?.theme || 'light',
        emailUpdates: profileData.preferences?.emailUpdates ?? false
      },
      travelPreferences: {
        preferredMode: profileData.travelPreferences?.preferredMode || 'car',
        routeOptimization: profileData.travelPreferences?.routeOptimization || 'fastest'
      },
      stats: {
        totalTrips: profileData.stats?.totalTrips || 0,
        totalDistance: profileData.stats?.totalDistance || 0,
        carbonFootprint: profileData.stats?.carbonFootprint || 0
      }
    };

    // Find and update profile, create if it doesn't exist
    const updatedProfile = await Profile.findOneAndUpdate(
      { userId },
      { $set: updateData },
      { 
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true
      }
    );

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          _id: req.user._id,
          name: req.user.name,
          email: req.user.email,
          profile: updatedProfile
        }
      }
    });
  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: err.message
    });
  }
};

// Update user stats
export const updateStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const { carbonSaved, moneySaved } = req.body;
    
    const profile = await Profile.findOne({ userId });
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    // Update stats
    profile.stats.totalTrips += 1;
    if (carbonSaved) profile.stats.carbonFootprint += carbonSaved;
    if (moneySaved) profile.stats.totalDistance += moneySaved;

    await profile.save();

    res.json({
      success: true,
      message: 'Stats updated successfully',
      data: profile.stats
    });
  } catch (err) {
    console.error('Error updating stats:', err);
    res.status(500).json({
      success: false,
      message: 'Error updating stats',
      error: err.message
    });
  }
};

// Get user preferences
export const getPreferences = async (req, res) => {
  try {
    const userId = req.user._id;
    const profile = await Profile.findOne({ userId });
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }
    res.json({
      success: true,
      data: profile.preferences
    });
  } catch (err) {
    console.error('Error fetching preferences:', err);
    res.status(500).json({
      success: false,
      message: 'Error fetching preferences',
      error: err.message
    });
  }
};

// Update user preferences
export const updatePreferences = async (req, res) => {
  try {
    const userId = req.user._id;
    const { notifications, emailUpdates } = req.body;
    
    const profile = await Profile.findOne({ userId });
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    // Update preferences
    if (notifications !== undefined) profile.preferences.notifications = notifications;
    if (emailUpdates !== undefined) profile.preferences.emailUpdates = emailUpdates;

    await profile.save();

    res.json({
      success: true,
      message: 'Preferences updated successfully',
      data: profile.preferences
    });
  } catch (err) {
    console.error('Error updating preferences:', err);
    res.status(500).json({
      success: false,
      message: 'Error updating preferences',
      error: err.message
    });
  }
}; 
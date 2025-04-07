import Activity from '../models/Activity.js';
import Trip from '../models/Trip.js';
import axios from 'axios';

// Get all activities for a trip
export const getActivities = async (req, res) => {
  try {
    const activities = await Activity.find({ tripId: req.params.tripId });
    res.status(200).json({
      success: true,
      data: activities
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Create a new activity
export const createActivity = async (req, res) => {
  try {
    const { name, description, location, startTime, endTime, cost, category } = req.body;
    
    const activity = new Activity({
      tripId: req.params.tripId,
      name,
      description,
      location,
      startTime,
      endTime,
      cost: parseFloat(cost) || 0,
      category
    });

    await activity.save();

    // Add activity to trip's itinerary
    const trip = await Trip.findById(req.params.tripId);
    if (!trip.itinerary) {
      trip.itinerary = [];
    }
    
    // Find or create the day in the itinerary
    const day = 1; // Default to day 1 if not specified
    let dayEntry = trip.itinerary.find(entry => entry.day === day);
    if (!dayEntry) {
      dayEntry = { day, activities: [] };
      trip.itinerary.push(dayEntry);
    }

    // Add the activity to the day's activities
    dayEntry.activities.push(activity._id);
    await trip.save();

    res.status(201).json({
      success: true,
      data: activity
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Get all activities
export const getAllActivities = async (req, res) => {
  try {
    const { category, ecoRating, startTime, endTime } = req.query;

    const query = {};
    if (category) query.category = category;
    if (ecoRating) query.ecoRating = { $gte: ecoRating };
    if (startTime) query.startTime = { $gte: new Date(startTime) };
    if (endTime) query.endTime = { $lte: new Date(endTime) };

    const activities = await Activity.find(query)
      .sort({ startTime: 1 });

    res.status(200).json({
      success: true,
      count: activities.length,
      data: activities,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// Get a single activity
export const getActivity = async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id);

    if (!activity) {
      return res.status(404).json({
        success: false,
        error: 'Activity not found',
      });
    }

    res.status(200).json({
      success: true,
      data: activity,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// Update an activity
export const updateActivity = async (req, res) => {
  try {
    const activity = await Activity.findByIdAndUpdate(
      req.params.activityId,
      req.body,
      { new: true, runValidators: true }
    );

    if (!activity) {
      return res.status(404).json({
        success: false,
        error: 'Activity not found'
      });
    }

    res.status(200).json({
      success: true,
      data: activity
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Delete an activity
export const deleteActivity = async (req, res) => {
  try {
    const activity = await Activity.findByIdAndDelete(req.params.activityId);

    if (!activity) {
      return res.status(404).json({
        success: false,
        error: 'Activity not found'
      });
    }

    // Remove activity from trip's itinerary
    const trip = await Trip.findById(req.params.tripId);
    if (trip.itinerary) {
      trip.itinerary.forEach(day => {
        day.activities = day.activities.filter(
          activityId => activityId.toString() !== req.params.activityId
        );
      });
      await trip.save();
    }

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Get weather forecast for activity location
export const getWeatherForecast = async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id);

    if (!activity) {
      return res.status(404).json({
        success: false,
        error: 'Activity not found',
      });
    }

    const { coordinates } = activity.location;
    const [latitude, longitude] = coordinates;

    // Call weather API (example using OpenWeatherMap)
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric`
    );

    res.status(200).json({
      success: true,
      data: {
        activity: activity.name,
        location: activity.location.address,
        forecast: response.data,
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// Get nearby eco-friendly activities
export const getNearbyEcoActivities = async (req, res) => {
  try {
    const { latitude, longitude, radius = 5000 } = req.query;

    const activities = await Activity.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)],
          },
          $maxDistance: parseInt(radius),
        },
      },
      ecoRating: { $gte: 3 },
    }).sort({ ecoRating: -1 });

    res.status(200).json({
      success: true,
      count: activities.length,
      data: activities,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
}; 
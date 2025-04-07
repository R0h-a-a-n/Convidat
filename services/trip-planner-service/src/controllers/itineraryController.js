import axios from 'axios';
import Itinerary from '../models/Itinerary.js';
import Activity from '../models/Activity.js';
import { WEATHER_API_KEY } from '../config.js';

// Create a new itinerary for a trip
export const createItinerary = async (req, res) => {
  try {
    const { tripId } = req.params;
    const itinerary = new Itinerary({
      trip: tripId,
      activities: [],
    });
    await itinerary.save();
    res.status(201).json({ success: true, data: itinerary });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get itinerary for a trip
export const getItinerary = async (req, res) => {
  try {
    const { tripId } = req.params;
    const itinerary = await Itinerary.findOne({ trip: tripId }).populate('activities');
    if (!itinerary) {
      return res.status(404).json({ success: false, error: 'Itinerary not found' });
    }
    res.status(200).json({ success: true, data: itinerary });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update itinerary
export const updateItinerary = async (req, res) => {
  try {
    const { tripId } = req.params;
    const itinerary = await Itinerary.findOneAndUpdate(
      { trip: tripId },
      req.body,
      { new: true, runValidators: true }
    );
    if (!itinerary) {
      return res.status(404).json({ success: false, error: 'Itinerary not found' });
    }
    res.status(200).json({ success: true, data: itinerary });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Delete itinerary
export const deleteItinerary = async (req, res) => {
  try {
    const { tripId } = req.params;
    const itinerary = await Itinerary.findOneAndDelete({ trip: tripId });
    if (!itinerary) {
      return res.status(404).json({ success: false, error: 'Itinerary not found' });
    }
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Add a new activity to the itinerary
export const addActivity = async (req, res) => {
  try {
    const { tripId } = req.params;
    const activity = new Activity(req.body);
    await activity.save();

    const itinerary = await Itinerary.findOne({ trip: tripId });
    if (!itinerary) {
      return res.status(404).json({ success: false, error: 'Itinerary not found' });
    }

    itinerary.activities.push(activity._id);
    await itinerary.save();

    res.status(201).json({ success: true, data: activity });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update an activity
export const updateActivity = async (req, res) => {
  try {
    const { activityId } = req.params;
    const activity = await Activity.findByIdAndUpdate(activityId, req.body, {
      new: true,
      runValidators: true,
    });
    if (!activity) {
      return res.status(404).json({ success: false, error: 'Activity not found' });
    }
    res.status(200).json({ success: true, data: activity });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Delete an activity
export const deleteActivity = async (req, res) => {
  try {
    const { tripId, activityId } = req.params;
    const activity = await Activity.findByIdAndDelete(activityId);
    if (!activity) {
      return res.status(404).json({ success: false, error: 'Activity not found' });
    }

    const itinerary = await Itinerary.findOne({ trip: tripId });
    if (itinerary) {
      itinerary.activities = itinerary.activities.filter(
        (id) => id.toString() !== activityId
      );
      await itinerary.save();
    }

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get weather information for an activity
export const getWeatherForActivity = async (req, res) => {
  try {
    const { activityId } = req.params;
    const activity = await Activity.findById(activityId);
    if (!activity) {
      return res.status(404).json({ success: false, error: 'Activity not found' });
    }

    const { latitude, longitude } = activity.location;
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${WEATHER_API_KEY}&units=metric`
    );

    res.status(200).json({
      success: true,
      data: {
        temperature: response.data.main.temp,
        description: response.data.weather[0].description,
        humidity: response.data.main.humidity,
        windSpeed: response.data.wind.speed,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}; 
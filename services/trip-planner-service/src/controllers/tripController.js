import Trip from '../models/Trip.js';
import Budget from '../models/Budget.js';
import PackingList from '../models/PackingList.js';
import Activity from '../models/Activity.js';

// Create a new trip
export const createTrip = async (req, res) => {
  try {
    const { title, description, startDate, endDate, destinations, tags } = req.body;
    const userId = req.user._id;

    // Create the trip with string destinations
    const trip = new Trip({
      userId,
      title,
      description,
      startDate,
      endDate,
      destinations: destinations || [], // Allow string destinations
      tags,
    });

    // Create associated budget
    const budget = new Budget({
      tripId: trip._id,
      totalBudget: 0,
      currency: 'USD',
      categories: [
        { name: 'accommodation', allocated: 0, spent: 0, items: [] },
        { name: 'transportation', allocated: 0, spent: 0, items: [] },
        { name: 'food', allocated: 0, spent: 0, items: [] },
        { name: 'activities', allocated: 0, spent: 0, items: [] },
        { name: 'shopping', allocated: 0, spent: 0, items: [] },
        { name: 'miscellaneous', allocated: 0, spent: 0, items: [] },
      ],
    });

    // Create associated packing list
    const packingList = new PackingList({
      tripId: trip._id,
      categories: [
        { name: 'clothing', items: [] },
        { name: 'toiletries', items: [] },
        { name: 'electronics', items: [] },
        { name: 'documents', items: [] },
        { name: 'medications', items: [] },
        { name: 'miscellaneous', items: [] },
      ],
    });

    // Save all documents
    await Promise.all([
      trip.save(),
      budget.save(),
      packingList.save(),
    ]);

    // Update trip with references
    trip.budget = budget._id;
    trip.packingList = packingList._id;
    await trip.save();

    res.status(201).json({
      success: true,
      data: trip,
    });
  } catch (error) {
    console.error('Error creating trip:', error);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// Get all trips for a user
export const getTrips = async (req, res) => {
  try {
    const userId = req.user._id;
    const { status, startDate, endDate } = req.query;

    const query = { userId };
    if (status) query.status = status;
    if (startDate) query.startDate = { $gte: new Date(startDate) };
    if (endDate) query.endDate = { $lte: new Date(endDate) };

    const trips = await Trip.find(query)
      .populate('destinations')
      .populate('budget')
      .populate('packingList')
      .sort({ startDate: 1 });

    res.status(200).json({
      success: true,
      count: trips.length,
      data: trips,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// Get a single trip
export const getTrip = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id)
      .populate('destinations')
      .populate('budget')
      .populate('packingList')
      .populate({
        path: 'itinerary.activities',
        model: 'Activity',
      });

    if (!trip) {
      return res.status(404).json({
        success: false,
        error: 'Trip not found',
      });
    }

    res.status(200).json({
      success: true,
      data: trip,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// Update a trip
export const updateTrip = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({
        success: false,
        error: 'Trip not found',
      });
    }

    // Update trip fields
    Object.keys(req.body).forEach(key => {
      trip[key] = req.body[key];
    });

    await trip.save();

    res.status(200).json({
      success: true,
      data: trip,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// Delete a trip
export const deleteTrip = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({
        success: false,
        error: 'Trip not found',
      });
    }

    // Delete associated budget and packing list
    await Promise.all([
      Budget.deleteOne({ tripId: trip._id }),
      PackingList.deleteOne({ tripId: trip._id }),
      Activity.deleteMany({ _id: { $in: trip.itinerary.flatMap(day => day.activities) } }),
    ]);

    await trip.remove();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// Add activity to itinerary
export const addActivityToItinerary = async (req, res) => {
  try {
    const { day, activityId } = req.body;
    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({
        success: false,
        error: 'Trip not found',
      });
    }

    // Find or create the day in the itinerary
    let dayEntry = trip.itinerary.find(entry => entry.day === day);
    if (!dayEntry) {
      dayEntry = { day, activities: [] };
      trip.itinerary.push(dayEntry);
    }

    // Add the activity if it's not already there
    if (!dayEntry.activities.includes(activityId)) {
      dayEntry.activities.push(activityId);
    }

    await trip.save();

    res.status(200).json({
      success: true,
      data: trip,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// Remove activity from itinerary
export const removeActivityFromItinerary = async (req, res) => {
  try {
    const { day, activityId } = req.body;
    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({
        success: false,
        error: 'Trip not found',
      });
    }

    const dayEntry = trip.itinerary.find(entry => entry.day === day);
    if (dayEntry) {
      dayEntry.activities = dayEntry.activities.filter(id => id.toString() !== activityId);
    }

    await trip.save();

    res.status(200).json({
      success: true,
      data: trip,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
}; 
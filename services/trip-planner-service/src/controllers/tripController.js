import mongoose from 'mongoose';
import Trip from '../models/Trip.js';
import Budget from '../models/Budget.js';
import PackingList from '../models/PackingList.js';
import Activity from '../models/Activity.js';

// Create a new trip
export const createTrip = async (req, res) => {
  try {
    const { title, description, startDate, endDate, destinations, tags } = req.body;
    const userId = req.user._id;

    let sanitizedDestinations = [];
    if (Array.isArray(destinations)) {
      sanitizedDestinations = destinations
        .filter(id => mongoose.Types.ObjectId.isValid(id))
        .map(id => mongoose.Types.ObjectId(id));
    }

    
    const trip = new Trip({
      userId,
      title,
      description,
      startDate,
      endDate,
      destinations: sanitizedDestinations,
      tags,
    });

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

    await Promise.all([
      trip.save(),
      budget.save(),
      packingList.save()
    ]);

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
      .populate('packingList');

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
      Activity.deleteMany({ tripId: trip._id })
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

// Activity controllers
export const getTripActivities = async (req, res) => {
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

export const createActivity = async (req, res) => {
  try {
    const activity = new Activity({
      ...req.body,
      tripId: req.params.tripId
    });
    await activity.save();
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

export const updateActivity = async (req, res) => {
  try {
    const activity = await Activity.findOneAndUpdate(
      { _id: req.params.activityId, tripId: req.params.tripId },
      req.body,
      { new: true }
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

export const deleteActivity = async (req, res) => {
  try {
    const activity = await Activity.findOneAndDelete({
      _id: req.params.activityId,
      tripId: req.params.tripId
    });
    if (!activity) {
      return res.status(404).json({
        success: false,
        error: 'Activity not found'
      });
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

// Packing list controllers
export const getTripPackingList = async (req, res) => {
  try {
    const packingList = await PackingList.findOne({ tripId: req.params.tripId });
    if (!packingList) {
      return res.status(404).json({
        success: false,
        error: 'Packing list not found'
      });
    }
    res.status(200).json({
      success: true,
      data: packingList
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

export const addPackingItem = async (req, res) => {
  try {
    const packingList = await PackingList.findOne({ tripId: req.params.tripId });
    if (!packingList) {
      return res.status(404).json({
        success: false,
        error: 'Packing list not found'
      });
    }

    const { category, item } = req.body;
    const categoryIndex = packingList.categories.findIndex(c => c.name === category);
    
    if (categoryIndex === -1) {
      packingList.categories.push({ name: category, items: [item] });
    } else {
      packingList.categories[categoryIndex].items.push(item);
    }

    await packingList.save();
    res.status(200).json({
      success: true,
      data: packingList
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

export const updatePackingItem = async (req, res) => {
  try {
    const packingList = await PackingList.findOne({ tripId: req.params.tripId });
    if (!packingList) {
      return res.status(404).json({
        success: false,
        error: 'Packing list not found'
      });
    }

    const { category, itemIndex, packed } = req.body;
    const categoryIndex = packingList.categories.findIndex(c => c.name === category);
    
    if (categoryIndex === -1 || !packingList.categories[categoryIndex].items[itemIndex]) {
      return res.status(404).json({
        success: false,
        error: 'Item not found'
      });
    }

    packingList.categories[categoryIndex].items[itemIndex].packed = packed;
    await packingList.save();
    res.status(200).json({
      success: true,
      data: packingList
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

export const deletePackingItem = async (req, res) => {
  try {
    const packingList = await PackingList.findOne({ tripId: req.params.tripId });
    if (!packingList) {
      return res.status(404).json({
        success: false,
        error: 'Packing list not found'
      });
    }

    const { category, itemIndex } = req.body;
    const categoryIndex = packingList.categories.findIndex(c => c.name === category);
    
    if (categoryIndex === -1 || !packingList.categories[categoryIndex].items[itemIndex]) {
      return res.status(404).json({
        success: false,
        error: 'Item not found'
      });
    }

    packingList.categories[categoryIndex].items.splice(itemIndex, 1);
    await packingList.save();
    res.status(200).json({
      success: true,
      data: packingList
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Budget controllers
export const getTripBudget = async (req, res) => {
  try {
    const budget = await Budget.findOne({ tripId: req.params.tripId });
    if (!budget) {
      return res.status(404).json({
        success: false,
        error: 'Budget not found'
      });
    }
    res.status(200).json({
      success: true,
      data: budget
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

export const createBudget = async (req, res) => {
  try {
    const budget = new Budget({
      ...req.body,
      tripId: req.params.tripId
    });
    await budget.save();
    res.status(201).json({
      success: true,
      data: budget
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

export const updateBudget = async (req, res) => {
  try {
    const budget = await Budget.findOneAndUpdate(
      { tripId: req.params.tripId },
      req.body,
      { new: true }
    );
    if (!budget) {
      return res.status(404).json({
        success: false,
        error: 'Budget not found'
      });
    }
    res.status(200).json({
      success: true,
      data: budget
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

export const addExpense = async (req, res) => {
  try {
    const budget = await Budget.findOne({ tripId: req.params.tripId });
    if (!budget) {
      return res.status(404).json({
        success: false,
        error: 'Budget not found'
      });
    }

    const { category, amount, description } = req.body;
    const categoryIndex = budget.categories.findIndex(c => c.name === category);
    
    if (categoryIndex === -1) {
      return res.status(400).json({
        success: false,
        error: 'Invalid category'
      });
    }

    budget.categories[categoryIndex].items.push({
      amount,
      description,
      date: new Date()
    });
    budget.categories[categoryIndex].spent += amount;

    await budget.save();
    res.status(200).json({
      success: true,
      data: budget
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

export const updateExpense = async (req, res) => {
  try {
    const budget = await Budget.findOne({ tripId: req.params.tripId });
    if (!budget) {
      return res.status(404).json({
        success: false,
        error: 'Budget not found'
      });
    }

    const { category, expenseId, amount, description } = req.body;
    const categoryIndex = budget.categories.findIndex(c => c.name === category);
    
    if (categoryIndex === -1) {
      return res.status(400).json({
        success: false,
        error: 'Invalid category'
      });
    }

    const expenseIndex = budget.categories[categoryIndex].items.findIndex(
      item => item._id.toString() === expenseId
    );

    if (expenseIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Expense not found'
      });
    }

    const oldAmount = budget.categories[categoryIndex].items[expenseIndex].amount;
    budget.categories[categoryIndex].items[expenseIndex] = {
      amount,
      description,
      date: new Date()
    };
    budget.categories[categoryIndex].spent += (amount - oldAmount);

    await budget.save();
    res.status(200).json({
      success: true,
      data: budget
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

export const deleteExpense = async (req, res) => {
  try {
    const budget = await Budget.findOne({ tripId: req.params.tripId });
    if (!budget) {
      return res.status(404).json({
        success: false,
        error: 'Budget not found'
      });
    }

    const { category, expenseId } = req.body;
    const categoryIndex = budget.categories.findIndex(c => c.name === category);
    
    if (categoryIndex === -1) {
      return res.status(400).json({
        success: false,
        error: 'Invalid category'
      });
    }

    const expenseIndex = budget.categories[categoryIndex].items.findIndex(
      item => item._id.toString() === expenseId
    );

    if (expenseIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Expense not found'
      });
    }

    const amount = budget.categories[categoryIndex].items[expenseIndex].amount;
    budget.categories[categoryIndex].items.splice(expenseIndex, 1);
    budget.categories[categoryIndex].spent -= amount;

    await budget.save();
    res.status(200).json({
      success: true,
      data: budget
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
}; 
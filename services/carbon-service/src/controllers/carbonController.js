const CarbonFootprint = require('../models/CarbonFootprint');

// Calculate carbon emission based on travel type and distance
const calculateCarbonEmission = (travelType, distance, unit) => {
  const emissionFactors = {
    flight: 0.255, // kg CO2 per km
    car: 0.171,    // kg CO2 per km
    train: 0.041,  // kg CO2 per km
    bus: 0.104,    // kg CO2 per km
    bicycle: 0,    // No emissions
    walking: 0     // No emissions
  };

  const distanceInKm = unit === 'miles' ? distance * 1.60934 : distance;
  return distanceInKm * emissionFactors[travelType];
};

// Add a new carbon footprint entry
exports.addCarbonFootprint = async (req, res) => {
  try {
    const { travelType, distance, unit, details } = req.body;
    const userId = req.user.id;

    const carbonEmission = calculateCarbonEmission(travelType, distance, unit);

    const footprint = new CarbonFootprint({
      userId,
      travelType,
      distance,
      unit,
      carbonEmission,
      details
    });

    await footprint.save();
    res.status(201).json(footprint);
  } catch (error) {
    console.error('Error in addCarbonFootprint:', error);
    res.status(500).json({ 
      message: 'Error adding carbon footprint', 
      error: error.message,
      details: error.errors
    });
  }
};

// Update a carbon footprint entry
exports.updateCarbonFootprint = async (req, res) => {
  try {
    const { id } = req.params;
    const { travelType, distance, unit, details } = req.body;
    const userId = req.user.id;

    // Verify ownership
    const existingEntry = await CarbonFootprint.findOne({ _id: id, userId });
    if (!existingEntry) {
      return res.status(404).json({ message: 'Entry not found or unauthorized' });
    }

    const carbonEmission = calculateCarbonEmission(travelType, distance, unit);

    const updatedFootprint = await CarbonFootprint.findByIdAndUpdate(
      id,
      {
        travelType,
        distance,
        unit,
        carbonEmission,
        details
      },
      { new: true }
    );

    res.json(updatedFootprint);
  } catch (error) {
    console.error('Error in updateCarbonFootprint:', error);
    res.status(500).json({ message: 'Error updating carbon footprint', error: error.message });
  }
};

// Delete a carbon footprint entry
exports.deleteCarbonFootprint = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Verify ownership
    const existingEntry = await CarbonFootprint.findOne({ _id: id, userId });
    if (!existingEntry) {
      return res.status(404).json({ message: 'Entry not found or unauthorized' });
    }

    await CarbonFootprint.findByIdAndDelete(id);
    res.json({ message: 'Entry deleted successfully' });
  } catch (error) {
    console.error('Error in deleteCarbonFootprint:', error);
    res.status(500).json({ message: 'Error deleting carbon footprint', error: error.message });
  }
};

// Get user's carbon footprint history
exports.getUserCarbonFootprint = async (req, res) => {
  try {
    const userId = req.user.id;
    const footprints = await CarbonFootprint.find({ userId })
      .sort({ date: -1 });
    res.json(footprints);
  } catch (error) {
    console.error('Error in getUserCarbonFootprint:', error);
    res.status(500).json({ message: 'Error fetching carbon footprint', error: error.message });
  }
};

// Get total carbon footprint for a user
exports.getTotalCarbonFootprint = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await CarbonFootprint.aggregate([
      { $match: { userId } },
      { $group: { 
        _id: null,
        totalEmission: { $sum: '$carbonEmission' },
        averageEmission: { $avg: '$carbonEmission' },
        count: { $sum: 1 }
      }}
    ]);

    res.json(result[0] || { totalEmission: 0, averageEmission: 0, count: 0 });
  } catch (error) {
    console.error('Error in getTotalCarbonFootprint:', error);
    res.status(500).json({ message: 'Error calculating total carbon footprint', error: error.message });
  }
};

// Get carbon footprint by date range
exports.getCarbonFootprintByDateRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const userId = req.user.id;

    const query = { userId };
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const footprints = await CarbonFootprint.find(query).sort({ date: -1 });
    res.json(footprints);
  } catch (error) {
    console.error('Error in getCarbonFootprintByDateRange:', error);
    res.status(500).json({ message: 'Error fetching carbon footprint by date range', error: error.message });
  }
}; 
const express = require('express');
const router = express.Router();
const Accommodation = require('../models/Accommodation');

// Get eco-friendly accommodations with filters
router.get('/search', async (req, res) => {
  try {
    const {
      city,
      country,
      maxPrice,
      minSustainabilityScore,
      type,
      amenities
    } = req.query;

    // Build query
    const query = {};
    if (city) query['location.city'] = new RegExp(city, 'i');
    if (country) query['location.country'] = new RegExp(country, 'i');
    if (maxPrice) query['priceRange.max'] = { $lte: parseFloat(maxPrice) };
    if (minSustainabilityScore) query.sustainabilityScore = { $gte: parseFloat(minSustainabilityScore) };
    if (type) query.type = type;
    if (amenities) query.amenities = { $all: amenities.split(',') };

    // Find accommodations
    const accommodations = await Accommodation.find(query)
      .sort({ sustainabilityScore: -1, averageRating: -1 })
      .limit(20);

    res.json({
      success: true,
      count: accommodations.length,
      data: accommodations
    });
  } catch (err) {
    console.error('Error searching accommodations:', err);
    res.status(500).json({
      success: false,
      message: 'Error searching accommodations',
      error: err.message
    });
  }
});

// Get accommodation details
router.get('/:id', async (req, res) => {
  try {
    const accommodation = await Accommodation.findById(req.params.id);
    if (!accommodation) {
      return res.status(404).json({
        success: false,
        message: 'Accommodation not found'
      });
    }
    res.json({
      success: true,
      data: accommodation
    });
  } catch (err) {
    console.error('Error fetching accommodation:', err);
    res.status(500).json({
      success: false,
      message: 'Error fetching accommodation',
      error: err.message
    });
  }
});

// Add review to accommodation
router.post('/:id/reviews', async (req, res) => {
  try {
    const { userId, rating, comment } = req.body;
    const accommodation = await Accommodation.findById(req.params.id);

    if (!accommodation) {
      return res.status(404).json({
        success: false,
        message: 'Accommodation not found'
      });
    }

    // Add review
    accommodation.reviews.push({
      userId,
      rating,
      comment,
      date: new Date()
    });

    // Update average rating
    const totalRatings = accommodation.reviews.reduce((sum, review) => sum + review.rating, 0);
    accommodation.averageRating = totalRatings / accommodation.reviews.length;

    await accommodation.save();

    res.json({
      success: true,
      message: 'Review added successfully',
      data: accommodation
    });
  } catch (err) {
    console.error('Error adding review:', err);
    res.status(500).json({
      success: false,
      message: 'Error adding review',
      error: err.message
    });
  }
});

module.exports = router; 
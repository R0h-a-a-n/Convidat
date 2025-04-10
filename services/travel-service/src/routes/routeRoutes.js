const express = require('express');
const router = express.Router();
const Route = require('../models/Route');

// Search for eco-friendly routes
router.post('/search', async (req, res) => {
  try {
    const {
      originCity,
      originCountry,
      destinationCity,
      destinationCountry,
      maxPrice,
      maxCarbonEmissions,
      preferredTransportTypes
    } = req.body;

    // Build query
    const query = {};
    if (originCity) query['origin.city'] = new RegExp(originCity, 'i');
    if (originCountry) query['origin.country'] = new RegExp(originCountry, 'i');
    if (destinationCity) query['destination.city'] = new RegExp(destinationCity, 'i');
    if (destinationCountry) query['destination.country'] = new RegExp(destinationCountry, 'i');
    if (maxPrice) query['totalCost.amount'] = { $lte: parseFloat(maxPrice) };
    if (maxCarbonEmissions) query.totalCarbonEmissions = { $lte: parseFloat(maxCarbonEmissions) };
    if (preferredTransportTypes && preferredTransportTypes.length > 0) {
      query['segments.type'] = { $in: preferredTransportTypes };
    }

    // Find routes
    const routes = await Route.find(query)
      .sort({ sustainabilityScore: 1, totalCost: 1 })
      .limit(10);

    // Calculate eco-savings for each route
    const routesWithSavings = routes.map(route => {
      const standardEmissions = route.totalDistance * 0.255; // Average flight emissions
      const savings = standardEmissions - route.totalCarbonEmissions;
      return {
        ...route.toObject(),
        ecoSavings: {
          carbonSaved: savings,
          percentage: ((savings / standardEmissions) * 100).toFixed(1)
        }
      };
    });

    res.json({
      success: true,
      count: routes.length,
      data: routesWithSavings
    });
  } catch (err) {
    console.error('Error searching routes:', err);
    res.status(500).json({
      success: false,
      message: 'Error searching routes',
      error: err.message
    });
  }
});

// Get route details
router.get('/:id', async (req, res) => {
  try {
    const route = await Route.findById(req.params.id);
    if (!route) {
      return res.status(404).json({
        success: false,
        message: 'Route not found'
      });
    }

    // Calculate eco-savings
    const standardEmissions = route.totalDistance * 0.255; // Average flight emissions
    const savings = standardEmissions - route.totalCarbonEmissions;

    const routeWithSavings = {
      ...route.toObject(),
      ecoSavings: {
        carbonSaved: savings,
        percentage: ((savings / standardEmissions) * 100).toFixed(1)
      }
    };

    res.json({
      success: true,
      data: routeWithSavings
    });
  } catch (err) {
    console.error('Error fetching route:', err);
    res.status(500).json({
      success: false,
      message: 'Error fetching route',
      error: err.message
    });
  }
});

// Get eco-friendly alternatives for a route
router.post('/alternatives', async (req, res) => {
  try {
    const { originCity, destinationCity, originalRoute } = req.body;

    // Find alternative routes
    const alternatives = await Route.find({
      'origin.city': new RegExp(originCity, 'i'),
      'destination.city': new RegExp(destinationCity, 'i'),
      _id: { $ne: originalRoute },
      sustainabilityScore: { $gt: 60 } // Only eco-friendly alternatives
    })
    .sort({ sustainabilityScore: 1, totalCost: 1 })
    .limit(5);

    // Calculate savings compared to original route
    const originalRouteData = await Route.findById(originalRoute);
    if (originalRouteData) {
      const alternativesWithSavings = alternatives.map(alt => ({
        ...alt.toObject(),
        savings: {
          cost: originalRouteData.totalCost.amount - alt.totalCost.amount,
          carbon: originalRouteData.totalCarbonEmissions - alt.totalCarbonEmissions,
          time: originalRouteData.totalDuration - alt.totalDuration
        }
      }));

      res.json({
        success: true,
        count: alternatives.length,
        data: alternativesWithSavings
      });
    } else {
      res.json({
        success: true,
        count: alternatives.length,
        data: alternatives
      });
    }
  } catch (err) {
    console.error('Error finding alternatives:', err);
    res.status(500).json({
      success: false,
      message: 'Error finding alternative routes',
      error: err.message
    });
  }
});

module.exports = router; 
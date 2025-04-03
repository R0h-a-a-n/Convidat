const express = require('express');
const router = express.Router();
const { routes } = require('../data/sampleData');

// Search routes
router.post('/search', (req, res) => {
  const {
    originCity,
    originCountry,
    destinationCity,
    destinationCountry,
    maxPrice,
    maxCarbonEmissions,
    preferredTransportTypes
  } = req.body;

  let filteredRoutes = [...routes];

  // Apply filters
  if (originCity) {
    filteredRoutes = filteredRoutes.filter(
      route => route.origin.city.toLowerCase().includes(originCity.toLowerCase())
    );
  }

  if (originCountry) {
    filteredRoutes = filteredRoutes.filter(
      route => route.origin.country.toLowerCase().includes(originCountry.toLowerCase())
    );
  }

  if (destinationCity) {
    filteredRoutes = filteredRoutes.filter(
      route => route.destination.city.toLowerCase().includes(destinationCity.toLowerCase())
    );
  }

  if (destinationCountry) {
    filteredRoutes = filteredRoutes.filter(
      route => route.destination.country.toLowerCase().includes(destinationCountry.toLowerCase())
    );
  }

  if (maxPrice) {
    filteredRoutes = filteredRoutes.filter(
      route => route.totalCost.amount <= parseInt(maxPrice)
    );
  }

  if (maxCarbonEmissions) {
    filteredRoutes = filteredRoutes.filter(
      route => route.totalCarbonEmissions <= parseInt(maxCarbonEmissions)
    );
  }

  if (preferredTransportTypes && preferredTransportTypes.length > 0) {
    filteredRoutes = filteredRoutes.filter(
      route => route.segments.some(segment => 
        preferredTransportTypes.includes(segment.type)
      )
    );
  }

  res.json({
    success: true,
    data: filteredRoutes
  });
});

// Get route by ID
router.get('/:id', (req, res) => {
  const route = routes.find(r => r._id === req.params.id);
  
  if (!route) {
    return res.status(404).json({
      success: false,
      error: 'Route not found'
    });
  }

  res.json({
    success: true,
    data: route
  });
});

module.exports = router; 
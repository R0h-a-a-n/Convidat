// travel-service/src/routes/routesjs.js (or create a new file called placesRoutes.js)

const express = require('express');
const router = express.Router();
const placesService = require('../services/placesService');

// Geocoding endpoint
router.get('/geocode', async (req, res) => {
  try {
    const { city } = req.query;
    
    if (!city) {
      return res.status(400).json({ error: 'City parameter is required' });
    }
    
    const geocodeResult = await placesService.geocodeCity(city);
    res.json(geocodeResult);
  } catch (error) {
    console.error('Geocode API error:', error);
    res.status(500).json({ error: 'Failed to geocode city' });
  }
});

// Nearby places endpoint
router.get('/nearby', async (req, res) => {
  try {
    const { lat, lng, type, radius, limit } = req.query;
    
    if (!lat || !lng) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }
    
    const nearbyPlaces = await placesService.getNearbyPlaces(
      parseFloat(lat),
      parseFloat(lng),
      type || 'locality',
      parseInt(radius) || 100000,
      parseInt(limit) || 3
    );
    
    res.json(nearbyPlaces);
  } catch (error) {
    console.error('Nearby places API error:', error);
    res.status(500).json({ error: 'Failed to fetch nearby places' });
  }
});

// Place details endpoint
router.get('/details', async (req, res) => {
  try {
    const { placeId, city } = req.query;
    
    if (placeId) {
      const details = await placesService.getPlaceDetails(placeId);
      res.json(details);
    } else if (city) {
      const description = await placesService.getCityDescription(city);
      res.json({ description });
    } else {
      res.status(400).json({ error: 'Either placeId or city parameter is required' });
    }
  } catch (error) {
    console.error('Place details API error:', error);
    res.status(500).json({ error: 'Failed to fetch place details' });
  }
});

module.exports = router;
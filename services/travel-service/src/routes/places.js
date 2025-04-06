const express = require('express');
const router = express.Router();
const axios = require('axios');

// Validate that required API keys are available
const validateApiKeys = (req, res, next) => {
  const geocodingKey = process.env.GEOCODING_API_KEY || process.env.GOOGLE_MAPS_API_KEY;
  const placesKey = process.env.PLACES_API_KEY || process.env.GOOGLE_MAPS_API_KEY;
  
  if (!geocodingKey || !placesKey) {
    return res.status(500).json({ 
      error: 'API keys not configured',
      details: 'Please set GEOCODING_API_KEY and PLACES_API_KEY environment variables'
    });
  }
  
  // Add the keys to the request object for use in the routes
  req.apiKeys = {
    geocoding: geocodingKey,
    places: placesKey
  };
  
  next();
};

// Apply middleware to all routes
router.use(validateApiKeys);

/**
 * @route GET /api/places/geocode
 * @desc Geocode a city name to coordinates
 * @access Public
 */
router.get('/geocode', async (req, res) => {
  try {
    const { city } = req.query;
    
    if (!city) {
      return res.status(400).json({ error: 'City parameter is required' });
    }
    
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(city)}&key=${req.apiKeys.geocoding}`
    );

    if (response.data.status !== 'OK' || !response.data.results.length) {
      return res.status(404).json({ 
        error: 'City not found',
        status: response.data.status,
        message: response.data.error_message || 'Unable to geocode the provided city'
      });
    }

    const result = response.data.results[0];
    res.json({
      location: result.geometry.location,
      formattedAddress: result.formatted_address,
      placeId: result.place_id
    });
  } catch (error) {
    console.error('Geocoding error:', error.message);
    res.status(500).json({ error: 'Failed to geocode city', details: error.message });
  }
});

/**
 * @route GET /api/places/nearby
 * @desc Get nearby cities based on coordinates
 * @access Public
 */
router.get('/nearby', async (req, res) => {
  try {
    const { lat, lng, type = 'locality', radius = 100000, limit = 3 } = req.query;
    
    if (!lat || !lng) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }
    
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=${type}&key=${req.apiKeys.places}`
    );

    if (response.data.status !== 'OK') {
      return res.status(400).json({ 
        error: 'Failed to get nearby places',
        status: response.data.status,
        message: response.data.error_message || 'No results found'
      });
    }

    // Filter for cities/localities and limit the results
    const cities = response.data.results
      .filter(place => place.types.includes('locality') || place.types.includes('political'))
      .slice(0, parseInt(limit))
      .map(place => ({
        name: place.name,
        placeId: place.place_id,
        location: place.geometry.location,
        vicinity: place.vicinity,
        types: place.types
      }));

    // Get additional details for each city if available
    const citiesWithDetails = await Promise.all(
      cities.map(async city => {
        try {
          const detailsResponse = await axios.get(
            `https://maps.googleapis.com/maps/api/place/details/json?place_id=${city.placeId}&fields=name,formatted_address,rating,editorial_summary&key=${req.apiKeys.places}`
          );
          
          if (detailsResponse.data.status === 'OK') {
            const result = detailsResponse.data.result;
            return {
              ...city,
              formattedAddress: result.formatted_address,
              rating: result.rating,
              description: result.editorial_summary?.overview || 
                `Discover eco-friendly destinations in ${city.name}`
            };
          }
          return {
            ...city,
            description: `Explore sustainable travel options in ${city.name}`
          };
        } catch (err) {
          console.error(`Error getting details for ${city.name}:`, err.message);
          return {
            ...city,
            description: `Visit ${city.name} for eco-conscious traveling`
          };
        }
      })
    );

    res.json({ cities: citiesWithDetails });
  } catch (error) {
    console.error('Nearby places error:', error.message);
    res.status(500).json({ error: 'Failed to fetch nearby places', details: error.message });
  }
});

/**
 * @route GET /api/places/details
 * @desc Get details about a place by ID or city name
 * @access Public
 */
router.get('/details', async (req, res) => {
  try {
    const { placeId, city } = req.query;
    
    if (!placeId && !city) {
      return res.status(400).json({ error: 'Either placeId or city parameter is required' });
    }

    if (placeId) {
      // Get details using placeId
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,formatted_address,rating,editorial_summary,url,geometry&key=${req.apiKeys.places}`
      );

      if (response.data.status !== 'OK') {
        return res.status(404).json({ 
          error: 'Place not found', 
          status: response.data.status 
        });
      }

      const result = response.data.result;
      res.json({
        name: result.name,
        formattedAddress: result.formatted_address,
        rating: result.rating,
        description: result.editorial_summary?.overview || 
          `Explore sustainable travel options in ${result.name}`,
        mapUrl: result.url,
        location: result.geometry?.location
      });
    } else {
      // Get description using city name (fallback to Wikipedia API)
      try {
        const wikiResponse = await axios.get(
          `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(city)}`
        );
        
        if (wikiResponse.data.extract) {
          return res.json({
            description: wikiResponse.data.extract
          });
        }
      } catch (wikiError) {
        console.log('Wikipedia API fallback failed, using generic description');
      }
      
      // If Wikipedia fails, return a generic description
      res.json({
        description: `Discover eco-friendly attractions and sustainable travel options in ${city}.`
      });
    }
  } catch (error) {
    console.error('Place details error:', error.message);
    res.status(500).json({ error: 'Failed to fetch place details', details: error.message });
  }
});

module.exports = router;
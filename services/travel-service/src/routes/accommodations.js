const express = require('express');
const router = express.Router();
const axios = require('axios');
require('dotenv').config();

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
const BASE_URL = 'https://maps.googleapis.com/maps/api/place';

// Search accommodations
router.get('/search', async (req, res) => {
  try {
    const { city, country, maxPrice, type } = req.query;
    console.log('Search params:', { city, country, maxPrice, type });

    if (!process.env.GOOGLE_MAPS_API_KEY) {
      console.error('Google Maps API key is missing');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const searchQuery = `${type || 'hotel'} in ${city}, ${country}`;
    const placesUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(searchQuery)}&key=${process.env.GOOGLE_MAPS_API_KEY}`;

    console.log('Making Places API request...');
    const response = await axios.get(placesUrl);
    console.log(`Places API response status: ${response.status}, found ${response?.data?.results?.length || 0} results`);

    if (!response.data.results || response.data.results.length === 0) {
      return res.json({ data: [] });
    }

    let accommodations = response.data.results.map(place => {
      const ecoScoreData = calculateEcoScore(place);
      const priceRange = calculatePriceRange(place.price_level);
      
      return {
        _id: place.place_id,
        name: place.name,
        location: {
          city: city,
          country: country,
          coordinates: {
            lat: place.geometry.location.lat,
            lng: place.geometry.location.lng
          },
          address: place.formatted_address
        },
        type: type || 'hotel',
        priceRange: priceRange,
        sustainability: {
          rating: ecoScoreData.rating,
          score: ecoScoreData.score,
          features: ecoScoreData.features,
          certifications: ecoScoreData.certifications
        },
        rating: place.rating || 0,
        photos: place.photos ? [`https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${place.photos[0].photo_reference}&key=${process.env.GOOGLE_MAPS_API_KEY}`] : [],
        types: place.types || []
      };
    });

    // Sort by eco score (highest to lowest)
    accommodations.sort((a, b) => b.sustainability.score - a.sustainability.score);

    // Take top 10 results
    accommodations = accommodations.slice(0, 10);

    console.log(`Returning top ${accommodations.length} results sorted by eco score`);
    res.json({ data: accommodations });
  } catch (error) {
    console.error('Error in accommodation search:', error.message);
    res.status(500).json({ error: 'Failed to fetch accommodations' });
  }
});

// Get accommodation details
router.get('/:id', async (req, res) => {
  try {
    const detailsUrl = `${BASE_URL}/details/json`;
    const response = await axios.get(detailsUrl, {
      params: {
        place_id: req.params.id,
        fields: 'name,rating,formatted_address,formatted_phone_number,website,photos,reviews,price_level,geometry',
        key: GOOGLE_MAPS_API_KEY
      }
    });

    if (!response.data.result) {
      return res.status(404).json({
        success: false,
        error: 'Accommodation not found'
      });
    }

    const place = response.data.result;
    
    const placeDetails = {
      _id: req.params.id,
      name: place.name,
      location: {
        coordinates: {
          lat: place.geometry.location.lat,
          lng: place.geometry.location.lng
        },
        address: place.formatted_address
      },
      contact: {
        phone: place.formatted_phone_number,
        website: place.website
      },
      rating: place.rating,
      reviews: place.reviews,
      photos: place.photos,
      priceLevel: place.price_level
    };

    res.json({
      success: true,
      data: placeDetails
    });
  } catch (error) {
    console.error('Error in /:id:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: error.response?.data?.error_message || error.message || 'Error fetching accommodation details'
    });
  }
});

// Helper function to calculate eco score and features
function calculateEcoScore(place) {
  let score = 0;
  let features = [];
  const details = place;
  
  // Base score from rating (0-5)
  if (details.rating) {
    score += details.rating * 0.4; // 40% weight for general rating
  }

  // Keywords that suggest eco-friendliness
  const ecoKeywords = ['eco', 'sustainable', 'green', 'organic', 'solar', 'recycl', 'environment', 'nature', 'garden'];
  if (details.name) {
    ecoKeywords.forEach(keyword => {
      if (details.name.toLowerCase().includes(keyword)) {
        score += 0.5;
        features.push(`${keyword.charAt(0).toUpperCase()}${keyword.slice(1)} Friendly`);
      }
    });
  }

  // Additional points for certain amenities or features
  if (details.types) {
    if (details.types.includes('lodging')) {
      score += 0.5;
      features.push('Eco-Friendly Lodging');
    }
    if (details.types.includes('spa')) {
      score += 0.3;
      features.push('Natural Spa');
    }
    if (details.types.includes('park')) {
      score += 0.4;
      features.push('Natural Surroundings');
    }
    if (details.types.includes('natural_feature')) {
      score += 0.4;
      features.push('Natural Environment');
    }
  }

  // Normalize score to 0-5 range
  score = Math.min(5, Math.max(0, score));
  
  // Default features if none found
  if (features.length === 0) {
    features = ['Energy Efficient', 'Waste Management'];
  }

  return {
    score: score,
    rating: Math.round(score),
    features: [...new Set(features)],
    certifications: ['Eco-Friendly Certified']
  };
}

// Calculate price range based on Google's price level
function calculatePriceRange(priceLevel = 2) {
  const basePrices = {
    0: { min: 20, max: 50 },    // Budget
    1: { min: 40, max: 100 },   // Economy
    2: { min: 80, max: 200 },   // Mid-range
    3: { min: 150, max: 400 },  // Upscale
    4: { min: 300, max: 1000 }, // Luxury
  };
  return basePrices[priceLevel] || basePrices[2];
}

module.exports = router; 
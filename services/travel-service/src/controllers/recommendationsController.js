const axios = require('axios');
require('dotenv').config();

const getRecommendations = async (req, res) => {
  try {
    const { city, country } = req.query;
    const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

    if (!GOOGLE_MAPS_API_KEY) {
      throw new Error('Google Maps API key is not configured');
    }

    // Step 1: Geocode the destination city to get coordinates
    const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      `${city}, ${country}`
    )}&key=${GOOGLE_MAPS_API_KEY}`;

    const geocodeResponse = await axios.get(geocodeUrl);
    
    if (geocodeResponse.data.status !== 'OK') {
      throw new Error('Failed to geocode city');
    }

    const { lat, lng } = geocodeResponse.data.results[0].geometry.location;

    // Step 2: Use Places API to find nearby cities
    const nearbySearchUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=100000&type=locality&key=${GOOGLE_MAPS_API_KEY}`;

    const nearbyResponse = await axios.get(nearbySearchUrl);

    if (nearbyResponse.data.status !== 'OK') {
      throw new Error('Failed to fetch nearby cities');
    }

    // Filter and format nearby cities
    const nearbyCities = nearbyResponse.data.results
      .filter(place => place.types.includes('locality'))
      .slice(0, 3)
      .map(place => ({
        city: place.name,
        description: `Explore eco-friendly destinations near ${place.name}`,
        mapUrl: `https://www.google.com/maps/place/${encodeURIComponent(place.name)}`,
        ecoFriendlySpots: [
          `${place.name} Nature Park`,
          `${place.name} Botanical Garden`,
          `${place.name} Wildlife Sanctuary`
        ]
      }));

    // Add the destination city as the first recommendation
    const recommendations = [
      {
        city: city,
        description: `Discover sustainable travel options in ${city}`,
        mapUrl: `https://www.google.com/maps/place/${encodeURIComponent(city)}`,
        ecoFriendlySpots: [
          `${city} Eco Park`,
          `${city} Green Zone`,
          `${city} Conservation Area`
        ]
      },
      ...nearbyCities
    ];

    res.json(recommendations);
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    res.status(500).json({ 
      error: 'Failed to fetch recommendations',
      details: error.message 
    });
  }
};

module.exports = {
  getRecommendations
}; 
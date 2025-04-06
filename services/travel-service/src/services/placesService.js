// travel-service/src/services/placesService.js

const axios = require('axios');

// You'll need to set up environment variables for your API keys
const GEOCODING_API_KEY = process.env.GEOCODING_API_KEY;
const PLACES_API_KEY = process.env.PLACES_API_KEY;

/**
 * Geocode a city name to get its coordinates
 * @param {string} city - The city name to geocode
 * @returns {Promise<Object>} The geocoding result with lat/lng
 */
async function geocodeCity(city) {
  try {
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(city)}&key=${GEOCODING_API_KEY}`
    );

    if (response.data.status !== 'OK' || !response.data.results.length) {
      throw new Error(`Failed to geocode city: ${city}`);
    }

    const location = response.data.results[0].geometry.location;
    return {
      location,
      formattedAddress: response.data.results[0].formatted_address
    };
  } catch (error) {
    console.error('Geocoding error:', error);
    throw error;
  }
}

/**
 * Get nearby cities based on coordinates
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @param {string} type - Place type (e.g., 'city')
 * @param {number} radius - Search radius in meters
 * @param {number} limit - Maximum number of results
 * @returns {Promise<Array>} Nearby cities
 */
async function getNearbyPlaces(lat, lng, type = 'locality', radius = 100000, limit = 3) {
  try {
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=${type}&key=${PLACES_API_KEY}`
    );

    if (response.data.status !== 'OK') {
      throw new Error(`Failed to get nearby places: ${response.data.status}`);
    }

    const cities = response.data.results
      .filter(place => place.types.includes('locality'))
      .slice(0, limit)
      .map(place => ({
        name: place.name,
        placeId: place.place_id,
        location: place.geometry.location
      }));

    // Fetch additional details for each city
    const citiesWithDetails = await Promise.all(
      cities.map(async city => {
        try {
          const details = await getPlaceDetails(city.placeId);
          return {
            ...city,
            description: details.description
          };
        } catch (err) {
          return city;
        }
      })
    );

    return { cities: citiesWithDetails };
  } catch (error) {
    console.error('Nearby places error:', error);
    throw error;
  }
}

/**
 * Get detailed information about a place
 * @param {string} placeId - Google Place ID
 * @returns {Promise<Object>} Place details
 */
async function getPlaceDetails(placeId) {
  try {
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,formatted_address,rating,editorial_summary&key=${PLACES_API_KEY}`
    );

    if (response.data.status !== 'OK') {
      throw new Error(`Failed to get place details: ${response.data.status}`);
    }

    const result = response.data.result;
    return {
      name: result.name,
      formattedAddress: result.formatted_address,
      rating: result.rating,
      description: result.editorial_summary?.overview || `Explore this eco-friendly destination`
    };
  } catch (error) {
    console.error('Place details error:', error);
    throw error;
  }
}

/**
 * Get city description from Wikipedia or fallback to a generated description
 * @param {string} city - City name
 * @returns {Promise<string>} City description
 */
async function getCityDescription(city) {
  try {
    // Try to get description from Wikipedia API
    const response = await axios.get(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(city)}`
    );
    
    if (response.data.extract) {
      return response.data.extract;
    }
    
    return `Explore eco-friendly attractions and sustainable travel options in ${city}.`;
  } catch (error) {
    console.error('City description error:', error);
    return `Discover sustainable tourism opportunities in ${city}.`;
  }
}

module.exports = {
  geocodeCity,
  getNearbyPlaces,
  getPlaceDetails,
  getCityDescription
};
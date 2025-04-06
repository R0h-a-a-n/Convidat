import dotenv from 'dotenv';
import axios from 'axios';
import Destination from '../models/Destination.js';

// Load environment variables
dotenv.config();

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

// Eco-friendly place types to search for
const ECO_FRIENDLY_TYPES = [
  'park',
  // 'tourist_attraction', // Removed due to overly generic results
  'museum',
  'art_gallery',
  'aquarium',
  'zoo',
  'botanical_garden',
  'natural_feature',
  'campground'
];

// Define non-eco-friendly types to filter out (e.g., hardware shops)
const NON_ECO_FRIENDLY_TYPES = ['hardware_store'];

// Minimum acceptable rating to consider a place (optional)
const MIN_RATING = 3;

export const getDestinationsByCity = async (req, res) => {
  try {
    const { city, country } = req.query;

    if (!city) {
      return res.status(400).json({
        success: false,
        error: 'City parameter is required'
      });
    }

    if (!GOOGLE_PLACES_API_KEY) {
      return res.status(500).json({
        success: false,
        error: 'Google Places API key is not configured'
      });
    }

    // First, try to get existing destinations from the database
    const existingDestinations = await Destination.find({
      city: new RegExp(city, 'i'),
      ...(country && { country: new RegExp(country, 'i') })
    });

    if (existingDestinations.length > 0) {
      console.log('Returning cached destinations from database');
      return res.json({
        success: true,
        data: existingDestinations
      });
    }

    console.log('No cached destinations found, fetching from Google Places API');

    // Get the city's coordinates using the Geocoding API
    console.log('Fetching coordinates for:', city, country);
    const geocodeResponse = await axios({
      method: 'get',
      url: 'https://maps.googleapis.com/maps/api/geocode/json',
      params: {
        address: `${city}${country ? `, ${country}` : ''}`,
        key: GOOGLE_PLACES_API_KEY
      }
    });

    console.log('Geocoding response status:', geocodeResponse.data.status);

    if (geocodeResponse.data.status !== 'OK' || !geocodeResponse.data.results.length) {
      console.error('Geocoding failed:', geocodeResponse.data);
      return res.status(404).json({
        success: false,
        error: 'City not found',
        details: geocodeResponse.data.status
      });
    }

    const location = geocodeResponse.data.results[0].geometry.location;
    console.log('Location found:', location);

    // Search for places in the city – one type at a time
    let allPlaces = [];

    for (const placeType of ECO_FRIENDLY_TYPES) {
      console.log(`Searching for ${placeType} places near:`, location);
      try {
        const placesResponse = await axios({
          method: 'get',
          url: 'https://maps.googleapis.com/maps/api/place/nearbysearch/json',
          params: {
            location: `${location.lat},${location.lng}`,
            radius: '5000',
            type: placeType,
            key: GOOGLE_PLACES_API_KEY
          }
        });

        if (placesResponse.data.status === 'OK' && placesResponse.data.results.length > 0) {
          // Filter results: ensure the place's types include the search type,
          // do not include any undesired types, and meet the rating threshold.
          const places = placesResponse.data.results
            .filter(place => {
              const types = place.types || [];
              const validType = types.includes(placeType);
              const hasNonEcoType = NON_ECO_FRIENDLY_TYPES.some(nonEco => types.includes(nonEco));
              const validRating = place.rating ? place.rating >= MIN_RATING : true;
              return validType && !hasNonEcoType && validRating;
            })
            .map(place => {
              // Determine eco-friendly features based on the place type
              const ecoFeatures = [];
              if (['park', 'natural_feature', 'campground'].includes(placeType)) {
                ecoFeatures.push('Natural Conservation');
              }
              if (['museum', 'art_gallery'].includes(placeType)) {
                ecoFeatures.push('Cultural Heritage');
              }
              if (['zoo', 'aquarium'].includes(placeType)) {
                ecoFeatures.push('Wildlife Conservation');
              }
              if (placeType === 'botanical_garden') {
                ecoFeatures.push('Biodiversity');
              }

              return {
                name: place.name,
                city: city,
                country: country || '',
                description: place.vicinity || 'No description available',
                ecoFeatures,
                location: {
                  type: 'Point',
                  coordinates: [place.geometry.location.lng, place.geometry.location.lat]
                },
                rating: place.rating || 0,
                openingHours: place.opening_hours?.open_now ? 'Open now' : 'Hours not available',
                admissionFee: 'Contact venue for details'
              };
            });

          allPlaces = [...allPlaces, ...places];
        } else {
          console.log(`No ${placeType} places found:`, placesResponse.data.status);
        }
      } catch (error) {
        console.error(`Error fetching ${placeType} places:`, error.response?.data || error.message);
        // Continue with other place types even if one fails
      }
    }

    // Remove duplicates (using place name as key) and sort by rating
    const uniquePlaces = Array.from(new Map(allPlaces.map(place => [place.name, place])).values())
      .sort((a, b) => b.rating - a.rating);

    if (uniquePlaces.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No eco-friendly destinations found in this area'
      });
    }

    // Save valid places to the database
    try {
      await Destination.insertMany(uniquePlaces);
      console.log(`Saved ${uniquePlaces.length} destinations to database`);
    } catch (error) {
      console.error('Failed to save destinations to database:', error);
      // Continue even if database save fails
    }

    console.log(`Found ${uniquePlaces.length} valid eco-friendly destinations`);
    return res.json({
      success: true,
      data: uniquePlaces
    });
  } catch (error) {
    console.error('Error in getDestinationsByCity:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch destinations',
      details: error.message
    });
  }
};

export const getDestinationById = async (req, res) => {
  try {
    const destination = await Destination.findById(req.params.id);

    if (!destination) {
      return res.status(404).json({
        success: false,
        error: 'Destination not found'
      });
    }

    res.json({
      success: true,
      data: destination
    });
  } catch (error) {
    console.error('Error fetching destination:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch destination',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const getNearbyDestinations = async (req, res) => {
  try {
    const { lat, lng, radius = 5000 } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        error: 'Latitude and longitude are required'
      });
    }

    const destinations = await Destination.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: parseInt(radius)
        }
      }
    });

    res.json({
      success: true,
      data: destinations
    });
  } catch (error) {
    console.error('Error fetching nearby destinations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch nearby destinations',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

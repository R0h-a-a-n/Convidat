const express = require('express');
const router = express.Router();
const axios = require('axios');
require('dotenv').config();

// Initialize Google Maps client
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
const TRAINLINE_API_KEY = process.env.TRAINLINE_API_KEY;
const REDBUS_API_KEY = process.env.REDBUS_API_KEY;

// Debug log for API key
console.log('Google Maps API Key status:', GOOGLE_MAPS_API_KEY ? 'Present' : 'Missing');

// Sample route data for fallback
const sampleRoutes = {
  'Chennai-Bangalore': {
    train: {
      distance: 350,
      duration: 360,
      price: 35,
      carbonEmissions: 14.35
    },
    bus: {
      distance: 350,
      duration: 420,
      price: 18,
      carbonEmissions: 28.7
    }
  },
  'Mumbai-Pune': {
    train: {
      distance: 150,
      duration: 180,
      price: 15,
      carbonEmissions: 6.15
    },
    bus: {
      distance: 150,
      duration: 240,
      price: 8,
      carbonEmissions: 12.3
    }
  },
  'Delhi-Agra': {
    train: {
      distance: 200,
      duration: 120,
      price: 20,
      carbonEmissions: 8.2
    },
    bus: {
      distance: 200,
      duration: 240,
      price: 10,
      carbonEmissions: 16.4
    }
  }
};

// Helper function to get route key
const getRouteKey = (origin, destination) => {
  const cities = [origin.city, destination.city].sort();
  return `${cities[0]}-${cities[1]}`;
};

// Helper function to calculate carbon emissions
const calculateCarbonEmissions = (distance, mode) => {
  // CO2 emissions in kg per passenger kilometer
  const emissionFactors = {
    train: 0.041,  // Electric train
    bus: 0.082,    // Coach bus
    flight: 0.255  // Short-haul flight
  };
  return (distance * (emissionFactors[mode] || emissionFactors.bus)).toFixed(2);
};

// Helper function to estimate price
const estimatePrice = (distance, mode) => {
  // Price per kilometer in USD
  const priceFactors = {
    train: 0.10,
    bus: 0.05,
    flight: 0.25
  };
  return Math.round(distance * (priceFactors[mode] || priceFactors.bus));
};

// Helper function to get route details from Google Maps
const getRouteDetails = async (origin, destination) => {
  try {
    if (!GOOGLE_MAPS_API_KEY) {
      throw new Error('Google Maps API key is not configured');
    }

    console.log(`Fetching route from ${origin} to ${destination}`);
    
    const response = await axios.get('https://maps.googleapis.com/maps/api/directions/json', {
      params: {
        origin: origin,
        destination: destination,
        mode: 'transit',
        transit_mode: 'train',
        alternatives: true,
        key: GOOGLE_MAPS_API_KEY
      }
    });

    if (response.data.status !== 'OK') {
      console.error('Google Maps API Error:', response.data.status, response.data.error_message);
      throw new Error(`Route search failed: ${response.data.status}`);
    }

    return response.data;
  } catch (error) {
    console.error('Error getting route details:', error.message);
    // If Google Maps API fails, use sample data
    return {
      routes: [{
        legs: [{
          distance: { value: 150000 }, // 150 km
          duration: { value: 15000 }, // 250 minutes
          start_location: { lat: 0, lng: 0 },
          end_location: { lat: 0, lng: 0 }
        }]
      }]
    };
  }
};

// Search routes
router.get('/search', async (req, res) => {
  try {
    const { originCity, originCountry, destinationCity, destinationCountry } = req.query;

    console.log('Received search request:', {
      query: req.query,
      headers: req.headers,
      method: req.method
    });

    // Validate required parameters
    if (!originCity || !destinationCity) {
      return res.status(400).json({
        success: false,
        message: 'Origin and destination cities are required'
      });
    }

    const origin = `${originCity}, ${originCountry}`;
    const destination = `${destinationCity}, ${destinationCountry}`;

    // Get route details from Google Maps API
    const routeDetails = await getRouteDetails(origin, destination);
    
    if (!routeDetails || !routeDetails.routes || routeDetails.routes.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No routes found'
      });
    }

    // Transform the route data using actual Google Maps response
    const transformedRoutes = routeDetails.routes.map((route, index) => {
      const leg = route.legs[0];
      
      // Get transit details from steps
      const transitSteps = leg.steps.filter(step => step.travel_mode === 'TRANSIT');
      const mainTransitStep = transitSteps[0]; // Get the main transit step (usually train)
      
      // Format duration for display
      const durationInMinutes = Math.round(leg.duration.value / 60);
      const hours = Math.floor(durationInMinutes / 60);
      const minutes = durationInMinutes % 60;
      const formattedDuration = `${hours}h ${minutes}m`;

      // Get transit specific information
      const transitDetails = mainTransitStep?.transit_details || {};
      const transitLine = transitDetails.line || {};
      const transitType = transitLine.vehicle?.type || 'TRAIN';

      return {
        _id: `route-${index}`,
        origin: {
          city: originCity,
          country: originCountry,
          address: leg.start_address,
          coordinates: {
            lat: leg.start_location.lat,
            lng: leg.start_location.lng
          }
        },
        destination: {
          city: destinationCity,
          country: destinationCountry,
          address: leg.end_address,
          coordinates: {
            lat: leg.end_location.lat,
            lng: leg.end_location.lng
          }
        },
        type: transitType.toLowerCase(),
        distance: Number((leg.distance.value / 1000).toFixed(2)), // Convert to km
        duration: formattedDuration,
        price: 13, // Fixed price for now
        carbonEmissions: 5.23, // Fixed emissions for now
        departureTime: transitDetails.departure_time?.text,
        arrivalTime: transitDetails.arrival_time?.text,
        steps: leg.steps.map(step => ({
          type: step.travel_mode.toLowerCase(),
          instruction: step.html_instructions,
          distance: step.distance.text,
          duration: step.duration.text,
          transitDetails: step.transit_details ? {
            departureStop: step.transit_details.departure_stop?.name,
            arrivalStop: step.transit_details.arrival_stop?.name,
            line: step.transit_details.line?.short_name,
            vehicle: step.transit_details.line?.vehicle?.name
          } : null
        })),
        sustainabilityFeatures: ['Electric Train', 'Public Transport']
      };
    });

    console.log('Transformed routes:', JSON.stringify(transformedRoutes, null, 2));

    res.json({
      success: true,
      data: transformedRoutes
    });

  } catch (error) {
    console.error('Route search error:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching for routes',
      error: error.message
    });
  }
});

// Get route by ID
router.get('/:id', (req, res) => {
  const route = routes.find(r => r._id === req.params.id);
  if (!route) {
    return res.status(404).json({
      success: false,
      message: 'Route not found'
    });
  }
  res.json({
    success: true,
    data: route
  });
});

module.exports = router; 
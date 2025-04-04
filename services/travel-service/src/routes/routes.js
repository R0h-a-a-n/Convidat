const express = require('express');
const router = express.Router();
const axios = require('axios');
require('dotenv').config();

// Initialize Google Maps client
const { GOOGLE_MAPS_API_KEY } = process.env;
const TRAINLINE_API_KEY = process.env.TRAINLINE_API_KEY;
const REDBUS_API_KEY = process.env.REDBUS_API_KEY;

// Debug log for API key
console.log('Google Maps API Key status:', GOOGLE_MAPS_API_KEY ? 'Present' : 'Missing');

// Constants for calculations
const TRANSPORT_EMISSIONS = {
  train: 0.041, // kg CO2 per km
  flight: 0.092, // kg CO2 per km (updated for modern aircraft)
  bus: 0.027, // kg CO2 per passenger km
  ferry: 0.019 // kg CO2 per passenger km
};

const BASE_PRICES = {
  train: 0.15, // $ per km
  flight: 0.25, // $ per km
  bus: 0.10, // $ per km
  ferry: 0.15 // $ per km
};

// Helper function to calculate emissions
const calculateEmissions = (distance, mode) => {
  const emissionFactor = TRANSPORT_EMISSIONS[mode] || TRANSPORT_EMISSIONS.train;
  // For international flights, emissions per km decrease with distance
  if (mode === 'flight' && distance > 1000) {
    // Reduce emissions factor for long-haul flights
    const reductionFactor = Math.min(0.7, Math.max(0.3, 1 - (distance - 1000) / 15000));
    return Number((distance * emissionFactor * reductionFactor).toFixed(2));
  }
  return Number((distance * emissionFactor).toFixed(2));
};

// Helper function to calculate price
const calculatePrice = (distance, mode) => {
  const priceFactor = BASE_PRICES[mode] || BASE_PRICES.train;
  // For international flights, price per km decreases with distance
  if (mode === 'flight' && distance > 1000) {
    const reductionFactor = Math.min(0.8, Math.max(0.4, 1 - (distance - 1000) / 15000));
    return Math.round(distance * priceFactor * reductionFactor);
  }
  return Math.round(distance * priceFactor);
};

// Helper function to get route details from Google Maps
const getRouteDetails = async (origin, destination, mode = 'transit') => {
  try {
    if (!GOOGLE_MAPS_API_KEY) {
      throw new Error('Google Maps API key is not configured');
    }

    console.log('=== Route Details Request ===');
    console.log('From:', origin);
    console.log('To:', destination);
    console.log('Mode:', mode);

    // For international routes or long distances, use flight mode
    const isInternational = origin.toLowerCase().includes('us') && !destination.toLowerCase().includes('us');
    const useFlightMode = isInternational || mode === 'flight';
    
    // Format origin for better results
    let originFormatted = origin;
    if (origin.toLowerCase().includes('north carolina')) {
      originFormatted = 'Charlotte, North Carolina, US'; // Using Charlotte as it's the largest city
    }

    // For flight routes, we'll create a simulated route
    if (useFlightMode) {
      // Use geocoding to get coordinates (simplified for now)
      const coordinates = {
        'charlotte': { lat: 35.2271, lng: -80.8431 },
        'mumbai': { lat: 19.0760, lng: 72.8777 },
        'chennai': { lat: 13.0827, lng: 80.2707 }
      };

      const startCoords = coordinates[originFormatted.split(',')[0].toLowerCase()] || { lat: 35.2271, lng: -80.8431 };
      const endCoords = coordinates[destination.split(',')[0].toLowerCase()] || { lat: 19.0760, lng: 72.8777 };

      // Calculate distance using Haversine formula
      const R = 6371; // Earth's radius in km
      const dLat = (endCoords.lat - startCoords.lat) * Math.PI / 180;
      const dLon = (endCoords.lng - startCoords.lng) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(startCoords.lat * Math.PI / 180) * Math.cos(endCoords.lat * Math.PI / 180) * 
                Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const distance = R * c;

      const flightTime = {
        hours: Math.floor(distance / 800),
        minutes: Math.round((distance % 800) / 13.33)
      };

      console.log('Creating flight route with distance:', distance.toFixed(2), 'km');

      return {
        routes: [{
          legs: [{
            distance: { value: distance * 1000, text: `${distance.toFixed(0)} km` },
            duration: { 
              value: (flightTime.hours * 3600 + flightTime.minutes * 60),
              text: `${flightTime.hours}h ${flightTime.minutes}m`
            },
            start_location: startCoords,
            end_location: endCoords,
            start_address: originFormatted,
            end_address: destination,
            steps: [{
              travel_mode: 'FLIGHT',
              html_instructions: `Flight from ${originFormatted} to ${destination}`,
              distance: { value: distance * 1000, text: `${distance.toFixed(0)} km` },
              duration: {
                text: `${flightTime.hours}h ${flightTime.minutes}m`,
                value: (flightTime.hours * 3600 + flightTime.minutes * 60)
              },
              transit_details: {
                departure_time: { text: '10:00 AM' },
                arrival_time: { 
                  text: `${(10 + flightTime.hours) % 24}:${flightTime.minutes.toString().padStart(2, '0')} ${flightTime.hours >= 14 ? 'PM' : 'AM'}`
                },
                line: { 
                  short_name: 'INT',
                  vehicle: { type: 'AIRPLANE', name: 'Airplane' }
                }
              }
            }]
          }]
        }]
      };
    }

    // For non-flight routes, use Google Maps API
    const params = {
      origin: originFormatted,
      destination: destination,
      key: GOOGLE_MAPS_API_KEY,
      mode: mode === 'train' ? 'transit' : mode
    };

    if (mode === 'train') {
      params.transit_mode = 'train';
    }

    const url = 'https://maps.googleapis.com/maps/api/directions/json';
    console.log('Making request to:', url);
    console.log('With params:', {
      ...params,
      key: '***'
    });

    const response = await axios.get(url, { params });

    console.log('=== API Response ===');
    console.log('Status:', response.data.status);
    console.log('Routes found:', response.data.routes ? response.data.routes.length : 0);

    if (response.data.status !== 'OK') {
      throw new Error(`Route search failed: ${response.data.status} - ${response.data.error_message || 'No additional error message'}`);
    }

    return response.data;
  } catch (error) {
    console.error('=== Route Details Error ===');
    console.error('Error Type:', error.name);
    console.error('Error Message:', error.message);
    if (error.response) {
      console.error('Response Status:', error.response.status);
      console.error('Response Data:', error.response.data);
    }
    throw error;
  }
};

// Search routes
router.get('/search', async (req, res) => {
  try {
    console.log('\n=== New Route Search Request ===');
    const { 
      originCity, 
      originCountry, 
      destinationCity, 
      destinationCountry,
      preferredTransportTypes = [],
      maxPrice,
      maxCarbonEmissions
    } = req.query;

    console.log('Search Parameters:', {
      origin: { city: originCity, country: originCountry },
      destination: { city: destinationCity, country: destinationCountry },
      transportTypes: preferredTransportTypes,
      maxPrice,
      maxCarbonEmissions
    });

    // Validate required parameters
    if (!originCity || !destinationCity) {
      return res.status(400).json({
        success: false,
        message: 'Origin and destination cities are required'
      });
    }

    // Format cities properly
    const formattedOriginCity = originCity.replace(/-/g, ' ');
    const origin = `${formattedOriginCity}, ${originCountry}`;
    const destination = `${destinationCity}, ${destinationCountry}`;
    
    console.log('Formatted Locations:', {
      origin,
      destination
    });

    // Determine available transport modes based on distance and location
    const isInternational = originCountry !== destinationCountry;
    let transportModes = [];
    
    // Handle transport types array
    if (Array.isArray(preferredTransportTypes)) {
      transportModes = preferredTransportTypes.filter(mode => 
        ['train', 'bus', 'flight', 'ferry'].includes(mode.toLowerCase())
      );
    } else if (typeof preferredTransportTypes === 'string') {
      transportModes = [preferredTransportTypes];
    }

    // For international routes, ensure flight is included
    if (isInternational && !transportModes.includes('flight')) {
      transportModes.push('flight');
    }

    // If no valid modes specified, use defaults
    if (transportModes.length === 0) {
      transportModes = isInternational ? ['flight'] : ['train', 'bus'];
    }

    console.log('Using transport modes:', transportModes);

    const routes = [];
    const errors = [];
    
    // Get routes for each transport mode
    for (const mode of transportModes) {
      try {
        console.log(`Searching for ${mode} route from ${origin} to ${destination}`);
        const routeDetails = await getRouteDetails(origin, destination, mode);
        
        if (routeDetails.routes && routeDetails.routes.length > 0) {
          routeDetails.routes.forEach((route, index) => {
            const leg = route.legs[0];
            const distance = leg.distance.value / 1000; // Convert to km
            const emissions = calculateEmissions(distance, mode);
            const price = calculatePrice(distance, mode);

            console.log(`Found ${mode} route:`, {
              distance: distance,
              emissions: emissions,
              price: price
            });

            // Skip if exceeds max price or emissions
            if ((maxPrice && price > parseFloat(maxPrice)) || 
                (maxCarbonEmissions && emissions > parseFloat(maxCarbonEmissions))) {
              console.log(`Route exceeds limits - Price: ${price}/${maxPrice}, Emissions: ${emissions}/${maxCarbonEmissions}`);
              return;
            }

            // Get transit/flight details
            const mainStep = leg.steps[0];
            const transitDetails = mainStep.transit_details || {};

            routes.push({
              _id: `${mode}-${index}`,
              type: mode,
              origin: {
                city: formattedOriginCity,
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
              distance: Number(distance.toFixed(2)),
              duration: mainStep.duration.text,
              price: price,
              carbonEmissions: emissions,
              departureTime: transitDetails.departure_time?.text || '10:00 AM',
              arrivalTime: transitDetails.arrival_time?.text || '6:00 PM',
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
              sustainabilityFeatures: mode === 'train' ? 
                ['Electric Train', 'Public Transport'] : 
                mode === 'flight' ? 
                  ['Modern Aircraft', 'Optimized Route'] :
                  ['Shared Transport', 'Fuel-Efficient']
            });
          });
        }
      } catch (error) {
        console.error(`Error fetching ${mode} route:`, error);
        errors.push(`${mode}: ${error.message}`);
        // Continue with other transport modes
      }
    }

    // Sort routes by emissions and price
    routes.sort((a, b) => {
      if (a.carbonEmissions === b.carbonEmissions) {
        return a.price - b.price;
      }
      return a.carbonEmissions - b.carbonEmissions;
    });

    console.log(`Found ${routes.length} routes`);
    if (errors.length > 0) {
      console.log('Encountered errors:', errors);
    }

    res.json({
      success: true,
      data: routes,
      errors: errors.length > 0 ? errors : undefined
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
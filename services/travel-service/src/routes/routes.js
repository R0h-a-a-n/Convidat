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
  train: {
    india: 0.015, // $ per km (approximately ₹1.25 per km)
    international: 0.15 // $ per km for international
  },
  flight: 0.25, // $ per km
  bus: 0.10, // $ per km
  ferry: 0.15 // $ per km
};

// Indian train routes database (simplified)
const INDIAN_TRAIN_ROUTES = {
  'Chennai-Mumbai': {
    distance: 1280, // km
    duration: 1260, // minutes (21 hours)
    basePrice: 1250, // INR (will be converted to USD)
    trains: [
      {
        name: "Chennai Express",
        number: "11041",
        departure: "11:05 PM",
        arrival: "5:50 AM",
        stops: [
          { name: "Panvel S.T. Bus Stand", time: "11:05 PM" },
          { name: "Sion", time: "11:25 PM" },
          { name: "SRM University", time: "5:10 AM" },
          { name: "Kalasipalyam", time: "5:30 AM" },
          { name: "Maharaja Travelskarad", time: "5:45 AM" },
          { name: "Karad Flyover Bridge", time: "5:50 AM" }
        ]
      }
    ]
  },
  'Mumbai-Chennai': {
    distance: 1280,
    duration: 1260,
    basePrice: 1250,
    trains: [
      {
        name: "Mumbai Express",
        number: "11042",
        departure: "4:00 PM",
        arrival: "10:00 PM",
        stops: [
          { name: "Mumbai CSMT", time: "4:00 PM" },
          { name: "Pune Junction", time: "7:00 PM" },
          { name: "Chennai Central", time: "10:00 PM" }
        ]
      }
    ]
  }
};

// Helper function to calculate emissions
const calculateEmissions = (distance, mode, country = null) => {
  const emissionFactor = TRANSPORT_EMISSIONS[mode] || TRANSPORT_EMISSIONS.train;
  // For international flights, emissions per km decrease with distance
  if (mode === 'flight' && distance > 1000) {
    const reductionFactor = Math.min(0.7, Math.max(0.3, 1 - (distance - 1000) / 15000));
    return Number((distance * emissionFactor * reductionFactor).toFixed(2));
  }
  return Number((distance * emissionFactor).toFixed(2));
};

// Helper function to calculate price
const calculatePrice = (distance, mode, country = null) => {
  let priceFactor;
  if (mode === 'train' && country?.toLowerCase() === 'india') {
    priceFactor = BASE_PRICES.train.india;
  } else if (mode === 'train') {
    priceFactor = BASE_PRICES.train.international;
  } else {
    priceFactor = BASE_PRICES[mode] || BASE_PRICES.train.international;
  }

  // For international flights, price per km decreases with distance
  if (mode === 'flight' && distance > 1000) {
    const reductionFactor = Math.min(0.8, Math.max(0.4, 1 - (distance - 1000) / 15000));
    return Math.round(distance * priceFactor * reductionFactor);
  }
  return Math.round(distance * priceFactor);
};

// Helper function to get Indian train route
const getIndianTrainRoute = (origin, destination) => {
  const cities = [origin, destination].map(city => city.split(',')[0].trim());
  const routeKey = `${cities[0]}-${cities[1]}`;
  return INDIAN_TRAIN_ROUTES[routeKey];
};

// Helper function to get route details from Google Maps or simulate flight routes
const getRouteDetails = async (origin, destination, mode = 'transit') => {
  try {
    if (!GOOGLE_MAPS_API_KEY) {
      throw new Error('Google Maps API key is not configured');
    }

    console.log('=== Route Details Request ===');
    console.log('From:', origin);
    console.log('To:', destination);
    console.log('Mode:', mode);

    // Check if this is an Indian train route
    if (mode === 'train' && 
        origin.toLowerCase().includes('india') && 
        destination.toLowerCase().includes('india')) {
      console.log('Found Indian train route');
      const trainRoute = getIndianTrainRoute(origin, destination);
      if (trainRoute) {
        const train = trainRoute.trains[0];
        return {
          routes: [{
            legs: [{
              distance: { value: trainRoute.distance * 1000, text: `${trainRoute.distance} km` },
              duration: { 
                value: trainRoute.duration * 60,
                text: `${Math.floor(trainRoute.duration / 60)}h ${trainRoute.duration % 60}m`
              },
              start_location: { lat: 0, lng: 0 }, // Placeholder coordinates
              end_location: { lat: 0, lng: 0 },
              start_address: origin,
              end_address: destination,
              steps: [{
                travel_mode: 'TRANSIT',
                html_instructions: `Take ${train.name} (${train.number}) from ${train.stops[0].name} to ${train.stops[train.stops.length - 1].name}`,
                distance: { value: trainRoute.distance * 1000, text: `${trainRoute.distance} km` },
                duration: {
                  text: `${Math.floor(trainRoute.duration / 60)}h ${trainRoute.duration % 60}m`,
                  value: trainRoute.duration * 60
                },
                transit_details: {
                  departure_time: { text: train.departure },
                  arrival_time: { text: train.arrival },
                  line: {
                    short_name: train.number,
                    vehicle: { type: 'TRAIN', name: 'Train' }
                  },
                  departure_stop: { name: train.stops[0].name },
                  arrival_stop: { name: train.stops[train.stops.length - 1].name }
                }
              }]
            }],
            overview_polyline: { points: null }
          }]
        };
      }
    }

    // For flight routes, simulate a realistic flight
    const useFlightMode = mode === 'flight';
    
    // Format origin for better results
    let originFormatted = origin;
    // For known issues with ambiguous locations, you can force a specific city.
    if (origin.toLowerCase().includes('north carolina')) {
      originFormatted = 'Charlotte, North Carolina, US';
    }

    if (useFlightMode) {
      // Define coordinates including Dubai for accurate simulation
      const coordinates = {
        'dubai': { lat: 25.2048, lng: 55.2708 },
        'mumbai': { lat: 19.0760, lng: 72.8777 },
        'chennai': { lat: 13.0827, lng: 80.2707 },
        'charlotte': { lat: 35.2271, lng: -80.8431 }
      };

      // Use the first part of the address (city) in lower case to find coordinates
      const originCityKey = originFormatted.split(',')[0].toLowerCase();
      const destinationCityKey = destination.split(',')[0].toLowerCase();

      const startCoords = coordinates[originCityKey] || { lat: 35.2271, lng: -80.8431 };
      const endCoords = coordinates[destinationCityKey] || { lat: 19.0760, lng: 72.8777 };

      // Calculate distance using the Haversine formula
      const R = 6371; // Earth's radius in km
      const dLat = (endCoords.lat - startCoords.lat) * Math.PI / 180;
      const dLon = (endCoords.lng - startCoords.lng) * Math.PI / 180;
      const a = Math.sin(dLat/2) ** 2 +
                Math.cos(startCoords.lat * Math.PI / 180) * Math.cos(endCoords.lat * Math.PI / 180) * 
                Math.sin(dLon/2) ** 2;
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const distance = R * c;

      // Use a flight speed of 900 km/h for realistic duration
      const flightSpeed = 900;
      const flightTimeHours = Math.floor(distance / flightSpeed);
      const flightTimeMinutes = Math.round((distance % flightSpeed) / 15); // 15 km per minute at 900 km/h

      console.log('Creating flight route with distance:', distance.toFixed(2), 'km');

      return {
        routes: [{
          legs: [{
            distance: { value: distance * 1000, text: `${distance.toFixed(0)} km` },
            duration: { 
              value: (flightTimeHours * 3600 + flightTimeMinutes * 60),
              text: `${flightTimeHours}h ${flightTimeMinutes}m`
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
                text: `${flightTimeHours}h ${flightTimeMinutes}m`,
                value: (flightTimeHours * 3600 + flightTimeMinutes * 60)
              },
              transit_details: {
                departure_time: { text: '10:00 AM' },
                arrival_time: { 
                  text: `${(10 + flightTimeHours) % 24}:${flightTimeMinutes.toString().padStart(2, '0')} ${flightTimeHours >= 14 ? 'PM' : 'AM'}`
                },
                line: { 
                  short_name: 'INT',
                  vehicle: { type: 'AIRPLANE', name: 'Airplane' }
                }
              }
            }]
          }],
          overview_polyline: { points: null }
        }]
      };
    }

    // For non-flight routes, use Google Maps API
    const params = {
      origin: originFormatted,
      destination: destination,
      key: GOOGLE_MAPS_API_KEY,
      mode: mode
    };

    // If the mode is train or bus, use transit with the appropriate filter
    if (mode === 'train') {
      params.mode = 'transit';
      params.transit_mode = 'train';
    } else if (mode === 'bus') {
      params.mode = 'transit';
      params.transit_mode = 'bus';
    }

    const url = 'https://maps.googleapis.com/maps/api/directions/json';
    console.log('Making request to:', url);
    console.log('With params:', { ...params, key: '***' });

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

// In-memory storage for routes so GET /:id can retrieve from the last search
let storedRoutes = [];

// Utility to generate detailed instructions string
const generateDetailedInstructions = (originCity, originCountry, destinationCity, destinationCountry, mode, totalDuration, price, emissions, departureTime, arrivalTime, steps) => {
  const header = `${originCity}, ${originCountry} to ${destinationCity}, ${destinationCountry}\n\n` +
                 `${mode.charAt(0).toUpperCase() + mode.slice(1)}\n\n` +
                 `Duration: ${totalDuration}\n` +
                 `Price: $${price}\n` +
                 `Carbon Emissions: ${emissions} kg CO2\n` +
                 `Schedule: ${departureTime} - ${arrivalTime}\n\n` +
                 `Journey Details:\n\n`;
  const details = steps.map(step => {
    let detail = `${step.travel_mode}: ${step.html_instructions} (${step.distance.text} • ${step.duration.text})`;
    if (step.transit_details) {
      detail += `\nfrom ${step.transit_details.departure_stop?.name || 'N/A'} to ${step.transit_details.arrival_stop?.name || 'N/A'}`;
    }
    return detail;
  }).join('\n\n');
  return header + details;
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
    
    console.log('Formatted Locations:', { origin, destination });

    // Determine available transport modes based on parameters
    const isInternational = originCountry !== destinationCountry;
    let transportModes = [];
    if (Array.isArray(preferredTransportTypes)) {
      transportModes = preferredTransportTypes.filter(mode => 
        ['train', 'bus', 'flight', 'ferry'].includes(mode.toLowerCase())
      );
    } else if (typeof preferredTransportTypes === 'string') {
      transportModes = [preferredTransportTypes];
    }
    if (isInternational && !transportModes.includes('flight')) {
      transportModes.push('flight');
    }
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
            const distance = leg.distance.value / 1000; // in km
            const emissions = calculateEmissions(distance, mode);
            const price = calculatePrice(distance, mode);
            const totalDuration = leg.duration.text;
            const departureTime = leg.steps[0].transit_details?.departure_time?.text || '10:00 AM';
            const arrivalTime = leg.steps[leg.steps.length - 1].transit_details?.arrival_time?.text || '6:00 PM';
            const mapUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(leg.start_address)}&destination=${encodeURIComponent(leg.end_address)}&travelmode=${(mode === 'bus' || mode === 'train') ? 'transit' : mode}`;

            // Build markers for origin and destination
            const markers = [
              { type: 'origin', label: 'Origin', coordinates: leg.start_location },
              { type: 'destination', label: 'Destination', coordinates: leg.end_location }
            ];

            // Generate a detailed instructions string based on steps
            const detailedInstructions = generateDetailedInstructions(
              formattedOriginCity, originCountry, destinationCity, destinationCountry,
              mode, totalDuration, price, emissions, departureTime, arrivalTime, leg.steps
            );

            console.log(`Found ${mode} route:`, {
              distance: Number(distance.toFixed(2)),
              emissions: emissions,
              price: price,
              duration: totalDuration
            });

            // Skip routes that exceed user limits
            if ((maxPrice && price > parseFloat(maxPrice)) || 
                (maxCarbonEmissions && emissions > parseFloat(maxCarbonEmissions))) {
              console.log(`Route exceeds limits - Price: ${price}/${maxPrice}, Emissions: ${emissions}/${maxCarbonEmissions}`);
              return;
            }

            routes.push({
              _id: `${mode}-${index}`,
              type: mode,
              origin: {
                city: formattedOriginCity,
                country: originCountry,
                address: leg.start_address,
                coordinates: leg.start_location
              },
              destination: {
                city: destinationCity,
                country: destinationCountry,
                address: leg.end_address,
                coordinates: leg.end_location
              },
              distance: Number(distance.toFixed(2)),
              duration: totalDuration,
              price: price,
              carbonEmissions: emissions,
              departureTime: departureTime,
              arrivalTime: arrivalTime,
              mapUrl: mapUrl,
              polyline: route.overview_polyline ? route.overview_polyline.points : null,
              markers: markers,
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
              detailedInstructions: detailedInstructions,
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
      }
    }

    // Sort routes by carbon emissions then by price
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

    // Save routes in memory for GET /:id retrieval
    storedRoutes = routes;

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

// Retrieve route by ID from in-memory storage
router.get('/:id', (req, res) => {
  const route = storedRoutes.find(r => r._id === req.params.id);
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

// ✅ Updated sustainable route backend with real Google Maps train routes via coordinates

const express = require('express');
const router = express.Router();
const axios = require('axios');
require('dotenv').config();

const { GOOGLE_MAPS_API_KEY } = process.env;

console.log('Google Maps API Key status:', GOOGLE_MAPS_API_KEY ? 'Present' : 'Missing');

const TRANSPORT_EMISSIONS = {
  train: 0.041,
  flight: 0.092,
  bus: 0.027,
  ferry: 0.019
};

const BASE_PRICES = {
  train: {
    india: 0.015,
    international: 0.15
  },
  flight: 0.25,
  bus: 0.10,
  ferry: 0.15
};

const calculateEmissions = (distance, mode) => {
  const factor = TRANSPORT_EMISSIONS[mode] || TRANSPORT_EMISSIONS.train;
  if (mode === 'flight' && distance > 1000) {
    const reduction = Math.min(0.7, Math.max(0.3, 1 - (distance - 1000) / 15000));
    return +(distance * factor * reduction).toFixed(2);
  }
  return +(distance * factor).toFixed(2);
};

const calculatePrice = (distance, mode, country) => {
  let factor;
  if (mode === 'train' && country?.toLowerCase() === 'india') {
    factor = BASE_PRICES.train.india;
  } else if (mode === 'train') {
    factor = BASE_PRICES.train.international;
  } else {
    factor = BASE_PRICES[mode] || BASE_PRICES.train.international;
  }
  if (mode === 'flight' && distance > 1000) {
    const reduction = Math.min(0.8, Math.max(0.4, 1 - (distance - 1000) / 15000));
    return Math.round(distance * factor * reduction);
  }
  return Math.round(distance * factor);
};

const getRouteDetails = async (originText, destinationText, mode = 'transit', options = {}) => {
  // Cache API responses to avoid redundant calls
  const apiCache = new Map();
  
  // Helper to geocode city strings -> lat/lng with caching
  const geocodeLocation = async (place) => {
    const cacheKey = `geocode:${place}`;
    if (apiCache.has(cacheKey)) return apiCache.get(cacheKey);
    
    try {
      const res = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
        params: { address: place, key: GOOGLE_MAPS_API_KEY }
      });
      
      if (res.data.status !== 'OK' || !res.data.results?.length) {
        throw new Error(`Geocoding failed with status: ${res.data.status}`);
      }
      
      const loc = res.data.results[0]?.geometry?.location;
      if (!loc) throw new Error(`Could not extract location data for: ${place}`);
      
      const result = {
        ...loc,
        formattedAddress: res.data.results[0]?.formatted_address,
        placeId: res.data.results[0]?.place_id
      };
      
      apiCache.set(cacheKey, result);
      return result;
    } catch (error) {
      throw new Error(`Geocoding error for '${place}': ${error.message}`);
    }
  };

  // Optimized Haversine distance calculation
  const getDistanceKm = (lat1, lng1, lat2, lng2) => {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  };

  // More efficient API call with caching
  const tryFetch = async (params, modeName) => {
    // Create cache key based on params
    const cacheKey = `directions:${JSON.stringify(params)}`;
    if (apiCache.has(cacheKey)) return apiCache.get(cacheKey);
    
    try {
      const response = await axios.get('https://maps.googleapis.com/maps/api/directions/json', { 
        params,
        timeout: 10000 // Reduced timeout for faster failures
      });
      
      const data = response.data;
      
      if (data.status !== 'OK') {
        const errorMessages = {
          'ZERO_RESULTS': `No ${modeName} routes found between these locations`,
          'NOT_FOUND': 'One or both locations could not be found',
          'MAX_WAYPOINTS_EXCEEDED': 'Too many waypoints in the request',
          'MAX_ROUTE_LENGTH_EXCEEDED': 'Route distance exceeds API limits',
          'INVALID_REQUEST': 'Invalid request parameters',
          'OVER_DAILY_LIMIT': 'API key usage limit exceeded',
          'OVER_QUERY_LIMIT': 'Too many requests',
          'REQUEST_DENIED': 'Request denied by the API',
          'UNKNOWN_ERROR': 'Unknown server error',
        };
        
        throw new Error(errorMessages[data.status] || `API returned error: ${data.status}`);
      }
      
      if (!data.routes?.length) {
        throw new Error(`No ${modeName} routes returned despite OK status`);
      }
      
      apiCache.set(cacheKey, data);
      return data;
    } catch (error) {
      if (error.response) {
        throw new Error(`API request failed with status ${error.response.status}: ${error.response.statusText}`);
      } else if (error.request) {
        throw new Error(`Request timeout or no response received for ${modeName} route`);
      }
      throw error;
    }
  };

  // Enhanced transit type validation
  const hasTransitType = (data, transitType) => {
    if (!data.routes?.length) return false;
    
    // Check multiple types of transit vehicles that could map to the requested type
    const transitTypeMapping = {
      'train': ['train', 'heavy_rail', 'intercity_bus', 'commuter_train', 'rail'],
      'bus': ['bus', 'trolleybus'],
      'subway': ['subway', 'metro_rail', 'metro'],
      'tram': ['tram', 'light_rail', 'monorail']
    };
    
    const typesToCheck = transitTypeMapping[transitType.toLowerCase()] || [transitType.toLowerCase()];
    
    // Check all legs and steps for matching transit types
    for (const route of data.routes) {
      for (const leg of route.legs || []) {
        for (const step of leg.steps || []) {
          if (step.travel_mode !== 'TRANSIT') continue;
          
          const vehicleType = step.transit_details?.line?.vehicle?.type?.toLowerCase();
          if (typesToCheck.includes(vehicleType)) {
            return true;
          }
        }
      }
    }
    
    return false;
  };

  // Optimized emissions calculator with memoization
  const emissionFactorMemo = {
    walking: 0,
    bicycling: 0,
    train: 35,
    subway: 30,
    tram: 25,
    bus: 105,
    transit: 65,
    driving: 170,
    ferry: 120,
    flight: 255
  };
  
  const calculateEmissions = (routeData, mode) => {
    if (!routeData.routes?.length) return { estimatedEmissions: Infinity };
    
    const route = routeData.routes[0];
    const distanceMeters = route.legs?.reduce((sum, leg) => sum + (leg.distance?.value || 0), 0) || 0;
    const distanceKm = distanceMeters / 1000;
    
    // Use precise transit step analysis for transit mode
    if (mode === 'transit') {
      let totalEmissions = 0;
      let totalAnalyzedDistance = 0;
      let transitModes = new Set();
      
      route.legs?.forEach(leg => {
        leg.steps?.forEach(step => {
          const stepDistanceKm = (step.distance?.value || 0) / 1000;
          
          if (step.travel_mode === 'WALKING') {
            // Walking has zero emissions
          } else if (step.travel_mode === 'TRANSIT') {
            const vehicleType = step.transit_details?.line?.vehicle?.type?.toLowerCase();
            transitModes.add(vehicleType || 'unknown');
            
            // Match vehicle type to emissions factor
            let emissionFactor;
            if (vehicleType === 'train' || vehicleType === 'heavy_rail' || vehicleType === 'commuter_train' || vehicleType === 'rail') {
              emissionFactor = emissionFactorMemo.train;
            } else if (vehicleType === 'subway' || vehicleType === 'metro_rail' || vehicleType === 'metro') {
              emissionFactor = emissionFactorMemo.subway;
            } else if (vehicleType === 'tram' || vehicleType === 'light_rail' || vehicleType === 'monorail') {
              emissionFactor = emissionFactorMemo.tram;
            } else if (vehicleType === 'bus' || vehicleType === 'trolleybus') {
              emissionFactor = emissionFactorMemo.bus;
            } else {
              emissionFactor = emissionFactorMemo.transit;
            }
            
            totalEmissions += stepDistanceKm * emissionFactor;
          } else {
            totalEmissions += stepDistanceKm * (emissionFactorMemo[mode] || emissionFactorMemo.driving);
          }
          
          totalAnalyzedDistance += stepDistanceKm;
        });
      });
      
      return {
        estimatedEmissions: totalEmissions,
        estimatedEmissionsPerKm: totalAnalyzedDistance > 0 ? totalEmissions / totalAnalyzedDistance : 0,
        distanceKm: distanceKm,
        transitModes: Array.from(transitModes)
      };
    }
    
    // For single-mode routes
    return {
      estimatedEmissions: distanceKm * (emissionFactorMemo[mode] || emissionFactorMemo.driving),
      estimatedEmissionsPerKm: emissionFactorMemo[mode] || emissionFactorMemo.driving,
      distanceKm: distanceKm
    };
  };

  // Optimized flight route generator
  const getFlightRoute = async (origin, destination, directDistance) => {
    // Calculate emissions with improved accuracy
    const shortHaulAdjustment = directDistance < 1500 ? 1.2 : 1.0; // Higher emissions for short flights due to takeoff/landing
    const flightEmissions = directDistance * 255 * shortHaulAdjustment;
    
    // More accurate flight time calculation
    const avgSpeed = directDistance < 1000 ? 700 : 850; // km/h - shorter flights are slower
    const taxiTime = 40/60; // 40 minutes for taxi, takeoff, landing procedures
    const flightTime = directDistance / avgSpeed + taxiTime;
    const hours = Math.floor(flightTime);
    const minutes = Math.floor((flightTime - hours) * 60);
    
    return {
      status: "OK",
      routes: [{
        legs: [{
          distance: { 
            text: `${Math.round(directDistance)} km`,
            value: directDistance * 1000
          },
          duration: {
            text: `${hours}h ${minutes}m`,
            value: (hours * 3600 + minutes * 60) * 1000
          },
          start_location: {
            lat: origin.lat,
            lng: origin.lng
          },
          end_location: {
            lat: destination.lat,
            lng: destination.lng
          },
          steps: [{
            travel_mode: "FLIGHT",
            distance: { 
              text: `${Math.round(directDistance)} km`,
              value: directDistance * 1000
            },
            duration: {
              text: `${hours}h ${minutes}m`,
              value: (hours * 3600 + minutes * 60) * 1000
            },
            html_instructions: `Fly from ${origin.formattedAddress || originText} to ${destination.formattedAddress || destinationText}`
          }]
        }],
        summary: `Flight from ${origin.formattedAddress || originText} to ${destination.formattedAddress || destinationText}`
      }],
      eco: {
        modeName: "Flight",
        estimatedEmissions: flightEmissions,
        estimatedEmissionsPerKm: 255 * shortHaulAdjustment,
        distanceKm: directDistance
      }
    };
  };

  // Streamlined diagnostics object
  const diagnostics = {
    geocodeResults: {},
    distance: null,
    attemptedModes: [],
    errors: {}
  };

  // Parallelize geocoding for origin and destination
  async function mainProcess() {
    try {
      // 1) Geocode both locations concurrently for speed
      console.log(`Geocoding: "${originText}" and "${destinationText}"`);
      const [originCoords, destinationCoords] = await Promise.all([
        geocodeLocation(originText),
        geocodeLocation(destinationText)
      ]);
      
      diagnostics.geocodeResults = {
        origin: { coords: originCoords, query: originText },
        destination: { coords: destinationCoords, query: destinationText }
      };
      
      // Calculate direct distance for route selection
      const directDistance = getDistanceKm(
        originCoords.lat, originCoords.lng, 
        destinationCoords.lat, destinationCoords.lng
      );
      diagnostics.distance = directDistance;
      
      console.log(`Direct distance: ${directDistance.toFixed(2)} km`);
      
      // 2) Define optimized eco-friendly route hierarchy
      let ecoModes = [];
      
      // Distance-based mode selection
      if (directDistance < 3) {
        ecoModes = [
          { mode: 'walking', name: 'Walking' },
          { mode: 'bicycling', name: 'Cycling' },
          { mode: 'transit', name: 'Public Transit' },
          { mode: 'driving', name: 'Driving' }
        ];
      } else if (directDistance < 8) {
        ecoModes = [
          { mode: 'bicycling', name: 'Cycling' },
          { mode: 'transit', name: 'Public Transit' },
          { mode: 'walking', name: 'Walking' },
          { mode: 'driving', name: 'Driving' }
        ];
      } else if (directDistance < 30) {
        ecoModes = [
          { mode: 'transit', name: 'Public Transit' },
          { mode: 'bicycling', name: 'Cycling' },
          { mode: 'driving', name: 'Driving' }
        ];
      } else if (directDistance < 800) {
        ecoModes = [
          { mode: 'transit', transitMode: 'train', name: 'Train' },
          { mode: 'transit', name: 'Public Transit' },
          { mode: 'driving', name: 'Driving' }
        ];
      } else if (directDistance < 3000) {
        ecoModes = [
          { mode: 'transit', transitMode: 'train', name: 'Train' },
          { mode: 'driving', name: 'Driving' },
          { specialMode: 'flight', name: 'Flight' }
        ];
      } else {
        ecoModes = [
          { specialMode: 'flight', name: 'Flight' },
          { mode: 'transit', transitMode: 'train', name: 'Train' },
          { mode: 'driving', name: 'Driving' }
        ];
      }
      
      // Apply user preferences if provided
      if (options.preferredTransportTypes?.length > 0) {
        const modeMap = {
          'train': { mode: 'transit', transitMode: 'train', name: 'Train' },
          'bus': { mode: 'transit', transitMode: 'bus', name: 'Bus' },
          'transit': { mode: 'transit', name: 'Public Transit' },
          'walking': { mode: 'walking', name: 'Walking' },
          'cycling': { mode: 'bicycling', name: 'Cycling' },
          'bicycling': { mode: 'bicycling', name: 'Cycling' },
          'driving': { mode: 'driving', name: 'Driving' },
          'car': { mode: 'driving', name: 'Driving' },
          'flight': { specialMode: 'flight', name: 'Flight' },
          'plane': { specialMode: 'flight', name: 'Flight' },
          'ferry': { specialMode: 'ferry', name: 'Ferry' }
        };
        
        const preferredModes = options.preferredTransportTypes
          .map(type => modeMap[type.toLowerCase()])
          .filter(Boolean);
        
        if (preferredModes.length > 0) {
          const remainingModes = ecoModes.filter(mode => 
            !preferredModes.some(pm => 
              (pm.mode === mode.mode && pm.transitMode === mode.transitMode) || 
              (pm.specialMode === mode.specialMode)
            )
          );
          
          ecoModes = [...preferredModes, ...remainingModes];
        }
      }
      
      // 3) Process routes in parallel for faster results
      const modePromises = ecoModes.map(async (ecoMode) => {
        try {
          console.log(`Attempting ${ecoMode.name} route`);
          diagnostics.attemptedModes.push(ecoMode.name);
          
          let data;
          
          if (ecoMode.specialMode === 'flight') {
            data = await getFlightRoute(originCoords, destinationCoords, directDistance);
          } else if (ecoMode.specialMode === 'ferry') {
            // Skip ferry for now
            return null;
          } else {
            const params = {
              origin: `${originCoords.lat},${originCoords.lng}`,
              destination: `${destinationCoords.lat},${destinationCoords.lng}`,
              key: GOOGLE_MAPS_API_KEY,
              mode: ecoMode.mode,
              alternatives: true,
              region: options.region
            };
            
            if (ecoMode.transitMode) {
              params.transit_mode = ecoMode.transitMode;
            }
            
            data = await tryFetch(params, ecoMode.name);
          }
          
          // Skip invalid routes
          if (!data || data.status !== 'OK' || !data.routes?.length) {
            diagnostics.errors[ecoMode.name] = 'No valid routes returned';
            return null;
          }
          
          // Validate transit types for specific modes
          if (ecoMode.transitMode === 'train' && !hasTransitType(data, 'train')) {
            diagnostics.errors[ecoMode.name] = 'No train segments found in route';
            return null;
          }
          
          // Calculate and attach emissions data
          if (!data.eco) {
            const emissions = calculateEmissions(data, ecoMode.mode || ecoMode.specialMode);
            data.eco = {
              modeName: ecoMode.name,
              ...emissions
            };
          }
          
          // Apply emissions constraints
          if (options.maxCarbonEmissions && 
              data.eco.estimatedEmissions > parseFloat(options.maxCarbonEmissions)) {
            diagnostics.errors[ecoMode.name] = `Emissions (${data.eco.estimatedEmissions.toFixed(2)}) exceed limit of ${options.maxCarbonEmissions}`;
            return null;
          }
          
          return {
            route: data,
            emissions: data.eco.estimatedEmissions,
            mode: ecoMode
          };
          
        } catch (error) {
          console.warn(`Error fetching ${ecoMode.name} route:`, error.message);
          diagnostics.errors[ecoMode.name] = error.message;
          return null;
        }
      });
      
      // Run requests in parallel with a limit of 3 concurrent requests
      const runWithConcurrencyLimit = async (promises, limit = 3) => {
        const results = [];
        const chunks = [];
        
        // Split promises into chunks
        for (let i = 0; i < promises.length; i += limit) {
          chunks.push(promises.slice(i, i + limit));
        }
        
        // Process chunks sequentially, but promises within a chunk in parallel
        for (const chunk of chunks) {
          const chunkResults = await Promise.all(chunk);
          results.push(...chunkResults);
        }
        
        return results;
      };
      
      // Process route requests with concurrency limit
      const routeResults = (await runWithConcurrencyLimit(modePromises))
        .filter(Boolean)
        .sort((a, b) => a.emissions - b.emissions);
      
      if (routeResults.length === 0) {
        throw new Error(JSON.stringify({
          message: "No viable routes found for this journey",
          diagnostics: {
            ...diagnostics,
            possibleReasons: [
              directDistance > 3000 ? "The distance is very long (over 3000km)" : null,
              directDistance > 10000 ? "The journey may be intercontinental which exceeds most routing systems" : null,
              Object.keys(diagnostics.errors).length > 3 ? "Multiple transport modes failed to produce viable routes" : null,
              diagnostics.errors.Train?.includes("No train segments") ? "Train routes were requested but not available between these locations" : null
            ].filter(Boolean)
          }
        }));
      }
      
      // Select the most eco-friendly route
      const bestResult = routeResults[0];
      const bestRoute = bestResult.route;
      
      // Add eco-friendliness ranking to all routes
      if (routeResults.length > 1) {
        // Create alternatives list from top 3 results
        bestRoute.eco_alternatives = routeResults.slice(0, 3).map(result => ({
          summary: result.route.routes[0].summary,
          mode: result.route.eco.modeName,
          emissions: result.route.eco.estimatedEmissions,
          duration: result.route.routes[0].legs?.[0]?.duration?.text || "Unknown",
          transitModes: result.route.eco.transitModes || []
        }));
      }
      
      // Add diagnostic information
      bestRoute.diagnostics = diagnostics;
      
      return bestRoute;
      
    } catch (error) {
      // Handle structured errors
      try {
        const parsedError = JSON.parse(error.message);
        throw new Error(JSON.stringify({
          status: "ERROR",
          error: parsedError.message,
          diagnostics: parsedError.diagnostics
        }));
      } catch (parseError) {
        // Regular error - add diagnostics
        throw new Error(JSON.stringify({
          status: "ERROR",
          error: error.message,
          diagnostics
        }));
      }
    }
  }
  
  // Return the main process execution
  return mainProcess();
};



let storedRoutes = [];

const generateDetailedInstructions = (...args) => {
  const [originCity, originCountry, destinationCity, destinationCountry, mode, totalDuration, price, emissions, departureTime, arrivalTime, steps] = args;
  const header = `${originCity}, ${originCountry} to ${destinationCity}, ${destinationCountry}\n\n` +
    `${mode.charAt(0).toUpperCase() + mode.slice(1)}\n\n` +
    `Duration: ${totalDuration}\nPrice: $${price}\nCarbon Emissions: ${emissions} kg CO2\n` +
    `Schedule: ${departureTime} - ${arrivalTime}\n\nJourney Details:\n\n`;
  const details = steps.map(step => {
    let detail = `${step.travel_mode}: ${step.html_instructions} (${step.distance.text} • ${step.duration.text})`;
    if (step.transit_details) {
      detail += `\nfrom ${step.transit_details.departure_stop?.name || 'N/A'} to ${step.transit_details.arrival_stop?.name || 'N/A'}`;
    }
    return detail;
  }).join('\n\n');
  return header + details;
};

router.get('/search', async (req, res) => {
  try {
    const { originCity, originCountry, destinationCity, destinationCountry, preferredTransportTypes = [], maxPrice, maxCarbonEmissions } = req.query;

    if (!originCity || !destinationCity) {
      return res.status(400).json({ success: false, message: 'Missing origin or destination city' });
    }

    const origin = `${originCity}, ${originCountry}`;
    const destination = `${destinationCity}, ${destinationCountry}`;
    const isInternational = originCountry !== destinationCountry;

    let modes = Array.isArray(preferredTransportTypes) ? preferredTransportTypes : [preferredTransportTypes];
    modes = modes.filter(m => ['train', 'bus', 'flight', 'ferry'].includes(m));
    if (isInternational && !modes.includes('flight')) modes.push('flight');
    if (modes.length === 0) modes = isInternational ? ['flight'] : ['train', 'bus'];

    const routes = [];

    for (const mode of modes) {
      try {
        const data = await getRouteDetails(origin, destination, mode);
        if (!data.routes?.length) continue;

        data.routes.forEach((route, i) => {
          const leg = route.legs[0];
          const distance = leg.distance.value / 1000;
          const emissions = calculateEmissions(distance, mode);
          const price = calculatePrice(distance, mode);
          const duration = leg.duration.text;
          const depTime = leg.steps[0].transit_details?.departure_time?.text || '10:00 AM';
          const arrTime = leg.steps.at(-1)?.transit_details?.arrival_time?.text || '6:00 PM';

          if ((maxPrice && price > parseFloat(maxPrice)) || (maxCarbonEmissions && emissions > parseFloat(maxCarbonEmissions))) return;

          routes.push({
            _id: `${mode}-${i}`,
            type: mode,
            origin: {
              city: originCity,
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
            distance: +distance.toFixed(2),
            duration,
            price,
            carbonEmissions: emissions,
            departureTime: depTime,
            arrivalTime: arrTime,
            steps: leg.steps.map(s => ({
              type: s.travel_mode.toLowerCase(),
              instruction: s.html_instructions,
              distance: s.distance.text,
              duration: s.duration.text,
              transitDetails: s.transit_details ? {
                departureStop: s.transit_details.departure_stop?.name,
                arrivalStop: s.transit_details.arrival_stop?.name,
                line: s.transit_details.line?.short_name,
                vehicle: s.transit_details.line?.vehicle?.name
              } : null
            })),
            detailedInstructions: generateDetailedInstructions(originCity, originCountry, destinationCity, destinationCountry, mode, duration, price, emissions, depTime, arrTime, leg.steps),
            sustainabilityFeatures: mode === 'train' ? ['Electric Train', 'Public Transport'] : mode === 'flight' ? ['Modern Aircraft', 'Optimized Route'] : ['Shared Transport', 'Fuel-Efficient']
          });
        });
      } catch (err) {
        console.error(`${mode.toUpperCase()} fetch failed:`, err.message);
      }
    }

    storedRoutes = routes;
    res.json({ success: true, data: routes });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Internal error', error: err.message });
  }
});

router.get('/:id', (req, res) => {
  const route = storedRoutes.find(r => r._id === req.params.id);
  if (!route) return res.status(404).json({ success: false, message: 'Route not found' });
  res.json({ success: true, data: route });
});

module.exports = router;
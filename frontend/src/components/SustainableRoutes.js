import React, { useState } from 'react';
import axios from 'axios';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Box,
  Chip,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Divider,
  LinearProgress,
  Paper,
  Alert,
} from '@mui/material';
import DirectionsTransitIcon from '@mui/icons-material/DirectionsTransit';
import FlightIcon from '@mui/icons-material/Flight';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import DirectionsBoatIcon from '@mui/icons-material/DirectionsBoat';
import TimelineIcon from '@mui/icons-material/Timeline';
import TravelMap from './TravelMap';

// Create axios instance with default config
const api = axios.create({
  baseURL: process.env.REACT_APP_TRAVEL_API_URL || 'http://localhost:3005',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Add request interceptor for auth
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// Add response interceptor for error handling
api.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    return Promise.reject(error);
  }
);

const SustainableRoutes = () => {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchParams, setSearchParams] = useState({
    originCity: '',
    originCountry: '',
    destinationCity: '',
    destinationCountry: '',
    maxPrice: '',
    maxCarbonEmissions: '',
    preferredTransportTypes: [],
  });

  const transportTypes = [
    { value: 'train', label: 'Train', icon: <DirectionsTransitIcon /> },
    { value: 'bus', label: 'Bus', icon: <DirectionsBusIcon /> },
    { value: 'ferry', label: 'Ferry', icon: <DirectionsBoatIcon /> },
    { value: 'flight', label: 'Flight', icon: <FlightIcon /> },
  ];

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await api.post('/api/routes/search', searchParams);
      setRoutes(response.data.data || []);
    } catch (error) {
      console.error('Error searching routes:', error);
      setError(error.response?.data?.message || 'Failed to search routes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setSearchParams({
      ...searchParams,
      [e.target.name]: e.target.value,
    });
  };

  const handleTransportTypeChange = (type) => {
    const currentTypes = searchParams.preferredTransportTypes;
    const newTypes = currentTypes.includes(type)
      ? currentTypes.filter(t => t !== type)
      : [...currentTypes, type];
    
    setSearchParams({
      ...searchParams,
      preferredTransportTypes: newTypes,
    });
  };

  const getTransportIcon = (type) => {
    switch (type) {
      case 'train': return <DirectionsTransitIcon />;
      case 'bus': return <DirectionsBusIcon />;
      case 'ferry': return <DirectionsBoatIcon />;
      case 'flight': return <FlightIcon />;
      default: return <TimelineIcon />;
    }
  };

  const getMapCenter = () => {
    if (routes.length > 0 && 
        routes[0].origin?.coordinates?.lat && 
        routes[0].origin?.coordinates?.lng) {
      return {
        lat: parseFloat(routes[0].origin.coordinates.lat),
        lng: parseFloat(routes[0].origin.coordinates.lng)
      };
    }
    return null;
  };

  return (
    <Container>
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Sustainable Travel Routes
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Paper sx={{ p: 3, mb: 3 }}>
          <form onSubmit={handleSearch}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="originCity"
                  label="Origin City"
                  value={searchParams.originCity}
                  onChange={handleInputChange}
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  name="originCountry"
                  label="Origin Country"
                  value={searchParams.originCountry}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="destinationCity"
                  label="Destination City"
                  value={searchParams.destinationCity}
                  onChange={handleInputChange}
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  name="destinationCountry"
                  label="Destination Country"
                  value={searchParams.destinationCountry}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="maxPrice"
                  label="Max Price (USD)"
                  type="number"
                  value={searchParams.maxPrice}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="maxCarbonEmissions"
                  label="Max Carbon Emissions (kg CO2)"
                  type="number"
                  value={searchParams.maxCarbonEmissions}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Preferred Transport Types
                </Typography>
                <FormGroup row>
                  {transportTypes.map((type) => (
                    <FormControlLabel
                      key={type.value}
                      control={
                        <Checkbox
                          checked={searchParams.preferredTransportTypes.includes(type.value)}
                          onChange={() => handleTransportTypeChange(type.value)}
                          icon={type.icon}
                          checkedIcon={type.icon}
                        />
                      }
                      label={type.label}
                    />
                  ))}
                </FormGroup>
              </Grid>
              <Grid item xs={12}>
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? 'Searching...' : 'Search Routes'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>

        {routes.length > 0 ? (
          <>
            <Box sx={{ mb: 3 }}>
              <TravelMap
                routes={routes}
                center={getMapCenter()}
              />
            </Box>
            <Grid container spacing={2}>
              {routes.map((route, index) => (
                <Grid item xs={12} key={route._id || index}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {route.origin.city}, {route.origin.country} to {route.destination.city}, {route.destination.country}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        {getTransportIcon(route.transportType)}
                        <Typography sx={{ ml: 1 }}>
                          {route.transportType.charAt(0).toUpperCase() + route.transportType.slice(1)}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Duration: {route.duration}
                      </Typography>
                      <Typography variant="body2" gutterBottom>
                        Price: ${route.price}
                      </Typography>
                      <Typography variant="body2" gutterBottom>
                        Carbon Emissions: {route.carbonEmissions} kg CO2
                      </Typography>
                      <Box sx={{ mt: 1 }}>
                        {route.sustainabilityFeatures?.map((feature, idx) => (
                          <Chip
                            key={idx}
                            label={feature}
                            size="small"
                            color="success"
                            sx={{ mr: 0.5, mb: 0.5 }}
                          />
                        ))}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </>
        ) : (
          <Typography color="text.secondary" align="center">
            No routes found. Try adjusting your search criteria.
          </Typography>
        )}
      </Box>
    </Container>
  );
};

export default SustainableRoutes; 
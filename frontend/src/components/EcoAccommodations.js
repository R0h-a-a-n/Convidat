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
  Rating,
  Box,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Alert,
  Divider
} from '@mui/material';
import TravelMap from './TravelMap';

// Create axios instance with default config
const api = axios.create({
  baseURL: process.env.REACT_APP_TRAVEL_API_URL || 'http://localhost:3006',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Add request interceptor for debugging
api.interceptors.request.use(
  config => {
    console.log('Making request to:', config.url, 'with params:', config.params);
    return config;
  },
  error => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  response => {
    console.log('Received response:', {
      status: response.status,
      data: response.data
    });
    return response;
  },
  error => {
    console.error('API Error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      url: error.config?.url,
      params: error.config?.params
    });
    return Promise.reject(error);
  }
);

const EcoAccommodations = () => {
  const [accommodations, setAccommodations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mapCenter, setMapCenter] = useState(null);
  const [searchParams, setSearchParams] = useState({
    city: '',
    country: '',
    maxPrice: '',
    minSustainabilityScore: '3.5',
    type: '',
    amenities: '',
  });

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setAccommodations([]);

    try {
      const response = await api.get('/api/accommodations/search', {
        params: searchParams
      });

      if (response.data.success === false) {
        throw new Error(response.data.error || 'Failed to fetch accommodations');
      }

      const results = response.data.data || [];
      setAccommodations(results);
      
      // Set map center to first result or search city if no results
      if (results.length > 0) {
        setMapCenter({
          lat: parseFloat(results[0].location.coordinates.lat),
          lng: parseFloat(results[0].location.coordinates.lng)
        });
      }

      if (results.length === 0) {
        setError('No eco-friendly accommodations found matching your criteria.');
      }
    } catch (error) {
      console.error('Error fetching accommodations:', error);
      setError(
        error.response?.data?.error || 
        error.message || 
        'Failed to fetch accommodations. Please try again.'
      );
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

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  return (
    <Container>
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Eco-Friendly Accommodations
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
                  label="City"
                  name="city"
                  value={searchParams.city}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Country"
                  name="country"
                  value={searchParams.country}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Max Price (USD)"
                  name="maxPrice"
                  type="number"
                  value={searchParams.maxPrice}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Accommodation Type</InputLabel>
                  <Select
                    name="type"
                    value={searchParams.type}
                    onChange={handleInputChange}
                    label="Accommodation Type"
                  >
                    <MenuItem value="">Any</MenuItem>
                    <MenuItem value="hotel">Hotel</MenuItem>
                    <MenuItem value="hostel">Hostel</MenuItem>
                    <MenuItem value="eco-lodge">Eco Lodge</MenuItem>
                    <MenuItem value="apartment">Apartment</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={loading}
                  fullWidth
                >
                  {loading ? 'Searching...' : 'Search'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>

        {accommodations.length > 0 && (
          <>
            <Box sx={{ mb: 3 }}>
              <TravelMap
                accommodations={accommodations}
                center={mapCenter}
              />
            </Box>
            <Grid container spacing={2}>
              {accommodations.map((accommodation) => (
                <Grid item xs={12} md={6} key={accommodation._id}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {accommodation.name}
                      </Typography>
                      
                      <Typography color="text.secondary" gutterBottom>
                        {accommodation.location.address}
                      </Typography>

                      <Box sx={{ mb: 2 }}>
                        <Typography component="span" variant="subtitle2">
                          Eco Rating: 
                        </Typography>
                        <Rating 
                          value={accommodation.sustainability.rating} 
                          readOnly 
                          precision={0.5}
                          sx={{ ml: 1 }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          Score: {accommodation.sustainability.score}/5
                        </Typography>
                      </Box>

                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Price Range:
                        </Typography>
                        <Typography variant="body1">
                          {formatPrice(accommodation.priceRange.min)} - {formatPrice(accommodation.priceRange.max)} /night
                        </Typography>
                      </Box>

                      <Divider sx={{ my: 1.5 }} />

                      <Box sx={{ mb: 1.5 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Eco Features:
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {accommodation.sustainability.features.map((feature, index) => (
                            <Chip 
                              key={index} 
                              label={feature} 
                              size="small" 
                              color="success" 
                              variant="outlined"
                            />
                          ))}
                        </Box>
                      </Box>

                      {accommodation.sustainability.certifications.length > 0 && (
                        <Box>
                          <Typography variant="subtitle2" gutterBottom>
                            Certifications:
                          </Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {accommodation.sustainability.certifications.map((cert, index) => (
                              <Chip 
                                key={index} 
                                label={cert} 
                                size="small" 
                                color="primary" 
                                variant="outlined"
                              />
                            ))}
                          </Box>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </>
        )}
      </Box>
    </Container>
  );
};

export default EcoAccommodations; 
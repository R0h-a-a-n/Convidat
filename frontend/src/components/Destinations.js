import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  TextField,
  Button,
  Chip,
  Rating,
  CircularProgress,
  Alert,
  Paper,
  Divider
} from '@mui/material';
import axios from 'axios';
import { LocationOn, AccessTime, Language, Phone, Email } from '@mui/icons-material';

const api = axios.create({
  baseURL: 'http://localhost:3008',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to include token
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

const Destinations = () => {
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!city) return;

    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/api/destinations/search', {
        params: { city, country }
      });

      if (response.data.success) {
        setDestinations(response.data.data);
        if (response.data.data.length === 0) {
          setError('No eco-friendly destinations found in this area.');
        }
      }
    } catch (err) {
      console.error('Error fetching destinations:', err);
      setError(
        err.response?.data?.error 
          ? `${err.response.data.error}${err.response.data.details ? `: ${err.response.data.details}` : ''}`
          : 'Failed to fetch destinations'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Eco-Friendly Destinations
      </Typography>

      <Paper sx={{ p: 3, mb: 4 }}>
        <form onSubmit={handleSearch}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={5}>
              <TextField
                fullWidth
                label="City"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
                placeholder="e.g., Chennai"
              />
            </Grid>
            <Grid item xs={12} md={5}>
              <TextField
                fullWidth
                label="Country (Optional)"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="e.g., India"
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                disabled={loading}
              >
                Search
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : destinations.length > 0 ? (
        <Grid container spacing={3}>
          {destinations.map((destination) => (
            <Grid item xs={12} key={destination._id || destination.name}>
              <Card>
                <Grid container>
                  <Grid item xs={12}>
                    <CardContent>
                      <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                        <Typography variant="h5" component="h2">
                          {destination.name}
                        </Typography>
                        <Rating value={destination.rating} readOnly precision={0.5} />
                      </Box>
                      
                      <Box display="flex" alignItems="center" my={1}>
                        <LocationOn color="action" />
                        <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                          {destination.city}, {destination.country}
                        </Typography>
                      </Box>

                      <Typography variant="body1" paragraph>
                        {destination.description}
                      </Typography>

                      <Box sx={{ mb: 2 }}>
                        {destination.ecoFeatures.map((feature) => (
                          <Chip
                            key={feature}
                            label={feature}
                            color="primary"
                            variant="outlined"
                            size="small"
                            sx={{ mr: 1, mb: 1 }}
                          />
                        ))}
                      </Box>

                      <Divider sx={{ my: 2 }} />

                      <Grid container spacing={2}>
                        {destination.openingHours && (
                          <Grid item xs={12} sm={6}>
                            <Box display="flex" alignItems="center">
                              <AccessTime color="action" />
                              <Typography variant="body2" sx={{ ml: 1 }}>
                                {destination.openingHours}
                              </Typography>
                            </Box>
                          </Grid>
                        )}
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2">
                            {destination.admissionFee}
                          </Typography>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Grid>
                </Grid>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            No destinations found. Try searching for a city.
          </Typography>
        </Paper>
      )}
    </Container>
  );
};

export default Destinations; 
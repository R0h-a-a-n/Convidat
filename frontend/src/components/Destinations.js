import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
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
import { LocationOn, AccessTime } from '@mui/icons-material';

const api = axios.create({
  baseURL: 'http://localhost:3008',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  error => Promise.reject(error)
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
        params: { 
          city, 
          country,
          excludeTypes: [
            'store',
            'restaurant',
            'food',
            'shop',
            'shopping_mall',
            'supermarket',
            'cafe',
            'bar',
            'lodging',
            'hotel',
            'business'
          ]
        } 
      });
      if (response.data.success) {
        // Filter out any remaining business-like places
        const filteredDestinations = response.data.data.filter(dest => {
          // Only include parks, natural features, tourist attractions, etc.
          const isNaturalOrCultural = dest.ecoFeatures.some(feature => 
            feature.includes('Natural') || 
            feature.includes('Cultural') || 
            feature.includes('Wildlife') ||
            feature.includes('Heritage') ||
            feature.includes('Conservation')
          );
          return isNaturalOrCultural;
        });
        setDestinations(filteredDestinations);
        if (filteredDestinations.length === 0) {
          setError('No eco-friendly destinations found in this area.');
        }
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch destinations');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{
        fontWeight: 'bold',
        fontFamily: 'Lexend Mega, sans-serif',
        mb: 4,
        backgroundColor: '#FEE440',
        px: 3,
        py: 1,
        border: '2px solid black',
        borderRadius: '0.75rem',
        boxShadow: '4px 6px 0 black',
        width: 'fit-content'
      }}>
        Eco-Friendly Destinations
      </Typography>

      <Paper sx={{
        p: 3,
        mb: 4,
        backgroundColor: '#C2F970',
        border: '2px solid black',
        boxShadow: '4px 6px 0 black',
        borderRadius: '0.75rem'
      }}>
        <form onSubmit={handleSearch}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={5}>
              <TextField fullWidth label="City" value={city} onChange={(e) => setCity(e.target.value)} required />
            </Grid>
            <Grid item xs={12} md={5}>
              <TextField fullWidth label="Country (Optional)" value={country} onChange={(e) => setCountry(e.target.value)} />
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={loading}
                sx={{
                  backgroundColor: '#FEE440',
                  color: 'black',
                  fontWeight: 'bold',
                  border: '2px solid black',
                  boxShadow: '4px 6px 0 black',
                  borderRadius: '0.75rem',
                  '&:hover': {
                    backgroundColor: '#FFD60A',
                    boxShadow: '6px 8px 0 black'
                  }
                }}
              >
                Search
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        <Box display="flex" justifyContent="center" my={4}><CircularProgress /></Box>
      ) : destinations.length > 0 ? (
        <Grid container spacing={3}>
          {destinations.map((destination) => (
            <Grid item xs={12} key={destination._id || destination.name}>
              <Card sx={{
                backgroundColor: '#B9FBC0',
                border: '2px solid black',
                boxShadow: '4px 6px 0 black',
                borderRadius: '0.75rem'
              }}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                    <Typography variant="h5" fontWeight="bold" fontFamily="Lexend Mega, sans-serif">
                      {destination.name}
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" my={1}>
                    <LocationOn sx={{ color: 'black' }} />
                    <Typography variant="body2" sx={{ ml: 1 }}>
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
                        sx={{
                          mr: 1,
                          mb: 1,
                          border: '2px solid black',
                          fontWeight: 'bold',
                          fontFamily: 'Lexend Mega, sans-serif'
                        }}
                      />
                    ))}
                  </Box>
                  <Divider sx={{ my: 2, borderColor: 'black' }} />
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2">{destination.admissionFee}</Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Paper sx={{
          p: 3,
          textAlign: 'center',
          backgroundColor: '#FFADAD',
          border: '2px solid black',
          boxShadow: '4px 6px 0 black',
          borderRadius: '0.75rem'
        }}>
          <Typography variant="body1" color="text.primary">
            No destinations found. Try searching for a city.
          </Typography>
        </Paper>
      )}
    </Container>
  );
};

export default Destinations;
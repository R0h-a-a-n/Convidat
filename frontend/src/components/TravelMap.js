import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Divider,
  CircularProgress,
  Alert
} from '@mui/material';
import { Close as CloseIcon, LocationOn, Public, TravelExplore } from '@mui/icons-material';
import EcoDestinations from './EcoDestinations';
import axios from 'axios';

// Default recommendations data
const DEFAULT_RECOMMENDATIONS = [
  {
    city: 'Mumbai',
    description: 'A vibrant city with rich cultural heritage and modern attractions',
    mapUrl: 'https://www.google.com/maps/place/Mumbai'
  },
  {
    city: 'Pune',
    description: 'Known for its educational institutions and pleasant weather',
    mapUrl: 'https://www.google.com/maps/place/Pune'
  },
  {
    city: 'Chennai',
    description: 'A coastal city with beautiful beaches and historical landmarks',
    mapUrl: 'https://www.google.com/maps/place/Chennai'
  }
];

const TravelMap = ({ destinationCity = 'Mumbai' }) => {
  const [recommendations, setRecommendations] = useState(DEFAULT_RECOMMENDATIONS);
  const [selectedCity, setSelectedCity] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        setError(null);

        // Use axios instead of fetch for better error handling
        const response = await axios.get('/api/recommendations', {
          params: {
            city: destinationCity
          },
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });

        if (response.data && Array.isArray(response.data)) {
          setRecommendations(response.data);
        } else {
          // If the API fails or returns invalid data, use default recommendations
          console.log('Using default recommendations due to invalid API response');
          setRecommendations(DEFAULT_RECOMMENDATIONS);
        }
      } catch (err) {
        console.error('Error fetching recommendations:', err);
        setError('Unable to fetch recommendations. Showing default options.');
        setRecommendations(DEFAULT_RECOMMENDATIONS);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [destinationCity]);

  const handleCityClick = (city) => {
    setSelectedCity(city);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedCity(null);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ ml: 2 }}>
          Loading travel recommendations...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Eco-Friendly Travel Recommendations
      </Typography>
      <Divider sx={{ mb: 3 }} />
      
      {error && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Grid container spacing={3}>
        {recommendations.map((recommendation, index) => (
          <Grid item xs={12} md={6} key={index}>
            <Card sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: index === 0 ? 'rgba(232, 244, 253, 0.9)' : 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(10px)',
              border: index === 0 ? '1px solid rgba(66, 165, 245, 0.5)' : '1px solid rgba(255, 255, 255, 0.3)',
              boxShadow: 4
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  {index === 0 ? (
                    <TravelExplore color="primary" sx={{ mr: 1 }} />
                  ) : (
                    <LocationOn color="action" sx={{ mr: 1 }} />
                  )}
                  <Typography variant="h5" color={index === 0 ? 'primary' : 'textPrimary'}>
                    {recommendation.city}
                  </Typography>
                </Box>
                <Typography variant="body1" paragraph>
                  {recommendation.description}
                </Typography>
                <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  <Button
                    variant={index === 0 ? "contained" : "outlined"}
                    color="primary"
                    onClick={() => handleCityClick(recommendation.city)}
                    startIcon={<Public />}
                  >
                    View Eco-Friendly Destinations
                  </Button>
                  <Button
                    variant="outlined"
                    color={index === 0 ? "primary" : "secondary"}
                    onClick={() => window.open(recommendation.mapUrl, '_blank')}
                    startIcon={<LocationOn />}
                  >
                    View on Map
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Eco-Friendly Destinations in {selectedCity}</Typography>
            <IconButton onClick={handleCloseDialog}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedCity && <EcoDestinations city={selectedCity} />}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default TravelMap;
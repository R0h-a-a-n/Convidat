import React, { useState } from 'react';
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
  Divider
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import EcoDestinations from './EcoDestinations';

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

const TravelMap = ({ recommendations = DEFAULT_RECOMMENDATIONS }) => {
  const [selectedCity, setSelectedCity] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  const handleCityClick = (city) => {
    setSelectedCity(city);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedCity(null);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Travel Recommendations
      </Typography>
      <Divider sx={{ mb: 3 }} />
      <Grid container spacing={3}>
        {recommendations.map((recommendation, index) => (
          <Grid item xs={12} md={6} key={index}>
            <Card sx={{ 
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              boxShadow: 4
            }}>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  {recommendation.city}
                </Typography>
                <Typography variant="body1" paragraph>
                  {recommendation.description}
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleCityClick(recommendation.city)}
                    sx={{ mr: 2 }}
                  >
                    View Eco-Friendly Destinations
                  </Button>
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => window.open(recommendation.mapUrl, '_blank')}
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
            <Typography variant="h6">Eco-Friendly Destinations</Typography>
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
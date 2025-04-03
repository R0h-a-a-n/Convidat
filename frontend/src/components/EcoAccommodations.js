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
} from '@mui/material';
import TravelMap from './TravelMap';

const EcoAccommodations = () => {
  const [accommodations, setAccommodations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchParams, setSearchParams] = useState({
    city: '',
    country: '',
    maxPrice: '',
    minSustainabilityScore: '60',
    type: '',
    amenities: '',
  });

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:3005/api/accommodations/search', {
        params: searchParams,
      });
      setAccommodations(response.data.data);
    } catch (error) {
      console.error('Error fetching accommodations:', error);
    }
    setLoading(false);
  };

  const handleInputChange = (e) => {
    setSearchParams({
      ...searchParams,
      [e.target.name]: e.target.value,
    });
  };

  const getMapCenter = () => {
    if (accommodations.length > 0) {
      return accommodations[0].location.coordinates;
    }
    return null;
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Eco-Friendly Accommodations
      </Typography>

      {/* Search Form */}
      <Box component="form" onSubmit={handleSearch} sx={{ mb: 4 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              name="city"
              label="City"
              value={searchParams.city}
              onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              name="country"
              label="Country"
              value={searchParams.country}
              onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              fullWidth
              name="maxPrice"
              label="Max Price (USD)"
              type="number"
              value={searchParams.maxPrice}
              onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select
                name="type"
                value={searchParams.type}
                onChange={handleInputChange}
                label="Type"
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="hotel">Hotel</MenuItem>
                <MenuItem value="hostel">Hostel</MenuItem>
                <MenuItem value="eco-lodge">Eco Lodge</MenuItem>
                <MenuItem value="apartment">Apartment</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              type="submit"
              disabled={loading}
              sx={{ height: '100%' }}
            >
              Search
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* Map */}
      <Paper sx={{ mb: 4, overflow: 'hidden' }}>
        <TravelMap
          accommodations={accommodations}
          center={getMapCenter()}
        />
      </Paper>

      {/* Results */}
      <Grid container spacing={3}>
        {accommodations.map((accommodation) => (
          <Grid item xs={12} sm={6} md={4} key={accommodation._id}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {accommodation.name}
                </Typography>
                <Typography color="textSecondary" gutterBottom>
                  {accommodation.location.city}, {accommodation.location.country}
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography component="legend">Eco Rating</Typography>
                  <Rating
                    value={accommodation.sustainability.ecoRating}
                    readOnly
                    precision={0.5}
                  />
                </Box>
                <Typography variant="body2" gutterBottom>
                  Price Range: ${accommodation.priceRange.min} - ${accommodation.priceRange.max}
                </Typography>
                <Box sx={{ mt: 1 }}>
                  {accommodation.sustainability.certifications.map((cert, index) => (
                    <Chip
                      key={index}
                      label={cert}
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
    </Container>
  );
};

export default EcoAccommodations; 
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
} from '@mui/material';
import DirectionsTransitIcon from '@mui/icons-material/DirectionsTransit';
import FlightIcon from '@mui/icons-material/Flight';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import DirectionsBoatIcon from '@mui/icons-material/DirectionsBoat';
import TimelineIcon from '@mui/icons-material/Timeline';
import TravelMap from './TravelMap';

const SustainableRoutes = () => {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(false);
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
    try {
      const response = await axios.post('http://localhost:3005/api/routes/search', searchParams);
      setRoutes(response.data.data);
    } catch (error) {
      console.error('Error searching routes:', error);
    }
    setLoading(false);
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
    if (routes.length > 0) {
      return routes[0].origin.coordinates;
    }
    return null;
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Sustainable Travel Routes
      </Typography>

      {/* Search Form */}
      <Box component="form" onSubmit={handleSearch} sx={{ mb: 4 }}>
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
              Search Routes
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* Map */}
      <Paper sx={{ mb: 4, overflow: 'hidden' }}>
        <TravelMap
          routes={routes}
          center={getMapCenter()}
        />
      </Paper>

      {/* Results */}
      {loading && <LinearProgress sx={{ mb: 2 }} />}
      
      <Grid container spacing={3}>
        {routes.map((route) => (
          <Grid item xs={12} key={route._id}>
            <Card>
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="h6">
                      {route.origin.city} → {route.destination.city}
                    </Typography>
                    <Typography color="textSecondary">
                      {route.origin.country} to {route.destination.country}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Divider sx={{ my: 1 }} />
                    {route.segments.map((segment, index) => (
                      <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        {getTransportIcon(segment.type)}
                        <Typography variant="body2" sx={{ ml: 1 }}>
                          {segment.provider} - {Math.round(segment.duration / 60)}h {segment.duration % 60}m
                          ({segment.distance}km) - ${segment.cost.amount}
                        </Typography>
                      </Box>
                    ))}
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2">
                      Total Duration: {Math.round(route.totalDuration / 60)}h {route.totalDuration % 60}m
                    </Typography>
                    <Typography variant="body2">
                      Total Distance: {route.totalDistance}km
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2">
                      Total Cost: ${route.totalCost.amount}
                    </Typography>
                    <Typography variant="body2">
                      Carbon Emissions: {route.totalCarbonEmissions}kg CO2
                    </Typography>
                  </Grid>

                  <Grid item xs={12}>
                    <Box sx={{ mt: 1 }}>
                      <Chip
                        label={`${route.ecoSavings.percentage}% less CO2`}
                        color="success"
                        sx={{ mr: 1 }}
                      />
                      <Chip
                        label={`Sustainability Score: ${route.sustainabilityScore}`}
                        color="primary"
                      />
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default SustainableRoutes; 
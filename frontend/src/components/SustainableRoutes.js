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
  LinearProgress,
  Paper,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import DirectionsTransitIcon from '@mui/icons-material/DirectionsTransit';
import FlightIcon from '@mui/icons-material/Flight';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import DirectionsBoatIcon from '@mui/icons-material/DirectionsBoat';
import TimelineIcon from '@mui/icons-material/Timeline';
import TravelMap from './TravelMap';

const api = axios.create({
  baseURL: process.env.REACT_APP_TRAVEL_API_URL || 'http://localhost:3006',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
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

api.interceptors.response.use(
  response => response,
  error => Promise.reject(error)
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
      const response = await api.get('/api/routes/search', { params: searchParams });
      setRoutes(response.data.data || []);
    } catch (error) {
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
    const newTypes = searchParams.preferredTransportTypes.includes(type)
      ? searchParams.preferredTransportTypes.filter(t => t !== type)
      : [...searchParams.preferredTransportTypes, type];
    setSearchParams({ ...searchParams, preferredTransportTypes: newTypes });
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

  return (
    <Container>
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography
          variant="h4"
          sx={{
            mb: 3,
            fontWeight: 'bold',
            fontFamily: 'Lexend Mega, sans-serif',
            backgroundColor: '#FEE440',
            px: 3,
            py: 1,
            border: '2px solid black',
            borderRadius: '0.75rem',
            boxShadow: '4px 6px 0 black',
            width: 'fit-content'
          }}
        >
          Sustainable Travel Routes
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Paper sx={{
          p: 3,
          mb: 3,
          backgroundColor: '#C2F970',
          border: '2px solid black',
          boxShadow: '4px 6px 0 black',
          borderRadius: '0.75rem'
        }}>
          <form onSubmit={handleSearch}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth name="originCity" label="Origin City" value={searchParams.originCity} onChange={handleInputChange} required sx={{ mb: 2 }} />
                <TextField fullWidth name="originCountry" label="Origin Country" value={searchParams.originCountry} onChange={handleInputChange} required />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth name="destinationCity" label="Destination City" value={searchParams.destinationCity} onChange={handleInputChange} required sx={{ mb: 2 }} />
                <TextField fullWidth name="destinationCountry" label="Destination Country" value={searchParams.destinationCountry} onChange={handleInputChange} required />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth name="maxPrice" label="Max Price (USD)" type="number" value={searchParams.maxPrice} onChange={handleInputChange} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth name="maxCarbonEmissions" label="Max Carbon Emissions (kg CO2)" type="number" value={searchParams.maxCarbonEmissions} onChange={handleInputChange} />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle1" fontWeight="bold">Preferred Transport Types</Typography>
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
                  type="submit"
                  disabled={loading}
                  sx={{
                    mt: 2,
                    backgroundColor: '#FEE440',
                    color: 'black',
                    fontWeight: 'bold',
                    border: '2px solid black',
                    boxShadow: '4px 6px 0 black',
                    borderRadius: '0.75rem',
                    textTransform: 'uppercase',
                    fontFamily: 'Lexend Mega, sans-serif',
                    '&:hover': {
                      backgroundColor: '#FFD60A',
                      boxShadow: '6px 8px 0 black'
                    }
                  }}
                >
                  {loading ? 'Searching...' : 'Search Routes'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>

        {loading && (
          <Box sx={{ width: '100%', mb: 3 }}>
            <LinearProgress />
          </Box>
        )}

        {routes.length > 0 ? (
          <>
            <Box sx={{ mb: 3 }}>
              <TravelMap routes={routes} />
            </Box>
            <Grid container spacing={2}>
              {routes.map((route) => (
                <Grid item xs={12} key={route._id}>
                  <Card sx={{
                    border: '2px solid black',
                    boxShadow: '4px 6px 0 black',
                    borderRadius: '0.75rem',
                    backgroundColor: '#B9FBC0',
                    color: 'black'
                  }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', fontFamily: 'Lexend Mega, sans-serif', mb: 1 }}>
                        {route.origin.city}, {route.origin.country} → {route.destination.city}, {route.destination.country}
                      </Typography>

                      <Box sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        backgroundColor: '#A0C4FF',
                        px: 2,
                        py: 0.5,
                        border: '2px solid black',
                        boxShadow: '2px 3px 0 black',
                        borderRadius: '0.5rem',
                        fontWeight: 'bold',
                        mb: 1
                      }}>
                        {getTransportIcon(route.type)}
                        <Typography sx={{ ml: 1 }}>
                          {route.type.charAt(0).toUpperCase() + route.type.slice(1)}
                        </Typography>
                      </Box>

                      <Typography variant="body1">Duration: {route.duration}</Typography>
                      <Typography variant="body1">Price: ${route.price}</Typography>
                      <Typography variant="body1">Carbon Emissions: {route.carbonEmissions} kg CO2</Typography>

                      {route.departureTime && route.arrivalTime && (
                        <Typography variant="body1">
                          Schedule: {route.departureTime} - {route.arrivalTime}
                        </Typography>
                      )}

                      <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle1" fontWeight="bold">Journey Details:</Typography>
                        <List>
                          {route.steps.map((step, index) => (
                            <ListItem key={index} sx={{ borderBottom: '1px dashed black' }}>
                              <ListItemIcon>
                                {getTransportIcon(step.type)}
                              </ListItemIcon>
                              <ListItemText
                                primary={<div dangerouslySetInnerHTML={{ __html: step.instruction }} />}
                                secondary={
                                  <>
                                    {step.distance} • {step.duration}
                                    {step.transitDetails && (
                                      <Typography variant="body2" component="div">
                                        {step.transitDetails.line && `Line ${step.transitDetails.line}`}
                                        {step.transitDetails.departureStop && ` from ${step.transitDetails.departureStop}`}
                                        {step.transitDetails.arrivalStop && ` to ${step.transitDetails.arrivalStop}`}
                                      </Typography>
                                    )}
                                  </>
                                }
                              />
                            </ListItem>
                          ))}
                        </List>
                      </Box>

                      <Box sx={{ mt: 1 }}>
                        {route.sustainabilityFeatures?.map((feature, idx) => (
                          <Chip
                            key={idx}
                            label={feature}
                            size="small"
                            sx={{
                              backgroundColor: '#FFDD57',
                              border: '2px solid black',
                              fontWeight: 'bold',
                              fontFamily: 'Lexend Mega, sans-serif',
                              boxShadow: '2px 3px 0 black',
                              mr: 0.5,
                              mb: 0.5
                            }}
                          />
                        ))}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </>
        ) : !loading && (
          <Typography color="text.secondary" align="center">
            No routes found. Try adjusting your search criteria.
          </Typography>
        )}
      </Box>
    </Container>
  );
};

export default SustainableRoutes;

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Tabs,
  Tab,
  Paper,
  Button,
  Grid,
  CircularProgress,
  Alert
} from '@mui/material';
import axios from 'axios';
import TripItinerary from './TripItinerary';
import TripBudget from './TripBudget';
import TripPackingList from './TripPackingList';
import TripActivities from './TripActivities';

const TripDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    const fetchTripDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:3010/api/trips/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setTrip(response.data.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch trip details');
        setLoading(false);
      }
    };

    fetchTripDetails();
  }, [id]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  if (!trip) {
    return (
      <Container>
        <Alert severity="warning" sx={{ mt: 2 }}>
          Trip not found
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          {trip.title}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
        </Typography>
        <Typography variant="body1" paragraph>
          {trip.description}
        </Typography>
      </Box>

      <Paper sx={{ width: '100%', mb: 2 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="Itinerary" />
          <Tab label="Budget" />
          <Tab label="Packing List" />
          <Tab label="Activities" />
        </Tabs>
      </Paper>

      <Box sx={{ mt: 2 }}>
        {tabValue === 0 && <TripItinerary tripId={id} />}
        {tabValue === 1 && <TripBudget tripId={id} />}
        {tabValue === 2 && <TripPackingList tripId={id} />}
        {tabValue === 3 && <TripActivities tripId={id} />}
      </Box>
    </Container>
  );
};

export default TripDetails; 
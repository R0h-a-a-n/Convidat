import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, Tabs, Tab, Paper, CircularProgress, Alert } from '@mui/material';
import axios from 'axios';
import TripBudget from './TripBudget';
import TripPackingList from './TripPackingList';
import TripActivities from './TripActivities';

const TabPanel = (props) => {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`trip-tabpanel-${index}`}
      aria-labelledby={`trip-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const TripDetails = () => {
  const { id } = useParams();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    const fetchTripDetails = async () => {
      try {
        const tripRes = await axios.get(`http://localhost:3010/api/trips/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });

        setTrip(tripRes.data.data);
        setError(null);
      } catch (err) {
        console.error("Error fetching trip:", err);
        setError("Failed to fetch trip details.");
      } finally {
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
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!trip) {
    return (
      <Box p={3}>
        <Alert severity="info">Trip not found</Alert>
      </Box>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
      <Box mb={3}>
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

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="trip details tabs">
          <Tab label="Budget" />
          <Tab label="Packing List" />
          <Tab label="Activities" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <TripBudget tripId={id} />
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <TripPackingList tripId={id} />
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <TripActivities tripId={id} />
      </TabPanel>
    </Paper>
  );
};

export default TripDetails;

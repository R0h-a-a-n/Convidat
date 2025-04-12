import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Tabs, Tab, Paper, CircularProgress, Alert, Button } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';
import TripBudget from './TripBudget';
import TripPackingList from './TripPackingList';
import TripActivities from './TripActivities';
import BrutalButton from './Brutalbutton';

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
  const navigate = useNavigate();
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

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this trip? This action cannot be undone.')) {
      try {
        await axios.delete(`http://localhost:3010/api/trips/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        navigate('/trips'); // Redirect to trips list after deletion
      } catch (err) {
        console.error("Error deleting trip:", err);
        setError("Failed to delete trip.");
      }
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress sx={{ color: '#FF69B4' }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert 
          severity="error" 
          sx={{ 
            border: '2px solid black',
            borderRadius: '0.75rem',
            boxShadow: '4px 4px 0 black',
            '& .MuiAlert-icon': {
              color: 'black'
            }
          }}
        >
          {error}
        </Alert>
      </Box>
    );
  }

  if (!trip) {
    return (
      <Box p={3}>
        <Alert 
          severity="info"
          sx={{ 
            border: '2px solid black',
            borderRadius: '0.75rem',
            boxShadow: '4px 4px 0 black',
            '& .MuiAlert-icon': {
              color: 'black'
            }
          }}
        >
          Trip not found
        </Alert>
      </Box>
    );
  }

  return (
    <Box 
      sx={{ 
        p: 3,
        backgroundColor: '#c0f4e4',
        backgroundImage: 'radial-gradient(#000 1px, transparent 1px)',
        backgroundSize: '25px 25px',
        minHeight: '100vh'
      }}
    >
      <Paper 
        elevation={0} 
        sx={{ 
          p: 4, 
          mt: 3,
          backgroundColor: '#FEE440',
          border: '3px solid black',
          borderRadius: '1rem',
          boxShadow: '8px 8px 0 black'
        }}
      >
        <Box mb={4}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography 
              variant="h3" 
              sx={{
                fontFamily: 'Lexend Mega, sans-serif',
                fontWeight: '900',
                color: 'black',
                textTransform: 'uppercase'
              }}
            >
              {trip.title}
            </Typography>
            <BrutalButton
              onClick={handleDelete}
              startIcon={<DeleteIcon />}
              sx={{
                backgroundColor: '#FF69B4',
                '&:hover': {
                  backgroundColor: '#FF8BC9'
                }
              }}
            >
              Delete Trip
            </BrutalButton>
          </Box>
          <Typography 
            variant="h6" 
            sx={{ 
              fontFamily: 'Lexend Mega, sans-serif',
              color: 'black',
              mb: 2
            }}
          >
            {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              fontFamily: 'Lexend Mega, sans-serif',
              backgroundColor: 'white',
              p: 2,
              borderRadius: '0.75rem',
              border: '2px solid black',
              boxShadow: '4px 4px 0 black'
            }}
          >
            {trip.description}
          </Typography>
        </Box>

        <Box 
          sx={{ 
            borderBottom: '3px solid black',
            mb: 3
          }}
        >
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            aria-label="trip details tabs"
            sx={{
              '& .MuiTab-root': {
                fontFamily: 'Lexend Mega, sans-serif',
                fontWeight: 'bold',
                color: 'black',
                '&.Mui-selected': {
                  color: 'black',
                  backgroundColor: '#00F5D4',
                  borderRadius: '0.75rem 0.75rem 0 0',
                  border: '2px solid black',
                  borderBottom: 'none'
                }
              },
              '& .MuiTabs-indicator': {
                display: 'none'
              }
            }}
          >
            <Tab label="Budget" />
            <Tab label="Packing List" />
            <Tab label="Activities" />
          </Tabs>
        </Box>

        <Box 
          sx={{ 
            backgroundColor: 'white',
            borderRadius: '1rem',
            border: '2px solid black',
            boxShadow: '6px 6px 0 black'
          }}
        >
          <TabPanel value={tabValue} index={0}>
            <TripBudget tripId={id} />
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <TripPackingList tripId={id} />
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <TripActivities tripId={id} />
          </TabPanel>
        </Box>
      </Paper>
    </Box>
  );
};

export default TripDetails;

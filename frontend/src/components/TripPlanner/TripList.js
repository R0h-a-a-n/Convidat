import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Typography,
  CircularProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { format } from 'date-fns';
import TripForm from './TripForm';
import axios from 'axios';
import BrutalButton from './Brutalbutton';
import BrutalCard from './Brutalcard';

const TripList = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState(null);

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    try {
      const response = await axios.get('http://localhost:3010/api/trips', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setTrips(response.data.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch trips');
      setLoading(false);
    }
  };

  const handleCreateTrip = () => {
    setSelectedTrip(null);
    setOpenDialog(true);
  };

  const handleEditTrip = (trip) => {
    setSelectedTrip(trip);
    setOpenDialog(true);
  };

  const handleDeleteTrip = async (tripId) => {
    if (window.confirm('Are you sure you want to delete this trip?')) {
      try {
        await axios.delete(`http://localhost:3010/api/trips/${tripId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        fetchTrips();
      } catch (err) {
        setError('Failed to delete trip');
      }
    }
  };

  const handleSaveTrip = async (tripData) => {
    try {
      const token = localStorage.getItem('token');
  
      if (!token) {
        setError('Please log in first');
        return;
      }
  
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };
  
      // Temporary workaround: ensure destinations is an array of ObjectIds (or empty)
      if (!Array.isArray(tripData.destinations) || tripData.destinations.some(d => typeof d !== 'string')) {
        tripData.destinations = []; // <- empty array as fallback
      }      
      console.log('[FINAL tripData]', tripData);

  
      if (selectedTrip) {
        await axios.put(
          `http://localhost:3010/api/trips/${selectedTrip._id}`,
          tripData,
          config
        );
      } else {
        await axios.post(
          'http://localhost:3010/api/trips',
          tripData,
          config
        );
      }
  
      setOpenDialog(false);
      fetchTrips();
    } catch (err) {
      console.error('Failed to save trip:', err);
      setError(err.response?.data?.error || 'Failed to save trip');
    }
  };
  
  

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress sx={{ color: '#FF69B4' }} />
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
      <Box 
        display="flex" 
        justifyContent="space-between" 
        alignItems="center" 
        mb={4}
        sx={{
          backgroundColor: '#FEE440',
          p: 3,
          borderRadius: '1rem',
          border: '3px solid black',
          boxShadow: '8px 8px 0 black'
        }}
      >
        <Typography 
          variant="h3" 
          sx={{
            fontFamily: 'Lexend Mega, sans-serif',
            fontWeight: '900',
            color: 'black',
            textTransform: 'uppercase'
          }}
        >
          My Trips
        </Typography>
        <BrutalButton
          startIcon={<AddIcon />}
          onClick={handleCreateTrip}
        >
          Create Trip
        </BrutalButton>
      </Box>

      {error && (
        <Box 
          sx={{ 
            mb: 4,
            p: 2,
            backgroundColor: '#FF8FAB',
            border: '2px solid black',
            borderRadius: '0.75rem',
            boxShadow: '4px 4px 0 black'
          }}
        >
          <Typography color="error" fontFamily="Lexend Mega, sans-serif">
            {error}
          </Typography>
        </Box>
      )}

      <Grid container spacing={4}>
        {trips.map((trip) => (
          <Grid item xs={12} sm={6} md={4} key={trip._id}>
            <Card
              sx={{
                height: '100%',
                cursor: 'pointer',
                backgroundColor: '#9B5DE5',
                color: 'white',
                border: '3px solid black',
                boxShadow: '6px 6px 0 black',
                borderRadius: '1rem',
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '8px 8px 0 black'
                }
              }}
            >
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                  <Typography 
                    variant="h6" 
                    sx={{
                      fontFamily: 'Lexend Mega, sans-serif',
                      fontWeight: 'bold',
                      color: '#FEE440'
                    }}
                  >
                    {trip.title}
                  </Typography>
                  <Box>
                    <IconButton 
                      size="small" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditTrip(trip);
                      }}
                      sx={{
                        backgroundColor: '#FEE440',
                        mr: 1,
                        border: '2px solid black',
                        '&:hover': { backgroundColor: '#FFD60A' }
                      }}
                    >
                      <EditIcon sx={{ color: 'black' }} />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteTrip(trip._id);
                      }}
                      sx={{
                        backgroundColor: '#FF69B4',
                        border: '2px solid black',
                        '&:hover': { backgroundColor: '#FF8BC9' }
                      }}
                    >
                      <DeleteIcon sx={{ color: 'black' }} />
                    </IconButton>
                  </Box>
                </Box>
                <Typography 
                  sx={{ 
                    mb: 2,
                    fontFamily: 'Lexend Mega, sans-serif',
                    fontSize: '0.9rem'
                  }}
                >
                  {trip.description}
                </Typography>
                <Typography 
                  sx={{
                    mb: 2,
                    fontFamily: 'Lexend Mega, sans-serif',
                    fontSize: '0.85rem',
                    color: '#FEE440'
                  }}
                >
                  {format(new Date(trip.startDate), 'MMM d, yyyy')} - {format(new Date(trip.endDate), 'MMM d, yyyy')}
                </Typography>
                <Typography 
                  sx={{
                    fontFamily: 'Lexend Mega, sans-serif',
                    fontSize: '0.85rem',
                    backgroundColor: '#00F5D4',
                    color: 'black',
                    display: 'inline-block',
                    px: 2,
                    py: 0.5,
                    borderRadius: '0.5rem',
                    border: '2px solid black'
                  }}
                >
                  Status: {trip.status}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: '#c0f4e4',
            border: '3px solid black',
            borderRadius: '1rem',
            boxShadow: '8px 8px 0 black'
          }
        }}
      >
        <DialogTitle 
          sx={{ 
            fontFamily: 'Lexend Mega, sans-serif',
            fontWeight: 'bold',
            borderBottom: '2px solid black',
            backgroundColor: '#FF69B4',
            color: 'black'
          }}
        >
          {selectedTrip ? 'Edit Trip' : 'Create New Trip'}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <TripForm
            trip={selectedTrip}
            onSave={handleSaveTrip}
            onCancel={() => setOpenDialog(false)}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default TripList; 
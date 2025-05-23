import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Box,
  Alert,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Trips = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: null,
    endDate: null,
    destinations: [],
    tags: [],
  });
  const navigate = useNavigate();

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

  const handleCreateTrip = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please log in to create a trip');
        return;
      }

      const decodedToken = JSON.parse(atob(token.split('.')[1]));
      const userId = decodedToken.userId;

      const response = await axios.post(
        'http://localhost:3010/api/trips',
        {
          ...formData,
          userId,
          destinations: formData.destinations.map(dest => dest.trim()),
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        setTrips([...trips, response.data.data]);
        setOpenDialog(false);
        setFormData({ title: '', description: '', startDate: null, endDate: null, destinations: [], tags: [] });
      }
    } catch (err) {
      console.error('Error creating trip:', err);
      setError(err.response?.data?.error || 'Failed to create trip');
    }
  };

  const handleTripClick = (tripId) => navigate(`/trips/${tripId}`);

  if (loading) return <Container><Typography>Loading...</Typography></Container>;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#c0f4e4',
        backgroundImage: 'radial-gradient(#aaa 1px, transparent 1px)',
        backgroundSize: '25px 25px',
        px: 2,
        py: 8
      }}
    >
      <Container maxWidth="lg">
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography
            variant="h3"
            sx={{
              fontFamily: 'Lexend Mega, sans-serif',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              color: 'black',
              backgroundColor: '#F15BB5',
              p: 2,
              border: '2px solid black',
              boxShadow: '4px 6px 0 black',
              borderRadius: '0.75rem'
            }}
          >
            My Trips
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenDialog(true)}
            sx={{
              backgroundColor: '#FEE440',
              color: 'black',
              border: '2px solid black',
              boxShadow: '4px 6px 0 black',
              borderRadius: '0.75rem',
              fontWeight: 'bold',
              fontFamily: 'Lexend Mega, sans-serif',
              textTransform: 'uppercase'
            }}
          >
            New Trip
          </Button>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Grid container spacing={3}>
          {trips.map((trip) => (
            <Grid item xs={12} sm={6} md={4} key={trip._id}>
              <Card
                sx={{
                  height: '100%',
                  cursor: 'pointer',
                  backgroundColor: '#9B5DE5',
                  color: 'white',
                  border: '2px solid black',
                  boxShadow: '4px 6px 0 black',
                  borderRadius: '1rem',
                  '&:hover': { boxShadow: '6px 8px 0 black' },
                }}
                onClick={() => handleTripClick(trip._id)}
              >
                <CardContent>
                  <Typography variant="h6" gutterBottom>{trip.title}</Typography>
                  <Typography variant="body2" gutterBottom>{trip.description}</Typography>
                  <Typography variant="body2">
                    {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
                  </Typography>
                  <Box mt={2}>
                    {trip.tags.map((tag) => (
                      <Chip
                        key={tag}
                        label={tag}
                        size="small"
                        sx={{ mr: 1, mb: 1, backgroundColor: '#FEE440', color: 'black', border: '1px solid black' }}
                      />
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontFamily: 'Lexend Mega, sans-serif', fontWeight: 'bold' }}>Create New Trip</DialogTitle>
          <DialogContent>
            <Box component="form" sx={{ mt: 2 }}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField fullWidth label="Title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth label="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} multiline rows={3} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker label="Start Date" value={formData.startDate} onChange={(date) => setFormData({ ...formData, startDate: date })} slotProps={{ textField: { fullWidth: true } }} />
                  </LocalizationProvider>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker label="End Date" value={formData.endDate} onChange={(date) => setFormData({ ...formData, endDate: date })} slotProps={{ textField: { fullWidth: true } }} />
                  </LocalizationProvider>
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth label="Destinations" value={formData.destinations.join(', ')} onChange={(e) => setFormData({ ...formData, destinations: e.target.value.split(',').map(d => d.trim()) })} helperText="Separate destinations with commas" />
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth label="Tags" value={formData.tags.join(', ')} onChange={(e) => setFormData({ ...formData, tags: e.target.value.split(',').map(t => t.trim()) })} helperText="Separate tags with commas" />
                </Grid>
              </Grid>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button onClick={handleCreateTrip} variant="contained" sx={{ backgroundColor: '#00BBF9', color: 'black', border: '2px solid black', boxShadow: '2px 3px 0 black', borderRadius: '0.5rem' }}>
              Create Trip
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default Trips;

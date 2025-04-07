import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  WbSunny as WeatherIcon,
} from '@mui/icons-material';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import axios from 'axios';

const TripItinerary = ({ tripId, itinerary = [], onUpdate }) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [error, setError] = useState('');
  const [weatherInfo, setWeatherInfo] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: {
      type: 'Point',
      coordinates: [0, 0],
      address: '',
    },
    startTime: new Date(),
    endTime: new Date(),
    cost: 0,
    category: 'sightseeing',
    ecoRating: 3,
    bookingRequired: false,
    notes: '',
  });

  const handleAddActivity = () => {
    setSelectedActivity(null);
    setFormData({
      name: '',
      description: '',
      location: {
        type: 'Point',
        coordinates: [0, 0],
        address: '',
      },
      startTime: new Date(),
      endTime: new Date(),
      cost: 0,
      category: 'sightseeing',
      ecoRating: 3,
      bookingRequired: false,
      notes: '',
    });
    setOpenDialog(true);
  };

  const handleEditActivity = (activity) => {
    setSelectedActivity(activity);
    setFormData({
      name: activity.name,
      description: activity.description || '',
      location: activity.location,
      startTime: new Date(activity.startTime),
      endTime: new Date(activity.endTime),
      cost: activity.cost || 0,
      category: activity.category,
      ecoRating: activity.ecoRating || 3,
      bookingRequired: activity.bookingRequired || false,
      notes: activity.notes || '',
    });
    setOpenDialog(true);
  };

  const handleDeleteActivity = async (activityId) => {
    if (window.confirm('Are you sure you want to delete this activity?')) {
      try {
        await axios.delete(
          `http://localhost:3010/api/trips/${tripId}/activities/${activityId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            }
          }
        );
        onUpdate();
      } catch (err) {
        console.error('Error deleting activity:', err);
        setError(err.response?.data?.error || 'Failed to delete activity');
      }
    }
  };

  const handleSaveActivity = async () => {
    try {
      if (selectedActivity) {
        await axios.put(
          `http://localhost:3010/api/trips/${tripId}/itinerary/${selectedActivity._id}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );
      } else {
        await axios.post(
          `http://localhost:3010/api/trips/${tripId}/activities`,
          {
            ...formData,
            tripId: tripId
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json'
            },
          }
        );
      }

      setOpenDialog(false);
      onUpdate();
    } catch (err) {
      console.error('Error saving activity:', err);
      setError(err.response?.data?.error || 'Failed to save activity');
    }
  };

  const handleGetWeather = async (activityId) => {
    try {
      const response = await axios.get(
        `http://localhost:3010/api/trips/${tripId}/activities/${activityId}/weather`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      setWeatherInfo(response.data.data);
    } catch (err) {
      console.error('Error fetching weather:', err);
      setError(err.response?.data?.error || 'Failed to fetch weather information');
    }
  };

  const groupedActivities = itinerary.reduce((acc, day) => {
    if (!acc[day.day]) {
      acc[day.day] = [];
    }
    acc[day.day].push(...day.activities);
    return acc;
  }, {});

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">Trip Itinerary</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddActivity}
        >
          Add Activity
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {weatherInfo && (
        <Alert severity="info" sx={{ mb: 2 }} onClose={() => setWeatherInfo(null)}>
          <Typography variant="subtitle2">
            Weather for {weatherInfo.activity} at {weatherInfo.location}:
          </Typography>
          <Typography variant="body2">
            {weatherInfo.forecast.current.temp}°C, {weatherInfo.forecast.current.weather[0].description}
          </Typography>
        </Alert>
      )}

      {Object.entries(groupedActivities)
        .sort(([a], [b]) => a - b)
        .map(([day, activities]) => (
          <Box key={day} mb={3}>
            <Typography variant="h6" gutterBottom>
              Day {day}
            </Typography>
            <Grid container spacing={2}>
              {activities.map((activity) => (
                <Grid item xs={12} md={6} key={activity._id}>
                  <Card>
                    <CardContent>
                      <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                        <Typography variant="h6">{activity.name}</Typography>
                        <Box>
                          <IconButton
                            size="small"
                            onClick={() => handleGetWeather(activity._id)}
                          >
                            <WeatherIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleEditActivity(activity)}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteActivity(activity._id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </Box>
                      <Typography variant="body2" color="textSecondary" paragraph>
                        {activity.description}
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2">
                            Time: {new Date(activity.startTime).toLocaleTimeString()} -{' '}
                            {new Date(activity.endTime).toLocaleTimeString()}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2">
                            Category: {activity.category}
                          </Typography>
                        </Grid>
                        <Grid item xs={12}>
                          <Typography variant="body2">
                            Location: {activity.location.address}
                          </Typography>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        ))}

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedActivity ? 'Edit Activity' : 'Add Activity'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Activity Name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, description: e.target.value }))
                  }
                  multiline
                  rows={3}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Location Address"
                  value={formData.location.address}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      location: { ...prev.location, address: e.target.value },
                    }))
                  }
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <TimePicker
                    label="Start Time"
                    value={formData.startTime}
                    onChange={(time) =>
                      setFormData((prev) => ({ ...prev, startTime: time }))
                    }
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                </LocalizationProvider>
              </Grid>

              <Grid item xs={12} sm={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <TimePicker
                    label="End Time"
                    value={formData.endTime}
                    onChange={(time) =>
                      setFormData((prev) => ({ ...prev, endTime: time }))
                    }
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                </LocalizationProvider>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Cost"
                  type="number"
                  value={formData.cost}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, cost: parseFloat(e.target.value) }))
                  }
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, category: e.target.value }))
                    }
                    label="Category"
                  >
                    <MenuItem value="sightseeing">Sightseeing</MenuItem>
                    <MenuItem value="adventure">Adventure</MenuItem>
                    <MenuItem value="cultural">Cultural</MenuItem>
                    <MenuItem value="food">Food</MenuItem>
                    <MenuItem value="shopping">Shopping</MenuItem>
                    <MenuItem value="relaxation">Relaxation</MenuItem>
                    <MenuItem value="transportation">Transportation</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Notes"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, notes: e.target.value }))
                  }
                  multiline
                  rows={2}
                />
              </Grid>

              <Grid item xs={12}>
                <Box display="flex" justifyContent="flex-end" gap={2}>
                  <Button variant="outlined" onClick={() => setOpenDialog(false)}>
                    Cancel
                  </Button>
                  <Button variant="contained" color="primary" onClick={handleSaveActivity}>
                    {selectedActivity ? 'Update Activity' : 'Add Activity'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default TripItinerary; 
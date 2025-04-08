import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import axios from 'axios';
import { format } from 'date-fns';



const TripActivities = ({ tripId }) => {
    console.log("tripId from props:", tripId);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    startTime: '',
    endTime: '',
    cost: '',
    category: 'sightseeing',
    ecoRating: 3,
    bookingRequired: false,
    notes: '',
    day: 1
  });

  const categories = [
    'sightseeing',
    'adventure',
    'cultural',
    'food',
    'shopping',
    'relaxation',
    'transportation'
  ];

  // Get the token from localStorage
  const getAuthToken = () => {
    return localStorage.getItem('token');
  };

  // Create axios instance with auth header
  const api = axios.create({
    baseURL: 'http://localhost:3010/api',
    headers: {
      'Authorization': `Bearer ${getAuthToken()}`,
      'Content-Type': 'application/json'
    }
  });

  useEffect(() => {
    if (!tripId) {
      setError('No trip ID provided');
      setLoading(false);
      return;
    }
    fetchActivities();
  }, [tripId]);

  const fetchActivities = async () => {
    try {
      console.log('Fetching activities for tripId:', tripId);
      const response = await api.get(`/trips/${tripId}/activities`);
      console.log('Activities response:', response.data);
      setActivities(response.data.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching activities:', err);
      setError(err.response?.data?.error || 'Failed to fetch activities');
      setLoading(false);
    }
  };

  const handleOpenDialog = () => setOpenDialog(true);
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData({
      name: '',
      description: '',
      location: '',
      startTime: '',
      endTime: '',
      cost: '',
      category: 'sightseeing',
      ecoRating: 3,
      bookingRequired: false,
      notes: '',
      day: 1
    });
    setError('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const formatTime = (time) => {
    if (!time) return '';
    // Remove any non-digit characters
    const digits = time.replace(/\D/g, '');
    // Format as HH:mm
    if (digits.length <= 2) return digits;
    return `${digits.slice(0, 2)}:${digits.slice(2, 4)}`;
  };

  const handleTimeChange = (e) => {
    const { name, value } = e.target;
    const formattedTime = formatTime(value);
    setFormData(prev => ({
      ...prev,
      [name]: formattedTime
    }));
  };

  const formatTimeInput = (time) => {
    if (!time) return '';
    // Remove any non-digit characters
    const digits = time.replace(/\D/g, '');
    // Format as HH:mm
    if (digits.length <= 2) return digits;
    return `${digits.slice(0, 2)}:${digits.slice(2, 4)}`;
  };

  const handleAddActivity = async () => {
    try {
      // Validate required fields
      if (!formData.name || !formData.location || !formData.startTime || !formData.endTime) {
        setError('Please fill in all required fields');
        return;
      }

      // Format the data
      const formattedData = {
        ...formData,
        startTime: formatTimeInput(formData.startTime),
        endTime: formatTimeInput(formData.endTime),
        cost: parseFloat(formData.cost) || 0,
        ecoRating: parseInt(formData.ecoRating) || 3,
        day: parseInt(formData.day) || 1
      };

      console.log('Adding activity with data:', formattedData);

      const response = await api.post(`/trips/${tripId}/activities`, formattedData);
      
      if (response.data.success) {
        // Update the activities list with the new activity
        setActivities(prevActivities => [...prevActivities, response.data.data]);
        handleCloseDialog();
      } else {
        setError(response.data.error || 'Failed to add activity');
      }
    } catch (err) {
      console.error('Error adding activity:', err);
      setError(err.response?.data?.error || 'Failed to add activity');
    }
  };

  const handleDeleteActivity = async (activityId) => {
    try {
      await api.delete(`/trips/${tripId}/activities/${activityId}`);
      fetchActivities();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete activity');
    }
  };

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Activities</Typography>
        <Button variant="contained" color="primary" onClick={handleOpenDialog}>
          Add Activity
        </Button>
      </Box>

      <List>
        {activities.map((activity) => (
          <ListItem
            key={activity._id}
            secondaryAction={
              <Button
                color="error"
                onClick={() => handleDeleteActivity(activity._id)}
              >
                Delete
              </Button>
            }
          >
            <ListItemText
              primary={activity.name}
              secondary={
                <>
                  <Typography component="span" variant="body2" color="text.primary">
                    {activity.description}
                  </Typography>
                  <br />
                  Location: {activity.location}
                  <br />
                  Time: {activity.startTime} - {activity.endTime}
                  <br />
                  Cost: ${activity.cost}
                  <br />
                  Category: {activity.category}
                </>
              }
            />
          </ListItem>
        ))}
      </List>

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Add New Activity</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="name"
            label="Activity Name"
            fullWidth
            value={formData.name}
            onChange={handleInputChange}
            required
          />
          <TextField
            margin="dense"
            name="description"
            label="Description"
            fullWidth
            value={formData.description}
            onChange={handleInputChange}
            required
          />
          <TextField
            margin="dense"
            name="location"
            label="Location"
            fullWidth
            value={formData.location}
            onChange={handleInputChange}
            required
          />
          <TextField
            margin="dense"
            name="startTime"
            label="Start Time (HHMM)"
            fullWidth
            value={formData.startTime}
            onChange={handleTimeChange}
            placeholder="e.g., 0944"
            required
          />
          <TextField
            margin="dense"
            name="endTime"
            label="End Time (HHMM)"
            fullWidth
            value={formData.endTime}
            onChange={handleTimeChange}
            placeholder="e.g., 1747"
            required
          />
          <TextField
            margin="dense"
            name="cost"
            label="Cost"
            type="number"
            fullWidth
            value={formData.cost}
            onChange={handleInputChange}
          />
          <FormControl fullWidth margin="dense" required>
            <InputLabel id="category-label">Category</InputLabel>
            <Select
              labelId="category-label"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              label="Category"
            >
              {categories.map((category) => (
                <MenuItem key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleAddActivity} variant="contained" color="primary">
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};


export default TripActivities; 
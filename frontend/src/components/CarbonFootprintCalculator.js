import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  CircularProgress,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import axios from 'axios';

// Create an axios instance with default config
const api = axios.create({
  baseURL: 'http://localhost:3002',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Add request interceptor to handle errors
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
api.interceptors.response.use(
  response => response,
  error => {
    console.error('Response error:', error);
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Error data:', error.response.data);
      console.error('Error status:', error.response.status);
      console.error('Error headers:', error.response.headers);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error setting up request:', error.message);
    }
    return Promise.reject(error);
  }
);

const initialFormData = {
  travelType: '',
  distance: '',
  unit: 'km'
};

const CarbonFootprintCalculator = () => {
  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [totalEmission, setTotalEmission] = useState(null);
  const [history, setHistory] = useState([]);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingEntry, setDeletingEntry] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await api.post('/api/carbon/footprint', formData);
      setSuccess('Carbon footprint added successfully!');
      setFormData(initialFormData);
      fetchTotalEmission();
      fetchHistory();
    } catch (err) {
      console.error('Submit error:', err);
      setError(err.response?.data?.message || 'Error adding carbon footprint');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (entry) => {
    setEditingEntry(entry);
    setFormData({
      travelType: entry.travelType,
      distance: entry.distance,
      unit: entry.unit
    });
    setEditDialogOpen(true);
  };

  const handleDelete = (entry) => {
    setDeletingEntry(entry);
    setDeleteDialogOpen(true);
  };

  const handleEditSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      await api.put(`/api/carbon/footprint/${editingEntry._id}`, formData);
      setSuccess('Entry updated successfully!');
      setEditDialogOpen(false);
      setFormData(initialFormData);
      fetchTotalEmission();
      fetchHistory();
    } catch (err) {
      console.error('Edit error:', err);
      setError(err.response?.data?.message || 'Error updating entry');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    setLoading(true);
    setError('');
    try {
      await api.delete(`/api/carbon/footprint/${deletingEntry._id}`);
      setSuccess('Entry deleted successfully!');
      setDeleteDialogOpen(false);
      fetchTotalEmission();
      fetchHistory();
    } catch (err) {
      console.error('Delete error:', err);
      setError(err.response?.data?.message || 'Error deleting entry');
    } finally {
      setLoading(false);
    }
  };

  const fetchTotalEmission = async () => {
    try {
      const response = await api.get('/api/carbon/footprint/total');
      setTotalEmission(response.data);
    } catch (err) {
      console.error('Error fetching total emission:', err);
    }
  };

  const fetchHistory = async () => {
    try {
      const response = await api.get('/api/carbon/footprint');
      setHistory(response.data);
    } catch (err) {
      console.error('Error fetching history:', err);
    }
  };

  useEffect(() => {
    fetchTotalEmission();
    fetchHistory();
  }, []);

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Carbon Footprint Calculator
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Travel Type</InputLabel>
                  <Select
                    name="travelType"
                    value={formData.travelType}
                    onChange={handleChange}
                    label="Travel Type"
                    required
                  >
                    <MenuItem value="flight">Flight</MenuItem>
                    <MenuItem value="car">Car</MenuItem>
                    <MenuItem value="train">Train</MenuItem>
                    <MenuItem value="bus">Bus</MenuItem>
                    <MenuItem value="bicycle">Bicycle</MenuItem>
                    <MenuItem value="walking">Walking</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Distance"
                  name="distance"
                  type="number"
                  value={formData.distance}
                  onChange={handleChange}
                  required
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Unit</InputLabel>
                  <Select
                    name="unit"
                    value={formData.unit}
                    onChange={handleChange}
                    label="Unit"
                    required
                  >
                    <MenuItem value="km">Kilometers</MenuItem>
                    <MenuItem value="miles">Miles</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : 'Calculate Carbon Footprint'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>

      {totalEmission && (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Your Total Carbon Footprint
            </Typography>
            <Typography variant="h4" color="primary">
              {totalEmission.totalEmission.toFixed(2)} kg CO2
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Based on {totalEmission.count} travel entries
            </Typography>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Travel History
          </Typography>
          {history.map((entry) => (
            <Box key={entry._id} sx={{ mb: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1, position: 'relative' }}>
              <Box sx={{ position: 'absolute', right: 8, top: 8 }}>
                <IconButton size="small" onClick={() => handleEdit(entry)} sx={{ mr: 1 }}>
                  <EditIcon />
                </IconButton>
                <IconButton size="small" onClick={() => handleDelete(entry)} color="error">
                  <DeleteIcon />
                </IconButton>
              </Box>
              <Typography variant="subtitle1">
                {entry.travelType.charAt(0).toUpperCase() + entry.travelType.slice(1)}
              </Typography>
              <Typography variant="body2">
                Distance: {entry.distance} {entry.unit}
              </Typography>
              <Typography variant="body2" color="primary">
                Carbon Emission: {entry.carbonEmission.toFixed(2)} kg CO2
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Date: {new Date(entry.date).toLocaleDateString()}
              </Typography>
            </Box>
          ))}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
        <DialogTitle>Edit Travel Entry</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Travel Type</InputLabel>
                <Select
                  name="travelType"
                  value={formData.travelType}
                  onChange={handleChange}
                  label="Travel Type"
                  required
                >
                  <MenuItem value="flight">Flight</MenuItem>
                  <MenuItem value="car">Car</MenuItem>
                  <MenuItem value="train">Train</MenuItem>
                  <MenuItem value="bus">Bus</MenuItem>
                  <MenuItem value="bicycle">Bicycle</MenuItem>
                  <MenuItem value="walking">Walking</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Distance"
                name="distance"
                type="number"
                value={formData.distance}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Unit</InputLabel>
                <Select
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                  label="Unit"
                  required
                >
                  <MenuItem value="km">Kilometers</MenuItem>
                  <MenuItem value="miles">Miles</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleEditSubmit} variant="contained" color="primary" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Travel Entry</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this travel entry?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} variant="contained" color="error" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CarbonFootprintCalculator; 
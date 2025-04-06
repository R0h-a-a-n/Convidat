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
  DialogActions,
  Paper
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3002',
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
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const fetchTotalEmission = async () => {
    try {
      const res = await api.get('/api/carbon/footprint/total');
      setTotalEmission(res.data);
    } catch (err) {
      console.error('Fetch total emission failed');
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await api.get('/api/carbon/footprint');
      setHistory(res.data);
    } catch (err) {
      console.error('Fetch history failed');
    }
  };

  useEffect(() => {
    fetchTotalEmission();
    fetchHistory();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/api/carbon/footprint', formData);
      setSuccess('Entry added!');
      setFormData(initialFormData);
      fetchTotalEmission();
      fetchHistory();
    } catch (err) {
      setError('Failed to add entry');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (entry) => {
    setEditingEntry(entry);
    setFormData({ travelType: entry.travelType, distance: entry.distance, unit: entry.unit });
    setEditDialogOpen(true);
  };

  const handleDelete = (entry) => {
    setDeletingEntry(entry);
    setDeleteDialogOpen(true);
  };

  const handleEditSubmit = async () => {
    setLoading(true);
    try {
      await api.put(`/api/carbon/footprint/${editingEntry._id}`, formData);
      setSuccess('Entry updated!');
      setEditDialogOpen(false);
      setFormData(initialFormData);
      fetchTotalEmission();
      fetchHistory();
    } catch (err) {
      setError('Failed to update entry');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    setLoading(true);
    try {
      await api.delete(`/api/carbon/footprint/${deletingEntry._id}`);
      setSuccess('Entry deleted!');
      setDeleteDialogOpen(false);
      fetchTotalEmission();
      fetchHistory();
    } catch (err) {
      setError('Failed to delete entry');
    } finally {
      setLoading(false);
    }
  };

  const cardHues = ['#9B5DE5', '#F15BB5', '#FEE440', '#00F5D4', '#00BBF9', '#B4F8C8'];

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Typography variant="h4" sx={{ fontFamily: 'Lexend Mega', mb: 3 }}>Carbon Footprint Calculator</Typography>

      {error && <Alert severity="error">{error}</Alert>}
      {success && <Alert severity="success">{success}</Alert>}

      <Card sx={{ mb: 4, border: '2px solid black', boxShadow: '4px 6px 0 black' }}>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Travel Type</InputLabel>
                  <Select name="travelType" value={formData.travelType} onChange={handleChange} required>
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
                <TextField fullWidth label="Distance" name="distance" type="number" value={formData.distance} onChange={handleChange} required />
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Unit</InputLabel>
                  <Select name="unit" value={formData.unit} onChange={handleChange} required>
                    <MenuItem value="km">Kilometers</MenuItem>
                    <MenuItem value="miles">Miles</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <Button type="submit" variant="contained" color="primary" fullWidth disabled={loading}>
                  {loading ? <CircularProgress size={24} /> : 'Calculate Carbon Footprint'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>

      {totalEmission && (
        <Card sx={{ mb: 4, border: '2px solid black', boxShadow: '4px 6px 0 black', backgroundColor: '#FEE440' }}>
          <CardContent>
            <Typography variant="h6">Your Total Carbon Footprint</Typography>
            <Typography variant="h4" color="primary">{totalEmission.totalEmission.toFixed(2)} kg CO2</Typography>
            <Typography variant="body2">Based on {totalEmission.count} travel entries</Typography>
          </CardContent>
        </Card>
      )}

      <Card sx={{ border: '2px solid black', boxShadow: '4px 6px 0 black' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Travel History</Typography>
          {history.map((entry, index) => (
            <Paper
              key={entry._id}
              sx={{
                mb: 2,
                p: 2,
                border: '2px solid black',
                boxShadow: '4px 6px 0 black',
                backgroundColor: cardHues[index % cardHues.length],
                position: 'relative'
              }}
            >
              <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
                <IconButton onClick={() => handleEdit(entry)}><EditIcon /></IconButton>
                <IconButton onClick={() => handleDelete(entry)} color="error"><DeleteIcon /></IconButton>
              </Box>
              <Typography variant="subtitle1">{entry.travelType.charAt(0).toUpperCase() + entry.travelType.slice(1)}</Typography>
              <Typography variant="body2">Distance: {entry.distance} {entry.unit}</Typography>
              <Typography variant="body2">Carbon Emission: {entry.carbonEmission.toFixed(2)} kg CO2</Typography>
              <Typography variant="caption">Date: {new Date(entry.date).toLocaleDateString()}</Typography>
            </Paper>
          ))}
        </CardContent>
      </Card>

      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
        <DialogTitle>Edit Entry</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} mt={1}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Travel Type</InputLabel>
                <Select name="travelType" value={formData.travelType} onChange={handleChange} required>
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
              <TextField fullWidth label="Distance" name="distance" type="number" value={formData.distance} onChange={handleChange} required />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Unit</InputLabel>
                <Select name="unit" value={formData.unit} onChange={handleChange} required>
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

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Entry</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this entry?</Typography>
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
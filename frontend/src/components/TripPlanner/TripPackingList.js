import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  TextField,
  CircularProgress,
  Alert,
  Grid,
  MenuItem
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Check as CheckIcon } from '@mui/icons-material';
import axios from 'axios';
import './TripBudget.css';
import BrutalButton from './Brutalbutton'; // or './BrutalButton'


const BrutalCard = ({ children }) => (
  <Box
    sx={{
      border: '2px solid black',
      boxShadow: '4px 6px 0 black',
      borderRadius: '1rem',
      backgroundColor: '#FEE440',
      p: 2,
      mb: 3
    }}
  >
    {children}
  </Box>
);

const TripPackingList = ({ tripId }) => {
  const [packingList, setPackingList] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newItem, setNewItem] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    fetchPackingList();
  }, [tripId]);

  const fetchPackingList = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:3010/api/packing/${tripId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPackingList(response.data.data);
      setLoading(false);
    } catch {
      setError('Failed to fetch packing list');
      setLoading(false);
    }
  };

  const handleAddItem = async () => {
    if (!newItem.trim() || !selectedCategory) return;
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `http://localhost:3010/api/packing/${tripId}/items`,
        { category: selectedCategory, name: newItem.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPackingList(response.data.data);
      setNewItem('');
    } catch {
      setError('Failed to add item');
    }
  };

  const handleDeleteItem = async (category, itemId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`http://localhost:3010/api/packing/${tripId}/items/${itemId}`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { category }
      });
      if (response.data.success) {
        setPackingList(response.data.data);
      } else {
        setError('Failed to delete item');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete item');
    }
  };

  const handleToggleItem = async (category, itemId, isPacked) => {
    try {
      const token = localStorage.getItem('token');
      console.log('Sending update request:', { category, itemId, isPacked: !isPacked });
      
      const response = await axios.put(`http://localhost:3010/api/packing/${tripId}/items/${itemId}`, {
        isPacked: !isPacked,
        category
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('Server response:', response.data);

      if (response.data.success) {
        // Update the entire packing list with the server response
        setPackingList(response.data.data);
      } else {
        console.error('Failed to update item:', response.data.error);
        setError('Failed to update item');
      }
    } catch (err) {
      console.error('Error updating item:', err);
      setError(err.response?.data?.error || 'Failed to update item');
    }
  };

  if (loading) {
    return <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px"><CircularProgress /></Box>;
  }

  if (error) {
    return <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>;
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ fontFamily: 'Lexend Mega, sans-serif', mb: 2 }}>Packing List</Typography>

      <BrutalCard>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={5}>
            <TextField
              fullWidth
              label="New Item"
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={5}>
            <TextField
              fullWidth
              select
              label="Category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              size="small"
            >
              <MenuItem value="">Select Category</MenuItem>
              {packingList?.categories.map((category) => (
                <MenuItem key={category.name} value={category.name}>{category.name}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={2}>
            <BrutalButton onClick={handleAddItem} disabled={!newItem.trim() || !selectedCategory}>
              <AddIcon /> Add
            </BrutalButton>
          </Grid>
        </Grid>
      </BrutalCard>

      {packingList?.categories.map((category) => (
        <BrutalCard key={category.name}>
          <Typography variant="h6" sx={{ fontFamily: 'Archivo Black', mb: 1 }}>{category.name}</Typography>
          <List>
            {category.items.map((item) => (
              <ListItem
                key={item._id}
                sx={{
                  backgroundColor: item.isPacked ? '#B4F8C8' : 'transparent',
                  border: '1px dashed black',
                  borderRadius: '0.5rem',
                  mb: 1
                }}
              >
                <ListItemText
                  primary={item.name}
                  sx={{
                    textDecoration: item.isPacked ? 'line-through' : 'none',
                    color: item.isPacked ? 'gray' : 'black'
                  }}
                />
                <ListItemSecondaryAction>
                  <IconButton onClick={() => handleToggleItem(category.name, item._id, item.isPacked)}>
                    <CheckIcon color={item.isPacked ? 'success' : 'action'} />
                  </IconButton>
                  <IconButton onClick={() => handleDeleteItem(category.name, item._id)}>
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </BrutalCard>
      ))}
    </Box>
  );
};

export default TripPackingList;

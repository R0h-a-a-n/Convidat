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
  Button,
  Paper,
  Grid,
  CircularProgress,
  Alert
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Check as CheckIcon } from '@mui/icons-material';
import axios from 'axios';

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
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setPackingList(response.data.data);
      setLoading(false);
    } catch (err) {
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
        {
          category: selectedCategory,
          name: newItem.trim()
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setPackingList(response.data.data);
      setNewItem('');
    } catch (err) {
      setError('Failed to add item');
    }
  };

  const handleDeleteItem = async (category, itemId) => {
    try {
      console.log('Deleting item:', { category, itemId });
      const token = localStorage.getItem('token');
      const response = await axios.delete(
        `http://localhost:3010/api/packing/${tripId}/items/${itemId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          data: {
            category: category
          }
        }
      );

      console.log('Delete response:', response.data);
      if (response.data.success) {
        setPackingList(response.data.data);
      } else {
        setError('Failed to delete item: ' + (response.data.error || 'Unknown error'));
      }
    } catch (err) {
      console.error('Error deleting item:', err);
      setError(err.response?.data?.error || 'Failed to delete item');
    }
  };

  const handleToggleItem = async (category, itemId, packed) => {
    try {
      console.log('Updating item:', { category, itemId, packed });
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `http://localhost:3010/api/packing/${tripId}/items/${itemId}`,
        {
          packed: !packed,
          category: category
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Update response:', response.data);
      if (response.data.success) {
        setPackingList(response.data.data);
      } else {
        setError('Failed to update item: ' + (response.data.error || 'Unknown error'));
      }
    } catch (err) {
      console.error('Error updating item:', err);
      setError(err.response?.data?.error || 'Failed to update item');
    }
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
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Packing List
      </Typography>

      <Paper sx={{ p: 2, mb: 2 }}>
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
              SelectProps={{
                native: true
              }}
            >
              <option value="">Select Category</option>
              {packingList?.categories.map((category) => (
                <option key={category.name} value={category.name}>
                  {category.name}
                </option>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={2}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddItem}
              disabled={!newItem.trim() || !selectedCategory}
            >
              Add
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {packingList?.categories.map((category) => (
        <Paper key={category.name} sx={{ mb: 2 }}>
          <Typography variant="subtitle1" sx={{ p: 2, borderBottom: '1px solid #eee' }}>
            {category.name.charAt(0).toUpperCase() + category.name.slice(1)}
          </Typography>
          <List>
            {category.items.map((item) => (
              <ListItem key={item._id}>
                <ListItemText
                  primary={item.name}
                  sx={{
                    textDecoration: item.packed ? 'line-through' : 'none',
                    color: item.packed ? 'text.secondary' : 'text.primary'
                  }}
                />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    onClick={() => handleToggleItem(category.name, item._id, item.packed)}
                    sx={{ mr: 1 }}
                  >
                    <CheckIcon color={item.packed ? 'success' : 'action'} />
                  </IconButton>
                  <IconButton
                    edge="end"
                    onClick={() => handleDeleteItem(category.name, item._id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </Paper>
      ))}
    </Box>
  );
};

export default TripPackingList; 
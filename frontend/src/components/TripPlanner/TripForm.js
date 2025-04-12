import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import BrutalButton from './Brutalbutton';

const inputStyles = {
  '& .MuiOutlinedInput-root': {
    backgroundColor: 'white',
    border: '2px solid black',
    borderRadius: '0.75rem',
    '&:hover': {
      borderColor: 'black',
    },
    '&.Mui-focused': {
      borderColor: 'black',
      boxShadow: '4px 4px 0 black',
    }
  },
  '& .MuiInputLabel-root': {
    fontFamily: 'Lexend Mega, sans-serif',
    '&.Mui-focused': {
      color: 'black',
    }
  }
};

const TripForm = ({ trip, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: new Date(),
    endDate: new Date(),
    status: 'planning',
    isPublic: false,
    tags: [],
    destinations: [],
  });

  useEffect(() => {
    if (trip) {
      setFormData({
        title: trip.title,
        description: trip.description || '',
        startDate: new Date(trip.startDate),
        endDate: new Date(trip.endDate),
        status: trip.status,
        isPublic: trip.isPublic,
        tags: trip.tags || [],
        destinations: trip.destinations?.map(d => d._id || d) || []
      });
    }
  }, [trip]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDateChange = (name) => (date) => {
    setFormData((prev) => ({
      ...prev,
      [name]: date,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Box 
      component="form" 
      onSubmit={handleSubmit} 
      sx={{ 
        mt: 2,
        '& .MuiGrid-item': {
          '& .MuiFormControl-root': {
            width: '100%'
          }
        }
      }}
    >
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            label="Trip Title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            sx={inputStyles}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            multiline
            rows={3}
            sx={inputStyles}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Start Date"
              value={formData.startDate}
              onChange={handleDateChange('startDate')}
              slotProps={{ 
                textField: { 
                  sx: inputStyles,
                  required: true
                } 
              }}
            />
          </LocalizationProvider>
        </Grid>

        <Grid item xs={12} sm={6}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="End Date"
              value={formData.endDate}
              onChange={handleDateChange('endDate')}
              minDate={formData.startDate}
              slotProps={{ 
                textField: { 
                  sx: inputStyles,
                  required: true
                } 
              }}
            />
          </LocalizationProvider>
        </Grid>

        <Grid item xs={12}>
          <FormControl sx={inputStyles}>
            <InputLabel>Status</InputLabel>
            <Select
              name="status"
              value={formData.status}
              onChange={handleChange}
              label="Status"
            >
              <MenuItem value="planning">Planning</MenuItem>
              <MenuItem value="in-progress">In Progress</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <TextField
            label="Tags (comma-separated)"
            name="tags"
            value={formData.tags.join(', ')}
            onChange={(e) => {
              const tags = e.target.value.split(',').map((tag) => tag.trim());
              setFormData((prev) => ({
                ...prev,
                tags,
              }));
            }}
            sx={inputStyles}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            label="Destinations (comma-separated)"
            name="destinations"
            value={formData.destinations?.join(', ') || ''}
            onChange={(e) => {
              const destinations = e.target.value
                .split(',')
                .map((id) => id.trim())
                .filter(Boolean);
              setFormData((prev) => ({
                ...prev,
                destinations,
              }));
            }}
            sx={inputStyles}
          />
        </Grid>

        <Grid item xs={12}>
          <Box 
            display="flex" 
            justifyContent="flex-end" 
            gap={2}
            sx={{
              mt: 2,
              borderTop: '2px solid black',
              pt: 3
            }}
          >
            <BrutalButton
              onClick={onCancel}
              sx={{
                backgroundColor: '#FF69B4',
                '&:hover': {
                  backgroundColor: '#FF8BC9'
                }
              }}
            >
              Cancel
            </BrutalButton>
            <BrutalButton
              type="submit"
              sx={{
                backgroundColor: '#FEE440',
                '&:hover': {
                  backgroundColor: '#FFD60A'
                }
              }}
            >
              {trip ? 'Update Trip' : 'Create Trip'}
            </BrutalButton>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TripForm; 
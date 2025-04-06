import React, { useState, useEffect } from 'react';
import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  Box,
  Link,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Park,
  DirectionsBike,
  Train,
  LocalFlorist,
  Nature,
  EmojiNature,
  LocationOn
} from '@mui/icons-material';
import axios from 'axios';

// Icon mapping for different eco-features
const featureIcons = {
  'Natural Conservation': <Nature color="primary" />,
  'Cultural Heritage': <LocalFlorist color="primary" />,
  'Wildlife Conservation': <Park color="primary" />,
  'Biodiversity': <EmojiNature color="primary" />,
  'Local Tourism': <LocationOn color="primary" />,
  default: <EmojiNature color="primary" />
};

const api = axios.create({
  baseURL: 'http://localhost:3008',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to include token
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

const EcoDestinations = ({ city }) => {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDestinations = async () => {
      if (!city) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const response = await api.get('/api/destinations/search', {
          params: { city }
        });

        if (response.data.success) {
          setDestinations(response.data.data);
        } else {
          setError('Failed to fetch destinations');
        }
      } catch (err) {
        console.error('Error fetching destinations:', err);
        setError(err.response?.data?.error || 'Failed to fetch destinations');
      } finally {
        setLoading(false);
      }
    };

    fetchDestinations();
  }, [city]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!destinations.length) {
    return (
      <Typography variant="body1" color="text.secondary" sx={{ p: 2 }}>
        No eco-friendly destinations found for {city}.
      </Typography>
    );
  }

  return (
    <Box>
      <Typography variant="body1" color="text.secondary" paragraph>
        Discover these sustainable and eco-friendly destinations in {city}:
      </Typography>
      <List>
        {destinations.map((destination, index) => (
          <React.Fragment key={destination._id || destination.name}>
            <ListItem>
              <ListItemIcon>
                {destination.ecoFeatures && destination.ecoFeatures[0] 
                  ? featureIcons[destination.ecoFeatures[0]] || featureIcons.default
                  : featureIcons.default}
              </ListItemIcon>
              <ListItemText
                primary={destination.name}
                secondary={
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      {destination.description}
                    </Typography>
                    <Box mt={1}>
                      {destination.ecoFeatures.map((feature) => (
                        <Typography
                          key={feature}
                          variant="caption"
                          color="primary"
                          component="span"
                          sx={{ mr: 2 }}
                        >
                          {feature}
                        </Typography>
                      ))}
                    </Box>
                  </Box>
                }
              />
            </ListItem>
            {index < destinations.length - 1 && <Divider variant="inset" component="li" />}
          </React.Fragment>
        ))}
      </List>
    </Box>
  );
};

export default EcoDestinations; 
import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Avatar,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Chip,
  FormControlLabel,
  Switch,
  MenuItem,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import TrainIcon from '@mui/icons-material/Train';
import FlightIcon from '@mui/icons-material/Flight';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginTop: theme.spacing(3),
  marginBottom: theme.spacing(3),
}));

const StatsCard = styled(Card)(({ theme }) => ({
  height: '100%',
  padding: theme.spacing(2),
  borderRadius: theme.spacing(2),
}));

const GreenStatsCard = styled(StatsCard)({
  backgroundColor: '#98FB98',
});

const YellowStatsCard = styled(StatsCard)({
  backgroundColor: '#FFD700',
});

const BlueStatsCard = styled(StatsCard)({
  backgroundColor: '#87CEEB',
});

const profileApi = axios.create({
  baseURL: 'http://localhost:3004',
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
});

const getTransportIcon = (type) => {
  switch (type?.toLowerCase()) {
    case 'car':
      return <DirectionsCarIcon />;
    case 'bus':
      return <DirectionsBusIcon />;
    case 'train':
      return <TrainIcon />;
    case 'flight':
      return <FlightIcon />;
    default:
      return <DirectionsCarIcon />;
  }
};

const Profile = () => {
  const { user: authUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    bio: '',
    avatar: '',
    location: {
      city: '',
      country: ''
    },
    travelPreferences: {
      preferredMode: 'car',
      routeOptimization: 'fastest'
    },
    stats: {
      totalTrips: 0,
      totalDistance: 0,
      carbonFootprint: 0
    }
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchProfile();
  }, [isAuthenticated, navigate]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      profileApi.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      const response = await profileApi.get('/api/profile');
      const profileData = response.data.data;
      
      // Initialize form data with profile data
      setFormData({
        bio: profileData.user.profile.bio || '',
        avatar: profileData.user.profile.avatar || '',
        location: {
          city: profileData.user.profile.location?.city || '',
          country: profileData.user.profile.location?.country || ''
        },
        travelPreferences: profileData.user.profile.travelPreferences || {
          preferredMode: 'car',
          routeOptimization: 'fastest'
        },
        stats: profileData.user.profile.stats || {
          totalTrips: 0,
          totalDistance: 0,
          carbonFootprint: 0
        }
      });
      
      setProfileData(profileData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError(error.response?.data?.message || 'Failed to fetch profile');
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value === 'true' ? true : value === 'false' ? false : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      const token = localStorage.getItem('token');
      profileApi.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Create update data with all required fields
      const updateData = {
        username: authUser?.username || profileData?.user?.username,
        profile: {
          bio: formData.bio || '',
          avatar: formData.avatar || '',
          location: {
            city: formData.location?.city || '',
            country: formData.location?.country || ''
          },
          travelPreferences: {
            preferredMode: formData.travelPreferences?.preferredMode || 'car',
            routeOptimization: formData.travelPreferences?.routeOptimization || 'fastest'
          },
          stats: {
            totalTrips: formData.stats?.totalTrips || 0,
            totalDistance: formData.stats?.totalDistance || 0,
            carbonFootprint: formData.stats?.carbonFootprint || 0
          }
        }
      };

      console.log('Sending update data:', updateData);

      const response = await profileApi.put('/api/profile', updateData);
      if (response.data.success) {
        setEditing(false);
        await fetchProfile();
      } else {
        setError(response.data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setError(error.response?.data?.message || 'Failed to update profile');
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <form onSubmit={handleSubmit}>
        {/* User Profile Section */}
        <StyledPaper elevation={3}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h4">
              {(authUser?.name || profileData?.user?.name || '').split(' ')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ')}
            </Typography>
            <Button
              variant="contained"
              color={editing ? "secondary" : "primary"}
              onClick={() => setEditing(!editing)}
            >
              {editing ? 'Cancel' : 'Edit Profile'}
            </Button>
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Box display="flex" flexDirection="column" alignItems="center">
                <Avatar
                  src={formData.avatar}
                  sx={{ width: 150, height: 150, mb: 2 }}
                />
                {editing && (
                  <TextField
                    fullWidth
                    label="Avatar URL"
                    name="avatar"
                    value={formData.avatar}
                    onChange={handleInputChange}
                    margin="normal"
                  />
                )}
                <Typography variant="body2" color="textSecondary">
                  Member since {new Date(profileData?.user?.createdAt).toLocaleDateString()}
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} md={8}>
              <Box>
                <Typography variant="h6" gutterBottom>Bio</Typography>
                {editing ? (
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    margin="normal"
                  />
                ) : (
                  <Typography variant="body1" paragraph>
                    {formData.bio || 'No bio added yet.'}
                  </Typography>
                )}
              </Box>

              <Box mt={3}>
                <Typography variant="h6" gutterBottom>Location</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    {editing ? (
                      <TextField
                        fullWidth
                        label="City"
                        name="location.city"
                        value={formData.location.city}
                        onChange={handleInputChange}
                        margin="normal"
                      />
                    ) : (
                      <Typography variant="body1">
                        City: {formData.location.city || 'Not specified'}
                      </Typography>
                    )}
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    {editing ? (
                      <TextField
                        fullWidth
                        label="Country"
                        name="location.country"
                        value={formData.location.country}
                        onChange={handleInputChange}
                        margin="normal"
                      />
                    ) : (
                      <Typography variant="body1">
                        Country: {formData.location.country || 'Not specified'}
                      </Typography>
                    )}
                  </Grid>
                </Grid>
              </Box>

              <Box mt={3}>
                <Typography variant="h6" gutterBottom>Travel Preferences</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    {editing ? (
                      <TextField
                        select
                        fullWidth
                        label="Preferred Mode"
                        name="travelPreferences.preferredMode"
                        value={formData.travelPreferences.preferredMode}
                        onChange={handleInputChange}
                        margin="normal"
                      >
                        <MenuItem value="car">Car</MenuItem>
                        <MenuItem value="bus">Bus</MenuItem>
                        <MenuItem value="train">Train</MenuItem>
                        <MenuItem value="flight">Flight</MenuItem>
                      </TextField>
                    ) : (
                      <Typography variant="body1">
                        Preferred Mode: {formData.travelPreferences.preferredMode.charAt(0).toUpperCase() + 
                        formData.travelPreferences.preferredMode.slice(1)}
                      </Typography>
                    )}
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    {editing ? (
                      <TextField
                        select
                        fullWidth
                        label="Route Optimization"
                        name="travelPreferences.routeOptimization"
                        value={formData.travelPreferences.routeOptimization}
                        onChange={handleInputChange}
                        margin="normal"
                      >
                        <MenuItem value="fastest">Fastest</MenuItem>
                        <MenuItem value="eco">Eco-Friendly</MenuItem>
                        <MenuItem value="balanced">Balanced</MenuItem>
                      </TextField>
                    ) : (
                      <Typography variant="body1">
                        Route Optimization: {formData.travelPreferences.routeOptimization.charAt(0).toUpperCase() + 
                        formData.travelPreferences.routeOptimization.slice(1)}
                      </Typography>
                    )}
                  </Grid>
                </Grid>
              </Box>
            </Grid>
          </Grid>

          {editing && (
            <Box mt={3} display="flex" justifyContent="flex-end">
              <Button
                type="submit"
                variant="contained"
                color="primary"
              >
                Save Changes
              </Button>
            </Box>
          )}
        </StyledPaper>
      </form>

      {/* Stats Section */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} sm={4}>
          <GreenStatsCard>
            <CardContent>
              <Typography variant="h6">ECO SCORE</Typography>
              <Typography variant="h3">{profileData?.metrics?.ecoScore || 0}</Typography>
              <Typography variant="body2">Out of 100</Typography>
            </CardContent>
          </GreenStatsCard>
        </Grid>
        <Grid item xs={12} sm={4}>
          <YellowStatsCard>
            <CardContent>
              <Typography variant="h6">TOTAL EMISSION</Typography>
              <Typography variant="h3">{profileData?.metrics?.totalEmissions || 0} kg</Typography>
              <Typography variant="body2">Across {profileData?.metrics?.tripCount || 0} trips</Typography>
            </CardContent>
          </YellowStatsCard>
        </Grid>
        <Grid item xs={12} sm={4}>
          <BlueStatsCard>
            <CardContent>
              <Typography variant="h6">AVG EMISSION</Typography>
              <Typography variant="h3">{profileData?.metrics?.avgEmission || 0} kg</Typography>
              <Typography variant="body2">Per Trip</Typography>
            </CardContent>
          </BlueStatsCard>
        </Grid>
      </Grid>

      {/* Travel History */}
      <StyledPaper sx={{ mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Travel History
        </Typography>
        <List>
          {profileData?.travelHistory?.map((trip) => (
            <ListItem key={trip.id}>
              <ListItemText
                primary={
                  <Box display="flex" alignItems="center">
                    {getTransportIcon(trip.type)}
                    <Box ml={1}>
                      {trip.type} Journey - {trip.distance} {trip.unit}
                    </Box>
                  </Box>
                }
                secondary={
                  <Typography component="div" variant="body2">
                    {new Date(trip.date).toLocaleDateString()}
                    <Chip 
                      label={`${trip.carbonEmission || 0}kg CO₂`}
                      size="small"
                      color="primary"
                      sx={{ ml: 1 }}
                    />
                  </Typography>
                }
              />
            </ListItem>
          ))}
        </List>
      </StyledPaper>
    </Container>
  );
};

export default Profile;
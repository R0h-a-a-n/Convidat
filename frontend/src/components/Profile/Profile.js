import './Profile.css';
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
  Tabs,
  Tab,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import TrainIcon from '@mui/icons-material/Train';
import FlightIcon from '@mui/icons-material/Flight';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import LinkIcon from '@mui/icons-material/Link';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginTop: theme.spacing(3),
  marginBottom: theme.spacing(3),
  border: '2px solid black',
  boxShadow: '4px 6px 0 black',
  borderRadius: '0.75rem',
  backgroundColor: '#FEE440'
}));

const StatsCard = styled(Card)(({ theme }) => ({
  height: '100%',
  padding: theme.spacing(2),
  border: '2px solid black',
  boxShadow: '4px 6px 0 black',
  borderRadius: '0.75rem',
}));

const GreenStatsCard = styled(StatsCard)({
  backgroundColor: '#9B5DE5',
  color: 'white'
});

const YellowStatsCard = styled(StatsCard)({
  backgroundColor: '#00BBF9',
  color: 'black'
});

const BlueStatsCard = styled(StatsCard)({
  backgroundColor: '#F15BB5',
  color: 'black'
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

// Format number to 2 decimal places
const formatNumber = (num) => Number(num).toFixed(2);

const MAX_IMAGE_SIZE = 800; // Maximum width/height in pixels

const compressImage = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions while maintaining aspect ratio
        if (width > height) {
          if (width > MAX_IMAGE_SIZE) {
            height = Math.round((height * MAX_IMAGE_SIZE) / width);
            width = MAX_IMAGE_SIZE;
          }
        } else {
          if (height > MAX_IMAGE_SIZE) {
            width = Math.round((width * MAX_IMAGE_SIZE) / height);
            height = MAX_IMAGE_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to JPEG format with 0.8 quality
        canvas.toBlob(
          (blob) => {
            resolve(blob);
          },
          'image/jpeg',
          0.8
        );
      };
      img.onerror = (error) => reject(error);
    };
    reader.onerror = (error) => reject(error);
  });
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
  const [imageUploadType, setImageUploadType] = useState('url'); // 'url' or 'file'
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = React.useRef();

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
        stats: {
          totalTrips: Number(profileData.user.profile.stats?.totalTrips || 0).toFixed(2),
          totalDistance: Number(profileData.user.profile.stats?.totalDistance || 0).toFixed(2),
          carbonFootprint: Number(profileData.user.profile.stats?.carbonFootprint || 0).toFixed(2)
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
            totalTrips: Number(formData.stats?.totalTrips || 0).toFixed(2),
            totalDistance: Number(formData.stats?.totalDistance || 0).toFixed(2),
            carbonFootprint: Number(formData.stats?.carbonFootprint || 0).toFixed(2)
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

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        setLoading(true);
        setError(null);

        // Compress the image
        const compressedBlob = await compressImage(file);
        
        // Convert compressed blob to base64
        const reader = new FileReader();
        reader.onloadend = () => {
          setSelectedFile(file);
          setFormData(prev => ({
            ...prev,
            avatar: reader.result
          }));
          setLoading(false);
        };
        reader.onerror = () => {
          setError('Failed to process image file');
          setLoading(false);
        };
        reader.readAsDataURL(compressedBlob);
      } catch (error) {
        console.error('Error processing file:', error);
        setError('Failed to process image file');
        setLoading(false);
      }
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
    <Box
      sx={{
        minHeight: '100vh',
        pt: 10,
        pb: 6,
        backgroundColor: '#c0f4e4',
        backgroundImage: 'radial-gradient(rgba(0, 0, 0, 0.2) 1px, transparent 1px)',
        backgroundSize: '25px 25px',
        px: 2
      }}
    >
      <Container maxWidth="lg">
        {error && <Alert severity="error" sx={{ mb: 2, border: '2px solid black', boxShadow: '4px 6px 0 black' }}>{error}</Alert>}
        {loading ? (
          <Box display="flex" justifyContent="center">
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Typography
              variant="h2"
              sx={{
                fontFamily: 'Lexend Mega, sans-serif',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                color: 'black',
                backgroundColor: '#F15BB5',
                p: 2,
                border: '2px solid black',
                boxShadow: '4px 6px 0 black',
                borderRadius: '0.75rem',
                display: 'inline-block',
                mb: 4,
                textAlign: 'center'
              }}
            >
              My Profile
            </Typography>
            <form onSubmit={handleSubmit}>
              {/* User Profile Section */}
              <StyledPaper elevation={3}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                  <Typography 
                    variant="h3"
                    sx={{
                      fontFamily: 'Lexend Mega, sans-serif',
                      color: 'black',
                      textTransform: 'capitalize'
                    }}
                  >
                    {(authUser?.name || profileData?.user?.name || '').split(' ')
                      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                      .join(' ')}
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={() => setEditing(!editing)}
                    sx={{
                      backgroundColor: editing ? '#FEE440' : '#00BBF9',
                      color: 'black',
                      border: '2px solid black',
                      boxShadow: '4px 6px 0 black',
                      borderRadius: '0.75rem',
                      '&:hover': {
                        backgroundColor: editing ? '#FEE440' : '#00BBF9',
                        transform: 'translate(2px, 2px)',
                        boxShadow: '2px 4px 0 black',
                      }
                    }}
                  >
                    {editing ? 'Cancel' : 'Edit Profile'}
                  </Button>
                </Box>

                <Grid container spacing={4}>
                  <Grid item xs={12} md={4}>
                    <Box display="flex" flexDirection="column" alignItems="center">
                      <Avatar
                        src={formData.avatar}
                        sx={{
                          width: 200,
                          height: 200,
                          mb: 3,
                          border: '2px solid black',
                          boxShadow: '4px 6px 0 black'
                        }}
                      />
                      {editing && (
                        <Box sx={{ width: '100%', mt: 2 }}>
                          <Tabs
                            value={imageUploadType}
                            onChange={(e, newValue) => setImageUploadType(newValue)}
                            sx={{
                              mb: 2,
                              '& .MuiTabs-indicator': {
                                backgroundColor: 'black',
                              },
                              '& .MuiTab-root': {
                                color: 'black',
                                fontFamily: 'Lexend Mega',
                                fontSize: '0.8rem',
                                '&.Mui-selected': {
                                  color: 'black',
                                  fontWeight: 'bold',
                                },
                              },
                            }}
                          >
                            <Tab 
                              icon={<LinkIcon />} 
                              label="URL" 
                              value="url"
                              sx={{ 
                                border: '2px solid black',
                                borderRadius: '0.75rem 0 0 0.75rem',
                                backgroundColor: imageUploadType === 'url' ? '#F15BB5' : '#FEE440',
                                '&:hover': {
                                  backgroundColor: imageUploadType === 'url' ? '#F15BB5' : '#FFE658',
                                }
                              }}
                            />
                            <Tab 
                              icon={<AddPhotoAlternateIcon />} 
                              label="Upload" 
                              value="file"
                              sx={{ 
                                border: '2px solid black',
                                borderRadius: '0 0.75rem 0.75rem 0',
                                borderLeft: 'none',
                                backgroundColor: imageUploadType === 'file' ? '#F15BB5' : '#FEE440',
                                '&:hover': {
                                  backgroundColor: imageUploadType === 'file' ? '#F15BB5' : '#FFE658',
                                }
                              }}
                            />
                          </Tabs>

                          {imageUploadType === 'url' ? (
                            <TextField
                              fullWidth
                              name="avatar"
                              label="Image URL"
                              value={formData.avatar}
                              onChange={handleInputChange}
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  border: '2px solid black',
                                  borderRadius: '0.75rem',
                                  backgroundColor: 'white',
                                  '&:hover': {
                                    border: '2px solid black',
                                  }
                                }
                              }}
                            />
                          ) : (
                            <Box sx={{ textAlign: 'center' }}>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileSelect}
                                style={{ display: 'none' }}
                                ref={fileInputRef}
                              />
                              <Button
                                variant="contained"
                                onClick={() => fileInputRef.current.click()}
                                sx={{
                                  backgroundColor: '#00F5D4',
                                  color: 'black',
                                  border: '2px solid black',
                                  boxShadow: '4px 4px 0 black',
                                  borderRadius: '0.75rem',
                                  fontFamily: 'Lexend Mega',
                                  '&:hover': {
                                    backgroundColor: '#00D5B4',
                                    transform: 'translate(2px, 2px)',
                                    boxShadow: '2px 2px 0 black',
                                  }
                                }}
                              >
                                {selectedFile ? 'Change Image' : 'Choose Image'}
                              </Button>
                              {selectedFile && (
                                <Typography 
                                  variant="body2" 
                                  sx={{ 
                                    mt: 1,
                                    fontFamily: 'Lexend Mega',
                                    color: 'black',
                                    backgroundColor: 'rgba(255,255,255,0.5)',
                                    p: 1,
                                    borderRadius: '0.5rem',
                                    border: '1px solid black'
                                  }}
                                >
                                  {selectedFile.name}
                                </Typography>
                              )}
                            </Box>
                          )}
                        </Box>
                      )}
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          mt: 2,
                          fontFamily: 'Archivo Black',
                          backgroundColor: 'rgba(0,0,0,0.1)',
                          p: 1,
                          borderRadius: '0.5rem',
                          border: '2px solid black',
                          textAlign: 'center'
                        }}
                      >
                        Member since {new Date(profileData?.user?.createdAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={12} md={8}>
                    <Box mb={4}>
                      <Typography 
                        variant="h5" 
                        sx={{ 
                          fontFamily: 'Archivo Black',
                          mb: 2,
                          backgroundColor: '#F15BB5',
                          p: 1,
                          borderRadius: '0.5rem',
                          border: '2px solid black',
                          display: 'inline-block'
                        }}
                      >
                        Bio
                      </Typography>
                      {editing ? (
                        <TextField
                          fullWidth
                          multiline
                          rows={4}
                          label="Bio"
                          name="bio"
                          value={formData.bio}
                          onChange={handleInputChange}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              border: '2px solid black',
                              borderRadius: '0.75rem',
                              backgroundColor: 'white',
                              '&:hover': {
                                border: '2px solid black',
                              }
                            }
                          }}
                        />
                      ) : (
                        <Typography 
                          variant="body1" 
                          sx={{
                            p: 2,
                            backgroundColor: 'rgba(255,255,255,0.5)',
                            borderRadius: '0.75rem',
                            border: '2px solid black',
                            boxShadow: '2px 3px 0 black'
                          }}
                        >
                          {formData.bio || 'No bio added yet.'}
                        </Typography>
                      )}
                    </Box>

                    <Box mb={4}>
                      <Typography 
                        variant="h5" 
                        sx={{ 
                          fontFamily: 'Archivo Black',
                          mb: 2,
                          backgroundColor: '#00BBF9',
                          p: 1,
                          borderRadius: '0.5rem',
                          border: '2px solid black',
                          display: 'inline-block'
                        }}
                      >
                        Location
                      </Typography>
                      <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                          {editing ? (
                            <TextField
                              fullWidth
                              label="City"
                              name="location.city"
                              value={formData.location.city}
                              onChange={handleInputChange}
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  border: '2px solid black',
                                  borderRadius: '0.75rem',
                                  backgroundColor: 'white',
                                  '&:hover': {
                                    border: '2px solid black',
                                  }
                                }
                              }}
                            />
                          ) : (
                            <Box 
                              sx={{
                                p: 2,
                                backgroundColor: 'rgba(255,255,255,0.5)',
                                borderRadius: '0.75rem',
                                border: '2px solid black',
                                boxShadow: '2px 3px 0 black'
                              }}
                            >
                              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>City</Typography>
                              <Typography variant="body1">{formData.location.city || 'Not specified'}</Typography>
                            </Box>
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
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  border: '2px solid black',
                                  borderRadius: '0.75rem',
                                  backgroundColor: 'white',
                                  '&:hover': {
                                    border: '2px solid black',
                                  }
                                }
                              }}
                            />
                          ) : (
                            <Box 
                              sx={{
                                p: 2,
                                backgroundColor: 'rgba(255,255,255,0.5)',
                                borderRadius: '0.75rem',
                                border: '2px solid black',
                                boxShadow: '2px 3px 0 black'
                              }}
                            >
                              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>Country</Typography>
                              <Typography variant="body1">{formData.location.country || 'Not specified'}</Typography>
                            </Box>
                          )}
                        </Grid>
                      </Grid>
                    </Box>

                    {editing && (
                      <Box mt={4} display="flex" justifyContent="flex-end">
                        <Button
                          type="submit"
                          variant="contained"
                          sx={{
                            backgroundColor: '#9B5DE5',
                            color: 'white',
                            border: '2px solid black',
                            boxShadow: '4px 6px 0 black',
                            borderRadius: '0.75rem',
                            '&:hover': {
                              backgroundColor: '#9B5DE5',
                              transform: 'translate(2px, 2px)',
                              boxShadow: '2px 4px 0 black',
                            }
                          }}
                        >
                          Save Changes
                        </Button>
                      </Box>
                    )}
                  </Grid>
                </Grid>
              </StyledPaper>
            </form>

            {/* Stats Section */}
            <Grid container spacing={3} sx={{ mt: 2 }}>
              <Grid item xs={12} sm={4}>
                <GreenStatsCard>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        fontFamily: 'Archivo Black',
                        backgroundColor: 'rgba(0,0,0,0.1)',
                        p: 1,
                        borderRadius: '0.5rem',
                        mb: 2,
                        border: '2px solid black'
                      }}
                    >
                      ECO SCORE
                    </Typography>
                    <Typography 
                      variant="h2" 
                      sx={{ 
                        fontFamily: 'Lexend Mega',
                        mb: 1,
                        fontSize: '3.5rem'
                      }}
                    >
                      {formatNumber(profileData?.metrics?.ecoScore || 0)}
                    </Typography>
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        fontWeight: 'bold',
                        backgroundColor: '#ffffff40',
                        p: 0.5,
                        borderRadius: '4px',
                        display: 'inline-block'
                      }}
                    >
                      Out of 100
                    </Typography>
                  </CardContent>
                </GreenStatsCard>
              </Grid>
              <Grid item xs={12} sm={4}>
                <YellowStatsCard>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        fontFamily: 'Archivo Black',
                        backgroundColor: 'rgba(0,0,0,0.1)',
                        p: 1,
                        borderRadius: '0.5rem',
                        mb: 2,
                        border: '2px solid black'
                      }}
                    >
                      TOTAL EMISSION
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      <Typography 
                        variant="h2" 
                        sx={{ 
                          fontFamily: 'Lexend Mega',
                          mb: 1,
                          fontSize: '3.5rem'
                        }}
                      >
                        {formatNumber(profileData?.metrics?.totalEmissions || 0)}
                      </Typography>
                      <Typography 
                        variant="h5" 
                        sx={{ 
                          fontFamily: 'Lexend Mega',
                          color: 'rgba(0,0,0,0.7)'
                        }}
                      >
                        kg CO₂
                      </Typography>
                    </Box>
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        fontWeight: 'bold',
                        backgroundColor: '#ffffff40',
                        p: 0.5,
                        borderRadius: '4px',
                        display: 'inline-block'
                      }}
                    >
                      Across {profileData?.metrics?.tripCount || 0} trips
                    </Typography>
                  </CardContent>
                </YellowStatsCard>
              </Grid>
              <Grid item xs={12} sm={4}>
                <BlueStatsCard>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        fontFamily: 'Archivo Black',
                        backgroundColor: 'rgba(0,0,0,0.1)',
                        p: 1,
                        borderRadius: '0.5rem',
                        mb: 2,
                        border: '2px solid black'
                      }}
                    >
                      AVG EMISSION
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      <Typography 
                        variant="h2" 
                        sx={{ 
                          fontFamily: 'Lexend Mega',
                          mb: 1,
                          fontSize: '3.5rem'
                        }}
                      >
                        {formatNumber(profileData?.metrics?.avgEmission || 0)}
                      </Typography>
                      <Typography 
                        variant="h5" 
                        sx={{ 
                          fontFamily: 'Lexend Mega',
                          color: 'rgba(0,0,0,0.7)'
                        }}
                      >
                        kg CO₂
                      </Typography>
                    </Box>
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        fontWeight: 'bold',
                        backgroundColor: '#ffffff40',
                        p: 0.5,
                        borderRadius: '4px',
                        display: 'inline-block'
                      }}
                    >
                      Per Trip
                    </Typography>
                  </CardContent>
                </BlueStatsCard>
              </Grid>
            </Grid>

            {/* Travel History */}
            <StyledPaper sx={{ mt: 3 }}>
              <Typography 
                variant="h4" 
                sx={{ 
                  fontFamily: 'Archivo Black',
                  mb: 3,
                  backgroundColor: '#00BBF9',
                  p: 1.5,
                  borderRadius: '0.75rem',
                  border: '2px solid black',
                  display: 'inline-block'
                }}
              >
                Travel History
              </Typography>
              <List>
                {profileData?.travelHistory?.map((trip) => (
                  <ListItem 
                    key={trip.id}
                    sx={{
                      mb: 2,
                      backgroundColor: 'rgba(255,255,255,0.5)',
                      borderRadius: '0.75rem',
                      border: '2px solid black',
                      boxShadow: '2px 3px 0 black'
                    }}
                  >
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center">
                          {getTransportIcon(trip.type)}
                          <Typography 
                            variant="h6" 
                            sx={{ 
                              ml: 2,
                              fontFamily: 'Lexend Mega',
                              fontSize: '1.1rem'
                            }}
                          >
                            {trip.type.charAt(0).toUpperCase() + trip.type.slice(1)} Journey - {formatNumber(trip.distance)} {trip.unit}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Box sx={{ mt: 1 }}>
                          <Typography 
                            component="span" 
                            variant="body1"
                            sx={{ 
                              fontFamily: 'Archivo Black',
                              color: 'black',
                              opacity: 0.8
                            }}
                          >
                            {new Date(trip.date).toLocaleDateString()}
                          </Typography>
                          <Chip 
                            label={`${formatNumber(trip.carbonEmission || 0)} kg CO₂`}
                            size="small"
                            sx={{ 
                              ml: 2,
                              backgroundColor: '#F15BB5',
                              color: 'black',
                              fontFamily: 'Lexend Mega',
                              border: '1px solid black',
                              '& .MuiChip-label': {
                                px: 2
                              }
                            }}
                          />
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </StyledPaper>
          </>
        )}
      </Container>
    </Box>
  );
};

export default Profile;
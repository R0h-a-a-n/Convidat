import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [carbonData, setCarbonData] = useState({
    totalEmission: 0,
    averageEmission: 0,
    count: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);

  const calculateEcoScore = (data) => {
    if (!data || !data.totalEmission) return 75;
    const avgEmissionPerTrip = data.totalEmission / (data.count || 1);
    if (avgEmissionPerTrip < 50) return 90;
    if (avgEmissionPerTrip < 100) return 75;
    if (avgEmissionPerTrip < 200) return 60;
    return 45;
  };

  const createAuthenticatedApi = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    return axios.create({
      baseURL: 'http://localhost:3002',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      withCredentials: true
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const api = createAuthenticatedApi();

        const totalResponse = await api.get('/api/carbon/footprint/total');
        if (totalResponse.data) {
          setCarbonData({
            totalEmission: Number(totalResponse.data.totalEmission) || 0,
            averageEmission: Number(totalResponse.data.averageEmission) || 0,
            count: Number(totalResponse.data.count) || 0
          });
        }

        const historyResponse = await api.get('/api/carbon/footprint');
        if (Array.isArray(historyResponse.data)) {
          setRecentActivity(historyResponse.data.slice(0, 5));
        }
      } catch (err) {
        if (err.message === 'No authentication token found' || err.response?.status === 401) {
          setError('Please log in to view your dashboard data.');
          navigate('/login');
        } else {
          setError(err.response?.data?.message || 'Failed to load dashboard data. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    } else {
      setError('Please log in to view your dashboard.');
      navigate('/login');
    }
  }, [user, navigate]);

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

  if (loading) {
    return (
      <Container>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  const ecoScore = calculateEcoScore(carbonData);

  return (
    <Box sx={{ width: '100%', minHeight: '100vh' }}>
      <Container
        maxWidth="lg"
        sx={{
          pt: 10,
          pb: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
        }}
      >
        <Box
          sx={{
            width: '100%',
            backgroundColor: 'rgba(255, 255, 255, 0.5)',
            borderRadius: 3,
            p: 4,
            backdropFilter: 'blur(16px) saturate(180%)',
            WebkitBackdropFilter: 'blur(16px) saturate(180%)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.2)'
          }}
        >
          {/* Welcome Banner */}
          <Paper
            elevation={3}
            sx={{
              p: 4,
              mb: 4,
              borderRadius: 3,
              background: 'linear-gradient(135deg, #4caf50 30%, #81c784 90%)',
              color: 'white',
              boxShadow: 6
            }}
          >
            <Typography variant="h4" fontWeight={600} gutterBottom>
              Welcome back, {user?.name || user?.email?.split('@')[0]}!
            </Typography>
            <Typography variant="subtitle1">
              Monitor your sustainable travel and lower your carbon footprint.
            </Typography>
          </Paper>

          {error && (
            <Alert severity="error" sx={{ mb: 4 }}>
              {error}
            </Alert>
          )}

          {/* Stats Section */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={4}>
              <Card sx={{
                borderRadius: 3,
                backgroundColor: 'rgba(255, 255, 255, 0.4)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                boxShadow: 4
              }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" gutterBottom>
                    Eco Score
                  </Typography>
                  <Box sx={{ position: 'relative', display: 'inline-flex', mt: 1 }}>
                    <CircularProgress
                      variant="determinate"
                      value={ecoScore}
                      size={80}
                      thickness={4}
                      sx={{ color: 'success.main' }}
                    />
                    <Box
                      sx={{
                        top: 0,
                        left: 0,
                        bottom: 0,
                        right: 0,
                        position: 'absolute',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Typography variant="h5" color="success.main">
                        {ecoScore}%
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{
                borderRadius: 3,
                backgroundColor: 'rgba(255, 255, 255, 0.4)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                boxShadow: 4
              }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" gutterBottom>
                    Total Carbon Footprint
                  </Typography>
                  <Typography variant="h3" color="primary.main" gutterBottom>
                    {carbonData.totalEmission.toFixed(1)}
                    <Typography component="span" variant="h6" color="text.secondary">
                      {' '}kg CO₂
                    </Typography>
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Across {carbonData.count} trips
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{
                borderRadius: 3,
                backgroundColor: 'rgba(255, 255, 255, 0.4)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                boxShadow: 4
              }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" gutterBottom>
                    Average Emission
                  </Typography>
                  <Typography variant="h3" color="primary.main" gutterBottom>
                    {carbonData.averageEmission.toFixed(1)}
                    <Typography component="span" variant="h6" color="text.secondary">
                      {' '}kg CO₂
                    </Typography>
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Per trip
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Recent Activity Section */}
          <Paper
            elevation={3}
            sx={{
              p: 3,
              borderRadius: 3,
              backgroundColor: 'rgba(255, 255, 255, 0.4)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              boxShadow: 4
            }}
          >
            <Typography variant="h5" gutterBottom>
              Recent Activity
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {recentActivity.length > 0 ? (
              <List>
                {recentActivity.map((activity, index) => (
                  <ListItem
                    key={index}
                    sx={{
                      mb: 1,
                      borderRadius: 2,
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.3)',
                      },
                    }}
                  >
                    <ListItemText
                      primary={activity.origin && activity.destination 
                        ? `${activity.travelType || 'Journey'} from ${activity.origin} to ${activity.destination}`
                        : `${activity.travelType + ' '+ 'Journey'}`
                      }
                      secondary={`${formatDate(activity.date)} - ${(activity.carbonEmission || 0).toFixed(1)} kg CO₂`}
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body1" color="text.secondary">
                No recent activity to display.
              </Typography>
            )}
          </Paper>
        </Box>
      </Container>
    </Box>
  );
};

export default Dashboard;

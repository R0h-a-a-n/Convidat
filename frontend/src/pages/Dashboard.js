import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  Button,
  LinearProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
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

  const quickActions = [
    { title: 'Find Eco Stays', path: '/eco-stays', color: 'success.main' },
    { title: 'Plan Route', path: '/sustainable-routes', color: 'info.main' },
    { title: 'Track Carbon', path: '/carbon', color: 'warning.main' }
  ];

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
    <Container maxWidth="lg">
      <Box sx={{ mt: 5, mb: 5 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={4}>
          {/* Welcome Banner */}
          <Grid item xs={12}>
            <Paper
              elevation={3}
              sx={{
                p: 4,
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
          </Grid>

          {/* Statistics Cards */}
          {[{
            title: 'Total Carbon Footprint',
            value: carbonData.totalEmission.toFixed(1),
            unit: 'kg CO2',
            progress: Math.min((carbonData.totalEmission) / 1000 * 100, 100),
            color: 'primary'
          }, {
            title: 'Average per Trip',
            value: carbonData.averageEmission.toFixed(1),
            unit: 'kg CO2',
            progress: null,
            color: 'secondary'
          }, {
            title: 'Eco Score',
            value: `${ecoScore}%`,
            progress: ecoScore,
            circular: true,
            color: 'success'
          }].map((stat, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card elevation={4} sx={{ borderRadius: 3 }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" gutterBottom>
                    {stat.title}
                  </Typography>
                  {stat.circular ? (
                    <Box sx={{ position: 'relative', display: 'inline-flex', mt: 1 }}>
                      <CircularProgress
                        variant="determinate"
                        value={stat.progress}
                        size={80}
                        thickness={4}
                        sx={{ color: `${stat.color}.main` }}
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
                        <Typography variant="h5" color={`${stat.color}.main`}>
                          {stat.value}
                        </Typography>
                      </Box>
                    </Box>
                  ) : (
                    <>
                      <Typography variant="h3" color={`${stat.color}.main`} gutterBottom>
                        {stat.value}
                        <Typography component="span" variant="h6" color="text.secondary"> {stat.unit}</Typography>
                      </Typography>
                      {stat.progress !== null && (
                        <LinearProgress
                          variant="determinate"
                          value={stat.progress}
                          sx={{ height: 8, borderRadius: 2, mt: 2, mb: 1 }}
                        />
                      )}
                      <Typography variant="body2" color="text.secondary">
                        {stat.title.includes('Total') ? `Based on ${carbonData.count} journeys` : 'Tracking your carbon impact'}
                      </Typography>
                    </>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}

          {/* Quick Actions */}
          <Grid item xs={12} md={6}>
            <Card elevation={4} sx={{ borderRadius: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Quick Actions
                </Typography>
                <Grid container spacing={2}>
                  {quickActions.map((action, i) => (
                    <Grid item xs={12} sm={4} key={i}>
                      <Button
                        variant="contained"
                        onClick={() => navigate(action.path)}
                        fullWidth
                        sx={{
                          backgroundColor: action.color,
                          color: 'white',
                          fontWeight: 600,
                          textTransform: 'none',
                          '&:hover': {
                            backgroundColor: action.color,
                            opacity: 0.9
                          }
                        }}
                      >
                        {action.title}
                      </Button>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Recent Activity */}
          <Grid item xs={12} md={6}>
            <Card elevation={4} sx={{ borderRadius: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Recent Activity
                </Typography>
                <List disablePadding>
                  {recentActivity.length > 0 ? (
                    recentActivity.map((activity, idx) => (
                      <React.Fragment key={activity._id}>
                        <ListItem sx={{ py: 1.5 }}>
                          <ListItemText
                            primary={`${activity.travelType.charAt(0).toUpperCase() + activity.travelType.slice(1)} Journey`}
                            secondary={`${activity.distance} ${activity.unit} • ${activity.carbonEmission.toFixed(1)} kg CO2 • ${formatDate(activity.date)}`}
                          />
                        </ListItem>
                        {idx < recentActivity.length - 1 && <Divider variant="middle" />}
                      </React.Fragment>
                    ))
                  ) : (
                    <ListItem>
                      <ListItemText
                        primary="No recent activity"
                        secondary="Start tracking your travel to see your impact"
                      />
                    </ListItem>
                  )}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default Dashboard;

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
  ListItemIcon,
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

  // Calculate eco score based on carbon data
  const calculateEcoScore = (data) => {
    if (!data || !data.totalEmission) return 75; // Default score
    
    // Basic calculation - can be made more sophisticated
    const avgEmissionPerTrip = data.totalEmission / (data.count || 1);
    if (avgEmissionPerTrip < 50) return 90;
    if (avgEmissionPerTrip < 100) return 75;
    if (avgEmissionPerTrip < 200) return 60;
    return 45;
  };

  // Create API instance with authentication
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

  // Fetch carbon data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const api = createAuthenticatedApi();

        // Fetch total carbon footprint
        const totalResponse = await api.get('/api/carbon/footprint/total');
        console.log('Total footprint response:', totalResponse.data);
        
        if (totalResponse.data) {
          setCarbonData({
            totalEmission: Number(totalResponse.data.totalEmission) || 0,
            averageEmission: Number(totalResponse.data.averageEmission) || 0,
            count: Number(totalResponse.data.count) || 0
          });
        }

        // Fetch recent activities
        const historyResponse = await api.get('/api/carbon/footprint');
        console.log('History response:', historyResponse.data);
        
        if (Array.isArray(historyResponse.data)) {
          setRecentActivity(historyResponse.data.slice(0, 5));
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const quickActions = [
    {
      title: 'Find Eco Stays',
      path: '/eco-stays',
      color: 'success.main'
    },
    {
      title: 'Plan Route',
      path: '/sustainable-routes',
      color: 'info.main'
    },
    {
      title: 'Track Carbon',
      path: '/carbon',
      color: 'warning.main'
    }
  ];

  if (loading) {
    return (
      <Container>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  const ecoScore = calculateEcoScore(carbonData);

  return (
    <Container>
      <Box sx={{ mt: 4, mb: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Grid container spacing={3}>
          {/* Welcome Section */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3, bgcolor: 'primary.main', color: 'white' }}>
              <Typography variant="h4" gutterBottom>
                Welcome back, {user?.name || user?.email?.split('@')[0]}!
              </Typography>
              <Typography variant="subtitle1">
                Track your sustainable travel journey and reduce your carbon footprint.
              </Typography>
            </Paper>
          </Grid>

          {/* Stats Section */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Total Carbon Footprint
                </Typography>
                <Typography variant="h3" color="primary" gutterBottom>
                  {carbonData.totalEmission.toFixed(1)}
                  <Typography component="span" variant="h6" color="text.secondary"> kg CO2</Typography>
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={Math.min((carbonData.totalEmission) / 1000 * 100, 100)} 
                  sx={{ mb: 1 }}
                />
                <Typography variant="body2" color="text.secondary">
                  Based on {carbonData.count} tracked journeys
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Average per Trip
                </Typography>
                <Typography variant="h3" color="secondary" gutterBottom>
                  {carbonData.averageEmission.toFixed(1)}
                  <Typography component="span" variant="h6" color="text.secondary"> kg CO2</Typography>
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <Typography variant="body2" color="success.main">
                    Tracking your carbon impact
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Eco Score
                </Typography>
                <Box sx={{ position: 'relative', display: 'inline-flex' }}>
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
                    <Typography variant="h5" component="div" color="success.main">
                      {ecoScore}%
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  {ecoScore > 70 ? 'Great' : ecoScore > 50 ? 'Good' : 'Room for improvement in'} sustainable travel!
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Quick Actions */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Quick Actions
                </Typography>
                <Grid container spacing={2}>
                  {quickActions.map((action, index) => (
                    <Grid item xs={12} sm={4} key={index}>
                      <Button
                        variant="outlined"
                        onClick={() => navigate(action.path)}
                        fullWidth
                        sx={{ 
                          borderColor: action.color,
                          color: action.color,
                          '&:hover': {
                            borderColor: action.color,
                            bgcolor: `${action.color}10`
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
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Recent Activity
                </Typography>
                <List>
                  {recentActivity.length > 0 ? (
                    recentActivity.map((activity, index) => (
                      <React.Fragment key={activity._id}>
                        <ListItem>
                          <ListItemText
                            primary={`${activity.travelType.charAt(0).toUpperCase() + activity.travelType.slice(1)} Journey`}
                            secondary={`${activity.distance} ${activity.unit} • ${activity.carbonEmission.toFixed(1)} kg CO2 • ${formatDate(activity.date)}`}
                          />
                        </ListItem>
                        {index < recentActivity.length - 1 && <Divider />}
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
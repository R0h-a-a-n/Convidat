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
  Alert,
  IconButton,
  Tooltip,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { 
  TrendingUp, 
  DirectionsCar, 
  EmojiTransportation, 
  Info, 
  Refresh,
  ArrowUpward,
  ArrowDownward,
  NoteAdd
} from '@mui/icons-material';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [carbonData, setCarbonData] = useState({
    totalEmission: 0,
    averageEmission: 0,
    count: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const calculateEcoScore = (data) => {
    if (!data || !data.totalEmission) return 75;
    const avgEmissionPerTrip = data.totalEmission / (data.count || 1);
    if (avgEmissionPerTrip < 50) return 90;
    if (avgEmissionPerTrip < 100) return 75;
    if (avgEmissionPerTrip < 200) return 60;
    return 45;
  };

  const getEcoScoreColor = (score) => {
    if (score >= 80) return theme.palette.success.main;
    if (score >= 60) return theme.palette.warning.light;
    return theme.palette.error.main;
  };

  const getEmissionTrend = () => {
    // Mock trend calculation - in a real app, this would compare to previous periods
    if (recentActivity.length < 2) return null;
    
    const latest = recentActivity[0]?.carbonEmission || 0;
    const previous = recentActivity[1]?.carbonEmission || 0;
    
    if (latest < previous) {
      return { direction: 'down', percentage: Math.round((previous - latest) / previous * 100) };
    } else if (latest > previous) {
      return { direction: 'up', percentage: Math.round((latest - previous) / previous * 100) };
    }
    return null;
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

  const fetchData = async () => {
    setRefreshing(true);
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
      setRefreshing(false);
    }
  };

  useEffect(() => {
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

  const getTravelIcon = (travelType) => {
    switch ((travelType || '').toLowerCase()) {
      case 'car':
        return <DirectionsCar />;
      default:
        return <EmojiTransportation />;
    }
  };

  const handleRefresh = () => {
    fetchData();
  };

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
  const ecoScoreColor = getEcoScoreColor(ecoScore);
  const emissionTrend = getEmissionTrend();

  return (
    <Box 
      sx={{ 
        width: '100%', 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8eb 100%)'
      }}
    >
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
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            borderRadius: 3,
            p: { xs: 2, md: 4 },
            backdropFilter: 'blur(16px) saturate(180%)',
            WebkitBackdropFilter: 'blur(16px) saturate(180%)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)'
          }}
        >
          {/* Header Section with Refresh Button */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h4" fontWeight={700} color="primary">
              Dashboard
            </Typography>
            <Tooltip title="Refresh data">
              <IconButton onClick={handleRefresh} disabled={refreshing}>
                {refreshing ? <CircularProgress size={24} /> : <Refresh />}
              </IconButton>
            </Tooltip>
          </Box>

          {/* Welcome Banner */}
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, md: 4 },
              mb: 4,
              borderRadius: 3,
              background: 'linear-gradient(135deg, #43a047 30%, #2e7d32 90%)',
              color: 'white',
              boxShadow: '0 8px 20px rgba(0, 0, 0, 0.1)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <Box sx={{ position: 'absolute', right: -30, top: -30, opacity: 0.15, fontSize: 180 }}>
              <EmojiTransportation fontSize="inherit" />
            </Box>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              Welcome back, {user?.name || user?.email?.split('@')[0]}!
            </Typography>
            <Typography variant="subtitle1">
              Monitor your sustainable travel and reduce your carbon footprint.
            </Typography>
          </Paper>

          {error && (
            <Alert 
              severity="error" 
              sx={{ mb: 4, borderRadius: 2 }}
              action={
                <IconButton
                  color="inherit"
                  size="small"
                  onClick={() => setError(null)}
                >
                  <Refresh fontSize="small" />
                </IconButton>
              }
            >
              {error}
            </Alert>
          )}

          {/* Stats Section */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={4}>
              <Card sx={{
                height: '100%',
                borderRadius: 3,
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                border: '1px solid rgba(0, 0, 0, 0.05)',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
                transition: 'transform 0.3s, box-shadow 0.3s',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 6px 25px rgba(0, 0, 0, 0.1)',
                }
              }}>
                <CardContent sx={{ textAlign: 'center', p: 3, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                    <Typography variant="h6" fontWeight={600}>
                      Eco Score
                    </Typography>
                    <Tooltip title="Based on your average emissions per trip">
                      <IconButton size="small">
                        <Info fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  <Box sx={{ position: 'relative', display: 'inline-flex', my: 2 }}>
                    <CircularProgress
                      variant="determinate"
                      value={100}
                      size={120}
                      thickness={4}
                      sx={{ color: theme.palette.grey[200] }}
                    />
                    <CircularProgress
                      variant="determinate"
                      value={ecoScore}
                      size={120}
                      thickness={4}
                      sx={{ 
                        color: ecoScoreColor,
                        position: 'absolute',
                        left: 0,
                      }}
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
                        flexDirection: 'column'
                      }}
                    >
                      <Typography variant="h3" fontWeight={700} color={ecoScoreColor}>
                        {ecoScore}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        out of 100
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {ecoScore >= 80 ? 'Excellent' : ecoScore >= 60 ? 'Good' : 'Needs improvement'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{
                height: '100%',
                borderRadius: 3,
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                border: '1px solid rgba(0, 0, 0, 0.05)',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
                transition: 'transform 0.3s, box-shadow 0.3s',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 6px 25px rgba(0, 0, 0, 0.1)',
                }
              }}>
                <CardContent sx={{ height: '100%', p: 3, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <TrendingUp color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6" fontWeight={600}>
                      Total Carbon Footprint
                    </Typography>
                  </Box>
                  <Typography variant="h3" fontWeight={700} color="primary.main" gutterBottom>
                    {carbonData.totalEmission.toFixed(1)}
                    <Typography component="span" variant="h6" color="text.secondary" fontWeight={400}>
                      {' '}kg CO₂
                    </Typography>
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <Typography variant="body1" color="text.secondary">
                      Across {carbonData.count} trips
                    </Typography>
                    {emissionTrend && (
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        ml: 2,
                        color: emissionTrend.direction === 'down' ? 'success.main' : 'error.main' 
                      }}>
                        {emissionTrend.direction === 'down' ? <ArrowDownward fontSize="small" /> : <ArrowUpward fontSize="small" />}
                        <Typography variant="body2" fontWeight={500}>
                          {emissionTrend.percentage}%
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{
                height: '100%',
                borderRadius: 3,
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                border: '1px solid rgba(0, 0, 0, 0.05)',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
                transition: 'transform 0.3s, box-shadow 0.3s',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 6px 25px rgba(0, 0, 0, 0.1)',
                }
              }}>
                <CardContent sx={{ height: '100%', p: 3, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <DirectionsCar color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6" fontWeight={600}>
                      Average Emission
                    </Typography>
                  </Box>
                  <Typography variant="h3" fontWeight={700} color="primary.main" gutterBottom>
                    {carbonData.averageEmission.toFixed(1)}
                    <Typography component="span" variant="h6" color="text.secondary" fontWeight={400}>
                      {' '}kg CO₂
                    </Typography>
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                    Per trip
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Recent Activity Section */}
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2, md: 3 },
              borderRadius: 3,
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              border: '1px solid rgba(0, 0, 0, 0.05)',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)'
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h5" fontWeight={600}>
                Recent Activity
              </Typography>
              <Tooltip title="Add new trip">
                <IconButton color="primary">
                  <NoteAdd />
                </IconButton>
              </Tooltip>
            </Box>
            <Divider sx={{ mb: 2 }} />
            {recentActivity.length > 0 ? (
              <List>
                {recentActivity.map((activity, index) => (
                  <ListItem
                    key={index}
                    sx={{
                      mb: 1.5,
                      borderRadius: 2,
                      backgroundColor: index % 2 === 0 ? 'rgba(0, 0, 0, 0.02)' : 'transparent',
                      '&:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.05)',
                      },
                      border: '1px solid rgba(0, 0, 0, 0.03)',
                      display: 'flex',
                      alignItems: 'center',
                      p: 2
                    }}
                  >
                    <Box sx={{ mr: 2, color: 'primary.main' }}>
                      {getTravelIcon(activity.travelType)}
                    </Box>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle1" fontWeight={500}>
                          {activity.origin && activity.destination 
                            ? `${activity.travelType || 'Journey'} from ${activity.origin} to ${activity.destination}`
                            : `${activity.travelType ? activity.travelType + ' Journey' : 'Journey'}`
                          }
                        </Typography>
                      }
                      secondary={`${formatDate(activity.date)}`}
                    />
                    <Box 
                      sx={{ 
                        ml: 'auto', 
                        textAlign: 'right',
                        p: 1,
                        borderRadius: 1,
                        bgcolor: 'primary.light',
                        color: 'primary.contrastText',
                        fontWeight: 500
                      }}
                    >
                      <Typography variant="body2" fontWeight={600}>
                        {(activity.carbonEmission || 0).toFixed(1)} kg CO₂
                      </Typography>
                    </Box>
                  </ListItem>
                ))}
              </List>
            ) : (
              <Box sx={{ py: 4, textAlign: 'center' }}>
                <Typography variant="body1" color="text.secondary">
                  No recent activity to display.
                </Typography>
              </Box>
            )}
          </Paper>
        </Box>
      </Container>
    </Box>
  );
};

export default Dashboard;
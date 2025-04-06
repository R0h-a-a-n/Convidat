import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Alert,
  IconButton,
  Tooltip,
  Divider
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [carbonData, setCarbonData] = useState({ totalEmission: 0, averageEmission: 0, count: 0 });
  const [recentActivity, setRecentActivity] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const pastelColors = ['#BAFCA2', '#FFDB58', '#FFA07A', '#FFC0CB', '#C4A1FF'];

  const fetchData = async () => {
    setRefreshing(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');
      const api = axios.create({
        baseURL: 'http://localhost:3002',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        withCredentials: true
      });
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
        setError(err.response?.data?.message || 'Failed to load dashboard data.');
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

  const getTravelIcon = (type) => (type?.toLowerCase() === 'car' ? <DirectionsCar /> : <EmojiTransportation />);
  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const calculateEcoScore = (data) => {
    const avg = data.totalEmission / (data.count || 1);
    if (avg < 50) return 90;
    if (avg < 100) return 75;
    if (avg < 200) return 60;
    return 45;
  };
  const ecoScore = calculateEcoScore(carbonData);
  const getEmissionTrend = () => {
    if (recentActivity.length < 2) return null;
    const latest = recentActivity[0]?.carbonEmission || 0;
    const previous = recentActivity[1]?.carbonEmission || 0;
    if (latest < previous) return { direction: 'down', percentage: Math.round((previous - latest) / previous * 100) };
    if (latest > previous) return { direction: 'up', percentage: Math.round((latest - previous) / previous * 100) };
    return null;
  };
  const emissionTrend = getEmissionTrend();

  if (loading) return (
    <Container>
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress size={60} />
      </Box>
    </Container>
  );

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#B4F8C8',
        backgroundImage: 'radial-gradient(rgba(0,0,0,0.1) 1px, transparent 1px)',
        backgroundSize: '25px 25px',
        backgroundRepeat: 'repeat',
        backgroundAttachment: 'scroll',
        px: 2,
        py: 4
      }}
    >
      <Container maxWidth="lg">
        <Typography
          variant="h3"
          sx={{
            fontFamily: 'Lexend Mega, sans-serif',
            mb: 4,
            fontWeight: 'bold',
            textTransform: 'uppercase',
            border: '2px solid black',
            p: 2,
            boxShadow: '4px 6px 0px black',
            backgroundColor: '#F15BB5',
            color: 'black',
            borderRadius: '1rem'
          }}
        >
          Dashboard
          <Tooltip title="Refresh Data">
            <IconButton onClick={fetchData} disabled={refreshing} sx={{ ml: 2 }}>
              {refreshing ? <CircularProgress size={24} /> : <Refresh />}
            </IconButton>
          </Tooltip>
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 4 }}>{error}</Alert>}

        <Grid container spacing={3}>
          {[{ label: 'Eco Score', value: ecoScore, note: 'Out of 100' },
            { label: 'Total Emission', value: `${carbonData.totalEmission.toFixed(1)} kg`, note: `Across ${carbonData.count} trips` },
            { label: 'Avg Emission', value: `${carbonData.averageEmission.toFixed(1)} kg`, note: 'Per Trip' }].map((item, idx) => (
              <Grid item xs={12} md={4} key={idx}>
                <Card sx={{ border: '2px solid black', boxShadow: '4px 6px 0 black', backgroundColor: pastelColors[idx % pastelColors.length], borderRadius: '1rem' }}>
                  <CardContent>
                    <Typography variant="h5" sx={{ fontFamily: 'Lexend Mega', textTransform: 'uppercase', fontWeight: 'bold' }}>{item.label}</Typography>
                    <Typography variant="h3" sx={{ fontWeight: 'bold' }}>{item.value}</Typography>
                    <Typography variant="body2">{item.note}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
        </Grid>

        <Box sx={{ mt: 6 }}>
          <Typography variant="h4" sx={{ fontFamily: 'Lexend Mega', textTransform: 'uppercase', mb: 2, border: '2px solid black', p: 2, boxShadow: '4px 6px 0 black', backgroundColor: '#FEE440', borderRadius: '1rem' }}>
            Recent Activity
          </Typography>
          <Divider sx={{ mb: 2 }} />
          {recentActivity.length ? (
            <List>
              {recentActivity.map((a, i) => (
                <ListItem key={i} sx={{ border: '2px solid black', boxShadow: '4px 6px 0 black', backgroundColor: pastelColors[i % pastelColors.length], mb: 2, borderRadius: '1rem' }}>
                  <Box sx={{ mr: 2 }}>{getTravelIcon(a.travelType)}</Box>
                  <ListItemText
                    primary={<Typography variant="h6">{`${a.travelType.charAt(0).toUpperCase() + a.travelType.slice(1).toLowerCase()} Journey`}</Typography>}
                    secondary={formatDate(a.date)}
                  />
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{(a.carbonEmission || 0).toFixed(1)} kg CO₂</Typography>
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography>No recent activity to show.</Typography>
          )}
        </Box>
      </Container>
    </Box>
  );
};

export default Dashboard;
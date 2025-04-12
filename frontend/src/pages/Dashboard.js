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
  Divider,
  Paper
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
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, PieChart, Pie, Cell } from 'recharts';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [carbonData, setCarbonData] = useState({ totalEmission: 0, averageEmission: 0, count: 0 });
  const [recentActivity, setRecentActivity] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [emissionsByType, setEmissionsByType] = useState([]);
  const [monthlyEmissions, setMonthlyEmissions] = useState([]);
  const [upcomingTrips, setUpcomingTrips] = useState([]);

  const pastelColors = ['#98FB98', '#FFD700', '#87CEEB', '#FFA07A', '#DDA0DD'];
  const RADIAN = Math.PI / 180;

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

      // Fetch all data
      const [historyResponse, tripsResponse] = await Promise.all([
        api.get('/api/carbon/footprint'),
        axios.get('http://localhost:3010/api/trips', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      if (Array.isArray(historyResponse.data)) {
        const footprintData = historyResponse.data;
        setRecentActivity(footprintData.slice(0, 5));
        
        // Calculate total emissions
        const total = footprintData.reduce((sum, item) => sum + item.carbonEmission, 0);
        const count = footprintData.length;
        setCarbonData({
          totalEmission: total,
          averageEmission: count > 0 ? total / count : 0,
          count
        });

        // Process daily emissions for the line chart
        const byDay = footprintData.reduce((acc, item) => {
          const date = new Date(item.date);
          const day = date.toISOString().split('T')[0];
          acc[day] = (acc[day] || 0) + item.carbonEmission;
          return acc;
        }, {});

        // Convert to array and sort by date
        const dailyEmissions = Object.entries(byDay)
          .map(([date, emission]) => ({
            date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            emission: Number(emission.toFixed(2))
          }))
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .reverse();

        setMonthlyEmissions(dailyEmissions);

        // Process emissions by type with better formatting
        const byType = footprintData.reduce((acc, item) => {
          const type = item.travelType.toLowerCase();
          if (item.carbonEmission > 0) {
            acc[type] = (acc[type] || 0) + item.carbonEmission;
          }
          return acc;
        }, {});
        
        // Sort by emission value and format for pie chart
        const sortedEmissions = Object.entries(byType)
          .sort(([, a], [, b]) => b - a)
          .map(([name, value]) => ({
            name: name.charAt(0).toUpperCase() + name.slice(1),
            value: Number(value.toFixed(2))
          }));
        setEmissionsByType(sortedEmissions);
      }

      if (Array.isArray(tripsResponse.data.data)) {
        const upcoming = tripsResponse.data.data
          .filter(trip => new Date(trip.startDate) > new Date())
          .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
          .slice(0, 3);
        setUpcomingTrips(upcoming);
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
    const avgEmission = data.totalEmission / (data.count || 1);
    // Using the same formula as the profile service:
    // 100 - (avgEmission * 5), capped between 0 and 100
    return Math.max(0, Math.min(100, (100 - (avgEmission * 5)).toFixed(2)));
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
    <Container 
      maxWidth="lg" 
      sx={{
        minHeight: '100vh',
        backgroundColor: '#c0f4e4',
        backgroundImage: 'radial-gradient(#aaa 1px, transparent 1px)',
        backgroundSize: '25px 25px',
        px: 2,
        py: 4
      }}
    >
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
        {[{ label: 'Eco Score', value: ecoScore.toFixed(2), note: 'Out of 100' },
          { label: 'Total Emission', value: `${carbonData.totalEmission.toFixed(2)} kg`, note: `Across ${carbonData.count} trips` },
          { label: 'Avg Emission', value: `${carbonData.averageEmission.toFixed(2)} kg`, note: 'Per Trip' }].map((item, idx) => (
            <Grid item xs={12} md={4} key={idx}>
              <Card sx={{ 
                border: '2px solid black', 
                boxShadow: '4px 6px 0 black', 
                backgroundColor: pastelColors[idx % pastelColors.length], 
                borderRadius: '1rem',
                '& .MuiTypography-root': {
                  fontWeight: 'bold'
                }
              }}>
                <CardContent>
                  <Typography variant="h5" sx={{ fontFamily: 'Lexend Mega', textTransform: 'uppercase', fontWeight: 'bold' }}>{item.label}</Typography>
                  <Typography variant="h3" sx={{ fontWeight: 'bold' }}>{item.value}</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>{item.note}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
      </Grid>

      {/* Emissions Over Time Chart */}
      <Grid container spacing={3} sx={{ mt: 3 }}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, border: '2px solid black', boxShadow: '4px 6px 0 black', borderRadius: '1rem', backgroundColor: '#F0F7FF' }}>
            <Typography variant="h6" sx={{ mb: 2, fontFamily: 'Lexend Mega', fontWeight: 'bold' }}>Daily Emissions</Typography>
            <LineChart width={700} height={300} data={monthlyEmissions} margin={{ top: 5, right: 30, left: 50, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tick={{ fill: '#000000', fontWeight: 'bold' }}
              />
              <YAxis 
                tick={{ fill: '#000000', fontWeight: 'bold' }}
                label={{ 
                  value: 'CO₂ Emissions (kg)', 
                  angle: -90, 
                  position: 'insideLeft', 
                  offset: -35,
                  style: { 
                    textAnchor: 'middle',
                    fontWeight: 'bold',
                    fill: '#000000'
                  }
                }}
              />
              <RechartsTooltip 
                formatter={(value) => [`${value} kg CO₂`, 'Emissions']}
                labelFormatter={(label) => `Date: ${label}`}
                contentStyle={{ fontWeight: 'bold' }}
              />
              <Legend wrapperStyle={{ fontWeight: 'bold' }}/>
              <Line 
                type="monotone" 
                dataKey="emission" 
                stroke="#2196F3" 
                name="CO₂ Emissions (kg)"
                strokeWidth={3}
                dot={{ r: 4, fill: '#2196F3' }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, border: '2px solid black', boxShadow: '4px 6px 0 black', borderRadius: '1rem', backgroundColor: '#FFF5E6' }}>
            <Typography variant="h6" sx={{ mb: 2, fontFamily: 'Lexend Mega', fontWeight: 'bold' }}>Emissions by Transport</Typography>
            <PieChart width={300} height={300}>
              <Pie
                data={emissionsByType}
                cx={150}
                cy={150}
                labelLine={false}
                label={({ name, cx, cy, midAngle, outerRadius }) => {
                  const RADIAN = Math.PI / 180;
                  const radius = outerRadius + 10; // Slightly outside the pie
                  const x = cx + radius * Math.cos(-midAngle * RADIAN);
                  const y = cy + radius * Math.sin(-midAngle * RADIAN);
                  const textAnchor = x > cx ? 'start' : 'end';
                
                  return (
                    <text
                      x={x}
                      y={y}
                      textAnchor={textAnchor}
                      fill="#000"
                      fontWeight="bold"
                      fontSize={12}
                    >
                      {name}
                    </text>
                  );
                }}
                
                
                outerRadius={90}
                innerRadius={60}
                paddingAngle={5}
                dataKey="value"
              >
                {emissionsByType.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={pastelColors[index % pastelColors.length]}
                    stroke="#000000"
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <RechartsTooltip 
                formatter={(value) => `${Number(value).toFixed(2)} kg CO₂`}
                contentStyle={{ fontWeight: 'bold' }}
              />
            </PieChart>
          </Paper>
        </Grid>
      </Grid>

      {/* Upcoming Trips */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" sx={{ fontFamily: 'Lexend Mega', textTransform: 'uppercase', mb: 2, border: '2px solid black', p: 2, boxShadow: '4px 6px 0 black', backgroundColor: '#FEE440', borderRadius: '1rem' }}>
          Upcoming Trips
        </Typography>
        <Grid container spacing={2}>
          {upcomingTrips.map((trip, index) => (
            <Grid item xs={12} md={4} key={trip._id}>
              <Card sx={{ border: '2px solid black', boxShadow: '4px 6px 0 black', backgroundColor: pastelColors[index % pastelColors.length], borderRadius: '1rem' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{trip.title}</Typography>
                  <Typography variant="body2">
                    {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {trip.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
          {upcomingTrips.length === 0 && (
            <Grid item xs={12}>
              <Typography variant="body1" sx={{ textAlign: 'center' }}>No upcoming trips scheduled.</Typography>
            </Grid>
          )}
        </Grid>
      </Box>

      {/* Recent Activity */}
      <Box sx={{ mt: 4 }}>
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
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{(a.carbonEmission || 0).toFixed(2)} kg CO₂</Typography>
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography>No recent activity to show.</Typography>
        )}
      </Box>
    </Container>
  );
};

export default Dashboard;
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Box
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const features = [
    {
      title: 'Carbon Footprint Tracking',
      description: 'Monitor and reduce your travel-related carbon emissions with our advanced tracking system.'
    },
    {
      title: 'Sustainable Travel Options',
      description: 'Discover eco-friendly travel options and make informed decisions about your journeys.'
    },
    {
      title: 'Rewards Program',
      description: 'Earn points for sustainable travel choices and redeem them for exciting rewards.'
    }
  ];

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 8, mb: 8 }}>
        <Typography
          variant="h2"
          component="h1"
          gutterBottom
          align="center"
          sx={{ mb: 4 }}
        >
          Welcome to Convidat
        </Typography>
        <Typography
          variant="h5"
          component="h2"
          gutterBottom
          align="center"
          color="text.secondary"
          sx={{ mb: 6 }}
        >
          Your Sustainable Travel Companion
        </Typography>

        {!user && (
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={() => navigate('/register')}
              sx={{ mr: 2 }}
            >
              Get Started
            </Button>
            <Button
              variant="outlined"
              color="primary"
              size="large"
              onClick={() => navigate('/login')}
            >
              Login
            </Button>
          </Box>
        )}

        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h5" component="h3" gutterBottom>
                    {feature.title}
                  </Typography>
                  <Typography color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
};

export default Home; 
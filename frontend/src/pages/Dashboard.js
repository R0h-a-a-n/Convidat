import React from 'react';
import { Box, Container, Typography, Grid, Paper, Card, CardContent } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();

  const stats = [
    {
      title: 'Carbon Points',
      value: user?.carbonPoints || 0,
      description: 'Points earned from sustainable travel choices'
    },
    {
      title: 'Total Trips',
      value: '0',
      description: 'Number of trips tracked'
    },
    {
      title: 'Carbon Saved',
      value: '0 kg',
      description: 'Total carbon emissions saved'
    }
  ];

  return (
    <Container>
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Dashboard
        </Typography>

        {/* Stats Section */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          {stats.map((stat, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card>
                <CardContent>
                  <Typography variant="h6" component="h2" gutterBottom>
                    {stat.title}
                  </Typography>
                  <Typography variant="h4" color="primary" gutterBottom>
                    {stat.value}
                  </Typography>
                  <Typography color="text.secondary">
                    {stat.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Welcome and Quick Links */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Welcome, {user?.email}!
              </Typography>
              <Typography variant="body1">
                This is your personal dashboard where you can manage your sustainable travel journey.
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Quick Links
              </Typography>
              <Typography variant="body1" paragraph>
                • Track your carbon footprint in the Carbon Footprint section
              </Typography>
              <Typography variant="body1" paragraph>
                • Plan sustainable travel routes
              </Typography>
              <Typography variant="body1">
                • View your environmental impact statistics
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default Dashboard; 
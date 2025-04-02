import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Slider,
  Grid,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Alert,
  Paper
} from '@mui/material';
import axios from 'axios';

const TravelRecommendations = () => {
  const [preferences, setPreferences] = useState({
    budget: 5,
    eco_friendly: 5,
    popularity: 5,
    cultural: 5
  });

  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSliderChange = (name) => (event, newValue) => {
    setPreferences(prev => ({
      ...prev,
      [name]: newValue
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.post('http://localhost:3003/api/recommendations', preferences);
      setRecommendations(response.data.recommendations);
    } catch (err) {
      console.error('Error fetching recommendations:', err);
      setError('Failed to get recommendations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const sliderLabels = {
    budget: ['Low Budget', 'High Budget'],
    eco_friendly: ['Less Eco-Friendly', 'More Eco-Friendly'],
    popularity: ['Off the Beaten Path', 'Popular Destination'],
    cultural: ['Modern', 'Cultural']
  };

  return (
    <Container>
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Travel Recommendations
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          Tell us your preferences and we'll recommend the perfect destinations for you
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Your Preferences
          </Typography>
          <Grid container spacing={4}>
            {Object.entries(sliderLabels).map(([key, [min, max]]) => (
              <Grid item xs={12} key={key}>
                <Typography gutterBottom>
                  {key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </Typography>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs>
                    <Slider
                      value={preferences[key]}
                      onChange={handleSliderChange(key)}
                      min={1}
                      max={10}
                      step={1}
                      marks
                      valueLabelDisplay="auto"
                    />
                  </Grid>
                  <Grid item xs={2}>
                    <Typography variant="body2" color="text.secondary">
                      {preferences[key]}/10
                    </Typography>
                  </Grid>
                </Grid>
                <Grid container justifyContent="space-between">
                  <Typography variant="caption" color="text.secondary">
                    {min}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {max}
                  </Typography>
                </Grid>
              </Grid>
            ))}
          </Grid>

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              disabled={loading}
              size="large"
            >
              {loading ? <CircularProgress size={24} /> : 'Get Recommendations'}
            </Button>
          </Box>
        </Paper>

        {recommendations.length > 0 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Recommended Destinations
            </Typography>
            <Grid container spacing={3}>
              {recommendations.map((rec, index) => (
                <Grid item xs={12} md={4} key={index}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {rec.destination}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Match Score: {(rec.similarity_score * 100).toFixed(1)}%
                      </Typography>
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="body2">
                          Eco-Friendly Score: {((rec.eco_friendly_score + 3) * 10).toFixed(1)}%
                        </Typography>
                        <Typography variant="body2">
                          Cultural Score: {((rec.cultural_score + 3) * 10).toFixed(1)}%
                        </Typography>
                        <Typography variant="body2">
                          Popularity: {((rec.popularity_score + 3) * 10).toFixed(1)}%
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default TravelRecommendations; 
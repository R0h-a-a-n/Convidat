// Top imports stay unchanged
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
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import axios from 'axios';

const TravelRecommendations = () => {
  const [preferences, setPreferences] = useState({
    season: 'Spring',
    climate: 'Temperate',
    budget: 'medium',
    popularity_weight: 0.85,
    eco_weight: 0.15
  });

  const [recommendations, setRecommendations] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitCount, setSubmitCount] = useState(0);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPreferences(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSliderChange = (name) => (event, newValue) => {
    const otherWeightName = name === 'popularity_weight' ? 'eco_weight' : 'popularity_weight';
    const otherWeight = 1 - newValue;
    setPreferences(prev => ({
      ...prev,
      [name]: newValue,
      [otherWeightName]: otherWeight
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    setMessage('');
    setRecommendations([]);

    try {
      const payload = {
        season: preferences.season,
        climate: preferences.climate,
        budget: preferences.budget,
        popularity_weight: preferences.popularity_weight,
        eco_weight: preferences.eco_weight
      };

      const response = await axios.post('http://localhost:3003/api/recommendations', payload, {
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });

      if (response.data && Array.isArray(response.data.recommendations)) {
        const processed = response.data.recommendations.map(rec => ({
          ...rec,
          similarity_score: rec.similarity_score ?? 0,
          combined_score: typeof rec.combined_score === 'number' && !isNaN(rec.combined_score)
            ? rec.combined_score
            : null
        }));

        setRecommendations(processed);
        setMessage(response.data.message || '');
        setSubmitCount(prev => prev + 1);
      } else {
        setError('Server response is missing recommendations data');
      }

    } catch (err) {
      console.error('Request Error:', err);
      if (err.response) {
        setError(err.response?.data?.message || 'Failed to get recommendations. Please try again.');
      } else {
        setError('Request failed. Please check your connection or try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  const seasons = ['Winter', 'Spring', 'Summer', 'Autumn', 'All Year'];
  const climates = ['Tropical', 'Dry', 'Temperate', 'Continental'];
  const budgets = ['low', 'medium', 'high'];

  return (
    <Container>
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="caption" display="block" gutterBottom>
          Submit Count: {submitCount}
        </Typography>
        <Typography variant="h4" gutterBottom>
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
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Season</InputLabel>
                <Select
                  name="season"
                  value={preferences.season}
                  onChange={handleChange}
                  label="Season"
                >
                  {seasons.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Preferred Climate</InputLabel>
                <Select
                  name="climate"
                  value={preferences.climate}
                  onChange={handleChange}
                  label="Preferred Climate"
                >
                  {climates.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Budget</InputLabel>
                <Select
                  name="budget"
                  value={preferences.budget}
                  onChange={handleChange}
                  label="Budget"
                >
                  {budgets.map(b => (
                    <MenuItem key={b} value={b}>
                      {b.charAt(0).toUpperCase() + b.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Typography gutterBottom>Popularity vs. Eco-Friendliness Weight</Typography>
              <Slider
                value={preferences.popularity_weight}
                onChange={handleSliderChange('popularity_weight')}
                min={0}
                max={1}
                step={0.05}
                valueLabelDisplay="auto"
                valueLabelFormat={(value) =>
                  `Pop: ${value.toFixed(2)}, Eco: ${(1 - value).toFixed(2)}`
                }
              />
              <Grid container justifyContent="space-between">
                <Typography variant="caption" color="text.secondary">
                  Focus on Eco-Friendliness
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Focus on Popularity
                </Typography>
              </Grid>
            </Grid>
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

        {message && <Alert severity="info" sx={{ mb: 2 }}>{message}</Alert>}

        {recommendations.length > 0 ? (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Recommendations Found: {recommendations.length}
              </Typography>
            </Grid>
            {recommendations.map((rec, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">
                      {rec.City}, {rec.COUNTRY}
                    </Typography>
                    <Typography color="text.secondary">
                      Type: {rec.Recommendation_Type}
                    </Typography>
                    <Typography>Budget: {rec.budget}</Typography>
                    <Typography>Season: {rec.season}</Typography>
                    <Typography>Climate: {rec.preferred_climate}</Typography>
                    <Typography>
                      Match Score:{' '}
                      {rec.combined_score !== null
                        ? `${(rec.combined_score * 100).toFixed(1)}%`
                        : 'N/A'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Typography color="text.secondary" align="center">
            No recommendations to display yet. Try adjusting your preferences and click "Get Recommendations".
          </Typography>
        )}
      </Box>
    </Container>
  );
};

export default TravelRecommendations;

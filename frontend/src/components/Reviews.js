import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Rating,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  CircularProgress,
  Alert
} from '@mui/material';
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3007',
  withCredentials: true
});

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    userName: '',
    rating: 0,
    title: '',
    comment: '',
    features: []
  });

  const featureOptions = [
    'Route Planning',
    'Eco-friendly Options',
    'User Interface',
    'Travel Recommendations',
    'Other'
  ];

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError(null);
      const [reviewsResponse, statsResponse] = await Promise.all([
        api.get('/api/reviews'),
        api.get('/api/reviews/stats')
      ]);

      if (reviewsResponse.data.success) {
        setReviews(reviewsResponse.data.data.reviews);
      }
      if (statsResponse.data.success) {
        setStats(statsResponse.data.data);
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setError(err.response?.data?.error || 'Failed to fetch reviews. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      const response = await api.post('/api/reviews', formData);
      if (response.data.success) {
        setFormData({
          userName: '',
          rating: 0,
          title: '',
          comment: '',
          features: []
        });
        fetchReviews();
      }
    } catch (err) {
      console.error('Error submitting review:', err);
      setError(err.response?.data?.error || 'Failed to submit review. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'rating' ? Number(value) : value
    }));
  };

  const handleFeatureChange = (event) => {
    setFormData(prev => ({
      ...prev,
      features: event.target.value
    }));
  };

  if (loading && !reviews.length) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        User Reviews
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {stats && (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Typography variant="h6">Average Rating</Typography>
                <Box display="flex" alignItems="center">
                  <Rating value={parseFloat(stats.averageRating)} precision={0.1} readOnly />
                  <Typography variant="body1" sx={{ ml: 1 }}>
                    ({stats.averageRating})
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="h6">Total Reviews</Typography>
                <Typography variant="body1">{stats.totalReviews}</Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="h6">Feature Popularity</Typography>
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {Object.entries(stats.featureStats).map(([feature, count]) => (
                    <Chip
                      key={feature}
                      label={`${feature}: ${count}`}
                      size="small"
                    />
                  ))}
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Write a Review
              </Typography>
              <form onSubmit={handleSubmit}>
                <TextField
                  fullWidth
                  label="Your Name"
                  name="userName"
                  value={formData.userName}
                  onChange={handleChange}
                  required
                  margin="normal"
                />
                <Box sx={{ my: 2 }}>
                  <Typography component="legend">Rating</Typography>
                  <Rating
                    name="rating"
                    value={Number(formData.rating)}
                    onChange={(event, newValue) => {
                      setFormData(prev => ({
                        ...prev,
                        rating: newValue
                      }));
                    }}
                    precision={1}
                  />
                </Box>
                <TextField
                  fullWidth
                  label="Review Title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  margin="normal"
                />
                <TextField
                  fullWidth
                  label="Your Review"
                  name="comment"
                  value={formData.comment}
                  onChange={handleChange}
                  required
                  multiline
                  rows={4}
                  margin="normal"
                />
                <FormControl fullWidth margin="normal">
                  <InputLabel>Features</InputLabel>
                  <Select
                    multiple
                    value={formData.features}
                    onChange={handleFeatureChange}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => (
                          <Chip key={value} label={value} />
                        ))}
                      </Box>
                    )}
                  >
                    {featureOptions.map((feature) => (
                      <MenuItem key={feature} value={feature}>
                        {feature}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                  sx={{ mt: 2 }}
                  disabled={loading}
                >
                  Submit Review
                </Button>
              </form>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom>
            Recent Reviews
          </Typography>
          {reviews.map((review) => (
            <Card key={review._id} sx={{ mb: 2 }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6">{review.title}</Typography>
                  <Rating value={review.rating} readOnly />
                </Box>
                <Typography color="textSecondary" gutterBottom>
                  By {review.userName} • {new Date(review.createdAt).toLocaleDateString()}
                </Typography>
                <Typography paragraph>{review.comment}</Typography>
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {review.features.map((feature) => (
                    <Chip
                      key={feature}
                      label={feature}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  ))}
                </Box>
              </CardContent>
            </Card>
          ))}
        </Grid>
      </Grid>
    </Container>
  );
};

export default Reviews; 
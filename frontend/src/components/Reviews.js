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
      <Typography
        variant="h4"
        sx={{
          fontFamily: 'Lexend Mega, sans-serif',
          fontWeight: 'bold',
          mb: 4,
          backgroundColor: '#FEE440',
          px: 3,
          py: 1,
          border: '2px solid black',
          boxShadow: '4px 6px 0 black',
          borderRadius: '0.75rem',
          width: 'fit-content'
        }}
      >
        User Reviews
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {stats && (
        <Card sx={{
          mb: 4,
          backgroundColor: '#C2F970',
          border: '2px solid black',
          boxShadow: '4px 6px 0 black',
          borderRadius: '0.75rem'
        }}>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Typography variant="h6" fontWeight="bold">Average Rating</Typography>
                <Box display="flex" alignItems="center">
                  <Rating value={parseFloat(stats.averageRating)} precision={0.1} readOnly />
                  <Typography variant="body1" sx={{ ml: 1 }}>
                    ({stats.averageRating})
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="h6" fontWeight="bold">Total Reviews</Typography>
                <Typography variant="body1">{stats.totalReviews}</Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="h6" fontWeight="bold">Feature Popularity</Typography>
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {Object.entries(stats.featureStats).map(([feature, count]) => (
                    <Chip
                      key={feature}
                      label={`${feature}: ${count}`}
                      size="small"
                      sx={{
                        border: '2px solid black',
                        backgroundColor: '#FFDD57',
                        fontWeight: 'bold'
                      }}
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
          <Card sx={{
            backgroundColor: '#B9FBC0',
            border: '2px solid black',
            boxShadow: '4px 6px 0 black',
            borderRadius: '0.75rem'
          }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
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
                  <Typography component="legend" fontWeight="bold">Rating</Typography>
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
                          <Chip
                            key={value}
                            label={value}
                            sx={{ backgroundColor: '#FFD6A5', border: '2px solid black', fontWeight: 'bold' }}
                          />
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
                  fullWidth
                  sx={{
                    mt: 2,
                    backgroundColor: '#FEE440',
                    color: 'black',
                    fontWeight: 'bold',
                    border: '2px solid black',
                    boxShadow: '4px 6px 0 black',
                    borderRadius: '0.75rem',
                    '&:hover': {
                      backgroundColor: '#FFD60A',
                      boxShadow: '6px 8px 0 black'
                    }
                  }}
                  disabled={loading}
                >
                  Submit Review
                </Button>
              </form>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Typography
            variant="h6"
            fontWeight="bold"
            sx={{
              mb: 2,
              backgroundColor: '#A0C4FF',
              px: 2,
              py: 1,
              border: '2px solid black',
              boxShadow: '4px 6px 0 black',
              borderRadius: '0.75rem',
              width: 'fit-content'
            }}
          >
            Recent Reviews
          </Typography>
          {reviews.map((review) => (
  <Card
  key={review._id}
  sx={{
    mb: 2,
    border: '2px solid black',
    boxShadow: '4px 6px 0 black',
    borderRadius: '0.75rem',
    backgroundColor: '#FFF1A5',
    color: 'black',
    overflow: 'hidden',
    p: 0
  }}
>
  <Box className={review.rating === 5 ? 'shiny-gradient' : ''} sx={{ p: 2 }}>
    <CardContent sx={{ p: 0 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h6" fontWeight="bold">{review.title}</Typography>
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
            sx={{ border: '2px solid black', fontWeight: 'bold' }}
          />
        ))}
      </Box>
    </CardContent>
  </Box>
</Card>


))}


        </Grid>
      </Grid>
    </Container>
  );
};

export default Reviews;

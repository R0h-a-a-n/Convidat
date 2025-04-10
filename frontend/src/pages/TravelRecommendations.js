import React, { useState, useEffect } from 'react';
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
  InputLabel,
  Tabs,
  Tab,
  Chip,
  Tooltip,
  IconButton,
  Divider,
  TextField,
  FormControlLabel,
  Switch
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import RefreshIcon from '@mui/icons-material/Refresh';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import './TravelRecommendations.css';

import axios from 'axios';

const TravelRecommendations = () => {
  // State for form values
  const [preferences, setPreferences] = useState({
    season: 'Spring',
    climate: 'Temperate',
    budget: 'medium',
    popularity_weight: 0.85,
    eco_weight: 0.15,
    metric: 'weighted',
    fallback_strategy: 'hybrid',
    num_recommendations: 10,
    min_match_score: 0
  });

  // State for API data
  const [recommendations, setRecommendations] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitCount, setSubmitCount] = useState(0);
  const [activeTab, setActiveTab] = useState(0);
  const [favorites, setFavorites] = useState([]);
  const [topCities, setTopCities] = useState([]);
  
  // State for metadata (dynamic dropdowns)
  const [metaData, setMetaData] = useState({
    seasons: ['Winter', 'Spring', 'Summer', 'Autumn', 'All Year'],
    climates: ['Tropical', 'Dry', 'Temperate', 'Continental'],
    budgets: ['low', 'medium', 'high'],
    countries: []
  });
  
  // State for advanced settings visibility
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Load metadata on component mount
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const response = await axios.get('http://localhost:3003/api/metadata');
        if (response.data) {
          setMetaData(response.data);
        }
      } catch (err) {
        console.error('Error fetching metadata:', err);
      }
    };

    const fetchTopCities = async () => {
      try {
        const response = await axios.get('http://localhost:3003/api/top_cities?count=6');
        if (response.data && Array.isArray(response.data.cities)) {
          setTopCities(response.data.cities);
        }
      } catch (err) {
        console.error('Error fetching top cities:', err);
      }
    };

    fetchMetadata();
    fetchTopCities();
    
    // Load favorites from localStorage
    const savedFavorites = localStorage.getItem('travelFavorites');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, []);

  // Save favorites to localStorage when they change
  useEffect(() => {
    localStorage.setItem('travelFavorites', JSON.stringify(favorites));
  }, [favorites]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPreferences(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSliderChange = (name) => (event, newValue) => {
    const otherWeightName = name === 'popularity_weight' ? 'eco_weight' : 'popularity_weight';
    const otherWeight = +(1 - newValue).toFixed(2);
    setPreferences(prev => ({
      ...prev,
      [name]: +newValue.toFixed(2),
      [otherWeightName]: otherWeight
    }));
  };

  const handleNumberInputChange = (e) => {
    const { name, value } = e.target;
    const numValue = parseInt(value, 10);
    
    if (!isNaN(numValue)) {
      setPreferences(prev => ({
        ...prev,
        [name]: numValue
      }));
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    setMessage('');
    setRecommendations([]);

    try {
      const payload = {
        // Only include season if it's not null/empty
        ...(preferences.season && { season: preferences.season }),
        ...(preferences.climate && { climate: preferences.climate }),
        ...(preferences.budget && { budget: preferences.budget }),
        popularity_weight: preferences.popularity_weight,
        eco_weight: preferences.eco_weight,
        metric: preferences.metric,
        fallback_strategy: preferences.fallback_strategy,
        num_recommendations: preferences.num_recommendations,
        min_match_score: preferences.min_match_score
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
        setActiveTab(1); // Switch to recommendations tab
      } else {
        setError('Server response is missing recommendations data');
      }

    } catch (err) {
      console.error('Request Error:', err);
      if (err.response) {
        setError(err.response?.data?.message || err.response?.data?.error || 'Failed to get recommendations. Please try again.');
      } else {
        setError('Request failed. Please check your connection or try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchCityDetails = async (cityName) => {
    try {
      const response = await axios.get(`http://localhost:3003/api/city/${encodeURIComponent(cityName)}`);
      console.log("City details:", response.data);
      // You can add more functionality here, like showing a modal with city details
      return response.data;
    } catch (err) {
      console.error(`Error fetching details for ${cityName}:`, err);
    }
  };

  const toggleFavorite = (city) => {
    const isFavorite = favorites.some(fav => fav.City === city.City && fav.COUNTRY === city.COUNTRY);
    
    if (isFavorite) {
      setFavorites(favorites.filter(fav => 
        !(fav.City === city.City && fav.COUNTRY === city.COUNTRY)
      ));
    } else {
      setFavorites([...favorites, city]);
    }
  };

  const isFavorite = (city) => {
    return favorites.some(fav => fav.City === city.City && fav.COUNTRY === city.COUNTRY);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const metricOptions = [
    { value: 'weighted', label: 'Weighted (Balanced)' },
    { value: 'euclidean', label: 'Euclidean (Spatial)' },
    { value: 'cosine', label: 'Cosine (Directional)' }
  ];

  const strategyOptions = [
    { value: 'hybrid', label: 'Hybrid (Best Overall)' },
    { value: 'similarity', label: 'Similarity (Based on Similar Cities)' },
    { value: 'popularity', label: 'Popularity (Most Popular First)' }
  ];

  const renderRecommendationCard = (rec, index) => (
    <Grid item xs={12} md={6} key={index}>
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">
              {rec.City}, {rec.COUNTRY}
            </Typography>
            <IconButton 
              onClick={() => toggleFavorite(rec)}
              color={isFavorite(rec) ? "primary" : "default"}
            >
              {isFavorite(rec) ? <FavoriteIcon /> : <FavoriteBorderIcon />}
            </IconButton>
          </Box>
          
          <Box display="flex" flexWrap="wrap" gap={1} mb={1}>
            <Chip 
              size="small" 
              color={rec.Recommendation_Type === "Exact Match" ? "success" : "warning"}
              label={rec.Recommendation_Type} 
            />
            {rec.Matches_season && (
              <Chip 
                size="small" 
                variant="outlined"
                color={rec.Matches_season === "✓" ? "success" : "default"}
                label={`Season: ${rec.Matches_season}`} 
              />
            )}
            {rec.Matches_preferred_climate && (
              <Chip 
                size="small" 
                variant="outlined"
                color={rec.Matches_preferred_climate === "✓" ? "success" : "default"}
                label={`Climate: ${rec.Matches_preferred_climate}`} 
              />
            )}
            {rec.Matches_budget && (
              <Chip 
                size="small" 
                variant="outlined"
                color={rec.Matches_budget === "✓" ? "success" : "default"}
                label={`Budget: ${rec.Matches_budget}`} 
              />
            )}
          </Box>
          
          <Divider sx={{ my: 1 }} />
          
          <Grid container spacing={1}>
            <Grid item xs={6}>
              <Typography variant="body2">Budget: {rec.budget}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2">Season: {rec.season}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2">Climate: {rec.preferred_climate}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2">
                Score: {rec.combined_score !== null
                  ? `${(rec.combined_score * 100).toFixed(1)}%`
                  : 'N/A'}
              </Typography>
            </Grid>
          </Grid>
          
          <Button 
            size="small" 
            variant="outlined" 
            onClick={() => window.open(`https://www.google.com/search?q=${encodeURIComponent(`${rec.City}, ${rec.COUNTRY} travel`)}`, '_blank')}
            sx={{ mt: 1 }}
          >
            View Details
          </Button>
        </CardContent>
      </Card>
    </Grid>
  );

  const renderTopCitiesSection = () => (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" gutterBottom>
        Top Destinations
      </Typography>
      <Grid container spacing={2}>
        {topCities.map((city, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card>
              <CardContent>
                <Typography variant="h6">
                  {city.City}, {city.COUNTRY}
                </Typography>
                <Box sx={{ mt: 1 }}>
                  <Typography variant="body2">
                    Popularity: {(city.popularity_score * 100).toFixed(1)}%
                  </Typography>
                  <Typography variant="body2">
                    Eco-Friendly: {(city.eco_score * 100).toFixed(1)}%
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  return (
    <Container>
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="caption" display="block" gutterBottom>
          Submit Count: {submitCount}
        </Typography>
        <Typography className="neo-header" variant="h4" gutterBottom>
          Travel Recommendations
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          Tell us your preferences and we'll recommend the perfect destinations for you
        </Typography>
  
        {error && <Alert severity="error" className="neo-alert" sx={{ mb: 2 }}>{error}</Alert>}
  
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs value={activeTab} onChange={handleTabChange} aria-label="travel tabs">
            <Tab label="Search" />
            <Tab label="Recommendations" />
            <Tab label="Favorites" />
          </Tabs>
        </Box>
  
        {activeTab === 0 && (
          <>
            <Paper className="neo-card" sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Your Preferences
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>Season</InputLabel>
                    <Select
                      name="season"
                      value={preferences.season || ''}
                      onChange={handleChange}
                      label="Season"
                    >
                      <MenuItem value="">Any Season</MenuItem>
                      {metaData.seasons?.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>Preferred Climate</InputLabel>
                    <Select
                      name="climate"
                      value={preferences.climate || ''}
                      onChange={handleChange}
                      label="Preferred Climate"
                    >
                      <MenuItem value="">Any Climate</MenuItem>
                      {metaData.climates?.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>Budget</InputLabel>
                    <Select
                      name="budget"
                      value={preferences.budget || ''}
                      onChange={handleChange}
                      label="Budget"
                    >
                      <MenuItem value="">Any Budget</MenuItem>
                      {metaData.budgets?.map(b => (
                        <MenuItem key={b} value={b}>
                          {b.charAt(0).toUpperCase() + b.slice(1)}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
  
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography gutterBottom>Popularity vs. Eco-Friendliness Weight</Typography>
                    <Tooltip title="Adjust the balance between popular destinations and eco-friendly ones">
                      <IconButton size="small">
                        <InfoIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  <Slider
                    value={preferences.popularity_weight}
                    onChange={handleSliderChange('popularity_weight')}
                    min={0}
                    max={1}
                    step={0.05}
                    valueLabelDisplay="auto"
                    valueLabelFormat={(value) => `Pop: ${value.toFixed(2)}, Eco: ${(1 - value).toFixed(2)}`}
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
  
              <Box sx={{ mt: 2 }}>
                <FormControlLabel
                  control={<Switch checked={showAdvanced} onChange={() => setShowAdvanced(!showAdvanced)} />}
                  label="Show Advanced Options"
                />
              </Box>
  
              {showAdvanced && (
                <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Advanced Options
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth>
                        <InputLabel>Similarity Metric</InputLabel>
                        <Select
                          name="metric"
                          value={preferences.metric}
                          onChange={handleChange}
                          label="Similarity Metric"
                        >
                          {metricOptions.map(option => (
                            <MenuItem key={option.value} value={option.value}>
                              {option.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth>
                        <InputLabel>Fallback Strategy</InputLabel>
                        <Select
                          name="fallback_strategy"
                          value={preferences.fallback_strategy}
                          onChange={handleChange}
                          label="Fallback Strategy"
                        >
                          {strategyOptions.map(option => (
                            <MenuItem key={option.value} value={option.value}>
                              {option.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Results Count"
                        name="num_recommendations"
                        value={preferences.num_recommendations}
                        onChange={handleNumberInputChange}
                        InputProps={{ inputProps: { min: 1, max: 50 } }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Minimum Match Score"
                        name="min_match_score"
                        value={preferences.min_match_score}
                        onChange={handleNumberInputChange}
                        InputProps={{ inputProps: { min: 0, max: 3 } }}
                      />
                    </Grid>
                  </Grid>
                </Box>
              )}
  
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
                <Button
                  className="neo-btn"
                  onClick={handleSubmit}
                  disabled={loading}
                  size="large"
                >
                  {loading ? <CircularProgress size={24} /> : 'Get Recommendations'}
                </Button>
              </Box>
            </Paper>
  
            {renderTopCitiesSection()}
          </>
        )}
  
        {activeTab === 1 && (
          <>
            {message && <Alert severity="info" className="neo-alert" sx={{ mb: 2 }}>{message}</Alert>}
  
            {recommendations.length > 0 ? (
              <>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    Recommendations Found: {recommendations.length}
                  </Typography>
                  <Button className="neo-btn" startIcon={<RefreshIcon />} onClick={handleSubmit} disabled={loading}>
                    Refresh
                  </Button>
                </Box>
                <Grid container spacing={2}>
                  {recommendations.map((rec, index) => renderRecommendationCard(rec, index))}
                </Grid>
              </>
            ) : (
              <Typography color="text.secondary" align="center">
                No recommendations to display yet. Try adjusting your preferences and click "Get Recommendations".
              </Typography>
            )}
          </>
        )}
  
        {activeTab === 2 && (
          <>
            <Typography variant="h6" gutterBottom>
              Your Favorite Destinations
            </Typography>
            {favorites.length > 0 ? (
              <Grid container spacing={2}>
                {favorites.map((city, index) => renderRecommendationCard(city, index))}
              </Grid>
            ) : (
              <Typography color="text.secondary" align="center">
                You haven't added any favorites yet. Click the heart icon on any recommendation to add it to favorites.
              </Typography>
            )}
          </>
        )}
      </Box>
    </Container>
  );  
};

export default TravelRecommendations;
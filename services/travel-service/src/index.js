const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const morgan = require('morgan');

// Import routes
const accommodationsRouter = require('./routes/accommodations');
const routesRouter = require('./routes/routes');
const placesRouter = require('./routes/places'); // New import for places API
const recommendationsRouter = require('./routes/recommendations'); // New import

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Configure CORS
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware
app.use(express.json());
app.use(morgan('dev'));

// Debug log for environment variables
console.log('Environment variables status:', {
  PORT: process.env.PORT || '3006',
  MONGODB_URI: process.env.MONGODB_URI ? 'Present' : 'Missing',
  GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY ? 'Present' : 'Missing',
  GEOCODING_API_KEY: process.env.GEOCODING_API_KEY ? 'Present' : 'Missing',
  PLACES_API_KEY: process.env.PLACES_API_KEY ? 'Present' : 'Missing'
});

// Routes
app.use('/api/accommodations', accommodationsRouter);
app.use('/api/routes', routesRouter);
app.use('/api/places', placesRouter); // Register the new places routes
app.use('/api', recommendationsRouter); // Add recommendations routes

// Test route
app.get('/api/test', (req, res) => {
  res.json({
    message: 'Travel service is running',
    mongodbStatus: process.env.MONGODB_URI ? 'Configured' : 'Not configured',
    googleMapsStatus: process.env.GOOGLE_MAPS_API_KEY ? 'Configured' : 'Not configured',
    geocodingApiStatus: process.env.GEOCODING_API_KEY ? 'Configured' : 'Not configured',
    placesApiStatus: process.env.PLACES_API_KEY ? 'Configured' : 'Not configured'
  });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/travel-service')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Start server
const PORT = process.env.PORT || 3006;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const accommodationsRoutes = require('./routes/accommodations');
const routesRoutes = require('./routes/routes');

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/accommodations', accommodationsRoutes);
app.use('/api/routes', routesRoutes);

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Start server
const PORT = process.env.PORT || 3005;
app.listen(PORT, () => {
  console.log(`Travel service running on port ${PORT}`);
}); 
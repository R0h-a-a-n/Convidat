import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  createItinerary,
  getItinerary,
  updateItinerary,
  deleteItinerary,
  addActivity,
  updateActivity,
  deleteActivity,
  getWeatherForActivity,
} from '../controllers/itineraryController.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// Itinerary CRUD routes
router.post('/trips/:tripId/itinerary', createItinerary);
router.get('/trips/:tripId/itinerary', getItinerary);
router.put('/trips/:tripId/itinerary', updateItinerary);
router.delete('/trips/:tripId/itinerary', deleteItinerary);

// Activity management routes
router.post('/trips/:tripId/activities', addActivity);
router.put('/trips/:tripId/activities/:activityId', updateActivity);
router.delete('/trips/:tripId/activities/:activityId', deleteActivity);

// Weather information route
router.get('/trips/:tripId/activities/:activityId/weather', getWeatherForActivity);

export default router; 
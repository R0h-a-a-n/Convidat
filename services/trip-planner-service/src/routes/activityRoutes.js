import express from 'express';
import {
  createActivity,
  getActivities,
  getActivity,
  updateActivity,
  deleteActivity,
  getWeatherForecast,
  getNearbyEcoActivities,
} from '../controllers/activityController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Activity routes
router.route('/:tripId/activities')
  .get((req, res, next) => {
    console.log('GET /:tripId/activities hit');
    next();
  }, getActivities)
  .post((req, res, next) => {
    console.log('POST /:tripId/activities hit');
    next();
  }, createActivity);

router.route('/:tripId/activities/:activityId')
  .put((req, res, next) => {
    console.log('PUT /:tripId/activities/:activityId hit');
    next();
  }, updateActivity)
  .delete((req, res, next) => {
    console.log('DELETE /:tripId/activities/:activityId hit');
    next();
  }, deleteActivity);

// Weather forecast route
router.route('/:id/weather')
  .get(getWeatherForecast);

// Nearby eco-friendly activities route
router.route('/nearby')
  .get(getNearbyEcoActivities);

export default router; 
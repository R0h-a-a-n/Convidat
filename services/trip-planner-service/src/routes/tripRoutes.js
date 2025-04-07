import express from 'express';
import {
  createTrip,
  getTrips,
  getTrip,
  updateTrip,
  deleteTrip,
  addActivityToItinerary,
  removeActivityFromItinerary,
} from '../controllers/tripController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// Trip routes
router.route('/')
  .post(createTrip)
  .get(getTrips);

router.route('/:id')
  .get(getTrip)
  .put(updateTrip)
  .delete(deleteTrip);

// Itinerary routes
router.route('/:id/itinerary')
  .post(addActivityToItinerary)
  .delete(removeActivityFromItinerary);

export default router; 
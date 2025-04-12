import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  getProfile,
  updateProfile,
  updateStats,
  getPreferences,
  updatePreferences
} from '../controllers/profileController.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// Profile routes
router.route('/')
  .get(getProfile)
  .put(updateProfile);

// Stats routes
router.route('/stats')
  .put(updateStats);

// Preferences routes
router.route('/preferences')
  .get(getPreferences)
  .put(updatePreferences);

export default router; 
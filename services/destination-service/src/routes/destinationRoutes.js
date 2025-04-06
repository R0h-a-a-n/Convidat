import express from 'express';
import {
  getDestinationsByCity,
  getDestinationById,
  getNearbyDestinations
} from '../controllers/destinationController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Protected routes - require authentication
router.get('/search', authenticateToken, getDestinationsByCity);
router.get('/:id', authenticateToken, getDestinationById);
router.get('/nearby', authenticateToken, getNearbyDestinations);

export default router; 
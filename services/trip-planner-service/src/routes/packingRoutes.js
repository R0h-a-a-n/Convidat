import express from 'express';
import {
  createPackingList,
  getPackingList,
  updatePackingList,
  addItem,
  updateItemStatus,
  getPackingProgress,
  generateSuggestedList,
  updateItem,
  deleteItem
} from '../controllers/packingController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// Packing list routes
router.route('/')
  .post(createPackingList);

router.route('/:tripId')
  .get(getPackingList)
  .put(updatePackingList);

// Item routes
router.route('/:tripId/items')
  .post(addItem);

router.route('/:tripId/items/:itemId')
  .put(updateItem)
  .delete(deleteItem);

router.route('/:tripId/items/status')
  .put(updateItemStatus);

// Progress route
router.route('/:tripId/progress')
  .get(getPackingProgress);

// Suggested list route
router.route('/:tripId/suggestions')
  .get(generateSuggestedList);

export default router; 
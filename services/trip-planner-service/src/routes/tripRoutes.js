import express from 'express';
import { authenticateToken} from '../middleware/authMiddleware.js';
import {
  createTrip,
  getTrips,
  getTrip,
  updateTrip,
  deleteTrip,
  getTripActivities,
  createActivity,
  updateActivity,
  deleteActivity,
  getTripPackingList,
  addPackingItem,
  updatePackingItem,
  deletePackingItem,
  getTripBudget,
  createBudget,
  updateBudget,
  addExpense,
  updateExpense,
  deleteExpense
} from '../controllers/tripController.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(authenticateToken);

// Trip routes
router.post('/', createTrip);
router.get('/', getTrips);
router.get('/:id', getTrip);
router.put('/:id', updateTrip);
router.delete('/:id', deleteTrip);

// Activity routes
router.get('/:tripId/activities', getTripActivities);
router.post('/:tripId/activities', createActivity);
router.put('/:tripId/activities/:activityId', updateActivity);
router.delete('/:tripId/activities/:activityId', deleteActivity);

// Packing list routes
router.get('/:tripId/packing', getTripPackingList);
router.post('/:tripId/packing', addPackingItem);
router.put('/:tripId/packing/:itemId', updatePackingItem);
router.delete('/:tripId/packing/:itemId', deletePackingItem);

// Budget routes
router.get('/:tripId/budget', getTripBudget);
router.post('/:tripId/budget', createBudget);
router.put('/:tripId/budget', updateBudget);
router.post('/:tripId/budget/expenses', addExpense);
router.put('/:tripId/budget/expenses/:expenseId', updateExpense);
router.delete('/:tripId/budget/expenses/:expenseId', deleteExpense);

export default router; 
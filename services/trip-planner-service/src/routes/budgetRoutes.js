import express from 'express';
import {
  createBudget,
  getBudget,
  updateBudget,
  addExpense,
  updateCategoryAllocation,
  getExchangeRate,
  getBudgetSummary,
} from '../controllers/budgetController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Budget routes
router.route('/')
  .post(createBudget);

router.route('/:tripId')
  .get(getBudget)
  .put(updateBudget);

// Expense routes
router.route('/:tripId/expenses')
  .post(addExpense);

// Category allocation routes
router.route('/:tripId/categories')
  .put(updateCategoryAllocation);

// Exchange rate route
router.route('/:tripId/exchange-rate')
  .get(getExchangeRate);

// Budget summary route
router.route('/:tripId/summary')
  .get(getBudgetSummary);

export default router; 
import Budget from '../models/Budget.js';
import axios from 'axios';

// Create a new budget
export const createBudget = async (req, res) => {
  try {
    const { tripId, totalBudget, currency, categories } = req.body;

    const budget = new Budget({
      tripId,
      totalBudget,
      currency,
      categories: categories || [
        { name: 'accommodation', allocated: 0, spent: 0, items: [] },
        { name: 'transportation', allocated: 0, spent: 0, items: [] },
        { name: 'food', allocated: 0, spent: 0, items: [] },
        { name: 'activities', allocated: 0, spent: 0, items: [] },
        { name: 'shopping', allocated: 0, spent: 0, items: [] },
        { name: 'miscellaneous', allocated: 0, spent: 0, items: [] },
      ],
    });

    await budget.save();

    res.status(201).json({
      success: true,
      data: budget,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// Get budget for a trip
export const getBudget = async (req, res) => {
  try {
    const budget = await Budget.findOne({ tripId: req.params.tripId });

    if (!budget) {
      return res.status(404).json({
        success: false,
        error: 'Budget not found',
      });
    }

    res.status(200).json({
      success: true,
      data: budget,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// Update budget
export const updateBudget = async (req, res) => {
  try {
    const budget = await Budget.findOne({ tripId: req.params.tripId });

    if (!budget) {
      return res.status(404).json({
        success: false,
        error: 'Budget not found',
      });
    }

    // Update budget fields
    Object.keys(req.body).forEach(key => {
      budget[key] = req.body[key];
    });

    await budget.save();

    res.status(200).json({
      success: true,
      data: budget,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// Add expense to a category
export const addExpense = async (req, res) => {
  try {
    const { category, description, amount, date, paymentMethod, receipt, notes } = req.body;
    const budget = await Budget.findOne({ tripId: req.params.tripId });

    if (!budget) {
      return res.status(404).json({
        success: false,
        error: 'Budget not found',
      });
    }

    const categoryIndex = budget.categories.findIndex(c => c.name === category);
    if (categoryIndex === -1) {
      return res.status(400).json({
        success: false,
        error: 'Invalid category',
      });
    }

    const expense = {
      description,
      amount: parseFloat(amount),
      date: new Date(date),
      paymentMethod,
      receipt,
      notes,
    };

    budget.categories[categoryIndex].items.push(expense);
    budget.categories[categoryIndex].spent += expense.amount;

    await budget.save();

    res.status(200).json({
      success: true,
      data: budget,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// Update category allocation
export const updateCategoryAllocation = async (req, res) => {
  try {
    const { category, allocated } = req.body;
    const budget = await Budget.findOne({ tripId: req.params.tripId });

    if (!budget) {
      return res.status(404).json({
        success: false,
        error: 'Budget not found',
      });
    }

    const categoryIndex = budget.categories.findIndex(c => c.name === category);
    if (categoryIndex === -1) {
      return res.status(400).json({
        success: false,
        error: 'Invalid category',
      });
    }

    budget.categories[categoryIndex].allocated = parseFloat(allocated);
    await budget.save();

    res.status(200).json({
      success: true,
      data: budget,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// Get exchange rate
export const getExchangeRate = async (req, res) => {
  try {
    const { from, to } = req.query;
    const budget = await Budget.findOne({ tripId: req.params.tripId });

    if (!budget) {
      return res.status(404).json({
        success: false,
        error: 'Budget not found',
      });
    }

    // Call exchange rate API (example using Exchange Rates API)
    const response = await axios.get(
      `https://api.exchangerate-api.com/v4/latest/${from || budget.currency}`
    );

    const rate = response.data.rates[to || 'USD'];
    budget.exchangeRate = rate;
    await budget.save();

    res.status(200).json({
      success: true,
      data: {
        from: from || budget.currency,
        to: to || 'USD',
        rate,
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// Get budget summary
export const getBudgetSummary = async (req, res) => {
  try {
    const budget = await Budget.findOne({ tripId: req.params.tripId });

    if (!budget) {
      return res.status(404).json({
        success: false,
        error: 'Budget not found',
      });
    }

    const summary = {
      totalBudget: budget.totalBudget,
      totalAllocated: budget.categories.reduce((sum, cat) => sum + cat.allocated, 0),
      totalSpent: budget.calculateTotalSpent(),
      remaining: budget.calculateRemaining(),
      categories: budget.categories.map(category => ({
        name: category.name,
        allocated: category.allocated,
        spent: category.spent,
        remaining: category.allocated - category.spent,
        percentageSpent: (category.spent / category.allocated) * 100 || 0,
      })),
    };

    res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
}; 
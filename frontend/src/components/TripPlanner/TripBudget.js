import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Typography,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  LinearProgress,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import axios from 'axios';

const TripBudget = ({ tripId }) => {
  const [budget, setBudget] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [openBudgetDialog, setOpenBudgetDialog] = useState(false);
  const [error, setError] = useState('');
  const [summary, setSummary] = useState(null);
  const [exchangeRate, setExchangeRate] = useState(null);
  const [formData, setFormData] = useState({
    category: '',
    description: '',
    amount: 0,
    date: new Date(),
    paymentMethod: 'cash',
    notes: '',
  });
  const [budgetFormData, setBudgetFormData] = useState({
    totalAmount: '',
    currency: 'USD',
    categories: [
      { name: 'Accommodation', allocated: 0 },
      { name: 'Transportation', allocated: 0 },
      { name: 'Food', allocated: 0 },
      { name: 'Activities', allocated: 0 },
      { name: 'Shopping', allocated: 0 },
      { name: 'Other', allocated: 0 },
    ],
  });

  useEffect(() => {
    fetchBudget();
  }, [tripId]);

  const fetchBudget = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3010/api/budgets/${tripId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      setBudget(response.data.data);
      if (response.data.data) {
        fetchBudgetSummary();
        fetchExchangeRate();
      }
      setLoading(false);
    } catch (err) {
      console.error('Error fetching budget:', err);
      setError('Failed to fetch budget');
      setLoading(false);
    }
  };

  const handleCreateBudget = async () => {
    try {
      let url = `http://localhost:3010/api/budgets/${tripId}`;
      let method = budget ? 'put' : 'post';
      
      console.log(`${method.toUpperCase()} budget with data:`, budgetFormData);
      
      const response = await axios({
        method,
        url,
        data: budgetFormData,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Budget response:', response.data);
      setBudget(response.data.data);
      setOpenBudgetDialog(false);
      fetchBudgetSummary();
      fetchExchangeRate();
    } catch (err) {
      console.error('Error managing budget:', err);
      setError(err.response?.data?.error || 'Failed to manage budget');
    }
  };

  const fetchBudgetSummary = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3010/api/budgets/${tripId}/summary`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      setSummary(response.data.data);
    } catch (err) {
      setError('Failed to fetch budget summary');
    }
  };

  const fetchExchangeRate = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3010/api/budgets/${tripId}/exchange-rate`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      setExchangeRate(response.data.data);
    } catch (err) {
      setError('Failed to fetch exchange rate');
    }
  };

  const handleAddExpense = () => {
    setFormData({
      category: '',
      description: '',
      amount: 0,
      date: new Date(),
      paymentMethod: 'cash',
      notes: '',
    });
    setOpenDialog(true);
  };

  const handleSaveExpense = async () => {
    try {
      await axios.post(
        `http://localhost:3010/api/budgets/${tripId}/expenses`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      setOpenDialog(false);
      fetchBudgetSummary();
    } catch (err) {
      setError('Failed to save expense');
    }
  };

  const handleUpdateAllocation = async (category, allocated) => {
    try {
      await axios.put(
        `http://localhost:3010/api/budgets/${tripId}/categories`,
        {
          category,
          allocated,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      fetchBudgetSummary();
    } catch (err) {
      setError('Failed to update allocation');
    }
  };

  if (loading) {
    return <LinearProgress />;
  }

  if (!budget) {
    return (
      <Box>
        <Alert severity="info" sx={{ mb: 2 }}>
          No budget information available. Create a budget to start tracking expenses.
        </Alert>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => setOpenBudgetDialog(true)}
        >
          Create Budget
        </Button>

        <Dialog open={openBudgetDialog} onClose={() => setOpenBudgetDialog(false)}>
          <DialogTitle>Create Trip Budget</DialogTitle>
          <DialogContent>
            <TextField
              margin="dense"
              label="Total Budget Amount"
              type="number"
              fullWidth
              value={budgetFormData.totalAmount}
              onChange={(e) => setBudgetFormData({ ...budgetFormData, totalAmount: e.target.value })}
            />
            <FormControl fullWidth margin="dense">
              <InputLabel>Currency</InputLabel>
              <Select
                value={budgetFormData.currency}
                onChange={(e) => setBudgetFormData({ ...budgetFormData, currency: e.target.value })}
              >
                <MenuItem value="USD">USD</MenuItem>
                <MenuItem value="EUR">EUR</MenuItem>
                <MenuItem value="GBP">GBP</MenuItem>
                <MenuItem value="JPY">JPY</MenuItem>
                <MenuItem value="AUD">AUD</MenuItem>
                <MenuItem value="CAD">CAD</MenuItem>
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenBudgetDialog(false)}>Cancel</Button>
            <Button onClick={handleCreateBudget} variant="contained" color="primary">
              Create
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">Trip Budget</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddExpense}
        >
          Add Expense
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {summary && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h6" gutterBottom>
                Budget Summary
              </Typography>
              <Button 
                variant="outlined" 
                size="small"
                onClick={() => {
                  setBudgetFormData({
                    ...budgetFormData,
                    totalAmount: summary.totalBudget,
                    currency: budget.currency
                  });
                  setOpenBudgetDialog(true);
                }}
              >
                Edit Total Budget
              </Button>
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="subtitle2" color="textSecondary">
                  Total Budget
                </Typography>
                <Typography variant="h6">
                  {budget.currency} {summary.totalBudget.toFixed(2)}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="subtitle2" color="textSecondary">
                  Total Spent
                </Typography>
                <Typography variant="h6">
                  {budget.currency} {summary.totalSpent.toFixed(2)}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="subtitle2" color="textSecondary">
                  Remaining
                </Typography>
                <Typography variant="h6" color={summary.remaining < 0 ? 'error' : 'inherit'}>
                  {budget.currency} {summary.remaining.toFixed(2)}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="subtitle2" color="textSecondary">
                  Exchange Rate
                </Typography>
                <Typography variant="h6">
                  1 {budget.currency} = {exchangeRate?.rate.toFixed(4) || '?'} USD
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      <Grid container spacing={3}>
        {summary?.categories.map((category) => (
          <Grid item xs={12} md={6} key={category.name}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {category.name.charAt(0).toUpperCase() + category.name.slice(1)}
                </Typography>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12}>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2">
                        Allocated: {budget.currency} {category.allocated.toFixed(2)}
                      </Typography>
                      <Typography variant="body2">
                        Spent: {budget.currency} {category.spent.toFixed(2)}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min((category.spent / category.allocated) * 100, 100)}
                      color={category.spent > category.allocated ? 'error' : 'primary'}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Update Allocation"
                      type="number"
                      value={category.allocated}
                      onChange={(e) => handleUpdateAllocation(category.name, e.target.value)}
                      size="small"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Expense</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, category: e.target.value }))
                    }
                    label="Category"
                  >
                    {budget.categories.map((category) => (
                      <MenuItem key={category.name} value={category.name}>
                        {category.name.charAt(0).toUpperCase() + category.name.slice(1)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, description: e.target.value }))
                  }
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Amount"
                  type="number"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, amount: parseFloat(e.target.value) }))
                  }
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Date"
                    value={formData.date}
                    onChange={(date) =>
                      setFormData((prev) => ({ ...prev, date }))
                    }
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                </LocalizationProvider>
              </Grid>

              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Payment Method</InputLabel>
                  <Select
                    value={formData.paymentMethod}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, paymentMethod: e.target.value }))
                    }
                    label="Payment Method"
                  >
                    <MenuItem value="cash">Cash</MenuItem>
                    <MenuItem value="credit_card">Credit Card</MenuItem>
                    <MenuItem value="debit_card">Debit Card</MenuItem>
                    <MenuItem value="mobile_payment">Mobile Payment</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Notes"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, notes: e.target.value }))
                  }
                  multiline
                  rows={2}
                />
              </Grid>

              <Grid item xs={12}>
                <Box display="flex" justifyContent="flex-end" gap={2}>
                  <Button variant="outlined" onClick={() => setOpenDialog(false)}>
                    Cancel
                  </Button>
                  <Button variant="contained" color="primary" onClick={handleSaveExpense}>
                    Add Expense
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default TripBudget; 
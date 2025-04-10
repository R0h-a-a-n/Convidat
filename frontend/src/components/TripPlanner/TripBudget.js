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
import './TripBudget.css';

const BrutalButton = ({ children, ...props }) => (
  <Button
    {...props}
    sx={{
      backgroundColor: '#00F5D4',
      border: '2px solid black',
      boxShadow: '4px 6px 0 black',
      borderRadius: '0.75rem',
      fontWeight: 'bold',
      textTransform: 'uppercase',
      fontFamily: 'Lexend Mega, sans-serif',
      '&:hover': {
        backgroundColor: '#00D5B4'
      },
      ...props.sx
    }}
  >
    {children}
  </Button>
);

const BrutalCard = ({ children, sx = {} }) => (
  <Box
    sx={{
      border: '2px solid black',
      boxShadow: '4px 6px 0 black',
      borderRadius: '1rem',
      backgroundColor: '#FEE440',
      p: 2,
      ...sx
    }}
  >
    {children}
  </Box>
);

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
      
      // Ensure totalAmount is a valid number
      const totalAmount = parseFloat(budgetFormData.totalAmount);
      if (isNaN(totalAmount)) {
        setError('Please enter a valid total amount');
        return;
      }

      console.log('Saving budget with data:', {
        totalAmount,
        currency: budgetFormData.currency,
        categories: budgetFormData.categories
      });

      const response = await axios({
        method,
        url,
        data: {
          totalBudget: totalAmount,
          currency: budgetFormData.currency,
          categories: budgetFormData.categories.map(cat => ({
            name: cat.name,
            allocated: parseFloat(cat.allocated) || 0
          }))
        },
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Server response:', response.data);

      if (response.data.success && response.data.data) {
        // Update local state with the new budget data
        const newBudget = {
          totalAmount: totalAmount,
          currency: budgetFormData.currency,
          categories: budgetFormData.categories
        };
        
        setBudget(newBudget);
        
        // Update the form data to match the new budget
        setBudgetFormData({
          totalAmount: totalAmount.toString(),
          currency: budgetFormData.currency,
          categories: budgetFormData.categories
        });
        
        // Close dialog
        setOpenBudgetDialog(false);
        // Clear any errors
        setError('');
        
        // Fetch updated data
        try {
          const [budgetRes, summaryRes, exchangeRes] = await Promise.all([
            axios.get(`http://localhost:3010/api/budgets/${tripId}`, {
              headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            }),
            axios.get(`http://localhost:3010/api/budgets/${tripId}/summary`, {
              headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            }),
            axios.get(`http://localhost:3010/api/budgets/${tripId}/exchange-rate`, {
              headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            })
          ]);

          console.log('Updated budget data:', budgetRes.data);
          console.log('Updated summary data:', summaryRes.data);
          console.log('Updated exchange rate data:', exchangeRes.data);

          if (budgetRes.data.success && budgetRes.data.data) {
            setBudget({
              ...budgetRes.data.data,
              categories: budgetRes.data.data.categories || [],
              totalAmount: budgetRes.data.data.totalBudget,
              currency: budgetRes.data.data.currency
            });
          }
          if (summaryRes.data.success && summaryRes.data.data) {
            setSummary(summaryRes.data.data);
          }
          if (exchangeRes.data.success && exchangeRes.data.data) {
            setExchangeRate(exchangeRes.data.data);
          }
          
        } catch (fetchErr) {
          console.error('Error fetching updated data:', fetchErr);
          setError('Budget updated but failed to fetch latest data');
        }
      } else {
        throw new Error(response.data.error || 'Failed to update budget');
      }
    } catch (err) {
      console.error('Error managing budget:', err);
      setError(err.message || 'Failed to manage budget');
    }
  };

  const handleEditBudget = () => {
    if (budget) {
      setBudgetFormData({
        totalAmount: budget.totalAmount?.toString() || '',
        currency: budget.currency || 'USD',
        categories: budget.categories || [
          { name: 'Accommodation', allocated: 0 },
          { name: 'Transportation', allocated: 0 },
          { name: 'Food', allocated: 0 },
          { name: 'Activities', allocated: 0 },
          { name: 'Shopping', allocated: 0 },
          { name: 'Other', allocated: 0 },
        ]
      });
    } else {
      setBudgetFormData({
        totalAmount: '',
        currency: 'USD',
        categories: [
          { name: 'Accommodation', allocated: 0 },
          { name: 'Transportation', allocated: 0 },
          { name: 'Food', allocated: 0 },
          { name: 'Activities', allocated: 0 },
          { name: 'Shopping', allocated: 0 },
          { name: 'Other', allocated: 0 },
        ]
      });
    }
    setOpenBudgetDialog(true);
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

  return (
    <Box className="trip-budget-wrapper">
  <Box className="trip-budget-container">
    <Typography className="trip-budget-header">Trip Budget</Typography>
    <BrutalButton startIcon={<AddIcon />} onClick={handleAddExpense}>
      Add Expense
    </BrutalButton>
  </Box>

  {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

  {summary && (
    <BrutalCard sx={{ mb: 4 }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">Budget Summary</Typography>
          <BrutalButton variant="outlined" size="small" onClick={handleEditBudget}>
            Edit Total Budget
          </BrutalButton>
        </Box>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="subtitle2">Total Budget</Typography>
            <Typography variant="h6">{budget.currency} {summary.totalBudget.toFixed(2)}</Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="subtitle2">Total Spent</Typography>
            <Typography variant="h6">{budget.currency} {summary.totalSpent.toFixed(2)}</Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="subtitle2">Remaining</Typography>
            <Typography variant="h6">{budget.currency} {summary.remaining.toFixed(2)}</Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="subtitle2">Exchange Rate</Typography>
            <Typography variant="h6">1 {budget.currency} = {exchangeRate?.rate.toFixed(4)} USD</Typography>
          </Grid>
        </Grid>
      </CardContent>
    </BrutalCard>
  )}

  <Grid container spacing={3} sx={{ background: '#B4F8C8', m: 0 }}>
    {summary?.categories.map((cat) => (
      <Grid item xs={12} md={6} key={cat.name}>
        <BrutalCard>
          <CardContent>
            <Typography variant="h6" sx={{ fontFamily: 'Archivo Black' }}>{cat.name}</Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Allocated: {budget.currency} {cat.allocated.toFixed(2)} | Spent: {budget.currency} {cat.spent.toFixed(2)}
            </Typography>
            <LinearProgress
              variant="determinate"
              value={Math.min((cat.spent / cat.allocated) * 100, 100)}
              color={cat.spent > cat.allocated ? 'error' : 'primary'}
              sx={{ height: 8, borderRadius: 4 }}
            />
            <TextField
              fullWidth
              label="Update Allocation"
              type="number"
              value={cat.allocated}
              onChange={(e) => handleUpdateAllocation(cat.name, e.target.value)}
              size="small"
              sx={{ mt: 2 }}
            />
          </CardContent>
        </BrutalCard>
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
              {budget?.categories ? (
  <Select
    value={formData.category}
    onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
    label="Category"
  >
    {budget.categories.map((category) => (
      <MenuItem key={category.name} value={category.name}>
        {category.name}
      </MenuItem>
    ))}
  </Select>
) : (
  <Typography variant="body2" sx={{ mt: 1, color: 'gray' }}>
    Budget not loaded. Please create a budget first.
  </Typography>
)}

            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              required
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Amount"
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData((prev) => ({ ...prev, amount: parseFloat(e.target.value) }))}
              required
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Date"
                value={formData.date}
                onChange={(date) => setFormData((prev) => ({ ...prev, date }))}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </LocalizationProvider>
          </Grid>

          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Payment Method</InputLabel>
              <Select
                value={formData.paymentMethod}
                onChange={(e) => setFormData((prev) => ({ ...prev, paymentMethod: e.target.value }))}
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
              onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
              multiline
              rows={2}
            />
          </Grid>

          <Grid item xs={12}>
            <Box display="flex" justifyContent="flex-end" gap={2}>
              <BrutalButton variant="outlined" onClick={() => setOpenDialog(false)}>
                Cancel
              </BrutalButton>
              <BrutalButton variant="contained" onClick={handleSaveExpense}>
                Add Expense
              </BrutalButton>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </DialogContent>
  </Dialog>

  <Dialog open={openBudgetDialog} onClose={() => setOpenBudgetDialog(false)}>
    <DialogTitle>{budget ? 'Edit Trip Budget' : 'Create Trip Budget'}</DialogTitle>
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
      <BrutalButton onClick={() => setOpenBudgetDialog(false)} variant="outlined">
        Cancel
      </BrutalButton>
      <BrutalButton onClick={handleCreateBudget}>
        {budget ? 'Update' : 'Create'}
      </BrutalButton>
    </DialogActions>
  </Dialog>
</Box>

  );
};

export default TripBudget;

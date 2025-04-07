import mongoose from 'mongoose';

const budgetSchema = new mongoose.Schema({
  tripId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trip',
    required: true,
  },
  totalBudget: {
    type: Number,
    required: true,
    min: 0,
  },
  currency: {
    type: String,
    required: true,
    default: 'USD',
  },
  categories: [{
    name: {
      type: String,
      required: true,
      enum: ['accommodation', 'transportation', 'food', 'activities', 'shopping', 'miscellaneous'],
    },
    allocated: {
      type: Number,
      required: true,
      min: 0,
    },
    spent: {
      type: Number,
      default: 0,
      min: 0,
    },
    items: [{
      description: {
        type: String,
        required: true,
      },
      amount: {
        type: Number,
        required: true,
        min: 0,
      },
      date: {
        type: Date,
        required: true,
      },
      paymentMethod: {
        type: String,
        enum: ['cash', 'credit_card', 'debit_card', 'mobile_payment', 'other'],
      },
      receipt: {
        type: String, // URL to receipt image or document
      },
      notes: {
        type: String,
      },
    }],
  }],
  savings: {
    type: Number,
    default: 0,
  },
  emergencyFund: {
    type: Number,
    default: 0,
  },
  exchangeRate: {
    type: Number,
    default: 1,
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
});

// Calculate total spent amount
budgetSchema.methods.calculateTotalSpent = function() {
  return this.categories.reduce((total, category) => total + category.spent, 0);
};

// Calculate remaining budget
budgetSchema.methods.calculateRemaining = function() {
  return this.totalBudget - this.calculateTotalSpent();
};

// Update lastUpdated timestamp before saving
budgetSchema.pre('save', function(next) {
  this.lastUpdated = Date.now();
  next();
});

// Create indexes for better query performance
budgetSchema.index({ tripId: 1 });
budgetSchema.index({ 'categories.name': 1 });

const Budget = mongoose.model('Budget', budgetSchema);

export default Budget; 
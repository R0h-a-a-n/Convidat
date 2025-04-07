import mongoose from 'mongoose';

const packingListSchema = new mongoose.Schema({
  tripId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trip',
    required: true,
  },
  categories: [{
    name: {
      type: String,
      required: true,
      enum: ['clothing', 'toiletries', 'electronics', 'documents', 'medications', 'miscellaneous'],
    },
    items: [{
      name: {
        type: String,
        required: true,
        trim: true,
      },
      quantity: {
        type: Number,
        required: true,
        min: 1,
        default: 1,
      },
      isPacked: {
        type: Boolean,
        default: false,
      },
      notes: {
        type: String,
        trim: true,
      },
      priority: {
        type: String,
        enum: ['essential', 'important', 'optional'],
        default: 'important',
      },
    }],
  }],
  weatherConsiderations: [{
    type: String,
    enum: ['hot', 'cold', 'rainy', 'sunny', 'windy'],
  }],
  specialRequirements: [{
    type: String,
    trim: true,
  }],
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
});

// Calculate total items
packingListSchema.methods.calculateTotalItems = function() {
  return this.categories.reduce((total, category) => 
    total + category.items.reduce((sum, item) => sum + item.quantity, 0), 0);
};

// Calculate packed items
packingListSchema.methods.calculatePackedItems = function() {
  return this.categories.reduce((total, category) => 
    total + category.items.filter(item => item.isPacked)
      .reduce((sum, item) => sum + item.quantity, 0), 0);
};

// Calculate packing progress
packingListSchema.methods.calculateProgress = function() {
  const total = this.calculateTotalItems();
  const packed = this.calculatePackedItems();
  return total > 0 ? (packed / total) * 100 : 0;
};

// Update lastUpdated timestamp before saving
packingListSchema.pre('save', function(next) {
  this.lastUpdated = Date.now();
  next();
});

// Create indexes for better query performance
packingListSchema.index({ tripId: 1 });
packingListSchema.index({ 'categories.name': 1 });

const PackingList = mongoose.model('PackingList', packingListSchema);

export default PackingList; 
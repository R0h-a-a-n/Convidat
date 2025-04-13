import PackingList from '../models/PackingList.js';

// Create a new packing list
export const createPackingList = async (req, res) => {
  try {
    const { tripId, categories, weatherConsiderations, specialRequirements } = req.body;

    const packingList = new PackingList({
      tripId,
      categories: categories || [
        { name: 'Clothing', items: [] },
        { name: 'Toiletries', items: [] },
        { name: 'Electronics', items: [] },
        { name: 'Documents', items: [] },
        { name: 'Medications', items: [] },
        { name: 'Miscellaneous', items: [] },
      ],
      weatherConsiderations,
      specialRequirements,
    });

    await packingList.save();

    res.status(201).json({
      success: true,
      data: packingList,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// Get packing list for a trip
export const getPackingList = async (req, res) => {
  try {
    const packingList = await PackingList.findOne({ tripId: req.params.tripId });

    if (!packingList) {
      return res.status(404).json({
        success: false,
        error: 'Packing list not found',
      });
    }

    res.status(200).json({
      success: true,
      data: packingList,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// Update packing list
export const updatePackingList = async (req, res) => {
  try {
    const packingList = await PackingList.findOne({ tripId: req.params.tripId });

    if (!packingList) {
      return res.status(404).json({
        success: false,
        error: 'Packing list not found',
      });
    }

    // Update packing list fields
    Object.keys(req.body).forEach(key => {
      packingList[key] = req.body[key];
    });

    await packingList.save();

    res.status(200).json({
      success: true,
      data: packingList,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// Add item to a category
export const addItem = async (req, res) => {
  try {
    const { category, name, quantity, notes, priority } = req.body;
    const packingList = await PackingList.findOne({ tripId: req.params.tripId });

    if (!packingList) {
      return res.status(404).json({
        success: false,
        error: 'Packing list not found',
      });
    }

    const categoryIndex = packingList.categories.findIndex(c => c.name === category);
    if (categoryIndex === -1) {
      return res.status(400).json({
        success: false,
        error: 'Invalid category',
      });
    }

    const item = {
      name,
      quantity: parseInt(quantity) || 1,
      isPacked: false,
      notes,
      priority: priority || 'important',
    };

    packingList.categories[categoryIndex].items.push(item);
    await packingList.save();

    res.status(200).json({
      success: true,
      data: packingList,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// Update item status
export const updateItemStatus = async (req, res) => {
  try {
    const { category, itemName, isPacked } = req.body;
    const packingList = await PackingList.findOne({ tripId: req.params.tripId });

    if (!packingList) {
      return res.status(404).json({
        success: false,
        error: 'Packing list not found',
      });
    }

    const categoryIndex = packingList.categories.findIndex(c => c.name === category);
    if (categoryIndex === -1) {
      return res.status(400).json({
        success: false,
        error: 'Invalid category',
      });
    }

    const itemIndex = packingList.categories[categoryIndex].items.findIndex(
      item => item.name === itemName
    );

    if (itemIndex === -1) {
      return res.status(400).json({
        success: false,
        error: 'Item not found',
      });
    }

    packingList.categories[categoryIndex].items[itemIndex].isPacked = isPacked;
    await packingList.save();

    res.status(200).json({
      success: true,
      data: packingList,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// Get packing progress
export const getPackingProgress = async (req, res) => {
  try {
    const packingList = await PackingList.findOne({ tripId: req.params.tripId });

    if (!packingList) {
      return res.status(404).json({
        success: false,
        error: 'Packing list not found',
      });
    }

    const progress = {
      totalItems: packingList.calculateTotalItems(),
      packedItems: packingList.calculatePackedItems(),
      progressPercentage: packingList.calculateProgress(),
      categories: packingList.categories.map(category => ({
        name: category.name,
        totalItems: category.items.reduce((sum, item) => sum + item.quantity, 0),
        packedItems: category.items
          .filter(item => item.isPacked)
          .reduce((sum, item) => sum + item.quantity, 0),
        progressPercentage: (category.items
          .filter(item => item.isPacked)
          .reduce((sum, item) => sum + item.quantity, 0) /
          category.items.reduce((sum, item) => sum + item.quantity, 0)) * 100 || 0,
      })),
    };

    res.status(200).json({
      success: true,
      data: progress,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// Generate suggested packing list
export const generateSuggestedList = async (req, res) => {
  try {
    const { tripId } = req.params;
    const { duration, weather, activities } = req.body;

    // This is a simplified example. In a real application, you would have
    // a more sophisticated algorithm for generating suggestions based on
    // trip details, weather, and planned activities.
    const suggestions = {
      clothing: generateClothingSuggestions(duration, weather),
      toiletries: generateToiletriesSuggestions(duration),
      electronics: generateElectronicsSuggestions(activities),
      documents: generateDocumentsSuggestions(),
      medications: generateMedicationsSuggestions(),
      miscellaneous: generateMiscellaneousSuggestions(activities),
    };

    res.status(200).json({
      success: true,
      data: suggestions,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// Helper functions for generating suggestions
function generateClothingSuggestions(duration, weather) {
  const baseItems = [
    { name: 'Underwear', quantity: Math.ceil(duration * 1.5) },
    { name: 'Socks', quantity: Math.ceil(duration * 1.5) },
    { name: 'T-shirts', quantity: Math.ceil(duration * 1.2) },
    { name: 'Pants/Shorts', quantity: Math.ceil(duration / 2) },
  ];

  if (weather.includes('cold')) {
    baseItems.push(
      { name: 'Warm jacket', quantity: 1 },
      { name: 'Sweaters', quantity: Math.ceil(duration / 3) },
      { name: 'Thermal underwear', quantity: Math.ceil(duration / 2) }
    );
  }

  if (weather.includes('rainy')) {
    baseItems.push(
      { name: 'Rain jacket', quantity: 1 },
      { name: 'Umbrella', quantity: 1 }
    );
  }

  return baseItems;
}

function generateToiletriesSuggestions(duration) {
  return [
    { name: 'Toothbrush', quantity: 1 },
    { name: 'Toothpaste', quantity: 1 },
    { name: 'Shampoo', quantity: 1 },
    { name: 'Soap', quantity: 1 },
    { name: 'Deodorant', quantity: 1 },
    { name: 'Razor', quantity: 1 },
    { name: 'Sunscreen', quantity: 1 },
    { name: 'First aid kit', quantity: 1 },
  ];
}

function generateElectronicsSuggestions(activities) {
  const baseItems = [
    { name: 'Phone charger', quantity: 1 },
    { name: 'Power bank', quantity: 1 },
    { name: 'Universal adapter', quantity: 1 },
  ];

  if (activities.includes('photography')) {
    baseItems.push(
      { name: 'Camera', quantity: 1 },
      { name: 'Camera charger', quantity: 1 },
      { name: 'Extra memory cards', quantity: 2 }
    );
  }

  return baseItems;
}

function generateDocumentsSuggestions() {
  return [
    { name: 'Passport', quantity: 1 },
    { name: 'Travel insurance', quantity: 1 },
    { name: 'Flight tickets', quantity: 1 },
    { name: 'Hotel reservations', quantity: 1 },
    { name: 'Emergency contacts', quantity: 1 },
  ];
}

function generateMedicationsSuggestions() {
  return [
    { name: 'Prescription medications', quantity: 1 },
    { name: 'Pain relievers', quantity: 1 },
    { name: 'Motion sickness pills', quantity: 1 },
    { name: 'Antihistamines', quantity: 1 },
  ];
}

function generateMiscellaneousSuggestions(activities) {
  const baseItems = [
    { name: 'Water bottle', quantity: 1 },
    { name: 'Snacks', quantity: 1 },
    { name: 'Travel pillow', quantity: 1 },
    { name: 'Earplugs', quantity: 1 },
    { name: 'Eye mask', quantity: 1 },
  ];

  if (activities.includes('hiking')) {
    baseItems.push(
      { name: 'Hiking boots', quantity: 1 },
      { name: 'Backpack', quantity: 1 },
      { name: 'Water purification tablets', quantity: 1 }
    );
  }

  if (activities.includes('swimming')) {
    baseItems.push(
      { name: 'Swimsuit', quantity: 1 },
      { name: 'Towel', quantity: 1 },
      { name: 'Flip flops', quantity: 1 }
    );
  }

  return baseItems;
}

// Update a specific item
export const updateItem = async (req, res) => {
  try {
    const { category, isPacked } = req.body;
    const { tripId, itemId } = req.params;

    console.log('Updating item:', { tripId, itemId, category, isPacked });

    const packingList = await PackingList.findOne({ tripId });

    if (!packingList) {
      return res.status(404).json({
        success: false,
        error: 'Packing list not found',
      });
    }

    const categoryIndex = packingList.categories.findIndex(c => c.name === category);
    if (categoryIndex === -1) {
      return res.status(400).json({
        success: false,
        error: 'Category not found',
      });
    }

    const itemIndex = packingList.categories[categoryIndex].items.findIndex(
      item => item._id.toString() === itemId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Item not found',
      });
    }

    // Update the isPacked status
    packingList.categories[categoryIndex].items[itemIndex].isPacked = isPacked;
    console.log('Saving item with isPacked:', isPacked);

    await packingList.save();
    console.log('PackingList saved successfully');

    res.status(200).json({
      success: true,
      data: packingList,
    });
  } catch (error) {
    console.error('Error updating item:', error);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// Delete a specific item
export const deleteItem = async (req, res) => {
  try {
    const { category } = req.body;
    const { tripId, itemId } = req.params;

    console.log('Deleting item:', { tripId, itemId, category });

    const packingList = await PackingList.findOne({ tripId });

    if (!packingList) {
      return res.status(404).json({
        success: false,
        error: 'Packing list not found',
      });
    }

    const categoryIndex = packingList.categories.findIndex(c => c.name === category);
    if (categoryIndex === -1) {
      return res.status(400).json({
        success: false,
        error: 'Category not found',
      });
    }

    const itemIndex = packingList.categories[categoryIndex].items.findIndex(
      item => item._id.toString() === itemId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Item not found',
      });
    }

    // Remove the item
    packingList.categories[categoryIndex].items.splice(itemIndex, 1);

    await packingList.save();

    res.status(200).json({
      success: true,
      data: packingList,
    });
  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
}; 
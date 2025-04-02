const express = require('express');
const router = express.Router();
const carbonController = require('../controllers/carbonController');
const authMiddleware = require('../middleware/auth');

// Apply auth middleware to all routes
router.use(authMiddleware);

// Routes
router.post('/footprint', carbonController.addCarbonFootprint);
router.put('/footprint/:id', carbonController.updateCarbonFootprint);
router.delete('/footprint/:id', carbonController.deleteCarbonFootprint);
router.get('/footprint', carbonController.getUserCarbonFootprint);
router.get('/footprint/total', carbonController.getTotalCarbonFootprint);
router.get('/footprint/range', carbonController.getCarbonFootprintByDateRange);

module.exports = router; 
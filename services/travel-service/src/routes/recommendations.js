const express = require('express');
const router = express.Router();
const { getRecommendations } = require('../controllers/recommendationsController');

// Get travel recommendations
router.get('/recommendations', getRecommendations);

module.exports = router; 
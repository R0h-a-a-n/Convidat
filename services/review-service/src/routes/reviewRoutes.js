const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');

// Get all reviews with statistics
router.get('/', reviewController.getReviews);

// Create a new review
router.post('/', reviewController.createReview);

// Get review statistics
router.get('/stats', reviewController.getReviewStats);

module.exports = router; 
const Review = require('../models/Review');

// Get all reviews with statistics
exports.getReviews = async (req, res) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 });
    
    // Calculate average rating
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;
    
    // Calculate feature statistics
    const featureStats = reviews.reduce((stats, review) => {
      review.features.forEach(feature => {
        stats[feature] = (stats[feature] || 0) + 1;
      });
      return stats;
    }, {});

    res.json({
      success: true,
      data: {
        reviews,
        statistics: {
          totalReviews: reviews.length,
          averageRating: averageRating.toFixed(1),
          featureStats
        }
      }
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching reviews',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Create a new review
exports.createReview = async (req, res) => {
  try {
    const { userName, rating, title, comment, features } = req.body;

    // Validate required fields
    if (!userName || !rating || !title || !comment || !features) {
      return res.status(400).json({
        success: false,
        error: 'Please provide all required fields',
        details: {
          userName: !userName ? 'Name is required' : undefined,
          rating: !rating ? 'Rating is required' : undefined,
          title: !title ? 'Title is required' : undefined,
          comment: !comment ? 'Comment is required' : undefined,
          features: !features ? 'At least one feature must be selected' : undefined
        }
      });
    }

    // Validate rating range
    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        error: 'Rating must be between 1 and 5'
      });
    }

    // Validate features
    if (!Array.isArray(features) || features.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'At least one feature must be selected'
      });
    }

    const review = await Review.create({
      userName,
      rating,
      title,
      comment,
      features
    });

    res.status(201).json({
      success: true,
      data: review
    });
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({
      success: false,
      error: 'Error creating review',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get review statistics
exports.getReviewStats = async (req, res) => {
  try {
    const stats = await Review.aggregate([
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
          featureCounts: {
            $push: '$features'
          }
        }
      }
    ]);

    if (stats.length === 0) {
      return res.json({
        success: true,
        data: {
          averageRating: 0,
          totalReviews: 0,
          featureStats: {}
        }
      });
    }

    // Calculate feature statistics
    const featureStats = stats[0].featureCounts.reduce((acc, features) => {
      features.forEach(feature => {
        acc[feature] = (acc[feature] || 0) + 1;
      });
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        averageRating: stats[0].averageRating.toFixed(1),
        totalReviews: stats[0].totalReviews,
        featureStats
      }
    });
  } catch (error) {
    console.error('Error fetching review statistics:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching review statistics'
    });
  }
}; 
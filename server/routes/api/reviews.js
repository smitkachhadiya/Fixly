const express = require('express');
const { createReview, getProviderReviews } = require('../../controllers/reviewController');
const { protect, authorize } = require('../../middleware/auth');

const router = express.Router();

// Public routes
router.get('/provider/:providerId', getProviderReviews);

// Protected routes
router.post('/', protect, authorize('customer'), createReview);

module.exports = router;
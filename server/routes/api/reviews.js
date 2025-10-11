const express = require('express');
const { createReview, getProviderReviews, getListingReviews } = require('../../controllers/reviewController');
const { protect, authorize } = require('../../middleware/auth');

const router = express.Router();

// Public routes
router.get('/provider/:providerId', getProviderReviews);
router.get('/listing/:listingId', getListingReviews);

// Protected routes
router.post('/', protect, authorize('customer'), createReview);

module.exports = router;
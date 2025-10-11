const express = require('express');
const { createReview } = require('../../controllers/reviewController');
const { protect, authorize } = require('../../middleware/auth');

const router = express.Router();

// Protected routes
router.post('/', protect, authorize('customer'), createReview);

module.exports = router;
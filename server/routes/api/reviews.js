const express = require('express');
const {
  createReview,
  getProviderReviews,
  getListingReviews,
  getReviewById,
  updateReview,
  deleteReview
} = require('../../controllers/reviewController');

const { protect, authorize } = require('../../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', async (req, res) => {
  try {
    const Review = require('../../models/Review');
    const reviews = await Review.find()
      .populate({
        path: 'customerId',
        select: 'firstName lastName profilePicture'
      })
      .sort({ reviewDateTime: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
});
router.get('/provider/:providerId', getProviderReviews);
router.get('/listing/:listingId', getListingReviews);
router.get('/:id', getReviewById);

// Protected routes
router.post('/', protect, authorize('customer'), createReview);
router.put('/:id', protect, authorize('customer'), updateReview);
router.delete('/:id', protect, authorize('customer', 'admin'), deleteReview);

module.exports = router;
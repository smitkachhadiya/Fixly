const Review = require('../models/Review');
const Booking = require('../models/Booking');
const ServiceListing = require('../models/ServiceListing');
const ServiceProvider = require('../models/ServiceProvider');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Create a new review
// @route   POST /api/reviews
// @access  Private (Customer only)
exports.createReview = asyncHandler(async (req, res) => {
  const { bookingId, rating, reviewText } = req.body;
  
  // Validate required fields
  if (!bookingId || !rating || !reviewText) {
    return res.status(400).json({
      success: false,
      message: 'Please provide all required fields'
    });
  }
  
  // Check if booking exists and belongs to the customer
  const booking = await Booking.findById(bookingId);
  
  if (!booking) {
    return res.status(404).json({
      success: false,
      message: 'Booking not found'
    });
  }
  
  // Verify the booking belongs to the customer
  if (booking.customerId.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to review this booking'
    });
  }
  
  // Check if booking is completed
  if (booking.bookingStatus !== 'Completed') {
    return res.status(400).json({
      success: false,
      message: 'Cannot review a booking that is not completed'
    });
  }
  
  // Check if review already exists
  const existingReview = await Review.findOne({ bookingId });
  
  if (existingReview) {
    return res.status(400).json({
      success: false,
      message: 'Review already exists for this booking'
    });
  }
  
  // Create review
  const review = await Review.create({
    bookingId,
    customerId: req.user.id,
    rating,
    reviewText
  });
  
  res.status(201).json({
    success: true,
    data: review
  });
});

// @desc    Get reviews for a service provider
// @route   GET /api/reviews/provider/:providerId
// @access  Public
exports.getProviderReviews = asyncHandler(async (req, res) => {
  const providerId = req.params.providerId;
  
  // Find bookings for this provider
  const bookings = await Booking.find({ 
    serviceProviderId: providerId,
    bookingStatus: 'Completed'
  });
  
  const bookingIds = bookings.map(booking => booking._id);
  
  // Find reviews for these bookings
  const reviews = await Review.find({ bookingId: { $in: bookingIds } })
    .populate({
      path: 'customerId',
      select: 'firstName lastName profilePicture'
    })
    .populate({
      path: 'bookingId',
      populate: {
        path: 'serviceListingId',
        select: 'serviceTitle'
      }
    })
    .sort({ reviewDateTime: -1 });
  
  res.status(200).json({
    success: true,
    count: reviews.length,
    data: reviews
  });
});

// @desc    Get reviews for a service listing
// @route   GET /api/reviews/listing/:listingId
// @access  Public
exports.getListingReviews = asyncHandler(async (req, res) => {
  const listingId = req.params.listingId;
  
  // Find bookings for this listing
  const bookings = await Booking.find({ 
    serviceListingId: listingId,
    bookingStatus: 'Completed'
  });
  
  const bookingIds = bookings.map(booking => booking._id);
  
  // Find reviews for these bookings
  const reviews = await Review.find({ bookingId: { $in: bookingIds } })
    .populate({
      path: 'customerId',
      select: 'firstName lastName profilePicture'
    })
    .populate({
      path: 'bookingId'
    })
    .sort({ reviewDateTime: -1 });
  
  res.status(200).json({
    success: true,
    count: reviews.length,
    data: reviews
  });
});
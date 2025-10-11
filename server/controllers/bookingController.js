const Booking = require('../models/Booking');
const ServiceListing = require('../models/ServiceListing');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Private (Customer only)
exports.createBooking = asyncHandler(async (req, res) => {
  const { 
    serviceListingId, 
    serviceDateTime, 
    specialInstructions 
  } = req.body;
  
  // Validate required fields
  if (!serviceListingId || !serviceDateTime) {
    return res.status(400).json({
      success: false,
      message: 'Please provide all required fields'
    });
  }
  
  // Get service listing details
  const serviceListing = await ServiceListing.findById(serviceListingId);
  
  if (!serviceListing) {
    return res.status(404).json({
      success: false,
      message: 'Service listing not found'
    });
  }
  
  // Check if service listing is active
  if (!serviceListing.isActive) {
    return res.status(400).json({
      success: false,
      message: 'This service is currently unavailable'
    });
  }
  
  // Create booking
  const booking = await Booking.create({
    customerId: req.user.id,
    serviceProviderId: serviceListing.serviceProviderId,
    serviceListingId,
    serviceDateTime: new Date(serviceDateTime),
    specialInstructions,
    totalAmount: serviceListing.servicePrice
  });
  
  res.status(201).json({
    success: true,
    data: booking
  });
});

// @desc    Get all bookings for a customer
// @route   GET /api/bookings/customer
// @access  Private (Customer only)
exports.getCustomerBookings = asyncHandler(async (req, res) => {
  console.log('User ID:', req.user.id);
  console.log('User Type:', req.user.userType);
  
  const bookings = await Booking.find({ customerId: req.user.id })
    .populate({
      path: 'serviceListingId',
      select: 'serviceTitle servicePrice serviceImage',
      populate: {
        path: 'categoryId',
        select: 'categoryName'
      }
    })
    .populate({
      path: 'serviceProviderId',
      select: 'userId',
      populate: {
        path: 'userId',
        select: 'firstName lastName profilePicture'
      }
    })
    .sort({ bookingDateTime: -1 });
  
  console.log('Found bookings:', bookings.length);
  
  // Mongoose find() returns an empty array if no bookings found, so no need for explicit check
  
  res.status(200).json({
    success: true,
    count: bookings.length,
    data: bookings
  });
});
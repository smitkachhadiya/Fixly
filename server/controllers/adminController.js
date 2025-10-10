const ServiceProvider = require('../models/ServiceProvider');
const User = require('../models/User');
const ServiceListing = require('../models/ServiceListing');
const Booking = require('../models/Booking');
const Complaint = require('../models/Complaint');
const AdminEarnings = require('../models/AdminEarnings');
const Payment = require('../models/Payment');
const Review = require('../models/Review');
const Commission = require('../models/Commission');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Update service provider verification status
// @route   PUT /api/admin/providers/:id/verify
// @access  Private (Admin only)
exports.updateProviderVerificationStatus = asyncHandler(async (req, res) => {
  const { verificationStatus } = req.body;

  // Validate status
  if (!verificationStatus || !['Pending', 'Verified', 'Rejected'].includes(verificationStatus)) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid verification status'
    });
  }

  // Find the service provider
  const serviceProvider = await ServiceProvider.findById(req.params.id);

  if (!serviceProvider) {
    return res.status(404).json({
      success: false,
      message: 'Service provider not found'
    });
  }

  // Update verification status
  serviceProvider.verificationStatus = verificationStatus;
  await serviceProvider.save();

  // Get the updated provider with populated fields
  const updatedProvider = await ServiceProvider.findById(req.params.id)
    .populate('userId', 'firstName lastName email profilePicture')
    .populate('serviceCategory', 'categoryName');

  res.status(200).json({
    success: true,
    data: updatedProvider
  });
});

// @desc    Get admin dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Private (Admin only)
exports.getDashboardStats = asyncHandler(async (req, res) => {
  // Get date range from query params
  const { startDate, endDate } = req.query;

  // Set up date filters
  let dateFilter = {};
  if (startDate && endDate) {
    dateFilter = {
      createdAt: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    };
  } else if (startDate) {
    dateFilter = {
      createdAt: { $gte: new Date(startDate) }
    };
  } else if (endDate) {
    dateFilter = {
      createdAt: { $lte: new Date(endDate) }
    };
  }

  // Get user counts
  const totalUsers = await User.countDocuments({ userType: 'user', ...dateFilter });
  const totalProviders = await ServiceProvider.countDocuments(dateFilter);
  const verifiedProviders = await ServiceProvider.countDocuments({ verificationStatus: 'Verified', ...dateFilter });
  const pendingProviders = await ServiceProvider.countDocuments({ verificationStatus: 'Pending', ...dateFilter });

  // Get new users in the last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const newUsers = await User.countDocuments({
    userType: 'user',
    createdAt: { $gte: thirtyDaysAgo }
  });

  // Calculate user growth percentage
  const sixtyDaysAgo = new Date();
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
  const previousPeriodUsers = await User.countDocuments({
    userType: 'user',
    createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo }
  });
  const userGrowth = previousPeriodUsers > 0
    ? ((newUsers - previousPeriodUsers) / previousPeriodUsers * 100).toFixed(1)
    : 100;

  // Get listing statistics
  const totalListings = await ServiceListing.countDocuments({ isActive: true, ...dateFilter });

  // Get booking statistics
  const totalBookings = await Booking.countDocuments(dateFilter);
  const pendingBookings = await Booking.countDocuments({ bookingStatus: 'Pending', ...dateFilter });
  const completedBookings = await Booking.countDocuments({ bookingStatus: 'Completed', ...dateFilter });
  const cancelledBookings = await Booking.countDocuments({ bookingStatus: 'Cancelled', ...dateFilter });

  // Calculate booking conversion rate
  const conversionRate = totalBookings > 0
    ? (completedBookings / totalBookings * 100).toFixed(1)
    : 0;


});

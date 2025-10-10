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


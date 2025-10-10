const ServiceProvider = require('../models/ServiceProvider');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const { cloudinary } = require('../config/cloudinary');

// @desc    Upload service provider profile image
// @route   PUT /api/providers/profile/image
// @access  Private (service providers only)
exports.uploadProviderProfileImage = asyncHandler(async (req, res) => {
  const serviceProvider = await ServiceProvider.findOne({ userId: req.user.id })
    .populate('userId');

  if (!serviceProvider) {
    return res.status(404).json({
      success: false,
      message: 'Service provider profile not found'
    });
  }

  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'Please upload an image'
    });
  }

  // Delete the old image from Cloudinary if it exists and it's not the default
  if (serviceProvider.userId.profilePicture && serviceProvider.userId.profilePicture !== 'default-profile.jpg') {
    const publicId = serviceProvider.userId.profilePicture.split('/').pop().split('.')[0];
    await cloudinary.uploader.destroy(`fixly/profiles/${publicId}`);
  }

  // Update user with new profile image URL
  serviceProvider.userId.profilePicture = req.file.path;
  await serviceProvider.userId.save();

  res.status(200).json({
    success: true,
    data: serviceProvider
  });
});
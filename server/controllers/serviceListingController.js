const ServiceListing = require('../models/ServiceListing');
const ServiceProvider = require('../models/ServiceProvider');
const asyncHandler = require('../utils/asyncHandler');
const { cloudinary } = require('../config/cloudinary');

// @desc    Upload service listing image
// @route   PUT /api/listings/:id/image
// @access  Private (Service provider who owns the listing)
exports.uploadListingImage = asyncHandler(async (req, res) => {
  const listing = await ServiceListing.findById(req.params.id);

  if (!listing) {
    return res.status(404).json({
      success: false,
      message: 'Service listing not found'
    });
  }

  // Find the service provider profile for the current user
  const serviceProvider = await ServiceProvider.findOne({ userId: req.user.id });

  // Check if the listing belongs to the provider
  if (!serviceProvider || listing.serviceProviderId.toString() !== serviceProvider._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'You are not authorized to update this listing'
    });
  }

  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'Please upload an image'
    });
  }

  // Delete the old image from Cloudinary if it exists
  if (listing.serviceImage) {
    const publicId = listing.serviceImage.split('/').pop().split('.')[0];
    await cloudinary.uploader.destroy(`fixly/services/${publicId}`);
  }

  // Update listing with image URL
  listing.serviceImage = req.file.path;
  await listing.save();

  res.status(200).json({
    success: true,
    data: listing
  });
});

// @desc    Delete service listing image
// @route   DELETE /api/listings/:id/image
// @access  Private (Service provider who owns the listing)
exports.deleteListingImage = asyncHandler(async (req, res) => {
  const listing = await ServiceListing.findById(req.params.id);

  if (!listing) {
    return res.status(404).json({
      success: false,
      message: 'Service listing not found'
    });
  }

  // Find the service provider profile for the current user
  const serviceProvider = await ServiceProvider.findOne({ userId: req.user.id });

  // Check if the listing belongs to the provider
  if (!serviceProvider || listing.serviceProviderId.toString() !== serviceProvider._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'You are not authorized to update this listing'
    });
  }

  // Delete the image from Cloudinary if it exists
  if (listing.serviceImage) {
    const publicId = listing.serviceImage.split('/').pop().split('.')[0];
    await cloudinary.uploader.destroy(`fixly/services/${publicId}`);
    
    // Remove image URL from listing
    listing.serviceImage = '';
    await listing.save();
  }

  res.status(200).json({
    success: true,
    data: listing
  });
});
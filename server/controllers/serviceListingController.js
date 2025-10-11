const ServiceListing = require('../models/ServiceListing');
const ServiceProvider = require('../models/ServiceProvider');
const asyncHandler = require('../utils/asyncHandler');
const { cloudinary } = require('../config/cloudinary');

// @desc    Create a new service listing
// @route   POST /api/listings
// @access  Private (Service providers only)
exports.createListing = asyncHandler(async (req, res) => {
  const {
    categoryId,
    serviceTitle,
    servicePrice,
    serviceDetails,
    tags,
    duration,
    serviceLocation
  } = req.body;

  console.log('Received data:', req.body);

  // Get image URL from file upload if available
  const serviceImage = req.file ? req.file.path : null;
  console.log('Image URL received:', serviceImage);

  // Find the service provider profile for the current user
  const serviceProvider = await ServiceProvider.findOne({ userId: req.user.id });

  if (!serviceProvider) {
    return res.status(404).json({
      success: false,
      message: 'Service provider profile not found. Please complete your profile first.'
    });
  }

  // Check if provider is verified
  if (serviceProvider.verificationStatus !== 'Verified') {
    return res.status(403).json({
      success: false,
      message: 'Your account must be verified before creating service listings'
    });
  }

  // Create the service listing with the image URL
  const listing = await ServiceListing.create({
    serviceProviderId: serviceProvider._id,
    categoryId,
    serviceTitle,
    servicePrice: parseFloat(servicePrice),
    serviceDetails,
    serviceImage: serviceImage || '', // Ensure we have a default value
    duration: duration ? parseInt(duration) : 0,
    serviceLocation: serviceLocation || '',
    tags: tags ? tags.split(',').map(tag => tag.trim()) : []
  });

  console.log('Created listing with image:', listing);

  res.status(201).json({
    success: true,
    data: listing
  });
});

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
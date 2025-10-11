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

// @desc    Get all service listings (with filtering)
// @route   GET /api/listings
// @access  Public
exports.getListings = asyncHandler(async (req, res) => {
  let query = { isActive: true };

  // Filter by category if provided
  if (req.query.category) {
    query.categoryId = req.query.category;
  }

  // Filter by provider if provided
  if (req.query.provider) {
    query.serviceProviderId = req.query.provider;
  }

  // Filter by price range if provided
  if (req.query.minPrice || req.query.maxPrice) {
    query.servicePrice = {};
    if (req.query.minPrice) query.servicePrice.$gte = parseFloat(req.query.minPrice);
    if (req.query.maxPrice) query.servicePrice.$lte = parseFloat(req.query.maxPrice);
  }

  // Filter by tags if provided
  if (req.query.tags) {
    const tagList = req.query.tags.split(',').map(tag => tag.trim());
    query.tags = { $in: tagList };
  }

  // Search by title or details
  if (req.query.search) {
    const searchRegex = new RegExp(req.query.search, 'i');
    query.$or = [
      { serviceTitle: searchRegex },
      { serviceDetails: searchRegex }
    ];
  }

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;

  // Sorting
  let sort = {};
  if (req.query.sort) {
    if (req.query.sort === 'price-asc') {
      sort = { servicePrice: 1 };
    } else if (req.query.sort === 'price-desc') {
      sort = { servicePrice: -1 };
    } else if (req.query.sort === 'rating') {
      sort = { averageRating: -1 };
    } else if (req.query.sort === 'newest') {
      sort = { createdAt: -1 };
    }
  } else {
    sort = { createdAt: -1 }; // Default sort by newest
  }

  const listings = await ServiceListing.find(query)
    .populate('serviceProviderId', 'rating')
    .populate('categoryId', 'categoryName')
    .sort(sort)
    .skip(startIndex)
    .limit(limit);

  const total = await ServiceListing.countDocuments(query);

  res.status(200).json({
    success: true,
    count: listings.length,
    pagination: {
      total,
      page,
      pages: Math.ceil(total / limit)
    },
    data: listings
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
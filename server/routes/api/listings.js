const express = require('express');
const {
  createListing,
  getListings,
  uploadListingImage,
  deleteListingImage
} = require('../../controllers/serviceListingController');

const { protect, authorize } = require('../../middleware/auth');
const { serviceImageUpload } = require('../../config/cloudinary');
const { validateFileType, validateFileSize } = require('../../middleware/fileValidation');

const router = express.Router();

// Public routes
router.get('/', getListings);

// Service provider routes
router.post(
  '/',
  protect,
  authorize('service_provider'),
  serviceImageUpload.single('serviceImage'),
  validateFileType,
  validateFileSize(5), // 5MB limit for service images
  createListing
);

// Service provider routes for image management
router.put(
  '/:id/image',
  protect,
  authorize('service_provider'),
  serviceImageUpload.single('image'),
  validateFileType,
  validateFileSize(5), // 5MB limit for service images
  uploadListingImage
);

router.delete(
  '/:id/image',
  protect,
  authorize('service_provider'),
  deleteListingImage
);

module.exports = router;
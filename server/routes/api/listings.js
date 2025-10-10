const express = require('express');
const {
  uploadListingImage,
  deleteListingImage
} = require('../../controllers/serviceListingController');

const { protect, authorize } = require('../../middleware/auth');
const { serviceImageUpload } = require('../../config/cloudinary');
const { validateFileType, validateFileSize } = require('../../middleware/fileValidation');

const router = express.Router();

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
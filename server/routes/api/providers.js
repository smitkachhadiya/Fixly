const express = require('express');
const {
  uploadProviderProfileImage
} = require('../../controllers/serviceProviderController');

const { protect, authorize } = require('../../middleware/auth');
const { profileImageUpload } = require('../../config/cloudinary');
const { validateFileType, validateFileSize } = require('../../middleware/fileValidation');

const router = express.Router();

// Profile image upload route
router.put('/profile/image',
  protect,
  authorize('service_provider'),
  profileImageUpload.single('image'),
  validateFileType,
  validateFileSize(2), // 2MB limit for profile images
  uploadProviderProfileImage
);

module.exports = router;
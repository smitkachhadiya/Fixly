const express = require('express');
const {
  registerAsProvider,
  getProviderProfile,
  updateProviderProfile,
  getServiceProviders,
  getServiceProviderById,
  getProviderListings,
  updateProviderLocation,
  uploadProviderProfileImage
} = require('../../controllers/serviceProviderController');

const { protect, authorize } = require('../../middleware/auth');
const { profileImageUpload } = require('../../config/cloudinary');
const { validateFileType, validateFileSize } = require('../../middleware/fileValidation');
const { validateProviderRegistration } = require('../../middleware/validateProvider');

const router = express.Router();

// Public routes
router.get('/', getServiceProviders);
router.get('/:id', getServiceProviderById);

// Register as service provider (public) - Add validation middleware
router.post('/register', validateProviderRegistration, registerAsProvider);

// Protected routes
router.get('/me', protect, authorize('service_provider'), getProviderProfile);
router.put('/profile', protect, authorize('service_provider'), updateProviderProfile);
router.put('/location', protect, authorize('service_provider'), updateProviderLocation);
router.get('/me/listings', protect, authorize('service_provider'), getProviderListings);

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
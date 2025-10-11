const express = require('express');
const {
  uploadCategoryImage
} = require('../../controllers/serviceCategoryController');

const { protect, authorize } = require('../../middleware/auth');
const { categoryImageUpload } = require('../../config/cloudinary');
const { validateFileType, validateFileSize } = require('../../middleware/fileValidation');

const router = express.Router();

// Category image upload route
router.put('/:id/image',
  protect,
  authorize('admin'),
  categoryImageUpload.single('image'),
  validateFileType,
  validateFileSize(2), // 2MB limit for category images
  uploadCategoryImage
);

module.exports = router;
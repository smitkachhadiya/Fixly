const ServiceCategory = require('../models/ServiceCategory');
const asyncHandler = require('../utils/asyncHandler');
const { cloudinary } = require('../config/cloudinary');

// @desc    Get all service categories
// @route   GET /api/categories
// @access  Public
exports.getCategories = asyncHandler(async (req, res) => {
  const categories = await ServiceCategory.find({ isActive: true });
  
  res.status(200).json({
    success: true,
    count: categories.length,
    data: categories
  });
});

// @desc    Get single category
// @route   GET /api/categories/:id
// @access  Public
exports.getCategory = asyncHandler(async (req, res) => {
  const category = await ServiceCategory.findById(req.params.id);
  
  if (!category || !category.isActive) {
    return res.status(404).json({
      success: false,
      message: 'Category not found'
    });
  }
  
  res.status(200).json({
    success: true,
    data: category
  });
});

// @desc    Create new category
// @route   POST /api/categories
// @access  Private/Admin
exports.createCategory = asyncHandler(async (req, res) => {
  const { categoryName, categoryDescription } = req.body;
  
  const category = await ServiceCategory.create({
    categoryName,
    categoryDescription
  });
  
  res.status(201).json({
    success: true,
    data: category
  });
});

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private/Admin
exports.updateCategory = asyncHandler(async (req, res) => {
  const { categoryName, categoryDescription, isActive } = req.body;
  
  let category = await ServiceCategory.findById(req.params.id);
  
  if (!category) {
    return res.status(404).json({
      success: false,
      message: 'Category not found'
    });
  }
  
  // Update fields
  if (categoryName) category.categoryName = categoryName;
  if (categoryDescription) category.categoryDescription = categoryDescription;
  if (isActive !== undefined) category.isActive = isActive;
  
  await category.save();
  
  res.status(200).json({
    success: true,
    data: category
  });
});

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
exports.deleteCategory = asyncHandler(async (req, res) => {
  const category = await ServiceCategory.findById(req.params.id);
  
  if (!category) {
    return res.status(404).json({
      success: false,
      message: 'Category not found'
    });
  }
  
  await category.remove();
  
  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Upload category image
// @route   PUT /api/categories/:id/image
// @access  Private/Admin
exports.uploadCategoryImage = asyncHandler(async (req, res) => {
  const category = await ServiceCategory.findById(req.params.id);
  
  if (!category) {
    return res.status(404).json({
      success: false,
      message: 'Category not found'
    });
  }
  
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'Please upload an image'
    });
  }
  
  // Update category with image URL
  category.categoryImage = req.file.path;
  await category.save();
  
  res.status(200).json({
    success: true,
    data: category
  });
});
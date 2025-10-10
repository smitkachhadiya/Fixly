const asyncHandler = require('../utils/asyncHandler');

// Validation middleware for service provider registration
exports.validateProviderRegistration = asyncHandler(async (req, res, next) => {
  const {
    firstName,
    lastName,
    email,
    password,
    phone,
    serviceDescription,
    serviceCategory
  } = req.body;

  // Check for required fields
  if (!firstName) {
    return res.status(400).json({
      success: false,
      message: 'First name is required'
    });
  }

  if (!lastName) {
    return res.status(400).json({
      success: false,
      message: 'Last name is required'
    });
  }

  if (!email) {
    return res.status(400).json({
      success: false,
      message: 'Email is required'
    });
  }

  // Email format validation
  const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid email address'
    });
  }

  if (!password) {
    return res.status(400).json({
      success: false,
      message: 'Password is required'
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'Password must be at least 6 characters'
    });
  }

  if (!phone) {
    return res.status(400).json({
      success: false,
      message: 'Phone number is required'
    });
  }

  if (!serviceDescription) {
    return res.status(400).json({
      success: false,
      message: 'Service description is required'
    });
  }

  if (!serviceCategory) {
    return res.status(400).json({
      success: false,
      message: 'Service category is required'
    });
  }

  next();
});
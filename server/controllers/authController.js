const crypto = require('crypto');
const User = require('../models/User');
const asyncHandler = require('express-async-handler');
const sendEmail = require('../utils/sendEmail');
const { error } = require('console');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res) => {
  const {
    userType,
    username,
    password,
    firstName,
    lastName,
    email,
    phone,
    address
  } = req.body;

  // Create user
  try{
  const user = await User.create({
    userType,
    username,
    password,
    firstName,
    lastName,
    email,
    phone,
    address
  });

  sendTokenResponse(user, 201, res);
}catch(err){
  console.error(err);
  res.status(500).json({
    sucess : false,
    message : 'Server error'
  });
}
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validate email & password
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Please provide an email and password'
    });
  }

  // Check for user
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }

  // Check if password matches
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }

  // Check if user is active
  if (!user.isActive) {
    return res.status(401).json({
      success: false,
      message: 'Your account has been deactivated. Please contact support.'
    });
  }

  sendTokenResponse(user, 200, res);
});

// @desc    Log user out / clear cookie
// @route   GET /api/auth/logout
// @access  Private
exports.logout = asyncHandler(async (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Update user details
// @route   PUT /api/auth/updatedetails
// @access  Private
exports.updateDetails = asyncHandler(async (req, res) => {
  const fieldsToUpdate = {
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    phone: req.body.phone,
    address: req.body.address
  };

  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Update user profile
// @route   PUT /api/auth/updateprofile
// @access  Private
exports.updateProfile = asyncHandler(async (req, res) => {
  // Create an object with only the fields that are provided in the request
  const fieldsToUpdate = {};

  // Only add fields that are present in the request body
  if (req.body.firstName) fieldsToUpdate.firstName = req.body.firstName;
  if (req.body.lastName) fieldsToUpdate.lastName = req.body.lastName;
  if (req.body.email) fieldsToUpdate.email = req.body.email;
  if (req.body.phone) fieldsToUpdate.phone = req.body.phone;

  // Handle address field - can be either direct or from businessAddress
  if (req.body.address) fieldsToUpdate.address = req.body.address;
  else if (req.body.businessAddress) fieldsToUpdate.address = req.body.businessAddress;

  if (req.body.businessName) fieldsToUpdate.businessName = req.body.businessName;
  if (req.body.description) fieldsToUpdate.description = req.body.description;

  // Add profile picture if it's in the request
  if (req.body.profilePicture) {
    fieldsToUpdate.profilePicture = req.body.profilePicture;
  }

  console.log('Fields to update:', fieldsToUpdate);

  try {
    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true
    });

    console.log('Updated user:', user);

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message
    });
  }
});

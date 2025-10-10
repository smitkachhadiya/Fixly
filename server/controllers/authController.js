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

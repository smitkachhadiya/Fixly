const express = require('express');
const { protect, authorize } = require('../../middleware/auth');
const ServiceListing = require('../../models/ServiceListing');
const asyncHandler = require('express-async-handler');

const router = express.Router();


module.exports = router;

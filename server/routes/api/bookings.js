const express = require('express');
const { createBooking } = require('../../controllers/bookingController');
const { protect, authorize } = require('../../middleware/auth');

const router = express.Router();

// Create booking route
router.post('/', protect, authorize('user'), createBooking);

module.exports = router;
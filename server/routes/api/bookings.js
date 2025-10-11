const express = require('express');
const { createBooking, getCustomerBookings } = require('../../controllers/bookingController');
const { protect, authorize } = require('../../middleware/auth');

const router = express.Router();

// Create booking route
router.post('/', protect, authorize('user'), createBooking);

// Get customer bookings route
router.get('/customer', protect, authorize('user'), getCustomerBookings);

module.exports = router;
const express = require('express');
const authRoutes = require('./api/auth');
const userRoutes = require('./api/users');
const providerRoutes = require('./api/providers');
const categoryRoutes = require('./api/categories');
const listingRoutes = require('./api/listings');
const bookingRoutes = require('./api/bookings');
const paymentRoutes = require('./api/payments');
const reviewRoutes = require('./api/reviews');
const complaintRoutes = require('./api/complaints');
const reportRoutes = require('./api/reports');
const commissionRoutes = require('./api/commissions');
const adminRoutes = require('./api/admin');

const router = express.Router();

// API Routes


module.exports = router;
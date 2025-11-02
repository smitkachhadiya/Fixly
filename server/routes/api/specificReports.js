const express = require('express');
const {
  getRevenueReport,
  getBookingsReport,
  getUsersReport,
  getProvidersReport,
  getCategoriesReport,
  getServicesReport
} = require('../../controllers/specificReportController');

const { protect, authorize } = require('../../middleware/auth');

const router = express.Router();

// All routes are protected and admin only
router.use(protect, authorize('admin'));

// Specific report routes
router.get('/revenue', getRevenueReport);
router.get('/bookings', getBookingsReport);
router.get('/users', getUsersReport);
router.get('/providers', getProvidersReport);
router.get('/categories', getCategoriesReport);
router.get('/services', getServicesReport);

module.exports = router;
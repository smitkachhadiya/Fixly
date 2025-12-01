const express = require('express');
const {
  createPaymentOrder,
  verifyPayment,
  createPayment,
  getPaymentById,
  getCustomerPayments,
  getProviderPayments,
  updatePaymentStatus,
  getAllPayments
} = require('../../controllers/paymentController');

const { protect, authorize } = require('../../middleware/auth');

const router = express.Router();

// Public routes
// None

// Protected routes
router.post('/order', protect, authorize('user'), createPaymentOrder);
router.post('/verify', protect, authorize('user'), verifyPayment);
router.post('/', protect, authorize('user'), createPayment);
router.get('/customer', protect, authorize('user'), getCustomerPayments);
router.get('/provider', protect, authorize('service_provider'), getProviderPayments);
router.get('/admin', protect, authorize('admin'), getAllPayments);
router.get('/:id', protect, getPaymentById);
router.put('/:id/status', protect, authorize('admin'), updatePaymentStatus);

module.exports = router;
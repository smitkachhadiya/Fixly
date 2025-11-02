const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true,
    unique: true
  },
  paymentAmount: {
    type: Number,
    required: [true, 'Payment amount is required'],
    min: [0, 'Payment amount cannot be negative']
  },
  paymentMethod: {
    type: String,
    required: [true, 'Payment method is required'],
    enum: ['Credit Card', 'Debit Card', 'PayPal', 'Bank Transfer', 'Cash']
  },
  transactionId: {
    type: String,
    unique: true
  },
  paymentDateTime: {
    type: Date,
    default: Date.now
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Completed', 'Failed', 'Refunded'],
    default: 'Pending'
  },
  commissionAmount: {
    type: Number,
    required: true,
    min: [0, 'Commission amount cannot be negative']
  },
  providerAmount: {
    type: Number,
    required: true,
    min: [0, 'Provider amount cannot be negative']
  },
  commissionTransferStatus: {
    type: String,
    enum: ['Pending', 'Completed', 'Failed'],
    default: 'Pending'
  },
  providerTransferStatus: {
    type: String,
    enum: ['Pending', 'Completed', 'Failed'],
    default: 'Pending'
  }
}, { timestamps: true });

module.exports = mongoose.model('Payment', PaymentSchema);
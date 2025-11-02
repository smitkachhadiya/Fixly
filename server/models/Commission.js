const mongoose = require('mongoose');

const CommissionSchema = new mongoose.Schema({
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
  serviceProviderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServiceProvider',
    required: true
  },
  amount: {
    type: Number,
    required: [true, 'Commission amount is required'],
    min: [0, 'Commission amount cannot be negative']
  },
  rate: {
    type: Number,
    required: [true, 'Commission rate is required'],
    min: [0, 'Commission rate cannot be negative'],
    max: [100, 'Commission rate cannot exceed 100%']
  },
  paymentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment'
  },
  status: {
    type: String,
    enum: ['Pending', 'Collected'],
    default: 'Pending'
  },
  collectionDate: {
    type: Date
  }
}, { timestamps: true });

module.exports = mongoose.model('Commission', CommissionSchema);
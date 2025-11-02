const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users',
    required: true
  },
  reportType: {
    type: String,
    required: [true, 'Report type is required'],
    enum: ['Revenue', 'Bookings', 'Providers', 'Customers', 'Complaints']
  },
  reportData: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  reportSummary: {
    type: String,
    required: [true, 'Report summary is required']
  },
  timeFrame: {
    startDate: Date,
    endDate: Date
  },
  totalCommission: {
    type: Number,
    default: 0
  },
  totalRevenue: {
    type: Number,
    default: 0
  },
  generatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('Report', ReportSchema);
const AdminEarnings = require('../models/AdminEarnings');
const Commission = require('../models/Commission');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get all admin earnings
// @route   GET /api/admin/earnings
// @access  Private (Admin only)
exports.getAllEarnings = asyncHandler(async (req, res) => {
  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;
  
  // Filtering
  let query = {};
  
  if (req.query.from && req.query.to) {
    query.date = {
      $gte: new Date(req.query.from),
      $lte: new Date(req.query.to)
    };
  }
  
  const earnings = await AdminEarnings.find(query)
    .sort({ date: -1 })
    .skip(startIndex)
    .limit(limit);
  
  const total = await AdminEarnings.countDocuments(query);
  
  // Calculate totals
  const totalEarnings = earnings.reduce((sum, earning) => sum + earning.totalCommissionEarned, 0);
  const totalBookings = earnings.reduce((sum, earning) => sum + earning.totalBookings, 0);
  
  res.status(200).json({
    success: true,
    count: earnings.length,
    pagination: {
      total,
      page,
      pages: Math.ceil(total / limit)
    },
    summary: {
      totalEarnings,
      totalBookings
    },
    data: earnings
  });
});

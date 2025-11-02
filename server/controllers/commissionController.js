const Commission = require('../models/Commission');
const ServiceProvider = require('../models/ServiceProvider');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get all commissions
// @route   GET /api/commissions
// @access  Private (Admin only)
exports.getAllCommissions = asyncHandler(async (req, res) => {
  const commissions = await Commission.find()
    .populate({
      path: 'serviceProviderId',
      select: 'userId businessName',
      populate: {
        path: 'userId',
        select: 'firstName lastName'
      }
    })
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: commissions.length,
    data: commissions
  });
});

// @desc    Get commissions for a specific provider
// @route   GET /api/commissions/provider/:providerId
// @access  Private (Admin only)
exports.getProviderCommissions = asyncHandler(async (req, res) => {
  const commissions = await Commission.find({ serviceProviderId: req.params.providerId })
    .populate({
      path: 'serviceProviderId',
      select: 'userId businessName',
      populate: {
        path: 'userId',
        select: 'firstName lastName'
      }
    })
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: commissions.length,
    data: commissions
  });
});

// @desc    Get commission by ID
// @route   GET /api/commissions/:id
// @access  Private (Admin only)
exports.getCommissionById = asyncHandler(async (req, res) => {
  const commission = await Commission.findById(req.params.id)
    .populate({
      path: 'serviceProviderId',
      select: 'userId businessName',
      populate: {
        path: 'userId',
        select: 'firstName lastName'
      }
    });

  if (!commission) {
    return res.status(404).json({
      success: false,
      message: 'Commission not found'
    });
  }

  res.status(200).json({
    success: true,
    data: commission
  });
});

// @desc    Update commission
// @route   PUT /api/commissions/:id
// @access  Private (Admin only)
exports.updateCommission = asyncHandler(async (req, res) => {
  let commission = await Commission.findById(req.params.id);

  if (!commission) {
    return res.status(404).json({
      success: false,
      message: 'Commission not found'
    });
  }

  // Update commission
  commission = await Commission.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: commission
  });
});
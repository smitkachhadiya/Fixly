const express = require('express');
const { protect, authorize } = require('../../middleware/auth');
const ServiceListing = require('../../models/ServiceListing');
const asyncHandler = require('express-async-handler');

const router = express.Router();

// @desc    Admin update listing status
// @route   PUT /api/admin/listings/:id/status
// @access  Private (Admin only)
router.put('/:id/status', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const { isActive } = req.body;

  if (isActive === undefined) {
    return res.status(400).json({
      success: false,
      message: 'isActive field is required'
    });
  }

  let listing = await ServiceListing.findById(req.params.id);

  if (!listing) {
    return res.status(404).json({
      success: false,
      message: 'Service listing not found'
    });
  }

  // Update status
  listing.isActive = isActive;
  await listing.save();

  res.status(200).json({
    success: true,
    data: listing
  });
}));


module.exports = router;

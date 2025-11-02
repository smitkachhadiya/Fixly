const express = require('express');
const { profileImageUpload } = require('../../config/cloudinary');
const {
  getSettings,
  updateGeneralSettings,
  updateCommissionSettings,
  updateNotificationSettings,
  updateSecuritySettings
} = require('../../controllers/settingsController');
const { protect, authorize } = require('../../middleware/auth');

const router = express.Router();

// All routes require admin authentication
router.use(protect, authorize('admin'));

// Settings routes
router.route('/')
  .get(getSettings);

router.route('/general')
  .put(profileImageUpload.single('logo'), updateGeneralSettings);

router.route('/commission')
  .put(updateCommissionSettings);

router.route('/notifications')
  .put(updateNotificationSettings);

router.route('/security')
  .put(updateSecuritySettings);

module.exports = router;
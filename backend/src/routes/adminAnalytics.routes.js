const express = require('express');
const adminAnalyticsController = require('../controllers/adminAnalytics.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

// Guard ALL Admin Analytics endpoints with authentication & ADMIN role authorization
router.use(authenticate);
router.use(authorize('ADMIN'));

router.get('/overview', adminAnalyticsController.getOverview);
router.get('/usage', adminAnalyticsController.getUsageOverTime);
router.get('/platforms', adminAnalyticsController.getPlatformUsage);
router.get('/features', adminAnalyticsController.getMostUsedFeatures);
router.get('/users', adminAnalyticsController.getUserActivity);
router.get('/user/:userId', adminAnalyticsController.getUserDetail);
router.get('/events', adminAnalyticsController.getRecentEvents);

module.exports = router;

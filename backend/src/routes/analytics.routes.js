const express = require('express');
const analyticsController = require('../controllers/analytics.controller');
const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();

// Apply authentication
router.use(authenticate);

router.get('/platforms', analyticsController.getPlatforms);
router.get('/engagement', analyticsController.getEngagementMetrics);
router.get('/sentiment', analyticsController.getSentimentDistribution);
router.get('/trends', analyticsController.getTrendingTopics);
router.get('/trends/topic/:topicName', analyticsController.getTopicDetail);
router.get('/forecast', analyticsController.getGrowthAndForecast);

module.exports = router;

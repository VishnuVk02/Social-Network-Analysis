const express = require('express');
const youtubeController = require('../controllers/youtube.controller');
const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();

// Public / Protected route configurations (guarded with authenticate for consistency)
router.use(authenticate);

// Channel Overview Fetch
router.get('/youtube/channel/:channelName', youtubeController.getChannelOverview);

// Video Analytics Fetch
router.get('/youtube/videos/:channelId', youtubeController.getVideoAnalytics);

// Video Comments Fetch
router.get('/youtube/comments/:videoId', youtubeController.getVideoComments);

// Analytics, Sentiment, and Trending sub-pages
router.get('/analytics/channel/:channelId', youtubeController.getChannelGrowthAnalytics);
router.get('/sentiment/channel/:channelId', youtubeController.getChannelSentimentAnalysis);
router.get('/trending/channel/:channelId', youtubeController.getChannelTrendingTopics);

module.exports = router;

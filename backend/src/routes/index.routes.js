const express = require('express');
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const groupRoutes = require('./group.routes');
const postRoutes = require('./post.routes');
const analyticsRoutes = require('./analytics.routes');
const youtubeRoutes = require('./youtube.routes');
const githubRoutes = require('./github.routes');
const telemetryRoutes = require('./telemetry.routes');
const adminAnalyticsRoutes = require('./adminAnalytics.routes');
const organizationRoutes = require('./organization.routes');
const privateMessageRoutes = require('./privateMessage.routes');
const reportRoutes = require('./report.routes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/groups', groupRoutes);
router.use('/messages', privateMessageRoutes);
router.use('/reports', reportRoutes);
router.use('/posts', postRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/github', githubRoutes);
router.use('/telemetry', telemetryRoutes);
router.use('/admin/analytics', adminAnalyticsRoutes);
router.use('/organization', organizationRoutes);
router.use('/', youtubeRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  const githubService = require('../services/githubService');
  res.status(200).json({
    status: 'UP',
    timestamp: new Date(),
    service: 'Telemetron Analytics API Layer',
    githubApi: githubService.getGithubApiStatus()
  });
});

module.exports = router;

const express = require('express');
const githubController = require('../controllers/github.controller');
const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();

// Guard all GitHub routes with authentication
router.use(authenticate);

// Trending Repositories (Dashboard view)
router.get('/trending', githubController.getTrendingDashboard);

// GitHub News Feed
router.get('/news', githubController.getNewsFeed);

// Language Trends
router.get('/languages', githubController.getLanguageTrends);

// Top Trending Developers
router.get('/top-developers', githubController.getTopDevelopers);

// Insights statistics overview cards
router.get('/insights', githubController.getInsightsOverview);

// Repository Details
router.get('/repository/:owner/:repo', githubController.getRepositoryDetails);

// User Profile Details
router.get('/user/:username', githubController.getUserProfile);

// Organization Profile Details
router.get('/organization/:org', githubController.getOrganizationProfile);

// Contributor Details
router.get('/contributors/:owner/:repo', githubController.getRepositoryContributors);

// Commit Details
router.get('/commits/:owner/:repo', githubController.getRepositoryCommits);

// GitHub API Health & Rate Limit Diagnostic
router.get('/status', githubController.getGithubStatus);

module.exports = router;


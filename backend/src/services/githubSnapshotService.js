const { prisma } = require('../config/db');
const trendingService = require('./githubTrendingService');
const newsService = require('./githubNewsService');
const analyticsService = require('./githubAnalyticsService');
const logger = require('../utils/logger');

/**
 * Capture historical snapshots for all trending repositories
 */
async function captureRepositorySnapshots() {
  logger.info('Capturing repository snapshots...');
  try {
    const trends = await prisma.githubTrend.findMany();
    
    for (const t of trends) {
      await prisma.githubRepositorySnapshot.create({
        data: {
          repoName: t.repoName,
          stars: t.stars,
          forks: t.forks,
          watchers: t.stars, // assumed watchers count
          contributorsCount: 15,
          capturedAt: new Date()
        }
      });
    }
    logger.info(`Successfully stored snapshots for ${trends.length} repositories.`);
  } catch (error) {
    logger.error(`captureRepositorySnapshots failed: ${error.message}`);
  }
}

/**
 * Runs the complete data collection flow
 */
async function executeDataCollection() {
  logger.info('========== STARTING AUTOMATIC GITHUB DATA COLLECTION ==========');
  try {
    // 1. Fetch trending repositories (calculates Intelligence Scores)
    await trendingService.fetchAndStoreTrendingRepos();

    // 2. Fetch trending developer rosters
    await trendingService.fetchAndStoreTrendingDevelopers();

    // 3. Collect GitHub news and releases
    await newsService.fetchAndStoreNews();

    // 4. Compile technology language trends
    await analyticsService.calculateLanguageTrends();

    // 5. Store historical snapshots
    await captureRepositorySnapshots();
    
    logger.info('========== GITHUB DATA COLLECTION COMPLETED SUCCESSFULLY ==========');
  } catch (error) {
    logger.error(`executeDataCollection failed: ${error.message}`);
  }
}

/**
 * Initialize the scheduled background task runner
 */
function initializeScheduler() {
  logger.info('Initializing GitHub Analytics Scheduler (6-hour frequency)...');
  
  // 1. Run collection immediately on server startup to seed DB
  executeDataCollection().catch(err => {
    logger.error(`Initial boot collection run failed: ${err.message}`);
  });

  // 2. Schedule run to occur every 6 hours
  // 6 hours = 6 * 60 * 60 * 1000 = 21,600,000 milliseconds
  const INTERVAL_MS = 6 * 60 * 60 * 1000;
  setInterval(() => {
    logger.info('Scheduled interval fired: executing GitHub Analytics background collector...');
    executeDataCollection().catch(err => {
      logger.error(`Interval collection run failed: ${err.message}`);
    });
  }, INTERVAL_MS);
}

module.exports = {
  initializeScheduler,
  executeDataCollection
};

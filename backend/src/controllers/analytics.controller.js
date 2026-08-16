const analyticsService = require('../services/analytics.service');
const trendAggregationService = require('../services/trendAggregationService');

async function getPlatforms(req, res, next) {
  try {
    const platforms = await analyticsService.getPlatforms();
    return res.status(200).json({
      success: true,
      data: platforms
    });
  } catch (error) {
    next(error);
  }
}

async function getEngagementMetrics(req, res, next) {
  try {
    const { platformId } = req.query;
    const metrics = await analyticsService.getEngagementMetrics(platformId);
    return res.status(200).json({
      success: true,
      data: metrics
    });
  } catch (error) {
    next(error);
  }
}

async function getSentimentDistribution(req, res, next) {
  try {
    const { platformId } = req.query;
    const sentiment = await analyticsService.getSentimentDistribution(platformId);
    return res.status(200).json({
      success: true,
      data: sentiment
    });
  } catch (error) {
    next(error);
  }
}

async function getTrendingTopics(req, res, next) {
  try {
    const { category, source, timeRange } = req.query;
    const trends = await trendAggregationService.getTrends({
      category: category || 'Technology',
      source: source || 'Combined',
      timeRange: timeRange || '7d'
    });
    return res.status(200).json({
      success: true,
      data: trends
    });
  } catch (error) {
    next(error);
  }
}

async function getTopicDetail(req, res, next) {
  try {
    const { topicName } = req.params;
    const detail = await trendAggregationService.getTopicDetail(topicName);
    return res.status(200).json({
      success: true,
      data: detail
    });
  } catch (error) {
    next(error);
  }
}

async function getGrowthAndForecast(req, res, next) {
  try {
    const { platformId } = req.query;
    const data = await analyticsService.getGrowthAndForecast(platformId);
    return res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getPlatforms,
  getEngagementMetrics,
  getSentimentDistribution,
  getTrendingTopics,
  getTopicDetail,
  getGrowthAndForecast
};

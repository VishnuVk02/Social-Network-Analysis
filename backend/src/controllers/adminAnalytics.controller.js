const telemetryService = require('../services/telemetryService');
const logger = require('../utils/logger');

async function getOverview(req, res, next) {
  try {
    const { timeRange, feature } = req.query;
    const overview = await telemetryService.getAdminOverview({ timeRange, feature });
    return res.status(200).json({
      success: true,
      ...overview
    });
  } catch (error) {
    next(error);
  }
}

async function getUsageOverTime(req, res, next) {
  try {
    const { timeRange, feature } = req.query;
    const chartData = await telemetryService.getUsageOverTime({ timeRange, feature });
    return res.status(200).json({
      success: true,
      chartData
    });
  } catch (error) {
    next(error);
  }
}

async function getPlatformUsage(req, res, next) {
  try {
    const { timeRange } = req.query;
    const data = await telemetryService.getPlatformUsage({ timeRange });
    return res.status(200).json({
      success: true,
      ...data
    });
  } catch (error) {
    next(error);
  }
}

async function getMostUsedFeatures(req, res, next) {
  try {
    const { timeRange } = req.query;
    const features = await telemetryService.getMostUsedFeatures({ timeRange });
    return res.status(200).json({
      success: true,
      features
    });
  } catch (error) {
    next(error);
  }
}

async function getUserActivity(req, res, next) {
  try {
    const { timeRange } = req.query;
    const users = await telemetryService.getUserActivityTable({ timeRange });
    return res.status(200).json({
      success: true,
      users
    });
  } catch (error) {
    next(error);
  }
}

async function getRecentEvents(req, res, next) {
  try {
    const { limit } = req.query;
    const events = await telemetryService.getRecentEvents({ limit: limit ? parseInt(limit, 10) : 20 });
    return res.status(200).json({
      success: true,
      events
    });
  } catch (error) {
    next(error);
  }
}

async function getUserDetail(req, res, next) {
  try {
    const { userId } = req.params;
    const detail = await telemetryService.getUserDetailAnalytics({ userId });
    return res.status(200).json({
      success: true,
      ...detail
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getOverview,
  getUsageOverTime,
  getPlatformUsage,
  getMostUsedFeatures,
  getUserActivity,
  getRecentEvents,
  getUserDetail
};

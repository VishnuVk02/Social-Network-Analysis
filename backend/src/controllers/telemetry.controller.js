const telemetryService = require('../services/telemetryService');
const logger = require('../utils/logger');

async function heartbeat(req, res, next) {
  try {
    const userId = req.user.id;
    const { sessionId } = req.body;

    const session = await telemetryService.recordHeartbeat({ userId, sessionId });

    return res.status(200).json({
      success: true,
      session
    });
  } catch (error) {
    next(error);
  }
}

async function recordEvent(req, res, next) {
  try {
    const userId = req.user.id;
    const { sessionId, eventType, feature, platform, metadata } = req.body;

    const event = await telemetryService.recordEvent({
      userId,
      sessionId,
      eventType,
      feature,
      platform,
      metadata
    });

    return res.status(201).json({
      success: true,
      event
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  heartbeat,
  recordEvent
};

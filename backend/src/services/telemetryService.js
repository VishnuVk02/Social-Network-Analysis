const { prisma } = require('../config/db');
const logger = require('../utils/logger');

/**
 * Calculates start Date based on timeRange filter ('24h' | '7d' | '30d')
 */
function getSinceDate(timeRange) {
  const now = new Date();
  if (timeRange === '24h' || timeRange === 'Today') {
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    return startOfDay;
  }
  if (timeRange === '30d') {
    const date = new Date(now);
    date.setDate(date.getDate() - 30);
    return date;
  }
  // Default to 7 days
  const date = new Date(now);
  date.setDate(date.getDate() - 7);
  return date;
}

/**
 * Formats seconds into human readable duration (e.g. "4h 25m" or "8m 12s")
 */
function formatDuration(totalSeconds) {
  if (!totalSeconds || totalSeconds <= 0) return '0m 0s';
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m ${seconds}s`;
}

/**
 * Heartbeat mechanism: creates a new session or updates existing session lastActivityAt & duration.
 */
async function recordHeartbeat({ userId, sessionId }) {
  try {
    const now = new Date();
    
    if (sessionId) {
      const existingSession = await prisma.applicationSession.findUnique({
        where: { id: sessionId }
      });

      if (existingSession && !existingSession.endedAt) {
        const durationSec = Math.max(
          existingSession.duration || 0,
          Math.floor((now.getTime() - new Date(existingSession.startedAt).getTime()) / 1000)
        );

        const updated = await prisma.applicationSession.update({
          where: { id: sessionId },
          data: {
            lastActivityAt: now,
            duration: durationSec
          }
        });

        return {
          sessionId: updated.id,
          startedAt: updated.startedAt,
          lastActivityAt: updated.lastActivityAt,
          duration: updated.duration
        };
      }
    }

    // Create new session
    const newSession = await prisma.applicationSession.create({
      data: {
        userId,
        startedAt: now,
        lastActivityAt: now,
        duration: 0
      }
    });

    return {
      sessionId: newSession.id,
      startedAt: newSession.startedAt,
      lastActivityAt: newSession.lastActivityAt,
      duration: 0
    };
  } catch (error) {
    logger.error('Error in telemetryService.recordHeartbeat:', error);
    throw error;
  }
}

/**
 * Records a meaningful application event (e.g. YouTube Search, GitHub Repo View, Trends Open).
 */
async function recordEvent({ userId, sessionId, eventType, feature, platform, metadata }) {
  try {
    const now = new Date();
    
    // Ensure session is updated
    let activeSessionId = sessionId;
    if (activeSessionId) {
      try {
        await recordHeartbeat({ userId, sessionId: activeSessionId });
      } catch (e) {
        // Continue event creation even if session update fails
      }
    }

    const event = await prisma.applicationEvent.create({
      data: {
        userId,
        sessionId: activeSessionId || null,
        eventType: eventType || 'action',
        feature: feature || 'General',
        platform: platform || null,
        metadata: metadata || {},
        createdAt: now
      }
    });

    return event;
  } catch (error) {
    logger.error('Error in telemetryService.recordEvent:', error);
    throw error;
  }
}

/**
 * Returns Admin Overview summary metrics for application usage.
 */
async function getAdminOverview({ timeRange = '7d', feature = 'All' }) {
  try {
    const sinceDate = getSinceDate(timeRange);

    // 1. Total registered users
    const totalUsers = await prisma.user.count();

    // 2. Active users in timeRange (distinct userIds with activity)
    const activeSessions = await prisma.applicationSession.findMany({
      where: {
        lastActivityAt: { gte: sinceDate }
      },
      select: { userId: true }
    });

    const activeEvents = await prisma.applicationEvent.findMany({
      where: {
        createdAt: { gte: sinceDate },
        ...(feature !== 'All' ? { feature } : {})
      },
      select: { userId: true }
    });

    const activeUserSet = new Set([
      ...activeSessions.map(s => s.userId),
      ...activeEvents.map(e => e.userId)
    ]);
    const activeUsersCount = activeUserSet.size;

    // 3. Total sessions in timeRange
    const totalSessionsCount = await prisma.applicationSession.count({
      where: {
        startedAt: { gte: sinceDate }
      }
    });

    // 4. Total usage time & avg duration
    const sessionAgg = await prisma.applicationSession.aggregate({
      where: {
        startedAt: { gte: sinceDate }
      },
      _sum: { duration: true },
      _avg: { duration: true }
    });

    const totalSeconds = sessionAgg._sum.duration || 0;
    const avgSeconds = Math.round(sessionAgg._avg.duration || 0);

    const totalUsageTimeFormatted = formatDuration(totalSeconds);
    const avgSessionDurationFormatted = formatDuration(avgSeconds);

    // 5. Total application actions
    const totalActionsCount = await prisma.applicationEvent.count({
      where: {
        createdAt: { gte: sinceDate },
        ...(feature !== 'All' ? { feature } : {})
      }
    });

    return {
      timeRange,
      featureFilter: feature,
      totalUsers,
      activeUsers: activeUsersCount,
      activeUsersPercentage: totalUsers > 0 ? Math.round((activeUsersCount / totalUsers) * 100) : 0,
      totalSessions: totalSessionsCount,
      totalUsageTime: totalUsageTimeFormatted,
      totalUsageTimeSeconds: totalSeconds,
      avgSessionDuration: avgSessionDurationFormatted,
      avgSessionDurationSeconds: avgSeconds,
      totalActions: totalActionsCount
    };
  } catch (error) {
    logger.error('Error in telemetryService.getAdminOverview:', error);
    throw error;
  }
}

/**
 * Returns daily application usage statistics over time for Recharts visualization.
 */
async function getUsageOverTime({ timeRange = '7d', feature = 'All' }) {
  try {
    const days = timeRange === '30d' ? 30 : (timeRange === 'Today' || timeRange === '24h' ? 1 : 7);
    const chartData = [];

    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const dayStart = new Date(now);
      dayStart.setDate(dayStart.getDate() - i);
      dayStart.setHours(0, 0, 0, 0);

      const dayEnd = new Date(dayStart);
      dayEnd.setHours(23, 59, 59, 999);

      // Sessions on this day
      const daySessions = await prisma.applicationSession.count({
        where: {
          startedAt: { gte: dayStart, lte: dayEnd }
        }
      });

      // Actions on this day
      const dayActions = await prisma.applicationEvent.count({
        where: {
          createdAt: { gte: dayStart, lte: dayEnd },
          ...(feature !== 'All' ? { feature } : {})
        }
      });

      // Active users on this day
      const activeSessionsDay = await prisma.applicationSession.findMany({
        where: {
          lastActivityAt: { gte: dayStart, lte: dayEnd }
        },
        select: { userId: true }
      });
      const activeEventsDay = await prisma.applicationEvent.findMany({
        where: {
          createdAt: { gte: dayStart, lte: dayEnd }
        },
        select: { userId: true }
      });

      const dayUserSet = new Set([
        ...activeSessionsDay.map(s => s.userId),
        ...activeEventsDay.map(e => e.userId)
      ]);

      const label = days === 1 
        ? 'Today' 
        : dayStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      chartData.push({
        date: label,
        activeUsers: dayUserSet.size,
        sessions: daySessions,
        actions: dayActions
      });
    }

    return chartData;
  } catch (error) {
    logger.error('Error in telemetryService.getUsageOverTime:', error);
    throw error;
  }
}

/**
 * Calculates platform usage breakdown (YouTube vs GitHub vs Trends vs Dashboard vs Groups).
 */
async function getPlatformUsage({ timeRange = '7d' }) {
  try {
    const sinceDate = getSinceDate(timeRange);

    const events = await prisma.applicationEvent.findMany({
      where: {
        createdAt: { gte: sinceDate }
      },
      select: { feature: true, platform: true }
    });

    const counts = {
      'YouTube': 0,
      'GitHub': 0,
      'Trends': 0,
      'Dashboard': 0,
      'Groups': 0,
      'Settings': 0,
      'Authentication': 0
    };

    events.forEach(e => {
      const feat = e.feature || 'Dashboard';
      if (counts[feat] !== undefined) {
        counts[feat]++;
      } else if (e.platform === 'YouTube' || feat.includes('YouTube')) {
        counts['YouTube']++;
      } else if (e.platform === 'GitHub' || feat.includes('GitHub')) {
        counts['GitHub']++;
      } else {
        counts['Dashboard']++;
      }
    });

    const totalEvents = Object.values(counts).reduce((a, b) => a + b, 0);

    const breakdown = Object.entries(counts).map(([name, count]) => ({
      name,
      count,
      percentage: totalEvents > 0 ? parseFloat(((count / totalEvents) * 100).toFixed(1)) : 0
    }));

    // Sort by count descending
    breakdown.sort((a, b) => b.count - a.count);

    return {
      totalEvents,
      breakdown
    };
  } catch (error) {
    logger.error('Error in telemetryService.getPlatformUsage:', error);
    throw error;
  }
}

/**
 * Returns ranked most used features with count and percentage.
 */
async function getMostUsedFeatures({ timeRange = '7d' }) {
  try {
    const sinceDate = getSinceDate(timeRange);

    const events = await prisma.applicationEvent.findMany({
      where: {
        createdAt: { gte: sinceDate }
      },
      select: { eventType: true, feature: true }
    });

    const featureCounts = {};

    events.forEach(e => {
      // Map eventType to friendly feature label
      let label = e.eventType || e.feature;
      if (label === 'youtube_channel_analysis') label = 'YouTube Channel Analytics';
      else if (label === 'youtube_search') label = 'YouTube Search';
      else if (label === 'github_repository_analysis') label = 'GitHub Repository Analytics';
      else if (label === 'github_search') label = 'GitHub Search';
      else if (label === 'github_user_analysis') label = 'GitHub Developer Profile';
      else if (label === 'github_trending') label = 'GitHub Trending Discovery';
      else if (label === 'trends_view') label = 'Trends Index Overview';
      else if (label === 'trends_topic_detail') label = 'Trends Topic Detail Modal';
      else if (label === 'dashboard_view') label = 'Overview Dashboard';
      else if (label === 'group_view') label = 'Group Telemetry Management';

      featureCounts[label] = (featureCounts[label] || 0) + 1;
    });

    const totalEvents = events.length;

    const ranked = Object.entries(featureCounts).map(([featureName, count]) => ({
      feature: featureName,
      count,
      percentage: totalEvents > 0 ? parseFloat(((count / totalEvents) * 100).toFixed(1)) : 0
    }));

    ranked.sort((a, b) => b.count - a.count);

    ranked.forEach((item, idx) => {
      item.rank = `#${idx + 1}`;
    });

    return ranked.slice(0, 8);
  } catch (error) {
    logger.error('Error in telemetryService.getMostUsedFeatures:', error);
    throw error;
  }
}

/**
 * Returns table of users with session count, total usage time, last active date, and actions count.
 */
async function getUserActivityTable({ timeRange = '7d' }) {
  try {
    const sinceDate = getSinceDate(timeRange);

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    });

    const userActivityList = [];

    for (const u of users) {
      // Sessions
      const sessions = await prisma.applicationSession.findMany({
        where: {
          userId: u.id,
          startedAt: { gte: sinceDate }
        },
        select: { duration: true, lastActivityAt: true }
      });

      // Actions
      const actionsCount = await prisma.applicationEvent.count({
        where: {
          userId: u.id,
          createdAt: { gte: sinceDate }
        }
      });

      const totalSec = sessions.reduce((acc, s) => acc + (s.duration || 0), 0);
      
      // Find latest activity date
      const latestSession = await prisma.applicationSession.findFirst({
        where: { userId: u.id },
        orderBy: { lastActivityAt: 'desc' }
      });

      const lastActive = latestSession ? latestSession.lastActivityAt : u.createdAt;

      userActivityList.push({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        lastActive,
        sessionsCount: sessions.length,
        usageTime: formatDuration(totalSec),
        usageTimeSeconds: totalSec,
        actionsCount
      });
    }

    // Sort by lastActive descending
    userActivityList.sort((a, b) => new Date(b.lastActive) - new Date(a.lastActive));

    return userActivityList;
  } catch (error) {
    logger.error('Error in telemetryService.getUserActivityTable:', error);
    throw error;
  }
}

/**
 * Returns recent meaningful application activity stream.
 */
async function getRecentEvents({ limit = 20 }) {
  try {
    const events = await prisma.applicationEvent.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { name: true, email: true, role: true }
        }
      }
    });

    return events.map(e => ({
      id: e.id,
      userId: e.userId,
      userName: e.user ? e.user.name : 'Unknown User',
      userEmail: e.user ? e.user.email : 'Unknown Email',
      userRole: e.user ? e.user.role : 'ANALYST',
      eventType: e.eventType,
      feature: e.feature,
      platform: e.platform,
      metadata: e.metadata,
      createdAt: e.createdAt
    }));
  } catch (error) {
    logger.error('Error in telemetryService.getRecentEvents:', error);
    throw error;
  }
}

/**
 * Returns detailed telemetry for a specific user.
 */
async function getUserDetailAnalytics({ userId }) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, role: true, createdAt: true }
    });

    if (!user) {
      throw new Error(`User with ID ${userId} not found.`);
    }

    const sessions = await prisma.applicationSession.findMany({
      where: { userId },
      orderBy: { startedAt: 'desc' }
    });

    const events = await prisma.applicationEvent.findMany({
      where: { userId },
      take: 20,
      orderBy: { createdAt: 'desc' }
    });

    const totalSeconds = sessions.reduce((acc, s) => acc + (s.duration || 0), 0);
    const avgSeconds = sessions.length > 0 ? Math.round(totalSeconds / sessions.length) : 0;

    // Platform usage breakdown for this user
    const platformCounts = { YouTube: 0, GitHub: 0, Trends: 0, Dashboard: 0 };
    events.forEach(e => {
      if (e.feature === 'YouTube' || e.platform === 'YouTube') platformCounts.YouTube++;
      else if (e.feature === 'GitHub' || e.platform === 'GitHub') platformCounts.GitHub++;
      else if (e.feature === 'Trends') platformCounts.Trends++;
      else platformCounts.Dashboard++;
    });

    return {
      user,
      totalSessions: sessions.length,
      totalUsageTime: formatDuration(totalSeconds),
      avgSessionDuration: formatDuration(avgSeconds),
      platformCounts,
      recentEvents: events.map(e => ({
        id: e.id,
        eventType: e.eventType,
        feature: e.feature,
        platform: e.platform,
        createdAt: e.createdAt
      }))
    };
  } catch (error) {
    logger.error('Error in telemetryService.getUserDetailAnalytics:', error);
    throw error;
  }
}

/**
 * Seeds initial application usage telemetry if empty to ensure rich dashboard demonstration.
 */
async function seedSampleTelemetry() {
  try {
    const sessionCount = await prisma.applicationSession.count();
    if (sessionCount > 0) {
      return; // Already seeded
    }

    const users = await prisma.user.findMany();
    if (users.length === 0) return;

    logger.info('Seeding initial Application Usage Telemetry data...');

    const now = new Date();

    for (const u of users) {
      // Create 5 sessions over the past 7 days for each user
      for (let i = 0; i < 5; i++) {
        const startedAt = new Date(now);
        startedAt.setDate(startedAt.getDate() - i);
        startedAt.setHours(9 + i * 2, Math.floor(Math.random() * 60), 0);

        const duration = Math.floor(Math.random() * 1200 + 300); // 5m - 25m
        const lastActivityAt = new Date(startedAt.getTime() + duration * 1000);

        const session = await prisma.applicationSession.create({
          data: {
            userId: u.id,
            startedAt,
            lastActivityAt,
            duration,
            createdAt: startedAt
          }
        });

        // Seed 4 events per session
        const eventTypes = [
          { type: 'dashboard_view', feat: 'Dashboard', plat: 'Dashboard' },
          { type: 'youtube_channel_analysis', feat: 'YouTube', plat: 'YouTube' },
          { type: 'github_repository_analysis', feat: 'GitHub', plat: 'GitHub' },
          { type: 'trends_view', feat: 'Trends', plat: 'Trends' }
        ];

        for (const evt of eventTypes) {
          await prisma.applicationEvent.create({
            data: {
              userId: u.id,
              sessionId: session.id,
              eventType: evt.type,
              feature: evt.feat,
              platform: evt.plat,
              createdAt: new Date(startedAt.getTime() + Math.random() * duration * 1000)
            }
          });
        }
      }
    }
    logger.info('Successfully seeded initial Application Usage Telemetry.');
  } catch (error) {
    logger.error('Error seeding telemetry:', error);
  }
}

module.exports = {
  recordHeartbeat,
  recordEvent,
  getAdminOverview,
  getUsageOverTime,
  getPlatformUsage,
  getMostUsedFeatures,
  getUserActivityTable,
  getRecentEvents,
  getUserDetailAnalytics,
  seedSampleTelemetry
};

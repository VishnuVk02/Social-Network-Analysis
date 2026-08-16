const { prisma } = require('../config/db');
const logger = require('../utils/logger');

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function validateUuid(id, entityName = 'Group') {
  if (!id || typeof id !== 'string' || !UUID_REGEX.test(id.trim())) {
    const error = new Error(`Invalid ${entityName} ID format. Must be a valid 36-character UUID.`);
    error.status = 400;
    throw error;
  }
}

function checkOrganizationAccount(user) {
  if (!user || user.accountType === 'INDIVIDUAL' || !user.organizationId) {
    const error = new Error('Groups are available exclusively for Organization accounts.');
    error.status = 403;
    throw error;
  }
}

function checkOrganizationAdmin(user) {
  checkOrganizationAccount(user);
  if (user.role !== 'ADMIN') {
    const error = new Error('Forbidden: Only Organization Administrators can perform this action.');
    error.status = 403;
    throw error;
  }
}

/**
 * Formats seconds into human readable duration (e.g. "32h 18m" or "12m")
 */
function formatDuration(totalSeconds) {
  if (!totalSeconds || totalSeconds <= 0) return '0m';
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

/**
 * Returns human readable relative time string (e.g. "8 minutes ago", "Today", "Yesterday")
 */
function formatRelativeTime(date) {
  if (!date) return 'Never';
  const now = new Date();
  const past = new Date(date);
  const diffMs = now.getTime() - past.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSec < 60) return 'Just now';
  if (diffMin < 60) return `${diffMin} min ago`;
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return past.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/**
 * Helper: get telemetry metrics for a group's members
 */
async function getTelemetryForUserIds(userIds) {
  if (!userIds || userIds.length === 0) {
    return {
      activeMembersToday: 0,
      totalSessions: 0,
      totalUsageTimeSeconds: 0,
      totalUsageTimeFormatted: '0m',
      lastActivityDate: null,
      lastActivityFormatted: 'Never',
      mostUsedPlatform: 'N/A',
      platformBreakdown: { YouTube: 0, GitHub: 0, Trends: 0 },
      topFeatures: []
    };
  }

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  // Active today count
  const activeSessionsToday = await prisma.applicationSession.findMany({
    where: {
      userId: { in: userIds },
      lastActivityAt: { gte: startOfDay }
    },
    select: { userId: true }
  });
  const activeEventsToday = await prisma.applicationEvent.findMany({
    where: {
      userId: { in: userIds },
      createdAt: { gte: startOfDay }
    },
    select: { userId: true }
  });
  const activeUserSet = new Set([
    ...activeSessionsToday.map(s => s.userId),
    ...activeEventsToday.map(e => e.userId)
  ]);

  // Total sessions & duration
  const sessions = await prisma.applicationSession.findMany({
    where: { userId: { in: userIds } },
    select: { duration: true, lastActivityAt: true }
  });

  const totalSessions = sessions.length;
  const totalSeconds = sessions.reduce((acc, s) => acc + (s.duration || 0), 0);

  // Latest activity
  const latestSession = await prisma.applicationSession.findFirst({
    where: { userId: { in: userIds } },
    orderBy: { lastActivityAt: 'desc' }
  });
  const latestEvent = await prisma.applicationEvent.findFirst({
    where: { userId: { in: userIds } },
    orderBy: { createdAt: 'desc' }
  });

  let lastActivityDate = null;
  if (latestSession && latestEvent) {
    lastActivityDate = latestSession.lastActivityAt > latestEvent.createdAt ? latestSession.lastActivityAt : latestEvent.createdAt;
  } else if (latestSession) {
    lastActivityDate = latestSession.lastActivityAt;
  } else if (latestEvent) {
    lastActivityDate = latestEvent.createdAt;
  }

  // Events & platform breakdown
  const events = await prisma.applicationEvent.findMany({
    where: { userId: { in: userIds } },
    select: { feature: true, platform: true, eventType: true }
  });

  const platformCounts = { YouTube: 0, GitHub: 0, Trends: 0 };
  const featureCounts = {};

  events.forEach(e => {
    let plat = e.platform;
    const feat = e.feature || '';

    if (!plat) {
      if (feat.includes('YouTube')) plat = 'YouTube';
      else if (feat.includes('GitHub')) plat = 'GitHub';
      else if (feat.includes('Trends')) plat = 'Trends';
    }

    if (plat === 'YouTube') platformCounts.YouTube++;
    else if (plat === 'GitHub') platformCounts.GitHub++;
    else if (plat === 'Trends') platformCounts.Trends++;

    // Feature label
    let label = e.eventType || feat;
    if (label === 'github_repository_analysis') label = 'GitHub Repository Analytics';
    else if (label === 'youtube_channel_analysis') label = 'YouTube Channel Analytics';
    else if (label === 'trends_view') label = 'Trends Index';
    else if (label === 'github_search') label = 'GitHub Search';
    else if (label === 'youtube_search') label = 'YouTube Search';
    else if (label === 'github_trending') label = 'GitHub Trending Discovery';

    featureCounts[label] = (featureCounts[label] || 0) + 1;
  });

  // Determine most used platform
  let mostUsedPlatform = 'N/A';
  let maxCount = 0;
  Object.entries(platformCounts).forEach(([p, count]) => {
    if (count > maxCount) {
      maxCount = count;
      mostUsedPlatform = p;
    }
  });

  const totalEvents = events.length;
  const platformBreakdown = {
    YouTube: totalEvents > 0 ? Math.round((platformCounts.YouTube / totalEvents) * 100) : 0,
    GitHub: totalEvents > 0 ? Math.round((platformCounts.GitHub / totalEvents) * 100) : 0,
    Trends: totalEvents > 0 ? Math.round((platformCounts.Trends / totalEvents) * 100) : 0
  };

  const rankedFeatures = Object.entries(featureCounts).map(([featureName, count]) => ({
    feature: featureName,
    count,
    percentage: totalEvents > 0 ? parseFloat(((count / totalEvents) * 100).toFixed(1)) : 0
  })).sort((a, b) => b.count - a.count).slice(0, 5);

  return {
    activeMembersToday: activeUserSet.size,
    totalSessions,
    totalUsageTimeSeconds: totalSeconds,
    totalUsageTimeFormatted: formatDuration(totalSeconds),
    lastActivityDate,
    lastActivityFormatted: formatRelativeTime(lastActivityDate),
    mostUsedPlatform,
    platformBreakdown,
    topFeatures: rankedFeatures
  };
}

/**
 * GET ALL GROUPS with overview metrics
 */
async function getAllGroups(user) {
  checkOrganizationAccount(user);

  const isOrgAdmin = user.role === 'ADMIN';

  const whereClause = {
    organizationId: user.organizationId
  };

  // Non-admin org users only see groups they belong to
  if (!isOrgAdmin) {
    whereClause.members = {
      some: { userId: user.id }
    };
  }

  const groups = await prisma.group.findMany({
    where: whereClause,
    include: {
      members: {
        select: { userId: true, role: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  // Calculate detailed card data for each group
  const groupCards = [];
  const allGroupUserIds = new Set();
  let totalUsageSecondsSum = 0;

  for (const g of groups) {
    const memberUserIds = g.members.map(m => m.userId);
    memberUserIds.forEach(id => allGroupUserIds.add(id));

    const metrics = await getTelemetryForUserIds(memberUserIds);
    totalUsageSecondsSum += metrics.totalUsageTimeSeconds;

    groupCards.push({
      id: g.id,
      name: g.name,
      description: g.description,
      createdAt: g.createdAt,
      memberCount: g.members.length,
      activeMembers: metrics.activeMembersToday,
      totalSessions: metrics.totalSessions,
      totalUsageTime: metrics.totalUsageTimeFormatted,
      lastActivity: metrics.lastActivityFormatted,
      mostUsedPlatform: metrics.mostUsedPlatform,
      isMember: g.members.some(m => m.userId === user.id),
      userRoleInGroup: g.members.find(m => m.userId === user.id)?.role || null
    });
  }

  // Top Overview Metrics
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const uniqueUserIdsArr = Array.from(allGroupUserIds);
  let activeMembersCount = 0;

  if (uniqueUserIdsArr.length > 0) {
    const activeSessions = await prisma.applicationSession.findMany({
      where: {
        userId: { in: uniqueUserIdsArr },
        lastActivityAt: { gte: startOfDay }
      },
      select: { userId: true }
    });
    const activeEvents = await prisma.applicationEvent.findMany({
      where: {
        userId: { in: uniqueUserIdsArr },
        createdAt: { gte: startOfDay }
      },
      select: { userId: true }
    });
    const activeSet = new Set([
      ...activeSessions.map(s => s.userId),
      ...activeEvents.map(e => e.userId)
    ]);
    activeMembersCount = activeSet.size;
  }

  const overviewMetrics = {
    totalGroups: groups.length,
    totalMembers: allGroupUserIds.size,
    activeMembers: activeMembersCount,
    totalGroupUsage: formatDuration(totalUsageSecondsSum)
  };

  return {
    groups: groupCards,
    overviewMetrics
  };
}

/**
 * GET GROUP BY ID
 */
async function getGroupById(id, user) {
  checkOrganizationAccount(user);
  validateUuid(id, 'Group');

  const group = await prisma.group.findFirst({
    where: {
      id: id.trim(),
      organizationId: user.organizationId
    },
    include: {
      members: {
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              role: true
            }
          }
        }
      }
    }
  });

  if (!group) {
    const error = new Error('Group not found in your organization.');
    error.status = 404;
    throw error;
  }

  // Authorization check for non-admin: must be a group member
  if (user.role !== 'ADMIN') {
    const isMember = group.members.some(m => m.userId === user.id);
    if (!isMember) {
      const error = new Error('Forbidden: You are not a member of this group.');
      error.status = 403;
      throw error;
    }
  }

  const memberUserIds = group.members.map(m => m.userId);
  const telemetry = await getTelemetryForUserIds(memberUserIds);

  return {
    id: group.id,
    name: group.name,
    description: group.description,
    organizationId: group.organizationId,
    createdAt: group.createdAt,
    updatedAt: group.updatedAt,
    memberCount: group.members.length,
    activeMembers: telemetry.activeMembersToday,
    totalSessions: telemetry.totalSessions,
    totalUsageTime: telemetry.totalUsageTimeFormatted,
    platformUsage: telemetry.platformBreakdown,
    members: group.members.map(m => ({
      id: m.id,
      userId: m.user.id,
      name: m.user.name,
      email: m.user.email,
      role: m.role, // GroupRole (ADMIN / MEMBER)
      userRole: m.user.role, // System Role (ADMIN / ANALYST / USER)
      joinedAt: m.joinedAt
    }))
  };
}

/**
 * CREATE GROUP
 */
async function createGroup(groupData, creatorUser) {
  checkOrganizationAdmin(creatorUser);
  const { name, description } = groupData;

  if (!name || typeof name !== 'string' || !name.trim()) {
    const error = new Error('Group name is required.');
    error.status = 400;
    throw error;
  }

  const trimmedName = name.trim();
  if (trimmedName.length > 100) {
    const error = new Error('Group name cannot exceed 100 characters.');
    error.status = 400;
    throw error;
  }

  // Check duplicate group name within organization
  const existingGroup = await prisma.group.findFirst({
    where: {
      organizationId: creatorUser.organizationId,
      name: { equals: trimmedName, mode: 'insensitive' }
    }
  });

  if (existingGroup) {
    const error = new Error(`A group with the name '${trimmedName}' already exists in your organization.`);
    error.status = 400;
    throw error;
  }

  const newGroup = await prisma.group.create({
    data: {
      name: trimmedName,
      description: description ? description.trim() : null,
      organizationId: creatorUser.organizationId,
      members: {
        create: {
          userId: creatorUser.id,
          role: 'ADMIN'
        }
      }
    },
    include: {
      members: true
    }
  });

  logger.info(`Group '${newGroup.name}' (${newGroup.id}) created by Admin: ${creatorUser.id}`);
  return newGroup;
}

/**
 * UPDATE GROUP (Rename / Edit description)
 */
async function updateGroup(groupId, groupData, user) {
  checkOrganizationAdmin(user);
  validateUuid(groupId, 'Group');
  const cleanGroupId = groupId.trim();

  const existingGroup = await prisma.group.findFirst({
    where: {
      id: cleanGroupId,
      organizationId: user.organizationId
    }
  });

  if (!existingGroup) {
    const error = new Error('Group not found in your organization.');
    error.status = 404;
    throw error;
  }

  const { name, description } = groupData;
  const updateData = {};

  if (name !== undefined) {
    if (!name || typeof name !== 'string' || !name.trim()) {
      const error = new Error('Group name cannot be empty.');
      error.status = 400;
      throw error;
    }
    const trimmedName = name.trim();
    if (trimmedName.length > 100) {
      const error = new Error('Group name cannot exceed 100 characters.');
      error.status = 400;
      throw error;
    }

    // Duplicate check if name changed
    if (trimmedName.toLowerCase() !== existingGroup.name.toLowerCase()) {
      const duplicate = await prisma.group.findFirst({
        where: {
          organizationId: user.organizationId,
          name: { equals: trimmedName, mode: 'insensitive' },
          id: { not: cleanGroupId }
        }
      });
      if (duplicate) {
        const error = new Error(`A group named '${trimmedName}' already exists in your organization.`);
        error.status = 400;
        throw error;
      }
    }
    updateData.name = trimmedName;
  }

  if (description !== undefined) {
    updateData.description = description ? description.trim() : null;
  }

  const updatedGroup = await prisma.group.update({
    where: { id: cleanGroupId },
    data: updateData
  });

  logger.info(`Group '${updatedGroup.id}' updated by Admin ${user.id}`);
  return updatedGroup;
}

/**
 * DELETE GROUP
 */
async function deleteGroup(groupId, user) {
  checkOrganizationAdmin(user);
  validateUuid(groupId, 'Group');
  const cleanGroupId = groupId.trim();

  const existingGroup = await prisma.group.findFirst({
    where: {
      id: cleanGroupId,
      organizationId: user.organizationId
    }
  });

  if (!existingGroup) {
    const error = new Error('Group not found in your organization.');
    error.status = 404;
    throw error;
  }

  await prisma.group.delete({
    where: { id: cleanGroupId }
  });

  logger.info(`Group '${cleanGroupId}' deleted by Admin ${user.id}`);
  return { success: true, message: 'Group deleted successfully.' };
}

/**
 * GET GROUP MEMBERS with user session/activity stats
 */
async function getGroupMembers(groupId, user) {
  checkOrganizationAccount(user);
  validateUuid(groupId, 'Group');
  const cleanGroupId = groupId.trim();

  const group = await prisma.group.findFirst({
    where: {
      id: cleanGroupId,
      organizationId: user.organizationId
    },
    include: {
      members: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              createdAt: true
            }
          }
        }
      }
    }
  });

  if (!group) {
    const error = new Error('Group not found in your organization.');
    error.status = 404;
    throw error;
  }

  // Authorization check for non-admin
  if (user.role !== 'ADMIN') {
    const isMember = group.members.some(m => m.userId === user.id);
    if (!isMember) {
      const error = new Error('Forbidden: You are not a member of this group.');
      error.status = 403;
      throw error;
    }
  }

  const membersWithStats = [];

  for (const m of group.members) {
    const memberUser = m.user;
    
    // Calculate stats
    const sessions = await prisma.applicationSession.findMany({
      where: { userId: memberUser.id },
      select: { duration: true, lastActivityAt: true }
    });

    const totalSec = sessions.reduce((acc, s) => acc + (s.duration || 0), 0);

    const latestSession = await prisma.applicationSession.findFirst({
      where: { userId: memberUser.id },
      orderBy: { lastActivityAt: 'desc' }
    });

    const latestEvent = await prisma.applicationEvent.findFirst({
      where: { userId: memberUser.id },
      orderBy: { createdAt: 'desc' }
    });

    let lastActiveDate = null;
    if (latestSession && latestEvent) {
      lastActiveDate = latestSession.lastActivityAt > latestEvent.createdAt ? latestSession.lastActivityAt : latestEvent.createdAt;
    } else if (latestSession) {
      lastActiveDate = latestSession.lastActivityAt;
    } else if (latestEvent) {
      lastActiveDate = latestEvent.createdAt;
    } else {
      lastActiveDate = memberUser.createdAt;
    }

    membersWithStats.push({
      userId: memberUser.id,
      name: memberUser.name,
      email: memberUser.email,
      role: m.role, // GroupRole ADMIN/MEMBER
      userRole: memberUser.role, // System Role
      joinedAt: m.joinedAt,
      lastActive: formatRelativeTime(lastActiveDate),
      lastActiveDate,
      sessions: sessions.length,
      usageTime: formatDuration(totalSec)
    });
  }

  return membersWithStats;
}

/**
 * ADD EMPLOYEE TO GROUP (Admin only, same organization check enforced!)
 */
async function addGroupMember(groupId, targetUserId, user) {
  checkOrganizationAdmin(user);
  validateUuid(groupId, 'Group');
  validateUuid(targetUserId, 'User');

  const cleanGroupId = groupId.trim();
  const cleanUserId = targetUserId.trim();

  // Verify Group belongs to Admin's organization
  const group = await prisma.group.findFirst({
    where: {
      id: cleanGroupId,
      organizationId: user.organizationId
    }
  });

  if (!group) {
    const error = new Error('Group not found in your organization.');
    error.status = 404;
    throw error;
  }

  // Verify target user belongs to SAME organization
  const targetUser = await prisma.user.findFirst({
    where: {
      id: cleanUserId,
      organizationId: user.organizationId
    }
  });

  if (!targetUser) {
    const error = new Error('Employee not found in your organization. Cross-organization membership is not allowed.');
    error.status = 400;
    throw error;
  }

  // Check existing membership
  const existingMember = await prisma.userGroup.findUnique({
    where: {
      userId_groupId: { userId: cleanUserId, groupId: cleanGroupId }
    }
  });

  if (existingMember) {
    const error = new Error(`${targetUser.name} is already a member of this group.`);
    error.status = 400;
    throw error;
  }

  const membership = await prisma.userGroup.create({
    data: {
      groupId: cleanGroupId,
      userId: cleanUserId,
      role: 'MEMBER'
    },
    include: {
      user: {
        select: { id: true, name: true, email: true, role: true }
      }
    }
  });

  logger.info(`Admin ${user.id} added Employee ${cleanUserId} to Group ${cleanGroupId}`);
  return membership;
}

/**
 * REMOVE MEMBER FROM GROUP
 */
async function removeGroupMember(groupId, targetUserId, user) {
  checkOrganizationAccount(user);
  validateUuid(groupId, 'Group');
  validateUuid(targetUserId, 'User');

  const cleanGroupId = groupId.trim();
  const cleanUserId = targetUserId.trim();

  // Check if admin or self-removal
  const isSelf = user.id === cleanUserId;
  if (!isSelf && user.role !== 'ADMIN') {
    const error = new Error('Forbidden: Only Organization Administrators can remove members.');
    error.status = 403;
    throw error;
  }

  const group = await prisma.group.findFirst({
    where: {
      id: cleanGroupId,
      organizationId: user.organizationId
    }
  });

  if (!group) {
    const error = new Error('Group not found in your organization.');
    error.status = 404;
    throw error;
  }

  const membership = await prisma.userGroup.findUnique({
    where: {
      userId_groupId: { userId: cleanUserId, groupId: cleanGroupId }
    }
  });

  if (!membership) {
    const error = new Error('User is not a member of this group.');
    error.status = 404;
    throw error;
  }

  await prisma.userGroup.delete({
    where: {
      userId_groupId: { userId: cleanUserId, groupId: cleanGroupId }
    }
  });

  logger.info(`User ${cleanUserId} removed from Group ${cleanGroupId} by User ${user.id}`);
  return { success: true, message: 'Member removed from group.' };
}

/**
 * GET GROUP ANALYTICS
 */
async function getGroupAnalytics(groupId, user) {
  checkOrganizationAccount(user);
  validateUuid(groupId, 'Group');
  const cleanGroupId = groupId.trim();

  const group = await prisma.group.findFirst({
    where: {
      id: cleanGroupId,
      organizationId: user.organizationId
    },
    include: {
      members: { select: { userId: true } }
    }
  });

  if (!group) {
    const error = new Error('Group not found in your organization.');
    error.status = 404;
    throw error;
  }

  if (user.role !== 'ADMIN') {
    const isMember = group.members.some(m => m.userId === user.id);
    if (!isMember) {
      const error = new Error('Forbidden: You are not a member of this group.');
      error.status = 403;
      throw error;
    }
  }

  const memberUserIds = group.members.map(m => m.userId);
  const telemetry = await getTelemetryForUserIds(memberUserIds);

  // 7-day activity chart
  const activityChart = [];
  const now = new Date();

  for (let i = 6; i >= 0; i--) {
    const dayStart = new Date(now);
    dayStart.setDate(dayStart.getDate() - i);
    dayStart.setHours(0, 0, 0, 0);

    const dayEnd = new Date(dayStart);
    dayEnd.setHours(23, 59, 59, 999);

    let daySessionsCount = 0;
    let activeMembersDayCount = 0;

    if (memberUserIds.length > 0) {
      daySessionsCount = await prisma.applicationSession.count({
        where: {
          userId: { in: memberUserIds },
          startedAt: { gte: dayStart, lte: dayEnd }
        }
      });

      const activeSessionsDay = await prisma.applicationSession.findMany({
        where: {
          userId: { in: memberUserIds },
          lastActivityAt: { gte: dayStart, lte: dayEnd }
        },
        select: { userId: true }
      });

      const activeEventsDay = await prisma.applicationEvent.findMany({
        where: {
          userId: { in: memberUserIds },
          createdAt: { gte: dayStart, lte: dayEnd }
        },
        select: { userId: true }
      });

      const daySet = new Set([
        ...activeSessionsDay.map(s => s.userId),
        ...activeEventsDay.map(e => e.userId)
      ]);
      activeMembersDayCount = daySet.size;
    }

    const label = dayStart.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

    activityChart.push({
      date: label,
      sessions: daySessionsCount,
      activeMembers: activeMembersDayCount
    });
  }

  return {
    totalSessions: telemetry.totalSessions,
    totalUsageTime: telemetry.totalUsageTimeFormatted,
    activeMembers: telemetry.activeMembersToday,
    youtubeUsage: telemetry.platformBreakdown.YouTube,
    githubUsage: telemetry.platformBreakdown.GitHub,
    trendsUsage: telemetry.platformBreakdown.Trends,
    topFeatures: telemetry.topFeatures,
    activityChart
  };
}

/**
 * JOIN GROUP BY ID (Organization members join within their organization)
 */
async function joinGroup(groupId, userId, user) {
  checkOrganizationAccount(user);
  validateUuid(groupId, 'Group');
  const cleanGroupId = groupId.trim();

  const group = await prisma.group.findFirst({
    where: { 
      id: cleanGroupId,
      organizationId: user.organizationId
    }
  });

  if (!group) {
    const error = new Error('Group not found in your organization.');
    error.status = 404;
    throw error;
  }

  const membership = await prisma.userGroup.findUnique({
    where: {
      userId_groupId: { userId, groupId: cleanGroupId }
    }
  });

  if (membership) {
    return membership;
  }

  return prisma.userGroup.create({
    data: {
      groupId: cleanGroupId,
      userId,
      role: 'MEMBER'
    }
  });
}

/**
 * LEAVE GROUP
 */
async function leaveGroup(groupId, userId, user) {
  return removeGroupMember(groupId, userId, user);
}

module.exports = {
  getAllGroups,
  getGroupById,
  createGroup,
  updateGroup,
  deleteGroup,
  getGroupMembers,
  addGroupMember,
  removeGroupMember,
  getGroupAnalytics,
  joinGroup,
  leaveGroup
};

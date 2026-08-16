const { prisma } = require('../config/db');
const logger = require('../utils/logger');
const socketService = require('./socketService');

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function validateUuid(id, entityName = 'ID') {
  if (!id || typeof id !== 'string' || !UUID_REGEX.test(id.trim())) {
    const error = new Error(`Invalid ${entityName} format. Must be a valid 36-character UUID.`);
    error.status = 400;
    throw error;
  }
}

function checkOrganizationAccount(user) {
  if (!user || user.accountType === 'INDIVIDUAL' || !user.organizationId) {
    const error = new Error('Group Chat is available exclusively for Organization accounts.');
    error.status = 403;
    throw error;
  }
}

async function verifyGroupAccess(groupId, user) {
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

  const isMember = group.members.some(m => m.userId === user.id);
  const isOrgAdmin = user.role === 'ADMIN';

  if (!isMember && !isOrgAdmin) {
    const error = new Error('Forbidden: You must be a group member to access this chat.');
    error.status = 403;
    throw error;
  }

  return group;
}

/**
 * XSS Helper: Sanitize text content to escape HTML
 */
function sanitizeText(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * GET GROUP MESSAGES with pagination
 */
async function getGroupMessages({ groupId, user, cursor, limit = 50 }) {
  await verifyGroupAccess(groupId, user);
  const cleanGroupId = groupId.trim();

  const parsedLimit = Math.min(Math.max(parseInt(limit, 10) || 50, 1), 100);

  const queryOptions = {
    where: { groupId: cleanGroupId },
    take: parsedLimit + 1, // Take 1 extra to check if hasMore
    orderBy: { createdAt: 'desc' },
    include: {
      sender: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true
        }
      }
    }
  };

  if (cursor) {
    validateUuid(cursor, 'Message Cursor');
    queryOptions.cursor = { id: cursor.trim() };
    queryOptions.skip = 1;
  }

  const rawMessages = await prisma.groupMessage.findMany(queryOptions);

  let hasMore = false;
  let nextCursor = null;

  if (rawMessages.length > parsedLimit) {
    hasMore = true;
    const nextItem = rawMessages.pop(); // Remove extra item
    nextCursor = nextItem.id;
  }

  // Reverse so frontend gets chronological order (oldest -> newest)
  const messages = rawMessages.reverse().map(m => ({
    id: m.id,
    groupId: m.groupId,
    senderId: m.senderId,
    senderName: m.sender ? m.sender.name : 'Unknown User',
    senderEmail: m.sender ? m.sender.email : '',
    senderRole: m.sender ? m.sender.role : 'USER',
    content: m.isDeleted ? 'This message was deleted' : m.content,
    messageType: m.messageType || 'TEXT',
    reportData: m.isDeleted ? null : m.reportData,
    isDeleted: m.isDeleted,
    createdAt: m.createdAt,
    updatedAt: m.updatedAt
  }));

  return {
    messages,
    hasMore,
    nextCursor
  };
}

/**
 * CREATE GROUP MESSAGE (Supports TEXT and REPORT message types)
 */
async function createGroupMessage({ groupId, content, messageType = 'TEXT', reportData = null, user }) {
  await verifyGroupAccess(groupId, user);
  const cleanGroupId = groupId.trim();

  const isReport = messageType === 'REPORT' && reportData;
  const initialContent = content ? content.trim() : (isReport ? `Shared ${reportData.type || 'Analytics'} Report: ${reportData.title || ''}` : '');

  if (!initialContent) {
    const error = new Error('Message content or report payload is required.');
    error.status = 400;
    throw error;
  }

  if (initialContent.length > 2000) {
    const error = new Error('Message exceeds maximum limit of 2000 characters.');
    error.status = 400;
    throw error;
  }

  const safeContent = sanitizeText(initialContent);

  const messageRecord = await prisma.groupMessage.create({
    data: {
      groupId: cleanGroupId,
      senderId: user.id,
      content: safeContent,
      messageType: isReport ? 'REPORT' : 'TEXT',
      reportData: isReport ? reportData : null
    },
    include: {
      sender: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true
        }
      }
    }
  });

  const formattedMessage = {
    id: messageRecord.id,
    groupId: messageRecord.groupId,
    senderId: messageRecord.senderId,
    senderName: messageRecord.sender ? messageRecord.sender.name : user.name,
    senderEmail: messageRecord.sender ? messageRecord.sender.email : user.email,
    senderRole: messageRecord.sender ? messageRecord.sender.role : user.role,
    content: messageRecord.content,
    messageType: messageRecord.messageType,
    reportData: messageRecord.reportData,
    isDeleted: false,
    createdAt: messageRecord.createdAt,
    updatedAt: messageRecord.updatedAt
  };

  // Broadcast real-time message via Socket.IO
  socketService.broadcastToGroup(cleanGroupId, 'group:message', formattedMessage);

  logger.info(`User ${user.id} posted ${messageRecord.messageType} message in Group ${cleanGroupId}`);
  return formattedMessage;
}

/**
 * DELETE GROUP MESSAGE (Soft Delete)
 */
async function deleteGroupMessage({ groupId, messageId, user }) {
  await verifyGroupAccess(groupId, user);
  validateUuid(groupId, 'Group');
  validateUuid(messageId, 'Message');

  const cleanGroupId = groupId.trim();
  const cleanMessageId = messageId.trim();

  const messageRecord = await prisma.groupMessage.findFirst({
    where: {
      id: cleanMessageId,
      groupId: cleanGroupId
    }
  });

  if (!messageRecord) {
    const error = new Error('Message not found in this group.');
    error.status = 404;
    throw error;
  }

  const isSender = messageRecord.senderId === user.id;
  const isOrgAdmin = user.role === 'ADMIN';

  if (!isSender && !isOrgAdmin) {
    const error = new Error('Forbidden: You can only delete your own messages unless you are an Organization Administrator.');
    error.status = 403;
    throw error;
  }

  if (messageRecord.isDeleted) {
    return { id: cleanMessageId, groupId: cleanGroupId, isDeleted: true };
  }

  const updatedMessage = await prisma.groupMessage.update({
    where: { id: cleanMessageId },
    data: {
      isDeleted: true,
      content: 'This message was deleted',
      reportData: null
    }
  });

  // Broadcast deletion event via Socket.IO
  socketService.broadcastToGroup(cleanGroupId, 'group:message:deleted', {
    messageId: cleanMessageId,
    groupId: cleanGroupId
  });

  logger.info(`Message ${cleanMessageId} deleted by User ${user.id} in Group ${cleanGroupId}`);
  return {
    id: updatedMessage.id,
    groupId: updatedMessage.groupId,
    isDeleted: true,
    message: 'Message deleted successfully.'
  };
}

module.exports = {
  getGroupMessages,
  createGroupMessage,
  deleteGroupMessage
};

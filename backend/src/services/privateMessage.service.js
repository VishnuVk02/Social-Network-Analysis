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
    const error = new Error('Private messaging is available exclusively for Organization accounts.');
    error.status = 403;
    throw error;
  }
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
 * Verify user is a participant of the target conversation within their organization
 */
async function verifyConversationAccess(conversationId, user) {
  checkOrganizationAccount(user);
  validateUuid(conversationId, 'Conversation');
  const cleanId = conversationId.trim();

  const conversation = await prisma.conversation.findFirst({
    where: {
      id: cleanId,
      organizationId: user.organizationId
    },
    include: {
      participants: {
        include: {
          user: {
            select: { id: true, name: true, email: true, role: true }
          }
        }
      }
    }
  });

  if (!conversation) {
    const error = new Error('Private conversation not found in your organization.');
    error.status = 404;
    throw error;
  }

  // PRIVACY RULE: User MUST be one of the participants.
  // Org Admins do NOT get automatic access to employees' private conversations!
  const isParticipant = conversation.participants.some(p => p.userId === user.id);

  if (!isParticipant) {
    const error = new Error('Forbidden: You are not a participant in this private conversation.');
    error.status = 403;
    throw error;
  }

  return conversation;
}

/**
 * GET ALL CONVERSATIONS for current user
 */
async function getUserConversations({ user }) {
  checkOrganizationAccount(user);

  const rawConversations = await prisma.conversation.findMany({
    where: {
      organizationId: user.organizationId,
      participants: {
        some: { userId: user.id }
      }
    },
    orderBy: { updatedAt: 'desc' },
    include: {
      participants: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true
            }
          }
        }
      },
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1
      }
    }
  });

  return rawConversations.map(conv => {
    const otherParticipantEntry = conv.participants.find(p => p.userId !== user.id);
    const otherUser = otherParticipantEntry ? otherParticipantEntry.user : null;
    const lastMsg = conv.messages.length > 0 ? conv.messages[0] : null;

    return {
      id: conv.id,
      organizationId: conv.organizationId,
      updatedAt: conv.updatedAt,
      createdAt: conv.createdAt,
      otherParticipant: otherUser ? {
        id: otherUser.id,
        name: otherUser.name,
        email: otherUser.email,
        role: otherUser.role
      } : { id: 'unknown', name: 'Former Employee', email: '', role: 'USER' },
      lastMessage: lastMsg ? {
        id: lastMsg.id,
        senderId: lastMsg.senderId,
        content: lastMsg.isDeleted ? 'This message was deleted' : lastMsg.content,
        messageType: lastMsg.messageType || 'TEXT',
        reportData: lastMsg.isDeleted ? null : lastMsg.reportData,
        isDeleted: lastMsg.isDeleted,
        createdAt: lastMsg.createdAt
      } : null
    };
  });
}

/**
 * GET OR CREATE CANONICAL 1-TO-1 CONVERSATION
 */
async function getOrCreateConversation({ user, recipientId }) {
  checkOrganizationAccount(user);
  validateUuid(recipientId, 'Recipient User');

  const cleanRecipientId = recipientId.trim();

  if (cleanRecipientId === user.id) {
    const error = new Error('You cannot initiate a private conversation with yourself.');
    error.status = 400;
    throw error;
  }

  // Verify recipient user belongs to the same organization
  const recipientUser = await prisma.user.findFirst({
    where: {
      id: cleanRecipientId,
      organizationId: user.organizationId,
      accountType: 'ORGANIZATION'
    },
    select: { id: true, name: true, email: true, role: true }
  });

  if (!recipientUser) {
    const error = new Error('Recipient employee not found in your organization.');
    error.status = 404;
    throw error;
  }

  // Find existing canonical 1-to-1 conversation between user and recipient
  const existingConversations = await prisma.conversation.findMany({
    where: {
      organizationId: user.organizationId,
      AND: [
        { participants: { some: { userId: user.id } } },
        { participants: { some: { userId: cleanRecipientId } } }
      ]
    },
    include: {
      participants: {
        include: {
          user: {
            select: { id: true, name: true, email: true, role: true }
          }
        }
      },
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1
      }
    }
  });

  // Filter for exact 1-to-1 conversation with exactly 2 participants
  const existingConv = existingConversations.find(c => c.participants.length === 2);

  if (existingConv) {
    return {
      id: existingConv.id,
      organizationId: existingConv.organizationId,
      updatedAt: existingConv.updatedAt,
      createdAt: existingConv.createdAt,
      otherParticipant: recipientUser,
      lastMessage: existingConv.messages.length > 0 ? {
        id: existingConv.messages[0].id,
        senderId: existingConv.messages[0].senderId,
        content: existingConv.messages[0].isDeleted ? 'This message was deleted' : existingConv.messages[0].content,
        messageType: existingConv.messages[0].messageType || 'TEXT',
        reportData: existingConv.messages[0].isDeleted ? null : existingConv.messages[0].reportData,
        isDeleted: existingConv.messages[0].isDeleted,
        createdAt: existingConv.messages[0].createdAt
      } : null
    };
  }

  // Create new canonical 1-to-1 conversation
  const newConversation = await prisma.conversation.create({
    data: {
      organizationId: user.organizationId,
      participants: {
        create: [
          { userId: user.id },
          { userId: cleanRecipientId }
        ]
      }
    },
    include: {
      participants: {
        include: {
          user: {
            select: { id: true, name: true, email: true, role: true }
          }
        }
      }
    }
  });

  logger.info(`Created new private conversation ${newConversation.id} between User ${user.id} and User ${cleanRecipientId}`);

  return {
    id: newConversation.id,
    organizationId: newConversation.organizationId,
    updatedAt: newConversation.updatedAt,
    createdAt: newConversation.createdAt,
    otherParticipant: recipientUser,
    lastMessage: null
  };
}

/**
 * GET MESSAGES for a private conversation
 */
async function getPrivateMessages({ conversationId, user, cursor, limit = 50 }) {
  await verifyConversationAccess(conversationId, user);
  const cleanId = conversationId.trim();

  const parsedLimit = Math.min(Math.max(parseInt(limit, 10) || 50, 1), 100);

  const queryOptions = {
    where: { conversationId: cleanId },
    take: parsedLimit + 1,
    orderBy: { createdAt: 'desc' },
    include: {
      sender: {
        select: { id: true, name: true, email: true, role: true }
      }
    }
  };

  if (cursor) {
    validateUuid(cursor, 'Message Cursor');
    queryOptions.cursor = { id: cursor.trim() };
    queryOptions.skip = 1;
  }

  const rawMessages = await prisma.privateMessage.findMany(queryOptions);

  let hasMore = false;
  let nextCursor = null;

  if (rawMessages.length > parsedLimit) {
    hasMore = true;
    const nextItem = rawMessages.pop();
    nextCursor = nextItem.id;
  }

  const messages = rawMessages.reverse().map(m => ({
    id: m.id,
    conversationId: m.conversationId,
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
 * CREATE PRIVATE MESSAGE (Supports TEXT and REPORT)
 */
async function createPrivateMessage({ conversationId, content, messageType = 'TEXT', reportData = null, user }) {
  await verifyConversationAccess(conversationId, user);
  const cleanId = conversationId.trim();

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

  // DB persistence
  const messageRecord = await prisma.privateMessage.create({
    data: {
      conversationId: cleanId,
      senderId: user.id,
      content: safeContent,
      messageType: isReport ? 'REPORT' : 'TEXT',
      reportData: isReport ? reportData : null
    },
    include: {
      sender: {
        select: { id: true, name: true, email: true, role: true }
      }
    }
  });

  // Touch conversation timestamp
  await prisma.conversation.update({
    where: { id: cleanId },
    data: { updatedAt: new Date() }
  });

  const formattedMessage = {
    id: messageRecord.id,
    conversationId: messageRecord.conversationId,
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

  // Broadcast real-time private message over Socket.IO
  socketService.broadcastToConversation(cleanId, 'conversation:message', formattedMessage);

  logger.info(`User ${user.id} sent ${messageRecord.messageType} private message in Conversation ${cleanId}`);
  return formattedMessage;
}

/**
 * DELETE PRIVATE MESSAGE (Soft Delete)
 */
async function deletePrivateMessage({ conversationId, messageId, user }) {
  await verifyConversationAccess(conversationId, user);
  validateUuid(conversationId, 'Conversation');
  validateUuid(messageId, 'Message');

  const cleanConvId = conversationId.trim();
  const cleanMessageId = messageId.trim();

  const messageRecord = await prisma.privateMessage.findFirst({
    where: {
      id: cleanMessageId,
      conversationId: cleanConvId
    }
  });

  if (!messageRecord) {
    const error = new Error('Private message not found.');
    error.status = 404;
    throw error;
  }

  // PRIVACY RULE: ONLY the original sender can delete their own private message.
  // Org Admins or other participants CANNOT delete another user's private message!
  if (messageRecord.senderId !== user.id) {
    const error = new Error('Forbidden: You can only delete your own private messages.');
    error.status = 403;
    throw error;
  }

  if (messageRecord.isDeleted) {
    return { id: cleanMessageId, conversationId: cleanConvId, isDeleted: true };
  }

  const updatedMessage = await prisma.privateMessage.update({
    where: { id: cleanMessageId },
    data: {
      isDeleted: true,
      content: 'This message was deleted',
      reportData: null
    }
  });

  // Broadcast deletion event via Socket.IO
  socketService.broadcastToConversation(cleanConvId, 'conversation:message:deleted', {
    messageId: cleanMessageId,
    conversationId: cleanConvId
  });

  logger.info(`User ${user.id} deleted private message ${cleanMessageId} in Conversation ${cleanConvId}`);
  return {
    id: updatedMessage.id,
    conversationId: updatedMessage.conversationId,
    isDeleted: true,
    message: 'Private message deleted successfully.'
  };
}

module.exports = {
  getUserConversations,
  getOrCreateConversation,
  getPrivateMessages,
  createPrivateMessage,
  deletePrivateMessage
};

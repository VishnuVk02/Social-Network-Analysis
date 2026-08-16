const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const { prisma } = require('../config/db');
const logger = require('../utils/logger');

let io = null;

function init(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PATCH', 'DELETE']
    }
  });

  // Socket Authentication Middleware
  io.use(async (socket, next) => {
    try {
      let token = socket.handshake.auth?.token || socket.handshake.headers?.authorization;

      if (token && token.startsWith('Bearer ')) {
        token = token.split(' ')[1];
      }

      if (!token) {
        return next(new Error('Authentication failed: Missing token.'));
      }

      if (!process.env.JWT_SECRET) {
        logger.error('JWT_SECRET environment variable is missing or unconfigured.');
        return next(new Error('Authentication failed: Server configuration error (JWT_SECRET is missing).'));
      }

      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET
      );

      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          accountType: true,
          organizationId: true
        }
      });

      if (!user) {
        return next(new Error('Authentication failed: User not found.'));
      }

      if (user.accountType !== 'ORGANIZATION' || !user.organizationId) {
        return next(new Error('Forbidden: Group chat is available exclusively for Organization accounts.'));
      }

      socket.user = user;
      next();
    } catch (err) {
      logger.error('Socket authentication failure:', err.message);
      return next(new Error('Authentication failed: Invalid or expired token.'));
    }
  });

  // Connection Handler
  io.on('connection', (socket) => {
    logger.info(`Socket connected: ${socket.id} (User: ${socket.user.name} - ${socket.user.id})`);

    // Room Join Authorization
    socket.on('group:join', async (data, callback) => {
      try {
        const groupId = typeof data === 'string' ? data : data?.groupId;
        if (!groupId) {
          if (callback) callback({ success: false, message: 'groupId is required.' });
          return;
        }

        const cleanGroupId = groupId.trim();

        // Verify group exists & belongs to user's organization
        const group = await prisma.group.findFirst({
          where: {
            id: cleanGroupId,
            organizationId: socket.user.organizationId
          },
          include: {
            members: { select: { userId: true } }
          }
        });

        if (!group) {
          if (callback) callback({ success: false, message: 'Group not found in your organization.' });
          return;
        }

        // Authorization check: Must be member OR Org Admin
        const isMember = group.members.some(m => m.userId === socket.user.id);
        const isOrgAdmin = socket.user.role === 'ADMIN';

        if (!isMember && !isOrgAdmin) {
          if (callback) callback({ success: false, message: 'Forbidden: You are not a member of this group.' });
          return;
        }

        const roomName = `group:${cleanGroupId}`;
        socket.join(roomName);
        logger.info(`User ${socket.user.name} (${socket.user.id}) joined socket room ${roomName}`);

        if (callback) callback({ success: true, room: roomName });
      } catch (error) {
        logger.error('Error in socket event group:join:', error);
        if (callback) callback({ success: false, message: 'Failed to join group chat room.' });
      }
    });

    // Private Conversation Room Join Authorization
    socket.on('conversation:join', async (data, callback) => {
      try {
        const conversationId = typeof data === 'string' ? data : data?.conversationId;
        if (!conversationId) {
          if (callback) callback({ success: false, message: 'conversationId is required.' });
          return;
        }

        const cleanConvId = conversationId.trim();

        // Verify conversation exists & belongs to user's organization
        const conversation = await prisma.conversation.findFirst({
          where: {
            id: cleanConvId,
            organizationId: socket.user.organizationId
          },
          include: {
            participants: { select: { userId: true } }
          }
        });

        if (!conversation) {
          if (callback) callback({ success: false, message: 'Private conversation not found in your organization.' });
          return;
        }

        // PRIVACY RULE: User MUST be one of the participants. Org Admins are NOT auto-authorized.
        const isParticipant = conversation.participants.some(p => p.userId === socket.user.id);

        if (!isParticipant) {
          if (callback) callback({ success: false, message: 'Forbidden: You are not a participant in this conversation.' });
          return;
        }

        const roomName = `conversation:${cleanConvId}`;
        socket.join(roomName);
        logger.info(`User ${socket.user.name} (${socket.user.id}) joined private conversation room ${roomName}`);

        if (callback) callback({ success: true, room: roomName });
      } catch (error) {
        logger.error('Error in socket event conversation:join:', error);
        if (callback) callback({ success: false, message: 'Failed to join private conversation room.' });
      }
    });

    // Room Leave
    socket.on('group:leave', (data) => {
      const groupId = typeof data === 'string' ? data : data?.groupId;
      if (groupId) {
        const roomName = `group:${groupId.trim()}`;
        socket.leave(roomName);
        logger.info(`User ${socket.user.name} left socket room ${roomName}`);
      }
    });

    socket.on('conversation:leave', (data) => {
      const conversationId = typeof data === 'string' ? data : data?.conversationId;
      if (conversationId) {
        const roomName = `conversation:${conversationId.trim()}`;
        socket.leave(roomName);
        logger.info(`User ${socket.user.name} left socket room ${roomName}`);
      }
    });

    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
}

function getIO() {
  if (!io) {
    throw new Error('Socket.IO has not been initialized.');
  }
  return io;
}

function broadcastToGroup(groupId, eventName, data) {
  if (io && groupId) {
    const roomName = `group:${groupId.trim()}`;
    io.to(roomName).emit(eventName, data);
  }
}

function broadcastToConversation(conversationId, eventName, data) {
  if (io && conversationId) {
    const roomName = `conversation:${conversationId.trim()}`;
    io.to(roomName).emit(eventName, data);
  }
}

module.exports = {
  init,
  getIO,
  broadcastToGroup,
  broadcastToConversation
};

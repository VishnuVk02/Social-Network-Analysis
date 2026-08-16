const privateMessageService = require('../services/privateMessage.service');

async function getUserConversations(req, res, next) {
  try {
    const conversations = await privateMessageService.getUserConversations({
      user: req.user
    });

    return res.status(200).json({
      success: true,
      data: conversations
    });
  } catch (error) {
    next(error);
  }
}

async function getOrCreateConversation(req, res, next) {
  try {
    const { recipientId } = req.body;
    const conversation = await privateMessageService.getOrCreateConversation({
      user: req.user,
      recipientId
    });

    return res.status(200).json({
      success: true,
      data: conversation
    });
  } catch (error) {
    next(error);
  }
}

async function getPrivateMessages(req, res, next) {
  try {
    const result = await privateMessageService.getPrivateMessages({
      conversationId: req.params.conversationId,
      user: req.user,
      cursor: req.query.cursor,
      limit: req.query.limit
    });

    return res.status(200).json({
      success: true,
      data: result.messages,
      hasMore: result.hasMore,
      nextCursor: result.nextCursor
    });
  } catch (error) {
    next(error);
  }
}

async function createPrivateMessage(req, res, next) {
  try {
    const message = await privateMessageService.createPrivateMessage({
      conversationId: req.params.conversationId,
      content: req.body.content,
      messageType: req.body.messageType,
      reportData: req.body.reportData,
      user: req.user
    });

    return res.status(201).json({
      success: true,
      message: 'Private message sent successfully.',
      data: message
    });
  } catch (error) {
    next(error);
  }
}

async function deletePrivateMessage(req, res, next) {
  try {
    const result = await privateMessageService.deletePrivateMessage({
      conversationId: req.params.conversationId,
      messageId: req.params.messageId,
      user: req.user
    });

    return res.status(200).json({
      success: true,
      message: 'Private message deleted successfully.',
      data: result
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getUserConversations,
  getOrCreateConversation,
  getPrivateMessages,
  createPrivateMessage,
  deletePrivateMessage
};

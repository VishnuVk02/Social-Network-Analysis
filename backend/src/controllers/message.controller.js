const messageService = require('../services/message.service');

async function getGroupMessages(req, res, next) {
  try {
    const result = await messageService.getGroupMessages({
      groupId: req.params.id,
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

async function createGroupMessage(req, res, next) {
  try {
    const message = await messageService.createGroupMessage({
      groupId: req.params.id,
      content: req.body.content,
      messageType: req.body.messageType,
      reportData: req.body.reportData,
      user: req.user
    });

    return res.status(201).json({
      success: true,
      message: 'Message sent successfully.',
      data: message
    });
  } catch (error) {
    next(error);
  }
}

async function deleteGroupMessage(req, res, next) {
  try {
    const result = await messageService.deleteGroupMessage({
      groupId: req.params.id,
      messageId: req.params.messageId,
      user: req.user
    });

    return res.status(200).json({
      success: true,
      message: 'Message deleted successfully.',
      data: result
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getGroupMessages,
  createGroupMessage,
  deleteGroupMessage
};

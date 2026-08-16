const express = require('express');
const privateMessageController = require('../controllers/privateMessage.controller');
const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();

// Enforce authentication on all private message routes
router.use(authenticate);

// Conversations endpoints
router.route('/conversations')
  .get(privateMessageController.getUserConversations)
  .post(privateMessageController.getOrCreateConversation);

// Messages within a conversation
router.route('/conversations/:conversationId/messages')
  .get(privateMessageController.getPrivateMessages)
  .post(privateMessageController.createPrivateMessage);

router.delete(
  '/conversations/:conversationId/messages/:messageId',
  privateMessageController.deletePrivateMessage
);

module.exports = router;

const express = require('express');
const groupController = require('../controllers/group.controller');
const messageController = require('../controllers/message.controller');
const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();

// Apply authentication to all group routes
router.use(authenticate);

router.route('/')
  .get(groupController.getAllGroups)
  .post(groupController.createGroup);

router.post('/join', groupController.joinGroup);
router.post('/leave', groupController.leaveGroup);

router.route('/:id')
  .get(groupController.getGroupById)
  .patch(groupController.updateGroup)
  .delete(groupController.deleteGroup);

router.route('/:id/members')
  .get(groupController.getGroupMembers)
  .post(groupController.addGroupMember);

router.delete('/:id/members/:userId', groupController.removeGroupMember);

router.get('/:id/analytics', groupController.getGroupAnalytics);

// Chat Message Endpoints
router.route('/:id/messages')
  .get(messageController.getGroupMessages)
  .post(messageController.createGroupMessage);

router.delete('/:id/messages/:messageId', messageController.deleteGroupMessage);

module.exports = router;

const groupService = require('../services/group.service');
const logger = require('../utils/logger');

async function getAllGroups(req, res, next) {
  try {
    const result = await groupService.getAllGroups(req.user);
    return res.status(200).json({
      success: true,
      data: result.groups,
      overviewMetrics: result.overviewMetrics
    });
  } catch (error) {
    next(error);
  }
}

async function getGroupById(req, res, next) {
  try {
    const group = await groupService.getGroupById(req.params.id, req.user);
    return res.status(200).json({
      success: true,
      data: group
    });
  } catch (error) {
    next(error);
  }
}

async function createGroup(req, res, next) {
  try {
    const group = await groupService.createGroup(req.body, req.user);
    
    logger.info(`Group '${group.name}' created by user: ${req.user.id}`);
    
    return res.status(201).json({
      success: true,
      message: 'Group created successfully.',
      data: group
    });
  } catch (error) {
    next(error);
  }
}

async function updateGroup(req, res, next) {
  try {
    const group = await groupService.updateGroup(req.params.id, req.body, req.user);
    
    logger.info(`Group '${req.params.id}' updated by user: ${req.user.id}`);
    
    return res.status(200).json({
      success: true,
      message: 'Group updated successfully.',
      data: group
    });
  } catch (error) {
    next(error);
  }
}

async function deleteGroup(req, res, next) {
  try {
    const result = await groupService.deleteGroup(req.params.id, req.user);
    
    logger.info(`Group '${req.params.id}' deleted by user: ${req.user.id}`);
    
    return res.status(200).json({
      success: true,
      message: result.message
    });
  } catch (error) {
    next(error);
  }
}

async function getGroupMembers(req, res, next) {
  try {
    const members = await groupService.getGroupMembers(req.params.id, req.user);
    return res.status(200).json({
      success: true,
      data: members
    });
  } catch (error) {
    next(error);
  }
}

async function addGroupMember(req, res, next) {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'userId is required.'
      });
    }

    const membership = await groupService.addGroupMember(req.params.id, userId, req.user);
    logger.info(`User: ${userId} added to Group: ${req.params.id} by Admin: ${req.user.id}`);

    return res.status(201).json({
      success: true,
      message: 'Employee added to group successfully.',
      data: membership
    });
  } catch (error) {
    next(error);
  }
}

async function removeGroupMember(req, res, next) {
  try {
    const result = await groupService.removeGroupMember(req.params.id, req.params.userId, req.user);
    logger.info(`User: ${req.params.userId} removed from Group: ${req.params.id} by User: ${req.user.id}`);

    return res.status(200).json({
      success: true,
      message: result.message
    });
  } catch (error) {
    next(error);
  }
}

async function getGroupAnalytics(req, res, next) {
  try {
    const analytics = await groupService.getGroupAnalytics(req.params.id, req.user);
    return res.status(200).json({
      success: true,
      data: analytics
    });
  } catch (error) {
    next(error);
  }
}

async function joinGroup(req, res, next) {
  try {
    const { groupId } = req.body;

    if (!groupId) {
      return res.status(400).json({
        success: false,
        message: 'groupId is required.'
      });
    }

    const membership = await groupService.joinGroup(groupId, req.user.id, req.user);
    logger.info(`User: ${req.user.id} joined Group: ${groupId}`);

    return res.status(200).json({
      success: true,
      message: 'Joined group successfully.',
      data: membership
    });
  } catch (error) {
    next(error);
  }
}

async function leaveGroup(req, res, next) {
  try {
    const groupId = req.body.groupId || req.params.id;

    if (!groupId) {
      return res.status(400).json({
        success: false,
        message: 'groupId is required.'
      });
    }

    const result = await groupService.leaveGroup(groupId, req.user.id, req.user);
    logger.info(`User: ${req.user.id} left Group: ${groupId}`);

    return res.status(200).json({
      success: true,
      message: result.message
    });
  } catch (error) {
    next(error);
  }
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

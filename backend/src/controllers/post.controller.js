const postService = require('../services/post.service');

async function getAllPosts(req, res, next) {
  try {
    const { platformId, platformKey } = req.query;
    const posts = await postService.getAllPosts({ platformId, platformKey });
    return res.status(200).json({
      success: true,
      data: posts
    });
  } catch (error) {
    next(error);
  }
}

async function getPostById(req, res, next) {
  try {
    const post = await postService.getPostById(req.params.id);
    return res.status(200).json({
      success: true,
      data: post
    });
  } catch (error) {
    next(error);
  }
}

async function createPost(req, res, next) {
  try {
    const post = await postService.createPost(req.body);
    return res.status(201).json({
      success: true,
      message: 'Post created successfully.',
      data: post
    });
  } catch (error) {
    next(error);
  }
}

async function updatePost(req, res, next) {
  try {
    const post = await postService.updatePost(req.params.id, req.body);
    return res.status(200).json({
      success: true,
      message: 'Post updated successfully.',
      data: post
    });
  } catch (error) {
    next(error);
  }
}

async function deletePost(req, res, next) {
  try {
    await postService.deletePost(req.params.id);
    return res.status(200).json({
      success: true,
      message: 'Post deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAllPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost
};

const express = require('express');
const postController = require('../controllers/post.controller');
const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();

// Apply authentication
router.use(authenticate);

router.route('/')
  .get(postController.getAllPosts)
  .post(postController.createPost);

router.route('/:id')
  .get(postController.getPostById)
  .put(postController.updatePost)
  .delete(postController.deletePost);

module.exports = router;

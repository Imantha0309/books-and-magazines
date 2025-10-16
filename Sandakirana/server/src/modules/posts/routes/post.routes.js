const express = require('express');
const postController = require('../controllers/post.controller');
const commentController = require('../controllers/comment.controller');
const replyController = require('../controllers/reply.controller');

const router = express.Router();

router.route('/').get(postController.getPosts).post(postController.createPost);
router.put('/:postId', postController.updatePost);
router.delete('/:postId', postController.deletePost);
router.get('/:postId/report', postController.getPostReport);
router.post('/:postId/like', postController.togglePostLike);

router.post('/:postId/comments', commentController.addComment);
router.put('/:postId/comments/:commentId', commentController.updateComment);
router.delete('/:postId/comments/:commentId', commentController.deleteComment);
router.post('/:postId/comments/:commentId/like', commentController.toggleCommentLike);

router.post('/:postId/comments/:commentId/replies', replyController.addReply);
router.put(
  '/:postId/comments/:commentId/replies/:replyId',
  replyController.updateReply
);
router.delete(
  '/:postId/comments/:commentId/replies/:replyId',
  replyController.deleteReply
);
router.post(
  '/:postId/comments/:commentId/replies/:replyId/like',
  replyController.toggleReplyLike
);

module.exports = router;

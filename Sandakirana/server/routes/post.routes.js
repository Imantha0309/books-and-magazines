const express = require('express');
const {
  createPost,
  getPosts,
  updatePost,
  deletePost,
  togglePostLike,
  addComment,
  updateComment,
  deleteComment,
  toggleCommentLike,
  addReply,
  updateReply,
  deleteReply,
  toggleReplyLike,
  getPostReport,
} = require('../controllers/post.controller');

const router = express.Router();

router.route('/').get(getPosts).post(createPost);
router.put('/:postId', updatePost);
router.delete('/:postId', deletePost);
router.get('/:postId/report', getPostReport);
router.post('/:postId/like', togglePostLike);
router.post('/:postId/comments', addComment);
router.put('/:postId/comments/:commentId', updateComment);
router.delete('/:postId/comments/:commentId', deleteComment);
router.post('/:postId/comments/:commentId/like', toggleCommentLike);
router.post('/:postId/comments/:commentId/replies', addReply);
router.put('/:postId/comments/:commentId/replies/:replyId', updateReply);
router.delete('/:postId/comments/:commentId/replies/:replyId', deleteReply);
router.post(
  '/:postId/comments/:commentId/replies/:replyId/like',
  toggleReplyLike
);

module.exports = router;

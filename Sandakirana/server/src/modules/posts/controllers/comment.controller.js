const {
  addComment,
  updateComment,
  deleteComment,
  toggleCommentLike,
} = require('../services/comment.service');

const respondWithError = (res, error) => {
  const status = error.status || 500;
  res.status(status).json({
    success: false,
    message: error.message || 'An unexpected error occurred.',
  });
};

exports.addComment = async (req, res) => {
  try {
    const post = await addComment(req.params.postId, req.body || {});
    res.status(201).json({
      success: true,
      data: post,
    });
  } catch (error) {
    respondWithError(res, error);
  }
};

exports.updateComment = async (req, res) => {
  try {
    const post = await updateComment(req.params.postId, req.params.commentId, req.body || {});
    res.status(200).json({
      success: true,
      data: post,
    });
  } catch (error) {
    respondWithError(res, error);
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const post = await deleteComment(req.params.postId, req.params.commentId, req.body || {});
    res.status(200).json({
      success: true,
      data: post,
    });
  } catch (error) {
    respondWithError(res, error);
  }
};

exports.toggleCommentLike = async (req, res) => {
  try {
    const post = await toggleCommentLike(
      req.params.postId,
      req.params.commentId,
      req.body || {}
    );
    res.status(200).json({
      success: true,
      data: post,
    });
  } catch (error) {
    respondWithError(res, error);
  }
};

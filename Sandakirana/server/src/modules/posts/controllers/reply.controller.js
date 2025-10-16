const {
  addReply,
  toggleReplyLike,
  updateReply,
  deleteReply,
} = require('../services/reply.service');

const respondWithError = (res, error) => {
  const status = error.status || 500;
  res.status(status).json({
    success: false,
    message: error.message || 'An unexpected error occurred.',
  });
};

exports.addReply = async (req, res) => {
  try {
    const post = await addReply(req.params.postId, req.params.commentId, req.body || {});
    res.status(201).json({
      success: true,
      data: post,
    });
  } catch (error) {
    respondWithError(res, error);
  }
};

exports.toggleReplyLike = async (req, res) => {
  try {
    const post = await toggleReplyLike(
      req.params.postId,
      req.params.commentId,
      req.params.replyId,
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

exports.updateReply = async (req, res) => {
  try {
    const post = await updateReply(
      req.params.postId,
      req.params.commentId,
      req.params.replyId,
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

exports.deleteReply = async (req, res) => {
  try {
    const post = await deleteReply(
      req.params.postId,
      req.params.commentId,
      req.params.replyId,
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

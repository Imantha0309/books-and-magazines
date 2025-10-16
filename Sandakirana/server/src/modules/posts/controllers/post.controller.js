const {
  listPosts,
  createPost,
  updatePost,
  deletePost,
  togglePostLike,
  buildPostReport,
} = require('../services/post.service');

const respondWithError = (res, error) => {
  const status = error.status || 500;
  res.status(status).json({
    success: false,
    message: error.message || 'An unexpected error occurred.',
  });
};

exports.getPosts = async (req, res) => {
  try {
    const { authorId } = req.query;
    const posts = await listPosts({ authorId });
    res.status(200).json({
      success: true,
      data: posts,
    });
  } catch (error) {
    respondWithError(res, error);
  }
};

exports.createPost = async (req, res) => {
  try {
    const post = await createPost(req.body || {});
    res.status(201).json({
      success: true,
      data: post,
      message: 'Post published successfully.',
    });
  } catch (error) {
    respondWithError(res, error);
  }
};

exports.updatePost = async (req, res) => {
  try {
    const post = await updatePost(req.params.postId, req.body || {});
    res.status(200).json({
      success: true,
      data: post,
    });
  } catch (error) {
    respondWithError(res, error);
  }
};

exports.deletePost = async (req, res) => {
  try {
    const result = await deletePost(req.params.postId, req.body || {});
    res.status(200).json({
      success: true,
      message: 'Post deleted successfully.',
      data: result,
    });
  } catch (error) {
    respondWithError(res, error);
  }
};

exports.getPostReport = async (req, res) => {
  try {
    const { doc, filename, compose } = await buildPostReport(req.params.postId, {
      userId: req.query.userId,
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    doc.on('error', (error) => {
      console.error('Error generating PDF:', error);
      if (!res.headersSent) {
        respondWithError(res, error);
      } else {
        res.end();
      }
    });

    doc.pipe(res);
    compose();
  } catch (error) {
    console.error('Failed to generate post report:', error);
    if (!res.headersSent) {
      respondWithError(res, error);
    } else {
      res.end();
    }
  }
};

exports.togglePostLike = async (req, res) => {
  try {
    const post = await togglePostLike(req.params.postId, req.body || {});
    res.status(200).json({
      success: true,
      data: post,
    });
  } catch (error) {
    respondWithError(res, error);
  }
};

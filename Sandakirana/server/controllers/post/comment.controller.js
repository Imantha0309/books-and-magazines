const Post = require('../../models/Post.model');
const {
  ensureUser,
  isObjectIdEqual,
  buildObjectId,
  respondWithPost,
} = require('./common');

exports.addComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId, content } = req.body;

    if (!userId || !content) {
      return res.status(400).json({
        success: false,
        message: 'User ID and content are required.',
      });
    }

    const user = await ensureUser(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found.',
      });
    }

    post.comments.unshift({
      author: user._id,
      content,
      likes: [],
      replies: [],
    });

    post.markModified('comments');
    await post.save();

    return respondWithPost(res, post._id, 201);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.updateComment = async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const { userId, content } = req.body;

    if (!userId || !content) {
      return res.status(400).json({
        success: false,
        message: 'User ID and content are required.',
      });
    }

    const user = await ensureUser(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found.',
      });
    }

    const comment = post.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found.',
      });
    }

    const isCommentAuthor = isObjectIdEqual(comment.author, user._id);
    const isPostAuthor = isObjectIdEqual(post.author, user._id);

    if (!isCommentAuthor && !isPostAuthor) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to edit this comment.',
      });
    }

    comment.content = content;
    comment.updatedAt = new Date();

    post.markModified('comments');
    await post.save();

    return respondWithPost(res, post._id);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required.',
      });
    }

    const user = await ensureUser(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found.',
      });
    }

    const comment = post.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found.',
      });
    }

    const isCommentAuthor = isObjectIdEqual(comment.author, user._id);
    const isPostAuthor = isObjectIdEqual(post.author, user._id);

    if (!isCommentAuthor && !isPostAuthor) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this comment.',
      });
    }

    comment.deleteOne();

    post.markModified('comments');
    await post.save();

    return respondWithPost(res, post._id);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.toggleCommentLike = async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required.',
      });
    }

    const user = await ensureUser(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found.',
      });
    }

    const comment = post.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found.',
      });
    }

    const userObjectId = buildObjectId(user._id);
    const alreadyLiked = comment.likes.some((like) => like.equals(userObjectId));

    if (alreadyLiked) {
      comment.likes = comment.likes.filter((like) => !like.equals(userObjectId));
    } else {
      comment.likes.push(userObjectId);
    }

    post.markModified('comments');
    await post.save();

    return respondWithPost(res, post._id);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const Post = require('../../models/Post.model');
const {
  ensureUser,
  buildObjectId,
  isObjectIdEqual,
  respondWithPost,
} = require('./common');

exports.addReply = async (req, res) => {
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

    comment.replies.push({
      author: user._id,
      content,
      likes: [],
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

exports.toggleReplyLike = async (req, res) => {
  try {
    const { postId, commentId, replyId } = req.params;
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

    const reply = comment.replies.id(replyId);
    if (!reply) {
      return res.status(404).json({
        success: false,
        message: 'Reply not found.',
      });
    }

    const userObjectId = buildObjectId(user._id);
    const alreadyLiked = reply.likes.some((like) => like.equals(userObjectId));

    if (alreadyLiked) {
      reply.likes = reply.likes.filter((like) => !like.equals(userObjectId));
    } else {
      reply.likes.push(userObjectId);
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

exports.updateReply = async (req, res) => {
  try {
    const { postId, commentId, replyId } = req.params;
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

    const reply = comment.replies.id(replyId);
    if (!reply) {
      return res.status(404).json({
        success: false,
        message: 'Reply not found.',
      });
    }

    const isReplyAuthor = isObjectIdEqual(reply.author, user._id);
    const isPostAuthor = isObjectIdEqual(post.author, user._id);

    if (!isReplyAuthor && !isPostAuthor) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to edit this reply.',
      });
    }

    reply.content = content;
    reply.updatedAt = new Date();

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

exports.deleteReply = async (req, res) => {
  try {
    const { postId, commentId, replyId } = req.params;
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

    const reply = comment.replies.id(replyId);
    if (!reply) {
      return res.status(404).json({
        success: false,
        message: 'Reply not found.',
      });
    }

    const isReplyAuthor = isObjectIdEqual(reply.author, user._id);
    const isPostAuthor = isObjectIdEqual(post.author, user._id);

    if (!isReplyAuthor && !isPostAuthor) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this reply.',
      });
    }

    reply.deleteOne();

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

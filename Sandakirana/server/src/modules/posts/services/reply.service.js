const Post = require('../models/post.model');
const {
  ensureUser,
  buildObjectId,
  isObjectIdEqual,
  fetchSanitizedPost,
} = require('./post.helpers');

const createHttpError = (status, message) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

const loadPostOrThrow = async (postId) => {
  const post = await Post.findById(postId);
  if (!post) {
    throw createHttpError(404, 'Post not found.');
  }
  return post;
};

const loadCommentOrThrow = (post, commentId) => {
  const comment = post.comments.id(commentId);
  if (!comment) {
    throw createHttpError(404, 'Comment not found.');
  }
  return comment;
};

const addReply = async (postId, commentId, payload) => {
  const { userId, content } = payload || {};

  if (!userId || !content) {
    throw createHttpError(400, 'User ID and content are required.');
  }

  const user = await ensureUser(userId);
  if (!user) {
    throw createHttpError(404, 'User not found.');
  }

  const post = await loadPostOrThrow(postId);
  const comment = loadCommentOrThrow(post, commentId);

  comment.replies.push({
    author: user._id,
    content,
    likes: [],
  });

  post.markModified('comments');
  await post.save();

  const sanitized = await fetchSanitizedPost(post._id);
  if (!sanitized) {
    throw createHttpError(404, 'Post not found.');
  }
  return sanitized;
};

const toggleReplyLike = async (postId, commentId, replyId, payload) => {
  const { userId } = payload || {};

  if (!userId) {
    throw createHttpError(400, 'User ID is required.');
  }

  const user = await ensureUser(userId);
  if (!user) {
    throw createHttpError(404, 'User not found.');
  }

  const post = await loadPostOrThrow(postId);
  const comment = loadCommentOrThrow(post, commentId);
  const reply = comment.replies.id(replyId);
  if (!reply) {
    throw createHttpError(404, 'Reply not found.');
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

  const sanitized = await fetchSanitizedPost(post._id);
  if (!sanitized) {
    throw createHttpError(404, 'Post not found.');
  }
  return sanitized;
};

const updateReply = async (postId, commentId, replyId, payload) => {
  const { userId, content } = payload || {};

  if (!userId || !content) {
    throw createHttpError(400, 'User ID and content are required.');
  }

  const user = await ensureUser(userId);
  if (!user) {
    throw createHttpError(404, 'User not found.');
  }

  const post = await loadPostOrThrow(postId);
  const comment = loadCommentOrThrow(post, commentId);
  const reply = comment.replies.id(replyId);
  if (!reply) {
    throw createHttpError(404, 'Reply not found.');
  }

  const isReplyAuthor = isObjectIdEqual(reply.author, user._id);
  const isPostAuthor = isObjectIdEqual(post.author, user._id);

  if (!isReplyAuthor && !isPostAuthor) {
    throw createHttpError(403, 'You do not have permission to edit this reply.');
  }

  reply.content = content;
  reply.updatedAt = new Date();

  post.markModified('comments');
  await post.save();

  const sanitized = await fetchSanitizedPost(post._id);
  if (!sanitized) {
    throw createHttpError(404, 'Post not found.');
  }
  return sanitized;
};

const deleteReply = async (postId, commentId, replyId, payload) => {
  const { userId } = payload || {};

  if (!userId) {
    throw createHttpError(400, 'User ID is required.');
  }

  const user = await ensureUser(userId);
  if (!user) {
    throw createHttpError(404, 'User not found.');
  }

  const post = await loadPostOrThrow(postId);
  const comment = loadCommentOrThrow(post, commentId);
  const reply = comment.replies.id(replyId);
  if (!reply) {
    throw createHttpError(404, 'Reply not found.');
  }

  const isReplyAuthor = isObjectIdEqual(reply.author, user._id);
  const isPostAuthor = isObjectIdEqual(post.author, user._id);

  if (!isReplyAuthor && !isPostAuthor) {
    throw createHttpError(403, 'You do not have permission to delete this reply.');
  }

  reply.deleteOne();

  post.markModified('comments');
  await post.save();

  const sanitized = await fetchSanitizedPost(post._id);
  if (!sanitized) {
    throw createHttpError(404, 'Post not found.');
  }
  return sanitized;
};

module.exports = {
  addReply,
  toggleReplyLike,
  updateReply,
  deleteReply,
};

const Post = require('../models/post.model');
const {
  ensureUser,
  isObjectIdEqual,
  buildObjectId,
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

const addComment = async (postId, payload) => {
  const { userId, content } = payload || {};

  if (!userId || !content) {
    throw createHttpError(400, 'User ID and content are required.');
  }

  const user = await ensureUser(userId);
  if (!user) {
    throw createHttpError(404, 'User not found.');
  }

  const post = await loadPostOrThrow(postId);

  post.comments.unshift({
    author: user._id,
    content,
    likes: [],
    replies: [],
  });

  post.markModified('comments');
  await post.save();

  const sanitized = await fetchSanitizedPost(post._id);
  if (!sanitized) {
    throw createHttpError(404, 'Post not found.');
  }
  return sanitized;
};

const updateComment = async (postId, commentId, payload) => {
  const { userId, content } = payload || {};

  if (!userId || !content) {
    throw createHttpError(400, 'User ID and content are required.');
  }

  const user = await ensureUser(userId);
  if (!user) {
    throw createHttpError(404, 'User not found.');
  }

  const post = await loadPostOrThrow(postId);

  const comment = post.comments.id(commentId);
  if (!comment) {
    throw createHttpError(404, 'Comment not found.');
  }

  const isCommentAuthor = isObjectIdEqual(comment.author, user._id);
  const isPostAuthor = isObjectIdEqual(post.author, user._id);

  if (!isCommentAuthor && !isPostAuthor) {
    throw createHttpError(403, 'You do not have permission to edit this comment.');
  }

  comment.content = content;
  comment.updatedAt = new Date();

  post.markModified('comments');
  await post.save();

  const sanitized = await fetchSanitizedPost(post._id);
  if (!sanitized) {
    throw createHttpError(404, 'Post not found.');
  }
  return sanitized;
};

const deleteComment = async (postId, commentId, payload) => {
  const { userId } = payload || {};

  if (!userId) {
    throw createHttpError(400, 'User ID is required.');
  }

  const user = await ensureUser(userId);
  if (!user) {
    throw createHttpError(404, 'User not found.');
  }

  const post = await loadPostOrThrow(postId);

  const comment = post.comments.id(commentId);
  if (!comment) {
    throw createHttpError(404, 'Comment not found.');
  }

  const isCommentAuthor = isObjectIdEqual(comment.author, user._id);
  const isPostAuthor = isObjectIdEqual(post.author, user._id);

  if (!isCommentAuthor && !isPostAuthor) {
    throw createHttpError(403, 'You do not have permission to delete this comment.');
  }

  comment.deleteOne();

  post.markModified('comments');
  await post.save();

  const sanitized = await fetchSanitizedPost(post._id);
  if (!sanitized) {
    throw createHttpError(404, 'Post not found.');
  }
  return sanitized;
};

const toggleCommentLike = async (postId, commentId, payload) => {
  const { userId } = payload || {};

  if (!userId) {
    throw createHttpError(400, 'User ID is required.');
  }

  const user = await ensureUser(userId);
  if (!user) {
    throw createHttpError(404, 'User not found.');
  }

  const post = await loadPostOrThrow(postId);

  const comment = post.comments.id(commentId);
  if (!comment) {
    throw createHttpError(404, 'Comment not found.');
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

  const sanitized = await fetchSanitizedPost(post._id);
  if (!sanitized) {
    throw createHttpError(404, 'Post not found.');
  }
  return sanitized;
};

module.exports = {
  addComment,
  updateComment,
  deleteComment,
  toggleCommentLike,
};

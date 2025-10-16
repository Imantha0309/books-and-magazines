const mongoose = require('mongoose');
const Post = require('../models/post.model');
const User = require('../../users/models/user.model');

const MAX_IMAGE_BYTES = 2.5 * 1024 * 1024; // ~2.5 MB to account for base64 overhead

const parseImagePayload = (rawImage) => {
  if (!rawImage) {
    return { dataUrl: '', bytes: 0 };
  }

  const base64Pattern = /^data:(.*?);base64,(.*)$/;
  const matches = rawImage.match(base64Pattern);

  if (matches) {
    const [, , base64Data] = matches;
    const bytes = Buffer.from(base64Data, 'base64').length;
    return { dataUrl: rawImage, bytes };
  }

  // Treat plain base64 strings as generic images
  const bytes = Buffer.from(rawImage, 'base64').length;
  return {
    dataUrl: `data:image/*;base64,${rawImage}`,
    bytes,
  };
};

const populatePostQuery = (query) =>
  query
    .populate({ path: 'author', select: 'name email role' })
    .populate({ path: 'comments.author', select: 'name email role' })
    .populate({
      path: 'comments.replies.author',
      select: 'name email role',
    });

const toStringId = (value) => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (value.toString) return value.toString();
  return '';
};

const sanitizeUser = (userDoc) => {
  if (!userDoc) return null;
  if (userDoc.toObject) {
    const raw = userDoc.toObject({ getters: true });
    return {
      id: toStringId(raw._id),
      name: raw.name,
      email: raw.email,
      role: raw.role,
    };
  }
  if (typeof userDoc === 'object') {
    return {
      id: toStringId(userDoc._id || userDoc.id),
      name: userDoc.name,
      email: userDoc.email,
      role: userDoc.role,
    };
  }
  return null;
};

const sanitizeLikes = (likes) =>
  Array.isArray(likes) ? likes.map((like) => toStringId(like)) : [];

const countArray = (arr) => (Array.isArray(arr) ? arr.length : 0);

const sanitizeReply = (replyDoc) => {
  const reply =
    replyDoc && typeof replyDoc.toObject === 'function'
      ? replyDoc.toObject({ getters: true, virtuals: false })
      : replyDoc || {};
  return {
    id: toStringId(reply._id),
    content: reply.content,
    createdAt: reply.createdAt,
    updatedAt: reply.updatedAt,
    author: sanitizeUser(reply.author),
    likes: sanitizeLikes(reply.likes),
  };
};

const sanitizeComment = (commentDoc) => {
  const comment =
    commentDoc && typeof commentDoc.toObject === 'function'
      ? commentDoc.toObject({ getters: true, virtuals: false })
      : commentDoc || {};
  return {
    id: toStringId(comment._id),
    content: comment.content,
    createdAt: comment.createdAt,
    updatedAt: comment.updatedAt,
    author: sanitizeUser(comment.author),
    likes: sanitizeLikes(comment.likes),
    replies: Array.isArray(comment.replies)
      ? comment.replies.map(sanitizeReply)
      : [],
  };
};

const sanitizePost = (postDoc) => {
  const post = postDoc.toObject({ getters: true, virtuals: false });
  return {
    id: toStringId(post._id),
    content: post.content,
    image: post.image || '',
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
    author: sanitizeUser(post.author),
    likes: sanitizeLikes(post.likes),
    comments: Array.isArray(post.comments)
      ? post.comments.map(sanitizeComment)
      : [],
  };
};

const ensureUser = async (userId) => {
  if (!userId) {
    return null;
  }
  try {
    const user = await User.findById(userId);
    return user || null;
  } catch (error) {
    return null;
  }
};

const buildObjectId = (value) =>
  value instanceof mongoose.Types.ObjectId
    ? value
    : new mongoose.Types.ObjectId(value);

const isObjectIdEqual = (left, right) => {
  if (!left || !right) {
    return false;
  }

  const leftId =
    left instanceof mongoose.Types.ObjectId ? left : new mongoose.Types.ObjectId(left);
  const rightId =
    right instanceof mongoose.Types.ObjectId ? right : new mongoose.Types.ObjectId(right);

  return leftId.equals(rightId);
};

const calculatePostMetrics = (postDoc) => {
  const likesCount = countArray(postDoc.likes);
  const comments = Array.isArray(postDoc.comments) ? postDoc.comments : [];

  const commentLikes = comments.reduce(
    (total, comment) => total + countArray(comment.likes),
    0
  );

  const repliesCount = comments.reduce(
    (total, comment) => total + countArray(comment.replies),
    0
  );

  const replyLikes = comments.reduce((total, comment) => {
    const replies = Array.isArray(comment.replies) ? comment.replies : [];
    return (
      total +
      replies.reduce((replyTotal, reply) => replyTotal + countArray(reply.likes), 0)
    );
  }, 0);

  const commentCount = comments.length;
  const createdAt = postDoc.createdAt ? new Date(postDoc.createdAt) : new Date();
  const daysSince = Math.max(
    0,
    Math.floor((Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24))
  );

  const totalReactions = likesCount + commentLikes + replyLikes;

  return {
    likesCount,
    commentCount,
    repliesCount,
    commentLikes,
    replyLikes,
    totalReactions,
    daysSince,
    createdAt,
  };
};

const fetchSanitizedPost = async (postId) => {
  const post = await populatePostQuery(Post.findById(postId));
  return post ? sanitizePost(post) : null;
};

module.exports = {
  MAX_IMAGE_BYTES,
  parseImagePayload,
  populatePostQuery,
  toStringId,
  sanitizeUser,
  sanitizeLikes,
  countArray,
  sanitizeReply,
  sanitizeComment,
  sanitizePost,
  ensureUser,
  buildObjectId,
  isObjectIdEqual,
  calculatePostMetrics,
  fetchSanitizedPost,
};

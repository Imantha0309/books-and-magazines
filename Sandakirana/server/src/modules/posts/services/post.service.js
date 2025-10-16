const PDFDocument = require('pdfkit');
const Post = require('../models/post.model');
const {
  MAX_IMAGE_BYTES,
  parseImagePayload,
  populatePostQuery,
  sanitizePost,
  ensureUser,
  isObjectIdEqual,
  calculatePostMetrics,
  fetchSanitizedPost,
  toStringId,
  buildObjectId,
} = require('./post.helpers');

const createHttpError = (status, message) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

const ALLOWED_POST_ROLES = ['author', 'user'];

const listPosts = async ({ authorId } = {}) => {
  const baseQuery = authorId ? Post.find({ author: authorId }) : Post.find();
  const posts = await populatePostQuery(baseQuery.sort({ createdAt: -1 }));
  return posts.map(sanitizePost);
};

const createPost = async ({ authorId, content, image = '' }) => {
  if (!authorId || !content) {
    throw createHttpError(400, 'Author ID and content are required.');
  }

  const { dataUrl, bytes } = parseImagePayload(image);

  if (bytes > MAX_IMAGE_BYTES) {
    throw createHttpError(422, 'Image is too large. Please upload an image smaller than 2.5 MB.');
  }

  const author = await ensureUser(authorId);
  if (!author || !ALLOWED_POST_ROLES.includes(author.role)) {
    throw createHttpError(403, 'You do not have permission to publish posts.');
  }

  const post = await Post.create({
    author: author._id,
    content,
    image: dataUrl,
  });

  const populated = await populatePostQuery(Post.findById(post._id));
  return sanitizePost(populated);
};

const updatePost = async (postId, payload) => {
  const { userId, content, image = '' } = payload || {};

  if (!userId || !content) {
    throw createHttpError(400, 'User ID and content are required.');
  }

  const { dataUrl, bytes } = parseImagePayload(image);

  if (bytes > MAX_IMAGE_BYTES) {
    throw createHttpError(422, 'Image is too large. Please upload an image smaller than 2.5 MB.');
  }

  const user = await ensureUser(userId);
  if (!user || !ALLOWED_POST_ROLES.includes(user.role)) {
    throw createHttpError(403, 'You do not have permission to update posts.');
  }

  const post = await Post.findById(postId);
  if (!post) {
    throw createHttpError(404, 'Post not found.');
  }

  if (!isObjectIdEqual(post.author, user._id)) {
    throw createHttpError(403, 'You can only update your own posts.');
  }

  post.content = content;
  post.image = dataUrl;
  post.updatedAt = new Date();

  await post.save();

  const sanitized = await fetchSanitizedPost(post._id);
  if (!sanitized) {
    throw createHttpError(404, 'Post not found.');
  }

  return sanitized;
};

const deletePost = async (postId, payload) => {
  const { userId } = payload || {};

  if (!userId) {
    throw createHttpError(400, 'User ID is required.');
  }

  const user = await ensureUser(userId);
  if (!user || !ALLOWED_POST_ROLES.includes(user.role)) {
    throw createHttpError(403, 'You do not have permission to delete posts.');
  }

  const post = await Post.findById(postId);
  if (!post) {
    throw createHttpError(404, 'Post not found.');
  }

  if (!isObjectIdEqual(post.author, user._id)) {
    throw createHttpError(403, 'You can only delete your own posts.');
  }

  await post.deleteOne();

  return { id: postId };
};

const togglePostLike = async (postId, payload) => {
  const { userId } = payload || {};

  if (!userId) {
    throw createHttpError(400, 'User ID is required.');
  }

  const user = await ensureUser(userId);
  if (!user) {
    throw createHttpError(404, 'User not found.');
  }

  const post = await Post.findById(postId);
  if (!post) {
    throw createHttpError(404, 'Post not found.');
  }

  const userObjectId = buildObjectId(user._id);
  const alreadyLiked = post.likes.some((like) => like.equals(userObjectId));

  if (alreadyLiked) {
    post.likes = post.likes.filter((like) => !like.equals(userObjectId));
  } else {
    post.likes.push(userObjectId);
  }

  await post.save();

  const sanitized = await fetchSanitizedPost(post._id);
  if (!sanitized) {
    throw createHttpError(404, 'Post not found.');
  }

  return sanitized;
};

const buildPostReport = async (postId, payload) => {
  const { userId } = payload || {};

  if (!userId) {
    throw createHttpError(400, 'User ID is required.');
  }

  const user = await ensureUser(userId);
  if (!user || user.role !== 'author') {
    throw createHttpError(403, 'Only authors can generate post reports.');
  }

  const post = await populatePostQuery(Post.findById(postId));
  if (!post) {
    throw createHttpError(404, 'Post not found.');
  }

  const authorId = post.author?._id || post.author;

  if (!isObjectIdEqual(authorId, user._id)) {
    throw createHttpError(403, 'You can only download reports for your own posts.');
  }

  const metrics = calculatePostMetrics(post);
  const authorPosts = await populatePostQuery(Post.find({ author: authorId }));
  const rankingData = authorPosts
    .map((authorPost) => ({
      id: toStringId(authorPost._id),
      totalReactions: calculatePostMetrics(authorPost).totalReactions,
    }))
    .sort((a, b) => b.totalReactions - a.totalReactions);

  const totalPosts = rankingData.length;
  const rank =
    rankingData.findIndex((entry) => entry.id === toStringId(post._id)) + 1 || totalPosts;

  const doc = new PDFDocument({ margin: 50 });
  const filename = `post-report-${postId}.pdf`;

  const compose = () => {
    doc.fontSize(20).text('Post Performance Report', { align: 'center' });
    doc.moveDown();

    doc.fontSize(12).text(`Author: ${post.author?.name || 'Unknown author'}`);
    doc.text(`Generated on: ${new Date().toLocaleString()}`);
    doc.moveDown();

    doc.fontSize(14).text('Post Overview', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(12).text(`Post ID: ${toStringId(post._id)}`);
    doc.text(`Published on: ${metrics.createdAt.toLocaleString()}`);
    doc.text(`Days since publication: ${metrics.daysSince}`);
    doc.moveDown(0.5);
    doc.text('Content preview:');
    doc.moveDown(0.3);
    doc.font('Helvetica-Oblique').text(post.content || 'No content provided.', {
      indent: 18,
    });
    doc.font('Helvetica');
    doc.moveDown();

    doc.fontSize(14).text('Engagement Metrics', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(12).text(`Post likes: ${metrics.likesCount}`);
    doc.text(`Comments: ${metrics.commentCount}`);
    doc.text(`Replies: ${metrics.repliesCount}`);
    doc.text(`Comment likes: ${metrics.commentLikes}`);
    doc.text(`Reply likes: ${metrics.replyLikes}`);
    doc.text(`Total reactions (likes): ${metrics.totalReactions}`);
    doc.moveDown();

    doc.fontSize(14).text('Ranking', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(12).text(
      `Ranking among your posts: ${rank} of ${totalPosts} (by total reactions)`
    );
    doc.text(`Total authored posts analysed: ${totalPosts}`);
    doc.moveDown();

    doc.fontSize(12).text(
      'Note: Total reactions include post likes, comment likes, and reply likes.',
      {
        align: 'left',
      }
    );

    doc.end();
  };

  return { doc, filename, compose };
};

module.exports = {
  listPosts,
  createPost,
  updatePost,
  deletePost,
  togglePostLike,
  buildPostReport,
};

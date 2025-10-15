const PDFDocument = require('pdfkit');
const Post = require('../../models/Post.model');
const {
  MAX_IMAGE_BYTES,
  parseImagePayload,
  populatePostQuery,
  sanitizePost,
  ensureUser,
  isObjectIdEqual,
  calculatePostMetrics,
  respondWithPost,
  toStringId,
} = require('./common');

exports.getPosts = async (req, res) => {
  try {
    const posts = await populatePostQuery(Post.find().sort({ createdAt: -1 }));

    res.status(200).json({
      success: true,
      data: posts.map(sanitizePost),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.createPost = async (req, res) => {
  try {
    const { authorId, content, image = '' } = req.body;

    if (!authorId || !content) {
      return res.status(400).json({
        success: false,
        message: 'Author ID and content are required.',
      });
    }

    const { dataUrl, bytes } = parseImagePayload(image);

    if (bytes > MAX_IMAGE_BYTES) {
      return res.status(422).json({
        success: false,
        message: 'Image is too large. Please upload an image smaller than 2.5 MB.',
      });
    }

    const author = await ensureUser(authorId);
    if (!author || author.role !== 'author') {
      return res.status(403).json({
        success: false,
        message: 'Only authors can publish posts.',
      });
    }

    const post = await Post.create({
      author: author._id,
      content,
      image: dataUrl,
    });

    const populated = await populatePostQuery(Post.findById(post._id));

    res.status(201).json({
      success: true,
      data: sanitizePost(populated),
      message: 'Post published successfully.',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.updatePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId, content, image = '' } = req.body;

    if (!userId || !content) {
      return res.status(400).json({
        success: false,
        message: 'User ID and content are required.',
      });
    }

    const { dataUrl, bytes } = parseImagePayload(image);

    if (bytes > MAX_IMAGE_BYTES) {
      return res.status(422).json({
        success: false,
        message: 'Image is too large. Please upload an image smaller than 2.5 MB.',
      });
    }

    const user = await ensureUser(userId);
    if (!user || user.role !== 'author') {
      return res.status(403).json({
        success: false,
        message: 'Only authors can update posts.',
      });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found.',
      });
    }

    if (!isObjectIdEqual(post.author, user._id)) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own posts.',
      });
    }

    post.content = content;
    post.image = dataUrl;
    post.updatedAt = new Date();

    await post.save();

    return respondWithPost(res, post._id);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required.',
      });
    }

    const user = await ensureUser(userId);
    if (!user || user.role !== 'author') {
      return res.status(403).json({
        success: false,
        message: 'Only authors can delete posts.',
      });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found.',
      });
    }

    if (!isObjectIdEqual(post.author, user._id)) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own posts.',
      });
    }

    await post.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'Post deleted successfully.',
      data: { id: postId },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getPostReport = async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required.',
      });
    }

    const user = await ensureUser(userId);
    if (!user || user.role !== 'author') {
      return res.status(403).json({
        success: false,
        message: 'Only authors can generate post reports.',
      });
    }

    const post = await populatePostQuery(Post.findById(postId));
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found.',
      });
    }

    const authorId = post.author?._id || post.author;

    if (!isObjectIdEqual(authorId, user._id)) {
      return res.status(403).json({
        success: false,
        message: 'You can only download reports for your own posts.',
      });
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
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    doc.on('error', (error) => {
      console.error('Error generating PDF:', error);
      if (!res.headersSent) {
        res.status(500).end();
      } else {
        res.end();
      }
    });

    doc.pipe(res);

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
  } catch (error) {
    console.error('Failed to generate post report:', error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    } else {
      res.end();
    }
  }
};

exports.togglePostLike = async (req, res) => {
  try {
    const { postId } = req.params;
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

    const userObjectId = user._id;
    const alreadyLiked = post.likes.some((like) => like.equals(userObjectId));

    if (alreadyLiked) {
      post.likes = post.likes.filter((like) => !like.equals(userObjectId));
    } else {
      post.likes.push(userObjectId);
    }

    await post.save();

    return respondWithPost(res, post._id);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

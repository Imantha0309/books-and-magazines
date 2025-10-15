module.exports = {
  ...require('./post/post.controller'),
  ...require('./post/comment.controller'),
  ...require('./post/reply.controller'),
};

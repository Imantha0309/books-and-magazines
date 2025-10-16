const authRoutes = require('../modules/auth/routes/auth.routes');
const userRoutes = require('../modules/users/routes/user.routes');
const postRoutes = require('../modules/posts/routes/post.routes');

const registerRoutes = (app) => {
  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/posts', postRoutes);
};

module.exports = { registerRoutes };

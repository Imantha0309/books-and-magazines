const express = require('express');
const cors = require('cors');
const { registerRoutes } = require('./routes');

const createApp = () => {
  const app = express();

  app.use(cors());
  app.use(express.json({ limit: '6mb' }));
  app.use(express.urlencoded({ extended: true, limit: '6mb' }));

  app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  registerRoutes(app);

  return app;
};

module.exports = { createApp };

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '6mb' }));
app.use(express.urlencoded({ extended: true, limit: '6mb' }));

// Connect to Database
connectDB();

// Routes
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/posts', require('./routes/post.routes'));

// Root route
app.get('/', (req, res) => {
  res.send('MERN API is running...');
});

const BASE_PORT = parseInt(process.env.PORT, 10) || 5000;
const MAX_PORT_SHIFTS = 10;

// Start the server; if the desired port is busy, fall back to the next available one.
const startServer = (port = BASE_PORT, shiftCount = 0) => {
  const server = app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE' && shiftCount < MAX_PORT_SHIFTS) {
      const nextPort = port + 1;
      console.warn(
        `Port ${port} is in use. Attempting to use port ${nextPort} instead.`
      );
      startServer(nextPort, shiftCount + 1);
      return;
    }

    console.error('Failed to start server:', error);
    process.exit(1);
  });
};

startServer();


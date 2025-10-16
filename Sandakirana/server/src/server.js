require('dotenv').config();

const http = require('http');
const { createApp } = require('./app');
const connectDatabase = require('./config/database');

const app = createApp();
const server = http.createServer(app);

const BASE_PORT = parseInt(process.env.PORT, 10) || 5000;
const MAX_PORT_SHIFTS = 10;

const start = async (port = BASE_PORT, shiftCount = 0) => {
  try {
    await connectDatabase();
  } catch (error) {
    console.error('Failed to connect to database:', error);
    process.exit(1);
  }

  server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE' && shiftCount < MAX_PORT_SHIFTS) {
      const nextPort = port + 1;
      console.warn(`Port ${port} is in use. Attempting to use port ${nextPort} instead.`);
      start(nextPort, shiftCount + 1);
      return;
    }

    console.error('Failed to start server:', error);
    process.exit(1);
  });
};

start();

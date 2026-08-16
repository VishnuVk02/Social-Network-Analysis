// Load environment variables
require('dotenv').config();

const app = require('./app');
const { testDbConnection } = require('./config/db');
const logger = require('./utils/logger');
const socketService = require('./services/socketService');

const githubSnapshotService = require('./services/githubSnapshotService');

const PORT = process.env.PORT || 5000;

async function startServer() {
  logger.info('Initializing Social Media Analytics Backend...');
  
  // Test connection to DB
  await testDbConnection();

  // Start GitHub trends scheduled collector
  githubSnapshotService.initializeScheduler();

  // Seed sample telemetry data for admin application analytics
  const telemetryService = require('./services/telemetryService');
  telemetryService.seedSampleTelemetry().catch(err => {
    logger.error('Failed to seed telemetry data:', err);
  });

  // Bind to port
  const server = app.listen(PORT, () => {
    logger.info(`Server is successfully running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode.`);
  });

  // Initialize Socket.IO server for real-time group chat
  socketService.init(server);

  // Handle graceful shutdowns
  const graceShutdown = (signal) => {
    logger.info(`${signal} received. Shutting down gracefully...`);
    server.close(() => {
      logger.info('HTTP server closed.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => graceShutdown('SIGTERM'));
  process.on('SIGINT', () => graceShutdown('SIGINT'));
}

startServer().catch(err => {
  logger.error('Failed to start server:', err);
  process.exit(1);
});

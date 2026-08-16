const morgan = require('morgan');
const logger = require('../utils/logger');

// Define format string for dev / prod
const morganFormat = process.env.NODE_ENV === 'production' ? 'combined' : 'dev';

// Map morgan stream to winston logger
const stream = {
  write: (message) => logger.info(message.trim())
};

// Create morgan middleware
const loggingMiddleware = morgan(morganFormat, { stream });

module.exports = loggingMiddleware;

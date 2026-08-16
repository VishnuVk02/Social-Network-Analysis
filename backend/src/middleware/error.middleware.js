const logger = require('../utils/logger');

function errorMiddleware(err, req, res, next) {
  logger.error(`${req.method} ${req.originalUrl} - Error: ${err.message}`, { stack: err.stack });

  // Handle Prisma Validation Errors (e.g. malformed UUID, invalid parameters)
  if (err.name === 'PrismaClientValidationError' || err.message?.includes('Invalid value for argument') || err.message?.includes('Malformed UUID')) {
    return res.status(400).json({
      success: false,
      message: 'Invalid parameters or group ID format provided.'
    });
  }

  // Handle Prisma specific database codes
  if (err.code && err.code.startsWith('P')) {
    // Prisma unique constraint violation
    if (err.code === 'P2002') {
      const field = err.meta?.target ? err.meta.target.join(', ') : 'Field';
      return res.status(409).json({
        success: false,
        message: `${field} already exists. Unique constraint failed.`,
      });
    }

    // Prisma record not found
    if (err.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: err.meta?.cause || 'Record not found.',
      });
    }
  }

  // Handle standard HTTP statuses if assigned
  const statusCode = err.status || 500;
  const message = err.message || 'Internal Server Error';

  return res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
}

module.exports = errorMiddleware;

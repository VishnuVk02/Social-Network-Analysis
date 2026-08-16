const { PrismaClient } = require('@prisma/client');
const logger = require('../utils/logger');

const prisma = new PrismaClient({
  log: [
    { emit: 'event', level: 'query' },
    { emit: 'event', level: 'info' },
    { emit: 'event', level: 'warn' },
    { emit: 'event', level: 'error' },
  ],
});

// Attach logging listeners in development mode
if (process.env.NODE_ENV !== 'production') {
  prisma.$on('query', (e) => {
    logger.debug(`Query: ${e.query} - Params: ${e.params} - Duration: ${e.duration}ms`);
  });
}

prisma.$on('info', (e) => logger.info(e.message));
prisma.$on('warn', (e) => logger.warn(e.message));
prisma.$on('error', (e) => logger.error(e.message));

// Handle connection test
async function testDbConnection() {
  try {
    await prisma.$connect();
    logger.info('Successfully connected to the PostgreSQL database.');
  } catch (error) {
    logger.error('Failed to connect to the database:', error);
    process.exit(1);
  }
}

module.exports = {
  prisma,
  testDbConnection
};

const winston = require('winston');
const path = require('path');

// Define log level and configuration based on environment
const level = process.env.NODE_ENV === 'production' ? 'info' : 'debug';

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.printf(({ timestamp, level, message, stack }) => {
    return `[${timestamp}] ${level}: ${stack || message}`;
  })
);

const logger = winston.createLogger({
  level,
  format: logFormat,
  transports: [
    // Write all errors to errors.log
    new winston.transports.File({ 
      filename: path.join(__dirname, '../../logs/errors.log'), 
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    // Write all logs to combined.log
    new winston.transports.File({ 
      filename: path.join(__dirname, '../../logs/combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    // Always log to the console
    new winston.transports.Console({
      format: consoleFormat
    })
  ]
});

// Attach YouTube Debugging and Verification Logger Functions
logger.logSearchResponse = (data) => {
  logger.info("========== SEARCH RESPONSE ==========");
  logger.info(JSON.stringify(data, null, 2));
  
  const items = data.items || [];
  items.forEach(item => {
    logger.info("Search Result Item:", {
      title: item.snippet?.title,
      channelId: item.id?.channelId || item.snippet?.channelId,
      description: item.snippet?.description
    });
  });
};

logger.logChannelResponse = (data) => {
  logger.info("========== CHANNEL API RESPONSE ==========");
  logger.info(JSON.stringify(data, null, 2));

  const firstItem = data.items?.[0];
  logger.info("Statistics:", {
    subscriberCount: firstItem?.statistics?.subscriberCount,
    viewCount: firstItem?.statistics?.viewCount,
    videoCount: firstItem?.statistics?.videoCount
  });
};

logger.logDatabaseSave = (channelDataToSave) => {
  logger.info("========== DATABASE SAVE ==========");
  logger.info(JSON.stringify(channelDataToSave, null, 2));
};

logger.logDatabaseRead = (record) => {
  logger.info("========== DATABASE RECORD READ ==========");
  logger.info(JSON.stringify(record, null, 2));
};

logger.logDtoMapping = (transformedChannelData) => {
  logger.info("========== TRANSFORMED DTO ==========");
  logger.info(JSON.stringify(transformedChannelData, null, 2));
  
  // Console.table style log print
  console.table([
    {
      apiField: "statistics.subscriberCount",
      appField: transformedChannelData.subscriberCount
    },
    {
      apiField: "statistics.viewCount",
      appField: transformedChannelData.viewCount // matches schema field
    },
    {
      apiField: "statistics.videoCount",
      appField: transformedChannelData.videoCount
    }
  ]);
};

logger.logFrontendData = (data) => {
  logger.info("========== FRONTEND DATA RECEIVED ==========");
  logger.info(JSON.stringify(data, null, 2));
};

module.exports = logger;

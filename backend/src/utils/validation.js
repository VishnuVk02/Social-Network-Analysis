const logger = require('./logger');

/**
 * Validate that essential YouTube statistics exist in the channel API response.
 * Throws an error and logs the raw response if fields are undefined.
 */
function validateYoutubeStats(channelResponse) {
  const item = channelResponse?.items?.[0];
  const subscriberCount = item?.statistics?.subscriberCount;
  const viewCount = item?.statistics?.viewCount;
  const videoCount = item?.statistics?.videoCount;

  if (subscriberCount === undefined || viewCount === undefined || videoCount === undefined) {
    logger.error("Raw API Response with missing statistics: " + JSON.stringify(channelResponse, null, 2));
    throw new Error(
      "Invalid YouTube statistics response"
    );
  }
}

module.exports = {
  validateYoutubeStats
};

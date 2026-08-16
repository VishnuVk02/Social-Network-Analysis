const Sentiment = require('sentiment');
const sentimentAnalyzer = new Sentiment();

/**
 * Analyzes the sentiment of a given text string.
 * @param {string} text - The input text to analyze.
 * @returns {Object} - Sentiment results containing overall label and score details.
 */
function analyzeText(text) {
  if (!text) {
    return {
      score: 0,
      comparative: 0,
      sentiment: 'NEUTRAL'
    };
  }

  const result = sentimentAnalyzer.analyze(text);
  
  let sentiment = 'NEUTRAL';
  if (result.score > 0) {
    sentiment = 'POSITIVE';
  } else if (result.score < 0) {
    sentiment = 'NEGATIVE';
  }

  return {
    score: result.score,
    comparative: result.comparative,
    sentiment
  };
}

module.exports = {
  analyzeText
};

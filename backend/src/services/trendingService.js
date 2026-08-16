const STOPWORDS = new Set([
  'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', 'your', 'yours', 'yourself', 'yourselves',
  'he', 'him', 'his', 'himself', 'she', 'her', 'hers', 'herself', 'it', 'its', 'itself', 'they', 'them', 'their',
  'theirs', 'themselves', 'what', 'which', 'who', 'whom', 'this', 'that', 'these', 'those', 'am', 'is', 'are',
  'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'having', 'do', 'does', 'did', 'doing', 'a', 'an',
  'the', 'and', 'but', 'if', 'or', 'because', 'as', 'until', 'while', 'of', 'at', 'by', 'for', 'with', 'about',
  'against', 'between', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'to', 'from', 'up',
  'down', 'in', 'out', 'on', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when',
  'where', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no',
  'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 's', 't', 'can', 'will', 'just', 'don',
  'should', 'now', 'd', 'll', 'm', 'o', 're', 've', 'y', 'ain', 'aren', 'couldn', 'didn', 'doesn', 'hadn',
  'hasn', 'haven', 'isn', 'ma', 'mightn', 'mustn', 'needn', 'shan', 'shouldn', 'wasn', 'weren', 'won', 'wouldn',
  'like', 'video', 'youtube', 'channel', 'subscribe', 'get', 'would', 'make', 'one', 'good', 'great', 'awesome'
]);

/**
 * Extracts and aggregates keyword frequencies from video metadata and comments.
 * @param {Array} videos - List of video objects.
 * @param {Array} comments - List of comment objects.
 * @returns {Array} - Array of { keyword, frequency } sorted by frequency.
 */
function extractTrendingKeywords(videos, comments) {
  const keywordCounts = {};

  // Helper to tokenize and clean text
  const addTextToCounts = (text) => {
    if (!text) return;
    const words = text
      .toLowerCase()
      .replace(/[^\w\s]/g, '') // remove punctuation
      .split(/\s+/);

    words.forEach(word => {
      if (word.length > 3 && !STOPWORDS.has(word) && isNaN(word)) {
        keywordCounts[word] = (keywordCounts[word] || 0) + 1;
      }
    });
  };

  // Add titles and descriptions
  videos.forEach(v => {
    addTextToCounts(v.title);
    addTextToCounts(v.description);
  });

  // Add comment content
  comments.forEach(c => {
    addTextToCounts(c.content);
  });

  // Sort and limit results
  return Object.entries(keywordCounts)
    .map(([keyword, frequency]) => ({
      keyword,
      frequency
    }))
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 30); // Return top 30 keywords
}

module.exports = {
  extractTrendingKeywords
};

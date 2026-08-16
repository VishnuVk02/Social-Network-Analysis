const STOPWORDS = [
  'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'arent', 'as', 'at',
  'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by', 'cant', 'cannot', 'could',
  'did', 'didnt', 'do', 'does', 'doesnt', 'doing', 'dont', 'down', 'during', 'each', 'few', 'for', 'from', 'further',
  'had', 'hadnt', 'has', 'hasnt', 'have', 'havent', 'having', 'he', 'her', 'here', 'hers', 'herself', 'him', 'himself',
  'his', 'how', 'i', 'if', 'in', 'into', 'is', 'isnt', 'it', 'its', 'itself', 'more', 'most', 'mustnt', 'my', 'myself',
  'no', 'nor', 'not', 'of', 'off', 'on', 'once', 'only', 'or', 'other', 'ought', 'our', 'ours', 'ourselves', 'out',
  'over', 'own', 'same', 'she', 'should', 'so', 'some', 'such', 'than', 'that', 'the', 'their', 'theirs', 'them',
  'themselves', 'then', 'there', 'these', 'they', 'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up',
  'very', 'was', 'wasnt', 'we', 'were', 'werent', 'what', 'when', 'where', 'which', 'while', 'who', 'whom', 'why',
  'with', 'would', 'you', 'your', 'yours', 'yourself', 'yourselves', 'post', 'comment', 'thread'
];

function extractTrendingKeywords(posts) {
  if (!posts || posts.length === 0) return [];

  const wordCounts = {};

  posts.forEach(post => {
    const text = (post.title || '') + ' ' + (post.selftext || '');
    const words = text.toLowerCase().split(/\W+/);

    words.forEach(word => {
      // Filter out short tokens, numbers, and stop words
      if (word.length > 3 && isNaN(word) && !STOPWORDS.includes(word)) {
        wordCounts[word] = (wordCounts[word] || 0) + 1;
      }
    });
  });

  return Object.entries(wordCounts)
    .map(([word, count]) => ({
      keyword: word,
      volume: count * 15, // scale volume for visual impact
      growthRate: parseFloat((Math.random() * 50 - 10).toFixed(1)) // random growth trend indicator
    }))
    .sort((a, b) => b.volume - a.volume)
    .slice(0, 15);
}

module.exports = {
  extractTrendingKeywords
};

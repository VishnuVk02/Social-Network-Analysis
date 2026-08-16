const POSITIVE_WORDS = [
  'great', 'awesome', 'good', 'fast', 'perfect', 'love', 'like', 'happy', 'thrilled',
  'launch', 'clean', 'excellent', 'amazing', 'solve', 'fix', 'help', 'beautiful',
  'smooth', 'recommend', 'stable', 'powerful', 'easy', 'simple', 'innovative'
];

const NEGATIVE_WORDS = [
  'bad', 'slow', 'hate', 'fail', 'error', 'bug', 'issue', 'latency', 'broken',
  'crash', 'unpopular', 'overrated', 'annoyed', 'worst', 'clunky', 'useless',
  'difficult', 'complicated', 'expensive', 'leak', 'vulnerable', 'warning'
];

function analyzeText(text) {
  if (!text) {
    return { positive: 0, neutral: 100, negative: 0, overall: 'NEUTRAL' };
  }

  const tokens = text.toLowerCase().split(/\W+/);
  let posCount = 0;
  let negCount = 0;

  tokens.forEach(token => {
    if (POSITIVE_WORDS.includes(token)) posCount++;
    if (NEGATIVE_WORDS.includes(token)) negCount++;
  });

  const totalHits = posCount + negCount;
  if (totalHits === 0) {
    return { positive: 0, neutral: 100, negative: 0, overall: 'NEUTRAL' };
  }

  const positive = parseFloat(((posCount / totalHits) * 100).toFixed(1));
  const negative = parseFloat(((negCount / totalHits) * 100).toFixed(1));
  const neutral = parseFloat((100 - positive - negative).toFixed(1));

  let overall = 'NEUTRAL';
  if (positive > negative + 10) overall = 'POSITIVE';
  if (negative > positive + 10) overall = 'NEGATIVE';

  return {
    positive,
    neutral,
    negative,
    overall
  };
}

module.exports = {
  analyzeText
};

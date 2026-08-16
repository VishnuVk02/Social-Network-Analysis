/**
 * Calculates YouTube channel growth, engagement trends, and upload frequencies.
 */
function calculateChannelAnalytics(videos) {
  if (!videos || videos.length === 0) {
    return {
      averageViews: 0,
      averageLikes: 0,
      averageComments: 0,
      engagementRate: 0,
      postingFrequency: 0, // videos per week
      uploadTrends: [],    // month-wise counts
      engagementTrends: [], // video performance trend line
      performanceTrends: [] // views/likes distributions
    };
  }

  let totalViews = 0;
  let totalLikes = 0;
  let totalComments = 0;
  let totalEngagementPercent = 0;

  videos.forEach(v => {
    totalViews += v.views;
    totalLikes += v.likes;
    totalComments += v.comments;
    
    // Engagement rate of a video = ((likes + comments) / views) * 100
    const videoEngagement = v.views > 0 ? ((v.likes + v.comments) / v.views) * 100 : 0;
    totalEngagementPercent += videoEngagement;
  });

  const averageViews = parseFloat((totalViews / videos.length).toFixed(2));
  const averageLikes = parseFloat((totalLikes / videos.length).toFixed(2));
  const averageComments = parseFloat((totalComments / videos.length).toFixed(2));
  
  // Overall Channel engagement rate (average of video engagement rates)
  const engagementRate = parseFloat((totalEngagementPercent / videos.length).toFixed(2));

  // Calculating posting frequency (videos per week)
  // Get time span between oldest and latest video in the list
  const dates = videos.map(v => new Date(v.publishedAt).getTime());
  const minDate = Math.min(...dates);
  const maxDate = Math.max(...dates);
  const timespanMs = maxDate - minDate;
  const timespanWeeks = timespanMs / (1000 * 60 * 60 * 24 * 7);
  const postingFrequency = timespanWeeks > 0 ? parseFloat((videos.length / timespanWeeks).toFixed(2)) : videos.length;

  // Monthly Upload Trends
  const monthlyStats = {};
  videos.forEach(v => {
    const dateObj = new Date(v.publishedAt);
    const monthYear = dateObj.toLocaleString('default', { month: 'short', year: '2-digit' }); // e.g. "Jun 26"
    monthlyStats[monthYear] = (monthlyStats[monthYear] || 0) + 1;
  });

  const uploadTrends = Object.entries(monthlyStats).map(([month, count]) => ({
    month,
    count
  })).reverse(); // latest months first or chronological? Let's keep it chronologically ordered
  
  // Sort monthly uploads in chronological order (approximated by reverse if videos were sorted desc)
  // Let's do a simple chronological sort based on the date of the first video matching that month
  const monthDates = {};
  videos.forEach(v => {
    const dateObj = new Date(v.publishedAt);
    const monthYear = dateObj.toLocaleString('default', { month: 'short', year: '2-digit' });
    if (!monthDates[monthYear]) {
      monthDates[monthYear] = dateObj.getTime();
    }
  });

  uploadTrends.sort((a, b) => monthDates[a.month] - monthDates[b.month]);

  // Video performance & Engagement trends (last 10 videos sorted chronologically)
  const engagementTrends = [...videos]
    .slice(0, 10)
    .reverse() // oldest first for timeline chart
    .map(v => ({
      title: v.title.length > 20 ? v.title.substring(0, 20) + '...' : v.title,
      views: v.views,
      likes: v.likes,
      comments: v.comments,
      engagement: v.views > 0 ? parseFloat((((v.likes + v.comments) / v.views) * 100).toFixed(2)) : 0
    }));

  return {
    averageViews,
    averageLikes,
    averageComments,
    engagementRate,
    postingFrequency,
    uploadTrends,
    engagementTrends,
    performanceTrends: engagementTrends
  };
}

module.exports = {
  calculateChannelAnalytics
};

const axios = require('axios');
const logger = require('../utils/logger');
const { validateYoutubeStats } = require('../utils/validation');

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const YOUTUBE_BASE_URL = process.env.YOUTUBE_BASE_URL || 'https://www.googleapis.com/youtube/v3';

/**
 * Main service to fetch data from the YouTube Data API.
 * Uses fallback simulator mock data if API Key is not provided or if requests fail.
 */
async function getChannelData(channelName) {
  logger.info(`Initiating YouTube Data fetch for channel: "${channelName}"`);

  // Check if API Key is set; if not, fall back to mock data
  if (!YOUTUBE_API_KEY || YOUTUBE_API_KEY === 'YOUR_API_KEY_HERE') {
    logger.warn('YOUTUBE_API_KEY is not configured or holds placeholder value. Launching mock simulator...');
    return getMockChannelData(channelName);
  }

  try {
    // 1. Search for the channel by name
    logger.info(`Searching YouTube Data API for channel query: "${channelName}"`);
    const searchResponse = await axios.get(`${YOUTUBE_BASE_URL}/search`, {
      params: {
        part: 'snippet',
        type: 'channel',
        q: channelName,
        maxResults: 1,
        key: YOUTUBE_API_KEY
      }
    });

    console.log("========== SEARCH RESPONSE ==========");
    console.log(JSON.stringify(searchResponse.data, null, 2));

    if (logger.logSearchResponse) {
      logger.logSearchResponse(searchResponse.data);
    }

    const searchItems = searchResponse.data.items || [];
    searchItems.forEach(item => {
      console.log({
        title: item.snippet?.title,
        channelId: item.id?.channelId,
        description: item.snippet?.description
      });
    });

    if (!searchItems || searchItems.length === 0) {
      throw new Error(`YouTube channel "${channelName}" not found.`);
    }

    const youtubeChannelId = searchItems[0].snippet.channelId;
    const channelNameFromApi = searchItems[0].snippet.title;
    logger.info(`Found YouTube Channel ID: "${youtubeChannelId}" (Title: "${channelNameFromApi}")`);

    // 2. Fetch Channel overview details
    const selectedChannelId = youtubeChannelId;
    console.log("========== SELECTED CHANNEL ==========");
    console.log({
      channelName,
      selectedChannelId
    });

    const channelResponse = await axios.get(`${YOUTUBE_BASE_URL}/channels`, {
      params: {
        part: 'snippet,statistics,contentDetails',
        id: youtubeChannelId,
        key: YOUTUBE_API_KEY
      }
    });

    console.log("========== CHANNEL API RESPONSE ==========");
    console.log(JSON.stringify(channelResponse.data, null, 2));

    if (logger.logChannelResponse) {
      logger.logChannelResponse(channelResponse.data);
    }

    console.log("Statistics:", {
      subscriberCount:
        channelResponse.data.items[0]?.statistics?.subscriberCount,

      viewCount:
        channelResponse.data.items[0]?.statistics?.viewCount,

      videoCount:
        channelResponse.data.items[0]?.statistics?.videoCount
    });

    // Run the validation rules
    validateYoutubeStats(channelResponse.data);

    const channelDetails = channelResponse.data.items?.[0];
    if (!channelDetails) {
      throw new Error(`Failed to retrieve details for channel ID: ${youtubeChannelId}`);
    }

    const { snippet, statistics, contentDetails } = channelDetails;
    const uploadsPlaylistId = contentDetails.relatedPlaylists?.uploads;

    const channelData = {
      youtubeChannelId,
      name: snippet.title,
      description: snippet.description,
      subscriberCount: parseFloat(statistics.subscriberCount || 0),
      viewCount: parseFloat(statistics.viewCount || 0),
      videoCount: parseInt(statistics.videoCount || 0, 10),
      thumbnail: snippet.thumbnails?.high?.url || snippet.thumbnails?.default?.url
    };

    // 3. Fetch latest videos from the uploads playlist (cost-efficient)
    let videos = [];
    let comments = [];

    if (uploadsPlaylistId) {
      logger.info(`Fetching uploads playlist items for playlist ID: ${uploadsPlaylistId}`);
      const playlistResponse = await axios.get(`${YOUTUBE_BASE_URL}/playlistItems`, {
        params: {
          part: 'snippet',
          playlistId: uploadsPlaylistId,
          maxResults: 15, // Retrieve top 15 latest videos
          key: YOUTUBE_API_KEY
        }
      });

      const playlistItems = playlistResponse.data.items || [];
      const videoIds = playlistItems.map(item => item.snippet.resourceId.videoId);

      if (videoIds.length > 0) {
        // 4. Retrieve video statistics (views, likes, comments)
        logger.info(`Fetching video statistics for ${videoIds.length} videos`);
        const videosResponse = await axios.get(`${YOUTUBE_BASE_URL}/videos`, {
          params: {
            part: 'snippet,statistics',
            id: videoIds.join(','),
            key: YOUTUBE_API_KEY
          }
        });

        const videoDetailsList = videosResponse.data.items || [];
        videos = videoDetailsList.map(item => ({
          youtubeVideoId: item.id,
          title: item.snippet.title,
          description: item.snippet.description,
          views: parseFloat(item.statistics?.viewCount || 0),
          likes: parseFloat(item.statistics?.likeCount || 0),
          comments: parseFloat(item.statistics?.commentCount || 0),
          publishedAt: item.snippet.publishedAt,
          thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url
        }));

        // 5. Fetch comments for top 3 videos to run sentiment analysis on (to avoid rate limiting)
        const topVideos = [...videos].sort((a, b) => b.views - a.views).slice(0, 3);
        
        for (const video of topVideos) {
          try {
            logger.info(`Fetching comments for video: ${video.title} (ID: ${video.youtubeVideoId})`);
            const commentResponse = await axios.get(`${YOUTUBE_BASE_URL}/commentThreads`, {
              params: {
                part: 'snippet',
                videoId: video.youtubeVideoId,
                maxResults: 10, // Retrieve top 10 comment threads
                textFormat: 'plainText',
                key: YOUTUBE_API_KEY
              }
            });

            const commentItems = commentResponse.data.items || [];
            commentItems.forEach(item => {
              const commentSnippet = item.snippet?.topLevelComment?.snippet;
              if (commentSnippet) {
                comments.push({
                  youtubeCommentId: item.snippet.topLevelComment.id,
                  youtubeVideoId: video.youtubeVideoId,
                  author: commentSnippet.authorDisplayName,
                  content: commentSnippet.textDisplay,
                  publishedAt: commentSnippet.publishedAt
                });
              }
            });
          } catch (commentError) {
            // Comments might be disabled on this video
            logger.warn(`Could not retrieve comments for video ${video.youtubeVideoId}: ${commentError.message}`);
          }
        }
      }
    }

    return {
      channel: channelData,
      videos,
      comments
    };

  } catch (error) {
    logger.error(`YouTube API fetch failed: ${error.message}. Falling back to mock simulation...`);
    return getMockChannelData(channelName);
  }
}

/**
 * High-fidelity simulator data for testing without a key
 */
function getMockChannelData(channelName) {
  const normalized = channelName.toLowerCase().trim();

  // MrBeast simulated data
  if (normalized.includes('beast')) {
    return generateMockDetails('MrBeast', {
      subscribers: 280000000,
      totalViews: 52000000000,
      videoCount: 790,
      thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=150&h=150&q=80',
      description: 'I Want To Make The World A Better Place Before I Die. Videos featuring massive challenges, charity stunts, and gaming content.'
    }, [
      { title: 'I Survived 100 Days In A Clean Circle', views: 185000000, likes: 12000000, comments: 450000, ageDays: 5 },
      { title: 'Ages 1 - 100 Fight For $500,000', views: 245000000, likes: 16000000, comments: 680000, ageDays: 14 },
      { title: 'Every Country In The World Fights For $250,000', views: 320000000, likes: 21000000, comments: 920000, ageDays: 30 },
      { title: 'I Spent 7 Days In Solitary Confinement', views: 140000000, likes: 8500000, comments: 320000, ageDays: 45 },
      { title: '$1 vs $1,000,0000 Hotel Room!', views: 290000000, likes: 14000000, comments: 550000, ageDays: 60 },
      { title: 'I Survived 7 Days In An Abandoned City', views: 195000000, likes: 9800000, comments: 410000, ageDays: 75 },
      { title: 'Surviving 7 Days Stranded At Sea', views: 155000000, likes: 8200000, comments: 280000, ageDays: 90 },
      { title: 'Would You Fly To Paris For A Baguette?', views: 98000000, likes: 5200000, comments: 190000, ageDays: 105 },
      { title: 'I Filled My House With 10,000,000 Orbeez', views: 165000000, likes: 7800000, comments: 350000, ageDays: 120 },
      { title: 'Last To Leave Circle Wins $500,000', views: 210000000, likes: 11000000, comments: 590000, ageDays: 150 }
    ]);
  }

  // OpenAI simulated data
  if (normalized.includes('openai') || normalized.includes('gpt')) {
    return generateMockDetails('OpenAI', {
      subscribers: 2500000,
      totalViews: 98000000,
      videoCount: 145,
      thumbnail: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=150&h=150&q=80',
      description: 'OpenAI research, announcements, and developer demos, including GPT-4o, Sora, ChatGPT, and API tutorials.'
    }, [
      { title: 'Introducing GPT-4o', views: 14200000, likes: 620000, comments: 48000, ageDays: 2 },
      { title: 'OpenAI Sora: First Impressions & Demos', views: 8900000, likes: 450000, comments: 35000, ageDays: 10 },
      { title: 'GPT-4o Developer Live Demo & API Overview', views: 4500000, likes: 180000, comments: 12000, ageDays: 15 },
      { title: 'Introducing ChatGPT Voice Mode', views: 6800000, likes: 290000, comments: 21000, ageDays: 25 },
      { title: 'OpenAI DevDay 2025 Opening Keynote', views: 5200000, likes: 210000, comments: 18000, ageDays: 40 },
      { title: 'ChatGPT Plus Custom GPTs Tutorial', views: 1800000, likes: 78000, comments: 4500, ageDays: 60 },
      { title: 'Prompt Engineering Best Practices with GPT-4', views: 2100000, likes: 92000, comments: 5900, ageDays: 80 },
      { title: 'Sora AI Video Generation: Behind the Scenes', views: 7900000, likes: 320000, comments: 29000, ageDays: 95 },
      { title: 'DALL-E 3 Text-to-Image Generation Launch', views: 3400000, likes: 140000, comments: 9800, ageDays: 120 },
      { title: 'Our Vision for the Future of AGI', views: 2900000, likes: 110000, comments: 14000, ageDays: 150 }
    ]);
  }

  // Fireship simulated data
  if (normalized.includes('fireship')) {
    return generateMockDetails('Fireship', {
      subscribers: 3100000,
      totalViews: 410000000,
      videoCount: 1200,
      thumbnail: 'https://images.unsplash.com/photo-1618005198140-5e5812e1ec73?auto=format&fit=crop&w=150&h=150&q=80',
      description: 'Code-report videos. High-intensity 100-second code tutorials and tech industry news for developers.'
    }, [
      { title: 'React 19 is Finally Here... is it any good?', views: 980000, likes: 72000, comments: 5400, ageDays: 1 },
      { title: 'Next.js 15 just changed everything again', views: 1200000, likes: 89000, comments: 6900, ageDays: 4 },
      { title: 'Web Development in 2026 - The Hard Truth', views: 2100000, likes: 145000, comments: 14000, ageDays: 7 },
      { title: 'TypeScript in 100 Seconds', views: 1800000, likes: 120000, comments: 8500, ageDays: 14 },
      { title: 'Cursor AI editor just killed VSCode', views: 1600000, likes: 110000, comments: 9200, ageDays: 20 },
      { title: 'Rust in 100 Seconds', views: 2400000, likes: 165000, comments: 12500, ageDays: 30 },
      { title: 'What is Web3? (explained in 100 seconds)', views: 1100000, likes: 62000, comments: 5200, ageDays: 45 },
      { title: 'The Rise of Bun - Node.js killer?', views: 1400000, likes: 98000, comments: 8100, ageDays: 60 },
      { title: '10 CSS Tricks You Should Know in 2026', views: 1300000, likes: 88000, comments: 4900, ageDays: 80 },
      { title: 'PostgreSQL in 100 Seconds', views: 1950000, likes: 128000, comments: 7900, ageDays: 100 }
    ]);
  }

  // Default Generic search simulation (TechWithTim / general developer channel)
  const channelTitle = channelName.charAt(0).toUpperCase() + channelName.slice(1);
  return generateMockDetails(channelTitle, {
    subscribers: 1400000,
    totalViews: 180000000,
    videoCount: 920,
    thumbnail: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=150&h=150&q=80',
    description: `Welcome to ${channelTitle}! Tech tutorials, programming tips, system design lessons, and software development guides.`
  }, [
    { title: 'Python Programming Course for Beginners (2026)', views: 820000, likes: 45000, comments: 3900, ageDays: 3 },
    { title: 'Build a Full Stack App in 1 Hour!', views: 450000, likes: 29000, comments: 2100, ageDays: 10 },
    { title: 'Is C++ Still Worth Learning Today?', views: 590000, likes: 32000, comments: 4500, ageDays: 20 },
    { title: 'How to Learn Data Structures and Algorithms', views: 910000, likes: 58000, comments: 6200, ageDays: 35 },
    { title: 'React vs Vue vs Angular in 2026', views: 320000, likes: 18000, comments: 1900, ageDays: 50 },
    { title: 'Deploying Node.js to AWS Docker Containers', views: 240000, likes: 12000, comments: 850, ageDays: 70 },
    { title: 'My Coding Desk Setup & Accessories', views: 480000, likes: 26000, comments: 3100, ageDays: 90 },
    { title: 'Git & GitHub Tutorial - Master Repository Control', views: 670000, likes: 41000, comments: 2800, ageDays: 120 },
    { title: 'JavaScript Promises Explained in 5 Minutes', views: 290000, likes: 15000, comments: 1200, ageDays: 150 },
    { title: 'Why I Switched from Windows to macOS for Dev', views: 780000, likes: 39000, comments: 5800, ageDays: 180 }
  ]);
}

/**
 * Generates structured mock payloads with videos and comments
 */
function generateMockDetails(title, channelStats, videoTemplates) {
  const youtubeChannelId = 'UC_' + title.replace(/[^a-zA-Z0-9]/g, '') + '_ID';

  const channel = {
    youtubeChannelId,
    name: title,
    description: channelStats.description,
    subscriberCount: channelStats.subscribers,
    viewCount: channelStats.totalViews,
    videoCount: channelStats.videoCount,
    thumbnail: channelStats.thumbnail
  };

  const videos = videoTemplates.map((v, index) => {
    const pubDate = new Date();
    pubDate.setDate(pubDate.getDate() - v.ageDays);

    return {
      youtubeVideoId: `video_id_${index}_${youtubeChannelId}`,
      title: v.title,
      description: `This is a simulated description for video: "${v.title}". Learn coding tips, tricks, and industry best practices in this video.`,
      views: v.views,
      likes: v.likes,
      comments: v.comments,
      publishedAt: pubDate.toISOString(),
      thumbnail: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=320&h=180&q=80'
    };
  });

  // Simulated Comments for top videos (to run Sentiment on)
  const commentTemplates = [
    { author: 'Jane Doe', content: 'This is exactly what I was looking for! Excellent breakdown and very clean.', ageDays: 1 },
    { author: 'CodingGuy', content: 'Loved the explanation, but wait, React 19 does not work that way on server side.', ageDays: 2 },
    { author: 'Techie99', content: 'Latency seems a bit high, this is really overrated and useless for production.', ageDays: 3 },
    { author: 'Alice Smith', content: 'Amazing video, thank you for making it so simple and easy to understand!', ageDays: 4 },
    { author: 'Bob Builder', content: 'Is there a GitHub repository for this code? There are some bugs in the import statements.', ageDays: 5 },
    { author: 'SubZero', content: 'Hate this library, it is extremely complicated and expensive to host.', ageDays: 6 },
    { author: 'Sunny_Dev', content: 'Wow, great performance and beautiful dashboard visual! Keep it up.', ageDays: 7 },
    { author: 'CriticalMind', content: 'I am thrilled about this release! Resolves all warning and compile issues.', ageDays: 8 },
    { author: 'TesterPro', content: 'Decent overall, but it crashed when running on my local machine. Pls fix.', ageDays: 9 },
    { author: 'AgileFan', content: 'Clean, stable, and highly innovative approach. Recommended!', ageDays: 10 }
  ];

  const comments = [];
  const topVideos = videos.slice(0, 3); // Assign comments to top 3 videos

  topVideos.forEach(v => {
    commentTemplates.forEach((ct, index) => {
      const commDate = new Date(v.publishedAt);
      commDate.setDate(commDate.getDate() + ct.ageDays);

      comments.push({
        youtubeCommentId: `comment_id_${index}_${v.youtubeVideoId}`,
        youtubeVideoId: v.youtubeVideoId,
        author: ct.author,
        content: ct.content,
        publishedAt: commDate.toISOString()
      });
    });
  });

  return {
    channel,
    videos,
    comments
  };
}

module.exports = {
  getChannelData
};

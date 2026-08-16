const { prisma } = require('../config/db');

async function findChannelByName(name) {
  // Case-insensitive search for channels in our local DB
  return prisma.youtubeChannel.findFirst({
    where: {
      name: {
        equals: name,
        mode: 'insensitive'
      }
    }
  });
}

async function findChannelById(youtubeChannelId) {
  return prisma.youtubeChannel.findUnique({
    where: { youtubeChannelId }
  });
}

async function getChannelWithDetails(channelId) {
  return prisma.youtubeChannel.findUnique({
    where: { id: channelId },
    include: {
      videos: {
        orderBy: { publishedAt: 'desc' }
      },
      snapshots: {
        orderBy: { capturedAt: 'desc' },
        take: 10
      },
      trendingKeywords: {
        orderBy: { frequency: 'desc' }
      }
    }
  });
}

async function saveChannelData({ channel, videos, comments, keywords, snapshot }) {
  // Use a transaction to write channel, videos, comments, keywords, and snapshot atomically
  return prisma.$transaction(async (tx) => {
    // 1. Upsert Channel details
    const savedChannel = await tx.youtubeChannel.upsert({
      where: { youtubeChannelId: channel.youtubeChannelId },
      create: {
        youtubeChannelId: channel.youtubeChannelId,
        name: channel.name,
        description: channel.description,
        subscriberCount: channel.subscriberCount,
        viewCount: channel.viewCount,
        videoCount: channel.videoCount,
        thumbnail: channel.thumbnail
      },
      update: {
        name: channel.name,
        description: channel.description,
        subscriberCount: channel.subscriberCount,
        viewCount: channel.viewCount,
        videoCount: channel.videoCount,
        thumbnail: channel.thumbnail,
        updatedAt: new Date()
      }
    });

    const channelId = savedChannel.id;

    // 2. Delete existing keywords and save new ones
    await tx.youtubeTrendingKeyword.deleteMany({
      where: { channelId }
    });
    if (keywords && keywords.length > 0) {
      await tx.youtubeTrendingKeyword.createMany({
        data: keywords.map(kw => ({
          keyword: kw.keyword,
          frequency: kw.frequency,
          channelId
        }))
      });
    }

    // 3. Save snapshot
    await tx.youtubeAnalyticsSnapshot.create({
      data: {
        channelId,
        averageViews: snapshot.averageViews,
        averageLikes: snapshot.averageLikes,
        averageComments: snapshot.averageComments,
        engagementRate: snapshot.engagementRate
      }
    });

    // 4. Save Videos and their corresponding Comments
    for (const video of videos) {
      const savedVideo = await tx.youtubeVideo.upsert({
        where: { youtubeVideoId: video.youtubeVideoId },
        create: {
          youtubeVideoId: video.youtubeVideoId,
          channelId,
          title: video.title,
          description: video.description,
          views: video.views,
          likes: video.likes,
          comments: video.comments,
          publishedAt: new Date(video.publishedAt),
          thumbnail: video.thumbnail
        },
        update: {
          title: video.title,
          description: video.description,
          views: video.views,
          likes: video.likes,
          comments: video.comments,
          thumbnail: video.thumbnail
        }
      });

      const videoId = savedVideo.id;

      // Filter and save comments for this video
      const videoComments = comments.filter(c => c.youtubeVideoId === video.youtubeVideoId);
      if (videoComments.length > 0) {
        // Delete old comments for this video to keep data clean
        await tx.youtubeComment.deleteMany({
          where: { videoId }
        });
        
        await tx.youtubeComment.createMany({
          data: videoComments.map(c => ({
            youtubeCommentId: c.youtubeCommentId,
            videoId,
            author: c.author,
            content: c.content,
            sentiment: c.sentiment,
            publishedAt: new Date(c.publishedAt)
          }))
        });
      }
    }

    return savedChannel;
  });
}

async function getVideosByChannel(channelId) {
  return prisma.youtubeVideo.findMany({
    where: { channelId },
    orderBy: { publishedAt: 'desc' }
  });
}

async function getCommentsByVideo(videoId) {
  return prisma.youtubeComment.findMany({
    where: { videoId },
    orderBy: { publishedAt: 'desc' }
  });
}

async function getSentimentDistribution(channelId) {
  // Aggregate sentiments of comments belonging to all videos of the channel
  const comments = await prisma.youtubeComment.findMany({
    where: {
      video: { channelId }
    },
    select: {
      sentiment: true
    }
  });

  const totals = { POSITIVE: 0, NEUTRAL: 0, NEGATIVE: 0 };
  comments.forEach(c => {
    if (totals[c.sentiment] !== undefined) {
      totals[c.sentiment]++;
    }
  });

  return totals;
}

module.exports = {
  findChannelByName,
  findChannelById,
  getChannelWithDetails,
  saveChannelData,
  getVideosByChannel,
  getCommentsByVideo,
  getSentimentDistribution
};

const { prisma } = require('../config/db');

async function getAllPosts(filters = {}) {
  const where = {};
  
  if (filters.platformId) {
    where.platformId = filters.platformId;
  }
  
  if (filters.platformKey) {
    where.platform = { key: filters.platformKey };
  }

  return prisma.post.findMany({
    where,
    include: {
      platform: true,
      sentiment: true
    },
    orderBy: { postedAt: 'desc' }
  });
}

async function getPostById(id) {
  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      platform: true,
      sentiment: true
    }
  });

  if (!post) {
    const error = new Error('Post not found.');
    error.status = 404;
    throw error;
  }

  return post;
}

async function createPost(postData) {
  const { content, platformId, engagementRate, likes, comments, shares, postedAt, sentiment } = postData;

  if (!content || !platformId || engagementRate === undefined) {
    const error = new Error('Content, platformId, and engagementRate are required.');
    error.status = 400;
    throw error;
  }

  // Create post and nested sentiment if provided
  const data = {
    content,
    platformId,
    engagementRate: parseFloat(engagementRate),
    likes: likes ? parseInt(likes) : 0,
    comments: comments ? parseInt(comments) : 0,
    shares: shares ? parseInt(shares) : 0,
    postedAt: postedAt ? new Date(postedAt) : new Date()
  };

  if (sentiment) {
    data.sentiment = {
      create: {
        positive: parseFloat(sentiment.positive || 0),
        neutral: parseFloat(sentiment.neutral || 0),
        negative: parseFloat(sentiment.negative || 0),
        overall: sentiment.overall || 'NEUTRAL'
      }
    };
  }

  return prisma.post.create({
    data,
    include: {
      platform: true,
      sentiment: true
    }
  });
}

async function updatePost(id, updateData) {
  const { content, platformId, engagementRate, likes, comments, shares, postedAt, sentiment } = updateData;
  
  // Verify post exists
  await getPostById(id);

  const data = {};
  if (content) data.content = content;
  if (platformId) data.platformId = platformId;
  if (engagementRate !== undefined) data.engagementRate = parseFloat(engagementRate);
  if (likes !== undefined) data.likes = parseInt(likes);
  if (comments !== undefined) data.comments = parseInt(comments);
  if (shares !== undefined) data.shares = parseInt(shares);
  if (postedAt) data.postedAt = new Date(postedAt);

  if (sentiment) {
    data.sentiment = {
      upsert: {
        create: {
          positive: parseFloat(sentiment.positive || 0),
          neutral: parseFloat(sentiment.neutral || 0),
          negative: parseFloat(sentiment.negative || 0),
          overall: sentiment.overall || 'NEUTRAL'
        },
        update: {
          positive: parseFloat(sentiment.positive),
          neutral: parseFloat(sentiment.neutral),
          negative: parseFloat(sentiment.negative),
          overall: sentiment.overall
        }
      }
    };
  }

  return prisma.post.update({
    where: { id },
    data,
    include: {
      platform: true,
      sentiment: true
    }
  });
}

async function deletePost(id) {
  await getPostById(id);

  return prisma.post.delete({
    where: { id }
  });
}

module.exports = {
  getAllPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost
};

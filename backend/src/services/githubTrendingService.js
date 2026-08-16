const { prisma } = require('../config/db');
const githubService = require('./githubService');
const logger = require('../utils/logger');

/**
 * Calculates custom Intelligence Score for a repository
 */
function computeIntelligenceScore(stars, forks, contributorsCount, openIssues) {
  // Activity score calculation: higher commits/frequency/participation weights
  const commitsWeight = 25 * 20; // assumed 25 weekly commits for trending
  const contributorWeight = contributorsCount * 5;
  const starsWeight = stars * 0.1;
  const forksWeight = forks * 0.2;
  
  // Base intelligence score formula
  return Math.round(starsWeight + forksWeight + contributorWeight + commitsWeight);
}

async function fetchAndStoreTrendingRepos() {
  logger.info('Running githubTrendingService - collecting trending repositories...');
  try {
    const repos = await githubService.getTrendingRepositories();
    
    for (const r of repos) {
      // Fetch contributors to calculate score
      let contributorsCount = 15;
      try {
        // Handle owner/repo formatting
        const parts = r.full_name.split('/');
        const contributors = await githubService.getRepositoryContributors(parts[0], parts[1]);
        contributorsCount = contributors.length || 15;
      } catch (e) {
        logger.warn(`Could not get contributors for trending repo ${r.full_name}: ${e.message}`);
      }

      const score = computeIntelligenceScore(r.stargazers_count, r.forks_count, contributorsCount, r.open_issues_count || 10);

      // Upsert into GithubTrend database model
      await prisma.githubTrend.upsert({
        where: { repoName: r.full_name },
        create: {
          repoName: r.full_name,
          owner: r.owner.login,
          stars: r.stargazers_count,
          forks: r.forks_count,
          language: r.language || 'JavaScript',
          description: r.description || '',
          repoUrl: `https://github.com/${r.full_name}`,
          intelligenceScore: score,
          updatedAt: new Date()
        },
        update: {
          stars: r.stargazers_count,
          forks: r.forks_count,
          language: r.language || 'JavaScript',
          description: r.description || '',
          intelligenceScore: score,
          updatedAt: new Date()
        }
      });
    }

    logger.info(`Successfully stored ${repos.length} trending repositories in PostgreSQL.`);
    return repos;
  } catch (error) {
    logger.error(`fetchAndStoreTrendingRepos failed: ${error.message}`);
    throw error;
  }
}

async function fetchAndStoreTrendingDevelopers() {
  logger.info('Running githubTrendingService - collecting trending developers...');
  try {
    // Collect popular developers (Linus, Dan, TJ)
    const devs = ['torvalds', 'gaearon', 'tj'];
    
    for (const d of devs) {
      const data = await githubService.getUserProfile(d);
      const profile = data.profile;
      const repos = data.repos;

      const popularRepo = repos[0] || { name: 'unknown', html_url: '', stargazers_count: 0 };

      await prisma.githubDeveloper.upsert({
        where: { username: profile.login },
        create: {
          username: profile.login,
          name: profile.name || profile.login,
          avatarUrl: profile.avatar_url,
          followers: profile.followers || 0,
          publicRepos: profile.public_repos || 0,
          popularRepoName: popularRepo.name,
          popularRepoUrl: popularRepo.html_url || `https://github.com/${profile.login}/${popularRepo.name}`,
          popularRepoStars: popularRepo.stargazers_count || 0,
          updatedAt: new Date()
        },
        update: {
          name: profile.name || profile.login,
          avatarUrl: profile.avatar_url,
          followers: profile.followers || 0,
          publicRepos: profile.public_repos || 0,
          popularRepoName: popularRepo.name,
          popularRepoStars: popularRepo.stargazers_count || 0,
          updatedAt: new Date()
        }
      });
    }

    logger.info('Successfully stored trending developers in PostgreSQL.');
  } catch (error) {
    logger.error(`fetchAndStoreTrendingDevelopers failed: ${error.message}`);
  }
}

module.exports = {
  fetchAndStoreTrendingRepos,
  fetchAndStoreTrendingDevelopers,
  computeIntelligenceScore
};

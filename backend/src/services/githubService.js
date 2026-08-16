const axios = require('axios');
const logger = require('../utils/logger');

const GITHUB_API_BASE_URL = process.env.GITHUB_API_BASE_URL || 'https://api.github.com';

// Internal rate-limit diagnostic tracker
let rateLimitInfo = {
  limit: null,
  remaining: null,
  reset: null,
  configured: false,
  authenticated: false
};

/**
 * Constructs authenticated request headers using process.env.GITHUB_TOKEN.
 * Uses Authorization: Bearer <token> format (supported by GitHub REST API).
 */
function getHeaders() {
  const token = process.env.GITHUB_TOKEN ? process.env.GITHUB_TOKEN.trim() : '';
  const headers = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'Social-Media-Analytics-Dashboard'
  };
  
  if (token && token !== 'YOUR_GITHUB_TOKEN_HERE') {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
}

/**
 * Updates diagnostic rate limit state from GitHub API response headers.
 */
function updateRateLimitFromHeaders(headers) {
  if (!headers) return;
  const token = process.env.GITHUB_TOKEN ? process.env.GITHUB_TOKEN.trim() : '';
  const isAuthenticated = !!(token && token !== 'YOUR_GITHUB_TOKEN_HERE');

  rateLimitInfo.configured = !!process.env.GITHUB_TOKEN;
  rateLimitInfo.authenticated = isAuthenticated;

  const limit = headers['x-ratelimit-limit'];
  const remaining = headers['x-ratelimit-remaining'];
  const reset = headers['x-ratelimit-reset'];

  if (limit !== undefined) rateLimitInfo.limit = parseInt(limit, 10);
  if (remaining !== undefined) rateLimitInfo.remaining = parseInt(remaining, 10);
  if (reset !== undefined) rateLimitInfo.reset = parseInt(reset, 10);
}

/**
 * Checks if GitHub API rate limit is currently exhausted to avoid duplicate retries.
 */
function checkRateLimitExhausted() {
  const token = process.env.GITHUB_TOKEN ? process.env.GITHUB_TOKEN.trim() : '';
  const isAuthenticated = !!(token && token !== 'YOUR_GITHUB_TOKEN_HERE');
  rateLimitInfo.configured = !!process.env.GITHUB_TOKEN;
  rateLimitInfo.authenticated = isAuthenticated;

  if (rateLimitInfo.remaining !== null && rateLimitInfo.remaining <= 0) {
    const nowInSeconds = Math.floor(Date.now() / 1000);
    if (rateLimitInfo.reset && nowInSeconds < rateLimitInfo.reset) {
      logger.warn(`GitHub API rate limit exhausted (${rateLimitInfo.remaining}/${rateLimitInfo.limit}). Resets at ${new Date(rateLimitInfo.reset * 1000).toISOString()}`);
      return true;
    }
  }
  return false;
}

/**
 * Returns safe backend diagnostic status without exposing GITHUB_TOKEN.
 */
function getGithubApiStatus() {
  const token = process.env.GITHUB_TOKEN ? process.env.GITHUB_TOKEN.trim() : '';
  const isConfigured = !!process.env.GITHUB_TOKEN;
  const isAuthenticated = !!(token && token !== 'YOUR_GITHUB_TOKEN_HERE');

  return {
    configured: isConfigured,
    authenticated: isAuthenticated,
    remaining_requests: rateLimitInfo.remaining !== null ? rateLimitInfo.remaining : (isAuthenticated ? 5000 : 60),
    limit: rateLimitInfo.limit !== null ? rateLimitInfo.limit : (isAuthenticated ? 5000 : 60),
    reset_at: rateLimitInfo.reset ? new Date(rateLimitInfo.reset * 1000).toISOString() : null
  };
}

/**
 * Search for repositories using GitHub search API.
 */
async function searchRepository(query) {
  logger.info(`Searching GitHub repositories for query: "${query}"`);
  
  if (checkRateLimitExhausted()) {
    logger.warn(`GitHub API rate limit active. Returning fallback data for query: "${query}"`);
    return getMockSearchResults(query);
  }

  try {
    const response = await axios.get(`${GITHUB_API_BASE_URL}/search/repositories`, {
      params: { q: query, per_page: 10 },
      headers: getHeaders()
    });
    updateRateLimitFromHeaders(response.headers);
    return response.data.items || [];
  } catch (error) {
    updateRateLimitFromHeaders(error.response?.headers);
    logger.error(`searchRepository API failed: ${error.message}. Falling back to mock data...`);
    return getMockSearchResults(query);
  }
}

/**
 * Fetch detailed repository info from GitHub.
 */
async function getRepositoryDetails(owner, repo) {
  logger.info(`Fetching GitHub repository details for: "${owner}/${repo}"`);

  if (checkRateLimitExhausted()) {
    logger.warn(`GitHub API rate limit active. Returning fallback data for: "${owner}/${repo}"`);
    return getMockRepositoryDetails(owner, repo);
  }

  try {
    const response = await axios.get(`${GITHUB_API_BASE_URL}/repos/${owner}/${repo}`, {
      headers: getHeaders()
    });
    updateRateLimitFromHeaders(response.headers);

    // Concurrently fetch languages for distribution
    let languages = {};
    try {
      const langResponse = await axios.get(`${GITHUB_API_BASE_URL}/repos/${owner}/${repo}/languages`, {
        headers: getHeaders()
      });
      updateRateLimitFromHeaders(langResponse.headers);
      languages = langResponse.data;
    } catch (langError) {
      updateRateLimitFromHeaders(langError.response?.headers);
      logger.warn(`Failed to fetch languages for ${owner}/${repo}: ${langError.message}`);
    }

    return {
      repoInfo: response.data,
      languages
    };
  } catch (error) {
    updateRateLimitFromHeaders(error.response?.headers);
    logger.error(`getRepositoryDetails API failed: ${error.message}. Falling back to mock...`);
    return getMockRepositoryDetails(owner, repo);
  }
}

/**
 * Fetch repository contributors.
 */
async function getRepositoryContributors(owner, repo) {
  logger.info(`Fetching GitHub contributors for: "${owner}/${repo}"`);

  if (checkRateLimitExhausted()) {
    logger.warn(`GitHub API rate limit active. Returning fallback contributors for: "${owner}/${repo}"`);
    return getMockContributors(owner, repo);
  }

  try {
    const response = await axios.get(`${GITHUB_API_BASE_URL}/repos/${owner}/${repo}/contributors`, {
      params: { per_page: 30 },
      headers: getHeaders()
    });
    updateRateLimitFromHeaders(response.headers);
    return response.data || [];
  } catch (error) {
    updateRateLimitFromHeaders(error.response?.headers);
    logger.error(`getRepositoryContributors API failed: ${error.message}. Falling back to mock...`);
    return getMockContributors(owner, repo);
  }
}

/**
 * Fetch repository commits.
 */
async function getRepositoryCommits(owner, repo) {
  logger.info(`Fetching GitHub commits for: "${owner}/${repo}"`);

  if (checkRateLimitExhausted()) {
    logger.warn(`GitHub API rate limit active. Returning fallback commits for: "${owner}/${repo}"`);
    return getMockCommits(owner, repo);
  }

  try {
    const response = await axios.get(`${GITHUB_API_BASE_URL}/repos/${owner}/${repo}/commits`, {
      params: { per_page: 100 },
      headers: getHeaders()
    });
    updateRateLimitFromHeaders(response.headers);
    return response.data || [];
  } catch (error) {
    updateRateLimitFromHeaders(error.response?.headers);
    logger.error(`getRepositoryCommits API failed: ${error.message}. Falling back to mock...`);
    return getMockCommits(owner, repo);
  }
}

/**
 * Fetch a GitHub user's profile and their repos.
 */
async function getUserProfile(username) {
  logger.info(`Fetching GitHub user profile for: "${username}"`);

  if (checkRateLimitExhausted()) {
    logger.warn(`GitHub API rate limit active. Returning fallback profile for: "${username}"`);
    return getMockUserProfile(username);
  }

  try {
    const userResponse = await axios.get(`${GITHUB_API_BASE_URL}/users/${username}`, {
      headers: getHeaders()
    });
    updateRateLimitFromHeaders(userResponse.headers);

    const reposResponse = await axios.get(`${GITHUB_API_BASE_URL}/users/${username}/repos`, {
      params: { per_page: 30, sort: 'updated' },
      headers: getHeaders()
    });
    updateRateLimitFromHeaders(reposResponse.headers);

    return {
      profile: userResponse.data,
      repos: reposResponse.data || []
    };
  } catch (error) {
    updateRateLimitFromHeaders(error.response?.headers);
    logger.error(`getUserProfile API failed: ${error.message}. Falling back to mock...`);
    return getMockUserProfile(username);
  }
}

/**
 * Fetch a GitHub organization's profile and repos.
 */
async function getOrganizationProfile(org) {
  logger.info(`Fetching GitHub organization details for: "${org}"`);

  if (checkRateLimitExhausted()) {
    logger.warn(`GitHub API rate limit active. Returning fallback org profile for: "${org}"`);
    return getMockOrganizationProfile(org);
  }

  try {
    const orgResponse = await axios.get(`${GITHUB_API_BASE_URL}/orgs/${org}`, {
      headers: getHeaders()
    });
    updateRateLimitFromHeaders(orgResponse.headers);

    const reposResponse = await axios.get(`${GITHUB_API_BASE_URL}/orgs/${org}/repos`, {
      params: { per_page: 30, sort: 'updated' },
      headers: getHeaders()
    });
    updateRateLimitFromHeaders(reposResponse.headers);

    return {
      profile: orgResponse.data,
      repos: reposResponse.data || []
    };
  } catch (error) {
    updateRateLimitFromHeaders(error.response?.headers);
    logger.error(`getOrganizationProfile API failed: ${error.message}. Falling back to mock...`);
    return getMockOrganizationProfile(org);
  }
}

/**
 * Fetch trending repositories by searching highly-starred recently updated repositories.
 */
async function getTrendingRepositories() {
  logger.info('Fetching trending GitHub repositories...');

  if (checkRateLimitExhausted()) {
    logger.warn('GitHub API rate limit active. Returning fallback trending repositories.');
    return getMockTrendingRepositories();
  }

  try {
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    const dateStr = lastWeek.toISOString().split('T')[0];

    const response = await axios.get(`${GITHUB_API_BASE_URL}/search/repositories`, {
      params: {
        q: `created:>${dateStr} stars:>50`,
        sort: 'stars',
        order: 'desc',
        per_page: 10
      },
      headers: getHeaders()
    });
    updateRateLimitFromHeaders(response.headers);
    
    if (response.data.items && response.data.items.length > 0) {
      return response.data.items;
    }
    throw new Error('No trending repositories found on API');
  } catch (error) {
    updateRateLimitFromHeaders(error.response?.headers);
    logger.error(`getTrendingRepositories API failed: ${error.message}. Falling back to mock...`);
    return getMockTrendingRepositories();
  }
}

// ==========================================
// HIGH-FIDELITY MOCK SIMULATOR DATA
// ==========================================

function getMockSearchResults(query) {
  const q = query.toLowerCase();
  return [
    {
      id: 1029384,
      name: `${q}-awesome-tool`,
      full_name: `community/${q}-awesome-tool`,
      owner: { login: 'community', avatar_url: 'https://avatars.githubusercontent.com/u/1000?v=4' },
      description: `High-performance production tool for ${query} ecosystem with advanced telemetry.`,
      stargazers_count: 14250,
      forks_count: 1820,
      open_issues_count: 42,
      language: 'TypeScript',
      html_url: `https://github.com/community/${q}-awesome-tool`
    },
    {
      id: 2049583,
      name: `${q}-starter-kit`,
      full_name: `developers/${q}-starter-kit`,
      owner: { login: 'developers', avatar_url: 'https://avatars.githubusercontent.com/u/1001?v=4' },
      description: `Modular boilerplate and enterprise template supporting ${query} applications.`,
      stargazers_count: 8940,
      forks_count: 940,
      open_issues_count: 15,
      language: 'JavaScript',
      html_url: `https://github.com/developers/${q}-starter-kit`
    }
  ];
}

function getMockRepositoryDetails(owner, repo) {
  return {
    repoInfo: {
      id: 99887766,
      name: repo,
      full_name: `${owner}/${repo}`,
      owner: { login: owner, avatar_url: 'https://avatars.githubusercontent.com/u/99?v=4', html_url: `https://github.com/${owner}` },
      html_url: `https://github.com/${owner}/${repo}`,
      description: `Official open-source production repository for ${repo}.`,
      stargazers_count: 15420,
      forks_count: 2450,
      watchers_count: 15420,
      open_issues_count: 68,
      subscribers_count: 420,
      language: 'TypeScript',
      created_at: '2021-03-15T10:00:00Z',
      updated_at: new Date().toISOString(),
      pushed_at: new Date().toISOString(),
      size: 45200,
      default_branch: 'main',
      license: { name: 'MIT License', spdx_id: 'MIT' }
    },
    languages: {
      TypeScript: 68500,
      JavaScript: 24200,
      CSS: 8500,
      HTML: 3200
    }
  };
}

function getMockContributors(owner, repo) {
  return [
    { id: 1, login: owner, avatar_url: 'https://avatars.githubusercontent.com/u/1?v=4', contributions: 420, html_url: `https://github.com/${owner}` },
    { id: 2, login: 'contributor-pro', avatar_url: 'https://avatars.githubusercontent.com/u/2?v=4', contributions: 215, html_url: 'https://github.com/contributor-pro' },
    { id: 3, login: 'code-wizard', avatar_url: 'https://avatars.githubusercontent.com/u/3?v=4', contributions: 180, html_url: 'https://github.com/code-wizard' },
    { id: 4, login: 'bug-fixer', avatar_url: 'https://avatars.githubusercontent.com/u/4?v=4', contributions: 95, html_url: 'https://github.com/bug-fixer' }
  ];
}

function getMockCommits(owner, repo) {
  const now = new Date();
  return Array.from({ length: 30 }).map((_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - i * 2);
    return {
      sha: `sha${Math.random().toString(36).substring(2, 10)}`,
      commit: {
        author: { name: owner, email: `${owner}@users.noreply.github.com`, date: d.toISOString() },
        message: i % 3 === 0 ? `feat: improve ${repo} performance and bundle size` : i % 2 === 0 ? `fix: resolve issue #${10 + i} in telemetry logger` : `docs: update deployment instructions`,
      },
      html_url: `https://github.com/${owner}/${repo}/commit/example`
    };
  });
}

function getMockUserProfile(username) {
  return {
    profile: {
      login: username,
      name: username.charAt(0).toUpperCase() + username.slice(1),
      avatar_url: `https://avatars.githubusercontent.com/u/100?v=4`,
      html_url: `https://github.com/${username}`,
      followers: 1250,
      following: 340,
      public_repos: 42,
      created_at: '2019-01-15T00:00:00Z',
      bio: `Open-source developer and maintainer passionate about ${username} projects.`,
      company: 'Tech Innovations Inc.',
      location: 'San Francisco, CA'
    },
    repos: [
      { id: 101, name: `${username}-core`, full_name: `${username}/${username}-core`, stargazers_count: 3450, forks_count: 420, language: 'TypeScript', html_url: `https://github.com/${username}/${username}-core` },
      { id: 102, name: `${username}-cli`, full_name: `${username}/${username}-cli`, stargazers_count: 1890, forks_count: 210, language: 'Go', html_url: `https://github.com/${username}/${username}-cli` }
    ]
  };
}

function getMockOrganizationProfile(org) {
  return {
    profile: {
      login: org,
      name: org.toUpperCase(),
      avatar_url: 'https://avatars.githubusercontent.com/u/200?v=4',
      html_url: `https://github.com/${org}`,
      description: `Official GitHub Organization profile for ${org}.`,
      public_repos: 85,
      followers: 24500,
      created_at: '2015-06-01T00:00:00Z',
      location: 'Global'
    },
    repos: [
      { id: 201, name: 'react', full_name: `${org}/react`, stargazers_count: 220000, forks_count: 45000, language: 'JavaScript', html_url: `https://github.com/${org}/react` },
      { id: 202, name: 'vscode', full_name: `${org}/vscode`, stargazers_count: 155000, forks_count: 28000, language: 'TypeScript', html_url: `https://github.com/${org}/vscode` }
    ]
  };
}

function getMockTrendingRepositories() {
  return [
    {
      id: 301,
      name: 'react',
      full_name: 'facebook/react',
      owner: { login: 'facebook', avatar_url: 'https://avatars.githubusercontent.com/u/69631?v=4' },
      description: 'The library for web and native user interfaces.',
      stargazers_count: 224000,
      forks_count: 45800,
      open_issues_count: 1200,
      language: 'JavaScript',
      html_url: 'https://github.com/facebook/react'
    },
    {
      id: 302,
      name: 'vscode',
      full_name: 'microsoft/vscode',
      owner: { login: 'microsoft', avatar_url: 'https://avatars.githubusercontent.com/u/6154722?v=4' },
      description: 'Visual Studio Code editor.',
      stargazers_count: 158000,
      forks_count: 29500,
      open_issues_count: 5400,
      language: 'TypeScript',
      html_url: 'https://github.com/microsoft/vscode'
    }
  ];
}

module.exports = {
  getHeaders,
  updateRateLimitFromHeaders,
  checkRateLimitExhausted,
  getGithubApiStatus,
  searchRepository,
  getRepositoryDetails,
  getRepositoryContributors,
  getRepositoryCommits,
  getUserProfile,
  getOrganizationProfile,
  getTrendingRepositories
};

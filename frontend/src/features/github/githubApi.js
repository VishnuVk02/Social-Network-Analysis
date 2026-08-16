import API from '../../services/api';

export const getRepositoryDetails = async (owner, repo, refresh) => {
  const response = await API.get(`/github/repository/${owner}/${repo}`, {
    params: { refresh: refresh ? 'true' : 'false' }
  });
  return response.data.data;
};

export const getUserProfile = async (username) => {
  const response = await API.get(`/github/user/${username}`);
  return response.data.data;
};

export const getOrganizationProfile = async (org) => {
  const response = await API.get(`/github/organization/${org}`);
  return response.data.data;
};

export const getRepositoryContributors = async (owner, repo) => {
  const response = await API.get(`/github/contributors/${owner}/${repo}`);
  return response.data.data;
};

export const getRepositoryCommits = async (owner, repo) => {
  const response = await API.get(`/github/commits/${owner}/${repo}`);
  return response.data.data;
};

export const getTrendingRepositories = async (sortBy) => {
  const response = await API.get('/github/trending', {
    params: { sortBy }
  });
  return response.data.data;
};

export const getGithubNews = async () => {
  const response = await API.get('/github/news');
  return response.data.data;
};

export const getGithubLanguages = async () => {
  const response = await API.get('/github/languages');
  return response.data.data;
};

export const getTopDevelopers = async () => {
  const response = await API.get('/github/top-developers');
  return response.data.data;
};

export const getGithubInsights = async () => {
  const response = await API.get('/github/insights');
  return response.data.data;
};

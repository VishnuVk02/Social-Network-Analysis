import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as githubApi from './githubApi';

const initialState = {
  repository: null,
  user: null,
  organization: null,
  trending: {
    repositories: [],
    trendingTechnologies: []
  },
  news: [],
  languages: [],
  topDevelopers: [],
  insights: null,
  isLoading: false,
  error: null
};

// Async Thunks
export const fetchRepositoryDetails = createAsyncThunk(
  'github/fetchRepositoryDetails',
  async ({ owner, repo, refresh }, { rejectWithValue }) => {
    try {
      const response = await githubApi.getRepositoryDetails(owner, repo, refresh);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch repository details.');
    }
  }
);

export const fetchUserProfile = createAsyncThunk(
  'github/fetchUserProfile',
  async (username, { rejectWithValue }) => {
    try {
      const response = await githubApi.getUserProfile(username);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user profile.');
    }
  }
);

export const fetchOrganizationProfile = createAsyncThunk(
  'github/fetchOrganizationProfile',
  async (org, { rejectWithValue }) => {
    try {
      const response = await githubApi.getOrganizationProfile(org);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch organization profile.');
    }
  }
);

export const fetchTrendingRepositories = createAsyncThunk(
  'github/fetchTrendingRepositories',
  async (sortBy, { rejectWithValue }) => {
    try {
      const response = await githubApi.getTrendingRepositories(sortBy);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch trending repositories.');
    }
  }
);

export const fetchGithubNews = createAsyncThunk(
  'github/fetchGithubNews',
  async (_, { rejectWithValue }) => {
    try {
      const response = await githubApi.getGithubNews();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch GitHub news feed.');
    }
  }
);

export const fetchGithubLanguages = createAsyncThunk(
  'github/fetchGithubLanguages',
  async (_, { rejectWithValue }) => {
    try {
      const response = await githubApi.getGithubLanguages();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch language trends.');
    }
  }
);

export const fetchTopDevelopers = createAsyncThunk(
  'github/fetchTopDevelopers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await githubApi.getTopDevelopers();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch top developers.');
    }
  }
);

export const fetchGithubInsights = createAsyncThunk(
  'github/fetchGithubInsights',
  async (_, { rejectWithValue }) => {
    try {
      const response = await githubApi.getGithubInsights();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch dashboard insights.');
    }
  }
);

const githubSlice = createSlice({
  name: 'github',
  initialState,
  reducers: {
    clearGithubError: (state) => {
      state.error = null;
    },
    resetGithubState: (state) => {
      return initialState;
    }
  },
  extraReducers: (builder) => {
    builder
      // Repository Details
      .addCase(fetchRepositoryDetails.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRepositoryDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.repository = action.payload;
      })
      .addCase(fetchRepositoryDetails.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // User Profile
      .addCase(fetchUserProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Organization Profile
      .addCase(fetchOrganizationProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchOrganizationProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.organization = action.payload;
      })
      .addCase(fetchOrganizationProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Trending Repositories
      .addCase(fetchTrendingRepositories.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTrendingRepositories.fulfilled, (state, action) => {
        state.isLoading = false;
        state.trending = action.payload;
      })
      .addCase(fetchTrendingRepositories.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // News Feed
      .addCase(fetchGithubNews.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchGithubNews.fulfilled, (state, action) => {
        state.isLoading = false;
        state.news = action.payload;
      })
      .addCase(fetchGithubNews.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Languages
      .addCase(fetchGithubLanguages.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchGithubLanguages.fulfilled, (state, action) => {
        state.isLoading = false;
        state.languages = action.payload;
      })
      .addCase(fetchGithubLanguages.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Top Developers
      .addCase(fetchTopDevelopers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTopDevelopers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.topDevelopers = action.payload;
      })
      .addCase(fetchTopDevelopers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Insights
      .addCase(fetchGithubInsights.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchGithubInsights.fulfilled, (state, action) => {
        state.isLoading = false;
        state.insights = action.payload;
      })
      .addCase(fetchGithubInsights.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  }
});

export const { clearGithubError, resetGithubState } = githubSlice.actions;
export default githubSlice.reducer;

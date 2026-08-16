import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../services/api';

const initialState = {
  channel: null,
  video: {
    topViewed: [],
    topLiked: [],
    latest: [],
    averages: { averageViews: 0, averageLikes: 0, averageComments: 0 },
    distributions: []
  },
  analytics: {
    averageViews: 0,
    averageLikes: 0,
    averageComments: 0,
    engagementRate: 0,
    postingFrequency: 0,
    uploadTrends: [],
    engagementTrends: [],
    performanceTrends: []
  },
  sentiment: {
    overallCounts: { POSITIVE: 0, NEUTRAL: 0, NEGATIVE: 0 },
    positivePercent: 0,
    negativePercent: 0,
    neutralPercent: 0,
    pieData: []
  },
  trending: {
    keywords: [],
    wordCloud: [],
    topicRanking: []
  },
  isLoading: false,
  error: null
};

// Async Thunks mapping REST endpoints
export const fetchChannelOverview = createAsyncThunk(
  'youtube/fetchChannelOverview',
  async ({ channelName, refresh }, { rejectWithValue }) => {
    try {
      const response = await API.get(`/youtube/channel/${channelName}`, {
        params: { refresh: refresh ? 'true' : 'false' }
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch YouTube channel details.');
    }
  }
);

export const fetchVideoAnalytics = createAsyncThunk(
  'youtube/fetchVideoAnalytics',
  async (channelId, { rejectWithValue }) => {
    try {
      const response = await API.get(`/youtube/videos/${channelId}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch video analytics.');
    }
  }
);

export const fetchChannelGrowth = createAsyncThunk(
  'youtube/fetchChannelGrowth',
  async (channelId, { rejectWithValue }) => {
    try {
      const response = await API.get(`/analytics/channel/${channelId}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch growth analytics.');
    }
  }
);

export const fetchChannelSentiment = createAsyncThunk(
  'youtube/fetchChannelSentiment',
  async (channelId, { rejectWithValue }) => {
    try {
      const response = await API.get(`/sentiment/channel/${channelId}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch sentiment analytics.');
    }
  }
);

export const fetchChannelTrending = createAsyncThunk(
  'youtube/fetchChannelTrending',
  async (channelId, { rejectWithValue }) => {
    try {
      const response = await API.get(`/trending/channel/${channelId}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch trending keywords.');
    }
  }
);

const youtubeSlice = createSlice({
  name: 'youtube',
  initialState,
  reducers: {
    clearYoutubeError: (state) => {
      state.error = null;
    },
    resetYoutubeState: (state) => {
      return initialState;
    }
  },
  extraReducers: (builder) => {
    builder
      // 1. Channel Overview
      .addCase(fetchChannelOverview.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchChannelOverview.fulfilled, (state, action) => {
        state.isLoading = false;
        state.channel = action.payload;
      })
      .addCase(fetchChannelOverview.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // 2. Video Analytics
      .addCase(fetchVideoAnalytics.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchVideoAnalytics.fulfilled, (state, action) => {
        state.isLoading = false;
        state.video = action.payload;
      })
      .addCase(fetchVideoAnalytics.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // 3. Growth Analytics
      .addCase(fetchChannelGrowth.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchChannelGrowth.fulfilled, (state, action) => {
        state.isLoading = false;
        state.analytics = action.payload;
      })
      .addCase(fetchChannelGrowth.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // 4. Sentiment Analytics
      .addCase(fetchChannelSentiment.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchChannelSentiment.fulfilled, (state, action) => {
        state.isLoading = false;
        state.sentiment = action.payload;
      })
      .addCase(fetchChannelSentiment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // 5. Trending Topics
      .addCase(fetchChannelTrending.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchChannelTrending.fulfilled, (state, action) => {
        state.isLoading = false;
        state.trending = action.payload;
      })
      .addCase(fetchChannelTrending.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  }
});

export const { clearYoutubeError, resetYoutubeState } = youtubeSlice.actions;
export default youtubeSlice.reducer;

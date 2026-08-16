import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../services/api';

const initialState = {
  posts: [],
  platforms: [],
  selectedPlatform: 'all', // 'all', or specific platformId
  metrics: {
    averageEngagementRate: 0,
    totalLikes: 0,
    totalComments: 0,
    totalShares: 0,
    engagementOverTime: []
  },
  isLoading: false,
  error: null
};

// Async Thunks
export const fetchPlatforms = createAsyncThunk(
  'dashboard/fetchPlatforms',
  async (_, { rejectWithValue }) => {
    try {
      const response = await API.get('/analytics/platforms');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to load platforms.');
    }
  }
);

export const fetchPosts = createAsyncThunk(
  'dashboard/fetchPosts',
  async (filters, { rejectWithValue }) => {
    try {
      const params = {};
      if (filters?.platformId && filters.platformId !== 'all') {
        params.platformId = filters.platformId;
      }
      const response = await API.get('/posts', { params });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to load posts.');
    }
  }
);

export const fetchEngagementMetrics = createAsyncThunk(
  'dashboard/fetchEngagementMetrics',
  async (platformId, { rejectWithValue }) => {
    try {
      const params = {};
      if (platformId && platformId !== 'all') {
        params.platformId = platformId;
      }
      const response = await API.get('/analytics/engagement', { params });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to load engagement metrics.');
    }
  }
);

export const createPost = createAsyncThunk(
  'dashboard/createPost',
  async (postData, { rejectWithValue, dispatch }) => {
    try {
      const response = await API.post('/posts', postData);
      // Reload posts and metrics after successful creation
      dispatch(fetchPosts({ platformId: 'all' }));
      dispatch(fetchEngagementMetrics('all'));
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create post.');
    }
  }
);

export const deletePost = createAsyncThunk(
  'dashboard/deletePost',
  async (postId, { rejectWithValue, dispatch }) => {
    try {
      await API.delete(`/posts/${postId}`);
      dispatch(fetchPosts({ platformId: 'all' }));
      dispatch(fetchEngagementMetrics('all'));
      return postId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete post.');
    }
  }
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    selectPlatform: (state, action) => {
      state.selectedPlatform = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Platforms
      .addCase(fetchPlatforms.fulfilled, (state, action) => {
        state.platforms = action.payload;
      })
      // Fetch Posts
      .addCase(fetchPosts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.posts = action.payload;
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch Engagement Metrics
      .addCase(fetchEngagementMetrics.fulfilled, (state, action) => {
        state.metrics = action.payload;
      });
  }
});

export const { selectPlatform } = dashboardSlice.actions;
export default dashboardSlice.reducer;

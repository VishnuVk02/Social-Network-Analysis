import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const api = axios.create({
  baseURL: '/api/admin/analytics'
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Thunks for Admin Application Analytics endpoints
export const fetchAdminOverview = createAsyncThunk(
  'admin/fetchAdminOverview',
  async ({ timeRange = '7d', feature = 'All' }, { rejectWithValue }) => {
    try {
      const res = await api.get('/overview', { params: { timeRange, feature } });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch admin overview');
    }
  }
);

export const fetchUsageOverTime = createAsyncThunk(
  'admin/fetchUsageOverTime',
  async ({ timeRange = '7d', feature = 'All' }, { rejectWithValue }) => {
    try {
      const res = await api.get('/usage', { params: { timeRange, feature } });
      return res.data.chartData || [];
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch usage chart');
    }
  }
);

export const fetchPlatformUsage = createAsyncThunk(
  'admin/fetchPlatformUsage',
  async ({ timeRange = '7d' }, { rejectWithValue }) => {
    try {
      const res = await api.get('/platforms', { params: { timeRange } });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch platform usage');
    }
  }
);

export const fetchMostUsedFeatures = createAsyncThunk(
  'admin/fetchMostUsedFeatures',
  async ({ timeRange = '7d' }, { rejectWithValue }) => {
    try {
      const res = await api.get('/features', { params: { timeRange } });
      return res.data.features || [];
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch features');
    }
  }
);

export const fetchUserActivity = createAsyncThunk(
  'admin/fetchUserActivity',
  async ({ timeRange = '7d' }, { rejectWithValue }) => {
    try {
      const res = await api.get('/users', { params: { timeRange } });
      return res.data.users || [];
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch user activity');
    }
  }
);

export const fetchRecentEvents = createAsyncThunk(
  'admin/fetchRecentEvents',
  async ({ limit = 20 } = {}, { rejectWithValue }) => {
    try {
      const res = await api.get('/events', { params: { limit } });
      return res.data.events || [];
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch recent events');
    }
  }
);

export const fetchUserDetail = createAsyncThunk(
  'admin/fetchUserDetail',
  async (userId, { rejectWithValue }) => {
    try {
      const res = await api.get(`/user/${userId}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch user detail');
    }
  }
);

const adminSlice = createSlice({
  name: 'admin',
  initialState: {
    overview: null,
    usageChart: [],
    platformUsage: { breakdown: [], totalEvents: 0 },
    mostUsedFeatures: [],
    userActivity: [],
    recentEvents: [],
    selectedUserDetail: null,
    filters: {
      timeRange: '7d',
      feature: 'All'
    },
    isLoading: false,
    isUserModalOpen: false,
    error: null
  },
  reducers: {
    setAdminFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    openUserModal: (state) => {
      state.isUserModalOpen = true;
    },
    closeUserModal: (state) => {
      state.isUserModalOpen = false;
      state.selectedUserDetail = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // fetchAdminOverview
      .addCase(fetchAdminOverview.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAdminOverview.fulfilled, (state, action) => {
        state.isLoading = false;
        state.overview = action.payload;
      })
      .addCase(fetchAdminOverview.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // fetchUsageOverTime
      .addCase(fetchUsageOverTime.fulfilled, (state, action) => {
        state.usageChart = action.payload;
      })
      // fetchPlatformUsage
      .addCase(fetchPlatformUsage.fulfilled, (state, action) => {
        state.platformUsage = action.payload;
      })
      // fetchMostUsedFeatures
      .addCase(fetchMostUsedFeatures.fulfilled, (state, action) => {
        state.mostUsedFeatures = action.payload;
      })
      // fetchUserActivity
      .addCase(fetchUserActivity.fulfilled, (state, action) => {
        state.userActivity = action.payload;
      })
      // fetchRecentEvents
      .addCase(fetchRecentEvents.fulfilled, (state, action) => {
        state.recentEvents = action.payload;
      })
      // fetchUserDetail
      .addCase(fetchUserDetail.pending, (state) => {
        state.isUserModalOpen = true;
      })
      .addCase(fetchUserDetail.fulfilled, (state, action) => {
        state.selectedUserDetail = action.payload;
      });
  }
});

export const { setAdminFilters, openUserModal, closeUserModal } = adminSlice.actions;
export default adminSlice.reducer;

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../services/api';

export const fetchTrendingIndex = createAsyncThunk(
  'trends/fetchTrendingIndex',
  async ({ category = 'Technology', source = 'Combined', timeRange = '7d' } = {}, { rejectWithValue }) => {
    try {
      const response = await API.get('/analytics/trends', {
        params: { category, source, timeRange }
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch cross-platform trends index.'
      );
    }
  }
);

export const fetchTopicDetail = createAsyncThunk(
  'trends/fetchTopicDetail',
  async (topicName, { rejectWithValue }) => {
    try {
      const response = await API.get(`/analytics/trends/topic/${encodeURIComponent(topicName)}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || `Failed to fetch trend details for ${topicName}.`
      );
    }
  }
);

const initialState = {
  trendsData: null,
  activeTopicDetail: null,
  isModalOpen: false,
  isLoading: false,
  isModalLoading: false,
  error: null,
  filters: {
    category: 'Technology',
    source: 'Combined',
    timeRange: '7d'
  }
};

const trendsSlice = createSlice({
  name: 'trends',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    closeTopicModal: (state) => {
      state.isModalOpen = false;
      state.activeTopicDetail = null;
    },
    clearTrendsError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // fetchTrendingIndex
      .addCase(fetchTrendingIndex.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTrendingIndex.fulfilled, (state, action) => {
        state.isLoading = false;
        state.trendsData = action.payload;
      })
      .addCase(fetchTrendingIndex.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // fetchTopicDetail
      .addCase(fetchTopicDetail.pending, (state) => {
        state.isModalLoading = true;
        state.isModalOpen = true;
      })
      .addCase(fetchTopicDetail.fulfilled, (state, action) => {
        state.isModalLoading = false;
        state.activeTopicDetail = action.payload;
      })
      .addCase(fetchTopicDetail.rejected, (state, action) => {
        state.isModalLoading = false;
        state.error = action.payload;
      });
  }
});

export const { setFilters, closeTopicModal, clearTrendsError } = trendsSlice.actions;
export default trendsSlice.reducer;

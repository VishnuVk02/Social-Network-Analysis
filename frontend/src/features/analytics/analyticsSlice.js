import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../services/api';

const initialState = {
  sentiment: {
    positive: 0,
    neutral: 0,
    negative: 0,
    overallCounts: { POSITIVE: 0, NEUTRAL: 0, NEGATIVE: 0 }
  },
  forecasts: [],
  growthHistory: [],
  isLoading: false,
  error: null
};

// Async Thunks
export const fetchSentimentDistribution = createAsyncThunk(
  'analytics/fetchSentiment',
  async (platformId, { rejectWithValue }) => {
    try {
      const params = {};
      if (platformId && platformId !== 'all') {
        params.platformId = platformId;
      }
      const response = await API.get('/analytics/sentiment', { params });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to load sentiment distribution.');
    }
  }
);

export const fetchGrowthAndForecast = createAsyncThunk(
  'analytics/fetchGrowthAndForecast',
  async (platformId, { rejectWithValue }) => {
    try {
      const params = {};
      if (platformId && platformId !== 'all') {
        params.platformId = platformId;
      }
      const response = await API.get('/analytics/forecast', { params });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to load growth and forecast metrics.');
    }
  }
);

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Sentiment
      .addCase(fetchSentimentDistribution.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSentimentDistribution.fulfilled, (state, action) => {
        state.isLoading = false;
        state.sentiment = action.payload;
      })
      .addCase(fetchSentimentDistribution.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch Growth and Forecast
      .addCase(fetchGrowthAndForecast.fulfilled, (state, action) => {
        state.forecasts = action.payload.forecasts;
        state.growthHistory = action.payload.growthHistory;
      });
  }
});

export default analyticsSlice.reducer;

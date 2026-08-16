import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../services/api';

// Fetch saved reports list
export const fetchSavedReports = createAsyncThunk(
  'reports/fetchSavedReports',
  async ({ category = 'ALL', search = '', visibility = '' } = {}, { rejectWithValue }) => {
    try {
      const response = await API.get('/reports', {
        params: { category, search, visibility }
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch saved reports.');
    }
  }
);

// Fetch single report details
export const fetchReportById = createAsyncThunk(
  'reports/fetchReportById',
  async (reportId, { rejectWithValue }) => {
    try {
      const response = await API.get(`/reports/${reportId}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch report details.');
    }
  }
);

// Generate new report snapshot
export const generateNewReport = createAsyncThunk(
  'reports/generateNewReport',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await API.post('/reports/generate', payload);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to generate report.');
    }
  }
);

// Delete report
export const deleteReportById = createAsyncThunk(
  'reports/deleteReportById',
  async (reportId, { rejectWithValue }) => {
    try {
      await API.delete(`/reports/${reportId}`);
      return reportId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete report.');
    }
  }
);

// Download Report PDF attachment
export const downloadReportPdf = createAsyncThunk(
  'reports/downloadReportPdf',
  async ({ reportId, title }, { rejectWithValue }) => {
    try {
      const response = await API.get(`/reports/${reportId}/pdf`, {
        responseType: 'blob'
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const cleanTitle = (title || 'telemetron-report').toLowerCase().replace(/[^a-z0-9]/g, '-');
      link.setAttribute('download', `${cleanTitle}-${reportId.substring(0, 8)}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return true;
    } catch (error) {
      if (error.response && error.response.data instanceof Blob) {
        try {
          const text = await error.response.data.text();
          const json = JSON.parse(text);
          return rejectWithValue(json.message || 'Failed to download report PDF.');
        } catch (e) {
          // fallback to message below
        }
      }
      return rejectWithValue(error.response?.data?.message || 'Failed to download report PDF.');
    }
  }
);

const initialState = {
  savedReports: [],
  activeReport: null,
  isLoadingList: false,
  isLoadingReport: false,
  isGenerating: false,
  isExportingPdf: false,
  error: null
};

const reportsSlice = createSlice({
  name: 'reports',
  initialState,
  reducers: {
    clearReportState: (state) => {
      state.activeReport = null;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // fetchSavedReports
      .addCase(fetchSavedReports.pending, (state) => {
        state.isLoadingList = true;
        state.error = null;
      })
      .addCase(fetchSavedReports.fulfilled, (state, action) => {
        state.isLoadingList = false;
        state.savedReports = action.payload;
      })
      .addCase(fetchSavedReports.rejected, (state, action) => {
        state.isLoadingList = false;
        state.error = action.payload;
      })
      // fetchReportById
      .addCase(fetchReportById.pending, (state) => {
        state.isLoadingReport = true;
        state.error = null;
      })
      .addCase(fetchReportById.fulfilled, (state, action) => {
        state.isLoadingReport = false;
        state.activeReport = action.payload;
      })
      .addCase(fetchReportById.rejected, (state, action) => {
        state.isLoadingReport = false;
        state.error = action.payload;
      })
      // generateNewReport
      .addCase(generateNewReport.pending, (state) => {
        state.isGenerating = true;
        state.error = null;
      })
      .addCase(generateNewReport.fulfilled, (state, action) => {
        state.isGenerating = false;
        state.savedReports.unshift(action.payload);
        state.activeReport = action.payload;
      })
      .addCase(generateNewReport.rejected, (state, action) => {
        state.isGenerating = false;
        state.error = action.payload;
      })
      // deleteReportById
      .addCase(deleteReportById.fulfilled, (state, action) => {
        state.savedReports = state.savedReports.filter(r => r.id !== action.payload);
        if (state.activeReport?.id === action.payload) {
          state.activeReport = null;
        }
      })
      // downloadReportPdf
      .addCase(downloadReportPdf.pending, (state) => {
        state.isExportingPdf = true;
      })
      .addCase(downloadReportPdf.fulfilled, (state) => {
        state.isExportingPdf = false;
      })
      .addCase(downloadReportPdf.rejected, (state) => {
        state.isExportingPdf = false;
      });
  }
});

export const { clearReportState } = reportsSlice.actions;
export default reportsSlice.reducer;

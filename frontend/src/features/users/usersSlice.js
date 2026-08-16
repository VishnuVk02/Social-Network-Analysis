import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../services/api';

const initialState = {
  list: [],
  isLoading: false,
  error: null
};

// Async Thunks
export const fetchUsers = createAsyncThunk(
  'users/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await API.get('/users');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch users list.');
    }
  }
);

export const addUser = createAsyncThunk(
  'users/add',
  async (userData, { rejectWithValue, dispatch }) => {
    try {
      const response = await API.post('/users', userData);
      dispatch(fetchUsers());
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create user.');
    }
  }
);

export const modifyUser = createAsyncThunk(
  'users/modify',
  async ({ id, data }, { rejectWithValue, dispatch }) => {
    try {
      const response = await API.put(`/users/${id}`, data);
      dispatch(fetchUsers());
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update user.');
    }
  }
);

export const removeUser = createAsyncThunk(
  'users/remove',
  async (id, { rejectWithValue, dispatch }) => {
    try {
      await API.delete(`/users/${id}`);
      dispatch(fetchUsers());
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete user.');
    }
  }
);

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.list = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  }
});

export default usersSlice.reducer;

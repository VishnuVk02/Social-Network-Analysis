import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../services/api';

const initialState = {
  messages: [],
  hasMore: false,
  nextCursor: null,
  isLoading: false,
  isLoadingOlder: false,
  isSending: false,
  error: null
};

// Fetch initial/latest message history
export const fetchGroupMessages = createAsyncThunk(
  'chat/fetchMessages',
  async ({ groupId, limit = 50 }, { rejectWithValue }) => {
    try {
      const response = await API.get(`/groups/${groupId}/messages`, {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch group messages.');
    }
  }
);

// Load older messages for pagination
export const loadOlderMessages = createAsyncThunk(
  'chat/loadOlderMessages',
  async ({ groupId, cursor, limit = 50 }, { rejectWithValue }) => {
    try {
      const response = await API.get(`/groups/${groupId}/messages`, {
        params: { cursor, limit }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to load older messages.');
    }
  }
);

// Send message via REST API (Supports TEXT and REPORT)
export const sendGroupMessage = createAsyncThunk(
  'chat/sendMessage',
  async ({ groupId, content, messageType = 'TEXT', reportData = null }, { rejectWithValue }) => {
    try {
      const response = await API.post(`/groups/${groupId}/messages`, { content, messageType, reportData });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to send message.');
    }
  }
);

// Delete message via REST API
export const deleteGroupMessage = createAsyncThunk(
  'chat/deleteMessage',
  async ({ groupId, messageId }, { rejectWithValue }) => {
    try {
      const response = await API.delete(`/groups/${groupId}/messages/${messageId}`);
      return { messageId, data: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete message.');
    }
  }
);

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    clearChatState: (state) => {
      state.messages = [];
      state.hasMore = false;
      state.nextCursor = null;
      state.isLoading = false;
      state.isSending = false;
      state.error = null;
    },
    appendRealtimeMessage: (state, action) => {
      const newMsg = action.payload;
      if (!newMsg || !newMsg.id) return;
      const exists = state.messages.some(m => m.id === newMsg.id);
      if (!exists) {
        state.messages.push(newMsg);
      }
    },
    markMessageDeleted: (state, action) => {
      const { messageId } = action.payload;
      const index = state.messages.findIndex(m => m.id === messageId);
      if (index !== -1) {
        state.messages[index].isDeleted = true;
        state.messages[index].content = 'This message was deleted';
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Messages
      .addCase(fetchGroupMessages.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchGroupMessages.fulfilled, (state, action) => {
        state.isLoading = false;
        state.messages = action.payload.data || [];
        state.hasMore = action.payload.hasMore || false;
        state.nextCursor = action.payload.nextCursor || null;
      })
      .addCase(fetchGroupMessages.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Load Older Messages
      .addCase(loadOlderMessages.pending, (state) => {
        state.isLoadingOlder = true;
      })
      .addCase(loadOlderMessages.fulfilled, (state, action) => {
        state.isLoadingOlder = false;
        const olderMsgs = action.payload.data || [];
        // Prepend older messages to the beginning
        const existingIds = new Set(state.messages.map(m => m.id));
        const filteredOlder = olderMsgs.filter(m => !existingIds.has(m.id));
        state.messages = [...filteredOlder, ...state.messages];
        state.hasMore = action.payload.hasMore || false;
        state.nextCursor = action.payload.nextCursor || null;
      })
      .addCase(loadOlderMessages.rejected, (state) => {
        state.isLoadingOlder = false;
      })
      // Send Message
      .addCase(sendGroupMessage.pending, (state) => {
        state.isSending = true;
        state.error = null;
      })
      .addCase(sendGroupMessage.fulfilled, (state, action) => {
        state.isSending = false;
        const msg = action.payload;
        if (msg && !state.messages.some(m => m.id === msg.id)) {
          state.messages.push(msg);
        }
      })
      .addCase(sendGroupMessage.rejected, (state, action) => {
        state.isSending = false;
        state.error = action.payload;
      })
      // Delete Message
      .addCase(deleteGroupMessage.fulfilled, (state, action) => {
        const { messageId } = action.payload;
        const index = state.messages.findIndex(m => m.id === messageId);
        if (index !== -1) {
          state.messages[index].isDeleted = true;
          state.messages[index].content = 'This message was deleted';
        }
      });
  }
});

export const { clearChatState, appendRealtimeMessage, markMessageDeleted } = chatSlice.actions;
export default chatSlice.reducer;

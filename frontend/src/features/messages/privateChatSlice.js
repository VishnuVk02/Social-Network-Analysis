import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../services/api';

const initialState = {
  conversations: [],
  activeConversation: null,
  messages: [],
  hasMore: false,
  nextCursor: null,
  isLoadingConversations: false,
  isLoadingMessages: false,
  isLoadingOlder: false,
  isSending: false,
  error: null
};

// Fetch user's private conversations
export const fetchConversations = createAsyncThunk(
  'privateChat/fetchConversations',
  async (_, { rejectWithValue }) => {
    try {
      const response = await API.get('/messages/conversations');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch conversations.');
    }
  }
);

// Get or Create canonical 1-to-1 conversation
export const startConversation = createAsyncThunk(
  'privateChat/startConversation',
  async ({ recipientId }, { rejectWithValue }) => {
    try {
      const response = await API.post('/messages/conversations', { recipientId });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to start conversation.');
    }
  }
);

// Fetch initial messages for active conversation
export const fetchPrivateMessages = createAsyncThunk(
  'privateChat/fetchMessages',
  async ({ conversationId, limit = 50 }, { rejectWithValue }) => {
    try {
      const response = await API.get(`/messages/conversations/${conversationId}/messages`, {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch private messages.');
    }
  }
);

// Load older messages for pagination
export const loadOlderPrivateMessages = createAsyncThunk(
  'privateChat/loadOlderMessages',
  async ({ conversationId, cursor, limit = 50 }, { rejectWithValue }) => {
    try {
      const response = await API.get(`/messages/conversations/${conversationId}/messages`, {
        params: { cursor, limit }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to load older messages.');
    }
  }
);

// Send private text or report message
export const sendPrivateMessage = createAsyncThunk(
  'privateChat/sendMessage',
  async ({ conversationId, content, messageType = 'TEXT', reportData = null }, { rejectWithValue }) => {
    try {
      const response = await API.post(`/messages/conversations/${conversationId}/messages`, { content, messageType, reportData });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to send private message.');
    }
  }
);

// Delete private message
export const deletePrivateMessage = createAsyncThunk(
  'privateChat/deleteMessage',
  async ({ conversationId, messageId }, { rejectWithValue }) => {
    try {
      const response = await API.delete(`/messages/conversations/${conversationId}/messages/${messageId}`);
      return { messageId, data: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete message.');
    }
  }
);

const privateChatSlice = createSlice({
  name: 'privateChat',
  initialState,
  reducers: {
    setActiveConversation: (state, action) => {
      state.activeConversation = action.payload;
      state.messages = [];
      state.hasMore = false;
      state.nextCursor = null;
      state.error = null;
    },
    clearPrivateChatState: (state) => {
      state.activeConversation = null;
      state.messages = [];
      state.hasMore = false;
      state.nextCursor = null;
      state.error = null;
    },
    appendRealtimePrivateMessage: (state, action) => {
      const newMsg = action.payload;
      if (!newMsg || !newMsg.id) return;

      // Ensure message belongs to currently open conversation
      if (state.activeConversation && newMsg.conversationId === state.activeConversation.id) {
        const exists = state.messages.some(m => m.id === newMsg.id);
        if (!exists) {
          state.messages.push(newMsg);
        }
      }

      // Update conversation list preview & timestamp
      const convIndex = state.conversations.findIndex(c => c.id === newMsg.conversationId);
      if (convIndex !== -1) {
        state.conversations[convIndex].lastMessage = {
          id: newMsg.id,
          senderId: newMsg.senderId,
          content: newMsg.isDeleted ? 'This message was deleted' : newMsg.content,
          isDeleted: newMsg.isDeleted,
          createdAt: newMsg.createdAt
        };
        state.conversations[convIndex].updatedAt = newMsg.createdAt;
        // Sort conversations list by latest timestamp
        state.conversations.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      }
    },
    markPrivateMessageDeleted: (state, action) => {
      const { messageId, conversationId } = action.payload;
      const index = state.messages.findIndex(m => m.id === messageId);
      if (index !== -1) {
        state.messages[index].isDeleted = true;
        state.messages[index].content = 'This message was deleted';
      }

      // Update conversation list preview if latest message was deleted
      const convIndex = state.conversations.findIndex(c => c.id === conversationId);
      if (convIndex !== -1 && state.conversations[convIndex].lastMessage?.id === messageId) {
        state.conversations[convIndex].lastMessage.isDeleted = true;
        state.conversations[convIndex].lastMessage.content = 'This message was deleted';
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Conversations
      .addCase(fetchConversations.pending, (state) => {
        state.isLoadingConversations = true;
        state.error = null;
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.isLoadingConversations = false;
        state.conversations = action.payload || [];
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.isLoadingConversations = false;
        state.error = action.payload;
      })
      // Start Conversation
      .addCase(startConversation.fulfilled, (state, action) => {
        const newConv = action.payload;
        if (newConv) {
          const index = state.conversations.findIndex(c => c.id === newConv.id);
          if (index !== -1) {
            state.conversations[index] = newConv;
          } else {
            state.conversations.unshift(newConv);
          }
          state.activeConversation = newConv;
        }
      })
      // Fetch Messages
      .addCase(fetchPrivateMessages.pending, (state) => {
        state.isLoadingMessages = true;
        state.error = null;
      })
      .addCase(fetchPrivateMessages.fulfilled, (state, action) => {
        state.isLoadingMessages = false;
        state.messages = action.payload.data || [];
        state.hasMore = action.payload.hasMore || false;
        state.nextCursor = action.payload.nextCursor || null;
      })
      .addCase(fetchPrivateMessages.rejected, (state, action) => {
        state.isLoadingMessages = false;
        state.error = action.payload;
      })
      // Load Older Messages
      .addCase(loadOlderPrivateMessages.pending, (state) => {
        state.isLoadingOlder = true;
      })
      .addCase(loadOlderPrivateMessages.fulfilled, (state, action) => {
        state.isLoadingOlder = false;
        const olderMsgs = action.payload.data || [];
        const existingIds = new Set(state.messages.map(m => m.id));
        const filteredOlder = olderMsgs.filter(m => !existingIds.has(m.id));
        state.messages = [...filteredOlder, ...state.messages];
        state.hasMore = action.payload.hasMore || false;
        state.nextCursor = action.payload.nextCursor || null;
      })
      .addCase(loadOlderPrivateMessages.rejected, (state) => {
        state.isLoadingOlder = false;
      })
      // Send Message
      .addCase(sendPrivateMessage.pending, (state) => {
        state.isSending = true;
        state.error = null;
      })
      .addCase(sendPrivateMessage.fulfilled, (state, action) => {
        state.isSending = false;
        const msg = action.payload;
        if (msg && !state.messages.some(m => m.id === msg.id)) {
          state.messages.push(msg);
        }
        // Update conversation preview
        if (state.activeConversation && msg) {
          state.activeConversation.lastMessage = {
            id: msg.id,
            senderId: msg.senderId,
            content: msg.content,
            isDeleted: false,
            createdAt: msg.createdAt
          };
          const convIndex = state.conversations.findIndex(c => c.id === state.activeConversation.id);
          if (convIndex !== -1) {
            state.conversations[convIndex].lastMessage = state.activeConversation.lastMessage;
            state.conversations[convIndex].updatedAt = msg.createdAt;
            state.conversations.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
          }
        }
      })
      .addCase(sendPrivateMessage.rejected, (state, action) => {
        state.isSending = false;
        state.error = action.payload;
      })
      // Delete Message
      .addCase(deletePrivateMessage.fulfilled, (state, action) => {
        const { messageId } = action.payload;
        const index = state.messages.findIndex(m => m.id === messageId);
        if (index !== -1) {
          state.messages[index].isDeleted = true;
          state.messages[index].content = 'This message was deleted';
        }
      });
  }
});

export const {
  setActiveConversation,
  clearPrivateChatState,
  appendRealtimePrivateMessage,
  markPrivateMessageDeleted
} = privateChatSlice.actions;

export default privateChatSlice.reducer;

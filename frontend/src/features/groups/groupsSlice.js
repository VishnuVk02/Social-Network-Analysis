import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../services/api';

const initialState = {
  list: [],
  overviewMetrics: {
    totalGroups: 0,
    totalMembers: 0,
    activeMembers: 0,
    totalGroupUsage: '0m'
  },
  currentGroup: null,
  groupMembers: [],
  groupAnalytics: null,
  orgEmployees: [],
  isLoading: false,
  error: null,
  actionSuccess: false,
  successMessage: ''
};

// Async Thunks
export const fetchGroups = createAsyncThunk(
  'groups/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await API.get('/groups');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch groups.');
    }
  }
);

export const fetchGroupById = createAsyncThunk(
  'groups/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await API.get(`/groups/${id}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get group details.');
    }
  }
);

export const createGroup = createAsyncThunk(
  'groups/create',
  async (groupData, { rejectWithValue, dispatch }) => {
    try {
      const response = await API.post('/groups', groupData);
      dispatch(fetchGroups());
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create group.');
    }
  }
);

export const updateGroup = createAsyncThunk(
  'groups/update',
  async ({ id, groupData }, { rejectWithValue, dispatch }) => {
    try {
      const response = await API.patch(`/groups/${id}`, groupData);
      dispatch(fetchGroupById(id));
      dispatch(fetchGroups());
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update group.');
    }
  }
);

export const deleteGroup = createAsyncThunk(
  'groups/delete',
  async (id, { rejectWithValue, dispatch }) => {
    try {
      const response = await API.delete(`/groups/${id}`);
      dispatch(fetchGroups());
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete group.');
    }
  }
);

export const fetchGroupMembers = createAsyncThunk(
  'groups/fetchMembers',
  async (groupId, { rejectWithValue }) => {
    try {
      const response = await API.get(`/groups/${groupId}/members`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch group members.');
    }
  }
);

export const addGroupMember = createAsyncThunk(
  'groups/addMember',
  async ({ groupId, userId }, { rejectWithValue, dispatch }) => {
    try {
      const response = await API.post(`/groups/${groupId}/members`, { userId });
      dispatch(fetchGroupMembers(groupId));
      dispatch(fetchGroupById(groupId));
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add member to group.');
    }
  }
);

export const removeGroupMember = createAsyncThunk(
  'groups/removeMember',
  async ({ groupId, userId }, { rejectWithValue, dispatch }) => {
    try {
      const response = await API.delete(`/groups/${groupId}/members/${userId}`);
      dispatch(fetchGroupMembers(groupId));
      dispatch(fetchGroupById(groupId));
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to remove member.');
    }
  }
);

export const fetchGroupAnalytics = createAsyncThunk(
  'groups/fetchAnalytics',
  async (groupId, { rejectWithValue }) => {
    try {
      const response = await API.get(`/groups/${groupId}/analytics`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch group analytics.');
    }
  }
);

export const fetchOrgEmployees = createAsyncThunk(
  'groups/fetchOrgEmployees',
  async (_, { rejectWithValue }) => {
    try {
      const response = await API.get('/organization/employees');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch organization employees.');
    }
  }
);

export const joinGroup = createAsyncThunk(
  'groups/join',
  async (groupId, { rejectWithValue, dispatch }) => {
    try {
      const response = await API.post('/groups/join', { groupId });
      dispatch(fetchGroups());
      dispatch(fetchGroupById(groupId));
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to join group.');
    }
  }
);

export const leaveGroup = createAsyncThunk(
  'groups/leave',
  async (groupId, { rejectWithValue, dispatch }) => {
    try {
      const response = await API.post('/groups/leave', { groupId });
      dispatch(fetchGroups());
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to leave group.');
    }
  }
);

const groupsSlice = createSlice({
  name: 'groups',
  initialState,
  reducers: {
    clearGroupError: (state) => {
      state.error = null;
    },
    clearActionSuccess: (state) => {
      state.actionSuccess = false;
      state.successMessage = '';
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch All Groups
      .addCase(fetchGroups.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchGroups.fulfilled, (state, action) => {
        state.isLoading = false;
        state.list = action.payload.data || [];
        state.overviewMetrics = action.payload.overviewMetrics || initialState.overviewMetrics;
      })
      .addCase(fetchGroups.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch Group By ID
      .addCase(fetchGroupById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchGroupById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentGroup = action.payload;
      })
      .addCase(fetchGroupById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Create Group
      .addCase(createGroup.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.actionSuccess = false;
      })
      .addCase(createGroup.fulfilled, (state, action) => {
        state.isLoading = false;
        state.actionSuccess = true;
        state.successMessage = action.payload.message || 'Group created successfully.';
      })
      .addCase(createGroup.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Update Group
      .addCase(updateGroup.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.actionSuccess = false;
      })
      .addCase(updateGroup.fulfilled, (state, action) => {
        state.isLoading = false;
        state.actionSuccess = true;
        state.successMessage = action.payload.message || 'Group updated successfully.';
      })
      .addCase(updateGroup.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Delete Group
      .addCase(deleteGroup.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.actionSuccess = false;
      })
      .addCase(deleteGroup.fulfilled, (state, action) => {
        state.isLoading = false;
        state.actionSuccess = true;
        state.currentGroup = null;
        state.successMessage = action.payload.message || 'Group deleted successfully.';
      })
      .addCase(deleteGroup.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch Members
      .addCase(fetchGroupMembers.pending, (state) => {
        state.error = null;
      })
      .addCase(fetchGroupMembers.fulfilled, (state, action) => {
        state.groupMembers = action.payload || [];
      })
      .addCase(fetchGroupMembers.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Add Member
      .addCase(addGroupMember.fulfilled, (state, action) => {
        state.actionSuccess = true;
        state.successMessage = action.payload.message || 'Member added successfully.';
      })
      .addCase(addGroupMember.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Remove Member
      .addCase(removeGroupMember.fulfilled, (state, action) => {
        state.actionSuccess = true;
        state.successMessage = action.payload.message || 'Member removed successfully.';
      })
      .addCase(removeGroupMember.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Fetch Analytics
      .addCase(fetchGroupAnalytics.pending, (state) => {
        state.error = null;
      })
      .addCase(fetchGroupAnalytics.fulfilled, (state, action) => {
        state.groupAnalytics = action.payload;
      })
      .addCase(fetchGroupAnalytics.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Fetch Org Employees
      .addCase(fetchOrgEmployees.fulfilled, (state, action) => {
        state.orgEmployees = action.payload || [];
      })
      // Join / Leave
      .addCase(joinGroup.fulfilled, (state, action) => {
        state.actionSuccess = true;
        state.successMessage = action.payload.message || 'Joined group successfully.';
      })
      .addCase(joinGroup.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(leaveGroup.fulfilled, (state, action) => {
        state.actionSuccess = true;
        state.currentGroup = null;
        state.successMessage = action.payload.message || 'Left group successfully.';
      })
      .addCase(leaveGroup.rejected, (state, action) => {
        state.error = action.payload;
      });
  }
});

export const { clearGroupError, clearActionSuccess } = groupsSlice.actions;
export default groupsSlice.reducer;

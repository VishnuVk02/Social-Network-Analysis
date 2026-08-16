import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import usersReducer from '../features/users/usersSlice';
import groupsReducer from '../features/groups/groupsSlice';
import chatReducer from '../features/groups/chatSlice';
import privateChatReducer from '../features/messages/privateChatSlice';
import trendsReducer from '../features/trends/trendsSlice';
import youtubeReducer from '../features/youtube/youtubeSlice';
import githubReducer from '../features/github/githubSlice';
import adminReducer from '../features/admin/adminSlice';
import reportsReducer from '../features/reports/reportsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    users: usersReducer,
    groups: groupsReducer,
    chat: chatReducer,
    privateChat: privateChatReducer,
    trends: trendsReducer,
    youtube: youtubeReducer,
    github: githubReducer,
    admin: adminReducer,
    reports: reportsReducer
  }
});

export default store;

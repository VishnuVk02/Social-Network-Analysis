import React, { useEffect } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { initTelemetryHeartbeat, stopTelemetryHeartbeat } from './utils/telemetry';

// Common Components
import Sidebar from './components/common/Sidebar';
import Navbar from './components/common/Navbar';
import SparkleCursor from './components/common/SparkleCursor';

// Page Views
import Login from './features/auth/Login';
import Register from './features/auth/Register';
import Dashboard from './features/dashboard/Dashboard';
import Trends from './features/trends/Trends';
import Settings from './features/settings/Settings';
import GroupManagement from './features/groups/GroupManagement';
import GroupDetailPage from './features/groups/GroupDetailPage';
import MessagesPage from './features/messages/MessagesPage';
import EmployeeManagement from './features/organization/EmployeeManagement';
import AdminAnalyticsPage from './features/admin/AdminAnalyticsPage';
import ReportsPage from './features/reports/ReportsPage';
import ReportViewerPage from './features/reports/ReportViewerPage';

// YouTube Pages
import YoutubeHome from './features/youtube/HomePage';
import YoutubeSearch from './features/youtube/SearchPage';
import YoutubeChannelDashboard from './features/youtube/ChannelDashboard';
import YoutubeSettings from './features/youtube/SettingsPage';

// GitHub Pages
import GithubDashboard from './features/github/GithubDashboard';
import GithubSearch from './features/github/SearchPage';
import GithubRepoDashboard from './features/github/RepoDashboard';
import GithubUserDashboard from './features/github/UserDashboard';
import GithubOrgDashboard from './features/github/OrgDashboard';
import GithubTrendingPage from './features/github/TrendingPage';

// Protected Route Guard for general users
function ProtectedRoute({ isAuthenticated }) {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}

// Organization-only Protected Route Guard
function OrganizationRoute({ isAuthenticated, user }) {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (user?.accountType !== 'ORGANIZATION') {
    return (
      <div className="p-8 max-w-lg mx-auto mt-20 rounded-2xl bg-slate-900 border border-amber-500/30 text-center space-y-4 shadow-2xl">
        <div className="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 font-black text-2xl flex items-center justify-center mx-auto">
          403
        </div>
        <h2 className="text-xl font-bold text-white">Groups Not Available</h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          Workspace groups are available exclusively for <strong className="text-emerald-400">Organization accounts</strong>. Your account type is <strong className="text-brand-400">INDIVIDUAL</strong>.
        </p>
      </div>
    );
  }
  return <Outlet />;
}

// Organization Admin-only Guard
function OrgAdminRoute({ isAuthenticated, user }) {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (user?.accountType !== 'ORGANIZATION' || user?.role !== 'ADMIN') {
    return (
      <div className="p-8 max-w-lg mx-auto mt-20 rounded-2xl bg-slate-900 border border-rose-500/30 text-center space-y-4 shadow-2xl">
        <div className="w-14 h-14 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 font-black text-2xl flex items-center justify-center mx-auto">
          403
        </div>
        <h2 className="text-xl font-bold text-white">Access Restricted</h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          Employee Management is restricted to Organization Administrators.
        </p>
      </div>
    );
  }
  return <Outlet />;
}

// Admin-only Protected Route Guard
function AdminRoute({ isAuthenticated, user }) {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (user?.role !== 'ADMIN') {
    return (
      <div className="p-8 max-w-lg mx-auto mt-20 rounded-2xl bg-slate-900 border border-rose-500/30 text-center space-y-4 shadow-2xl">
        <div className="w-14 h-14 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 font-black text-2xl flex items-center justify-center mx-auto">
          403
        </div>
        <h2 className="text-xl font-bold text-white">Access Denied</h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          Application Analytics is restricted to System Administrators.
        </p>
      </div>
    );
  }
  return <Outlet />;
}

// Layout wrapper injecting Sidebar & Navbar
function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = React.useState(true);

  return (
    <div className="flex h-screen overflow-hidden bg-dark-950">
      {/* Sidebar Navigation */}
      <Sidebar isOpen={sidebarOpen} />

      {/* Main Content viewport */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header Bar */}
        <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} isSidebarOpen={sidebarOpen} />

        {/* Dynamic sub-pages */}
        <main className="flex-1 overflow-y-auto bg-transparent">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default function App() {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  // Initialize background telemetry heartbeat when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      initTelemetryHeartbeat();
    } else {
      stopTelemetryHeartbeat();
    }
  }, [isAuthenticated]);

  return (
    <>
      <SparkleCursor />
      <Routes>
        {/* Public auth pages */}
        <Route 
          path="/login" 
          element={
            isAuthenticated ? <Navigate to="/" replace /> : <Login />
          } 
        />
        <Route 
          path="/register" 
          element={
            isAuthenticated ? <Navigate to="/" replace /> : <Register />
          } 
        />

        {/* Authenticated dashboard pages */}
        <Route element={<ProtectedRoute isAuthenticated={isAuthenticated} />}>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/trends" element={<Trends />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/reports/:reportId" element={<ReportViewerPage />} />
            
            {/* Organization-only Groups & Messages Routes */}
            <Route element={<OrganizationRoute isAuthenticated={isAuthenticated} user={user} />}>
              <Route path="/groups" element={<GroupManagement />} />
              <Route path="/groups/:groupId" element={<GroupDetailPage />} />
              <Route path="/messages" element={<MessagesPage />} />
            </Route>

            {/* Organization Admin-only Employees Route */}
            <Route element={<OrgAdminRoute isAuthenticated={isAuthenticated} user={user} />}>
              <Route path="/employees" element={<EmployeeManagement />} />
            </Route>

            {/* YouTube Routes */}
            <Route path="/youtube" element={<YoutubeHome />} />
            <Route path="/youtube/search" element={<YoutubeSearch />} />
            <Route path="/youtube/channel/:channelId" element={<YoutubeChannelDashboard />} />
            <Route path="/youtube/settings" element={<YoutubeSettings />} />

            {/* GitHub Routes */}
            <Route path="/github" element={<GithubDashboard />} />
            <Route path="/github/search" element={<GithubSearch />} />
            <Route path="/github/repository/:owner/:repo" element={<GithubRepoDashboard />} />
            <Route path="/github/user/:username" element={<GithubUserDashboard />} />
            <Route path="/github/organization/:org" element={<GithubOrgDashboard />} />
            <Route path="/github/trending" element={<GithubTrendingPage />} />

            {/* Admin-only Application Analytics Route */}
            <Route element={<AdminRoute isAuthenticated={isAuthenticated} user={user} />}>
              <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
            </Route>
          </Route>
        </Route>

        {/* Wildcard redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

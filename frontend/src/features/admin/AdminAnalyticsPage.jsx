import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchAdminOverview, 
  fetchUsageOverTime, 
  fetchPlatformUsage, 
  fetchMostUsedFeatures, 
  fetchUserActivity, 
  fetchRecentEvents,
  fetchUserDetail,
  setAdminFilters,
  closeUserModal
} from './adminSlice';
import MetricCard from '../../components/common/MetricCard';
import DataTable from '../../components/common/DataTable';
import BackButton from '../../components/common/BackButton';
import { 
  Users, 
  Clock, 
  Activity, 
  ShieldCheck, 
  Calendar, 
  Filter, 
  Zap, 
  Layers, 
  PieChart as PieIcon, 
  TrendingUp, 
  UserCheck, 
  Globe2, 
  Youtube, 
  Github, 
  Flame, 
  X, 
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';

export default function AdminAnalyticsPage() {
  const dispatch = useDispatch();

  const { 
    overview, 
    usageChart, 
    platformUsage, 
    mostUsedFeatures, 
    userActivity, 
    recentEvents, 
    selectedUserDetail,
    isUserModalOpen,
    filters,
    isLoading 
  } = useSelector((state) => state.admin);

  const [searchTerm, setSearchTerm] = useState('');

  const timeRanges = [
    { label: 'Today', value: 'Today' },
    { label: 'Last 7 Days', value: '7d' },
    { label: 'Last 30 Days', value: '30d' }
  ];

  const featuresList = [
    'All',
    'Dashboard',
    'YouTube',
    'GitHub',
    'Trends',
    'Groups',
    'Settings',
    'Authentication'
  ];

  // Fetch telemetry whenever filters change
  useEffect(() => {
    dispatch(fetchAdminOverview(filters));
    dispatch(fetchUsageOverTime(filters));
    dispatch(fetchPlatformUsage(filters));
    dispatch(fetchMostUsedFeatures(filters));
    dispatch(fetchUserActivity(filters));
    dispatch(fetchRecentEvents({ limit: 20 }));
  }, [dispatch, filters]);

  const handleTimeRangeChange = (e) => {
    dispatch(setAdminFilters({ timeRange: e.target.value }));
  };

  const handleFeatureChange = (e) => {
    dispatch(setAdminFilters({ feature: e.target.value }));
  };

  const handleUserClick = (userId) => {
    dispatch(fetchUserDetail(userId));
  };

  const filteredUsers = userActivity.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const tableHeaders = [
    { name: 'User' },
    { name: 'Role' },
    { name: 'Last Active' },
    { name: 'Sessions' },
    { name: 'Total Usage Time' },
    { name: 'Analytics Actions' },
    { name: 'Action' }
  ];

  const overviewData = overview || {
    totalUsers: 0,
    activeUsers: 0,
    activeUsersPercentage: 0,
    totalSessions: 0,
    totalUsageTime: '0h 0m',
    avgSessionDuration: '0m 0s',
    totalActions: 0
  };

  return (
    <div className="p-8 space-y-8 w-full max-w-[1700px] mx-auto min-h-full bg-white text-slate-900">
      
      {/* 1. PAGE HEADER & CONTROLS */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between border-b border-slate-200 pb-6 gap-6">
        <div className="flex items-center space-x-4">
          <BackButton fallbackRoute="/" />
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-3xl font-extrabold text-black tracking-tight">
                Application Analytics
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-pine-500/10 border border-pine-500/30 text-pine-700 uppercase tracking-wider">
                System Admin
              </span>
            </div>
            <p className="text-slate-700 text-xs font-bold mt-0.5">
              Cross-system feature usage metrics, active user engagement telemetry, and audit event logs.
            </p>
          </div>
        </div>

        {/* Filters: [Time Range] [Feature Filter] */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Time Range Filter */}
          <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 focus-within:border-brand-500 transition-colors">
            <Calendar className="w-4 h-4 text-brand-400 shrink-0" />
            <select
              value={filters.timeRange}
              onChange={handleTimeRangeChange}
              className="bg-transparent text-xs text-slate-200 font-semibold border-none outline-none focus:ring-0 cursor-pointer pr-4"
            >
              {timeRanges.map(t => (
                <option key={t.value} value={t.value} className="bg-dark-900 text-slate-200">
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {/* Feature Filter */}
          <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 focus-within:border-brand-500 transition-colors">
            <Filter className="w-4 h-4 text-brand-400 shrink-0" />
            <select
              value={filters.feature}
              onChange={handleFeatureChange}
              className="bg-transparent text-xs text-slate-200 font-semibold border-none outline-none focus:ring-0 cursor-pointer pr-4"
            >
              {featuresList.map(f => (
                <option key={f} value={f} className="bg-dark-900 text-slate-200">
                  {f === 'All' ? 'All Features' : f}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 2. OVERVIEW CARDS (6 Metrics) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5">
        <MetricCard
          title="Total Users"
          value={overviewData.totalUsers}
          icon={Users}
          description="Registered platform accounts"
        />
        <MetricCard
          title="Active Users"
          value={`${overviewData.activeUsers} (${overviewData.activeUsersPercentage}%)`}
          icon={UserCheck}
          description={`Active in ${filters.timeRange}`}
        />
        <MetricCard
          title="Total Sessions"
          value={overviewData.totalSessions}
          icon={Activity}
          description="Logged application sessions"
        />
        <MetricCard
          title="Total Usage Time"
          value={overviewData.totalUsageTime}
          icon={Clock}
          description="Accumulated active session time"
        />
        <MetricCard
          title="Avg Session Duration"
          value={overviewData.avgSessionDuration}
          icon={Zap}
          description="Mean time spent per session"
        />
        <MetricCard
          title="Analytics Actions"
          value={overviewData.totalActions}
          icon={Layers}
          description="Total telemetry events logged"
        />
      </div>

      {/* 3. APPLICATION USAGE OVER TIME CHART */}
      <div className="glass-panel p-6 rounded-2xl space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-base font-bold text-white flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-brand-400" />
              Application Usage Over Time
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Daily trend telemetry for Active Users, Sessions, and Analytics Actions.
            </p>
          </div>
        </div>

        <div className="w-full h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={usageChart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorActions" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0}/>
                </linearGradient>
                <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0}/>
                </linearGradient>
                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
              />
              <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: 11, color: '#94a3b8' }} />
              <Area type="monotone" dataKey="actions" name="Analytics Actions" stroke="#6366f1" fillOpacity={1} fill="url(#colorActions)" strokeWidth={2} />
              <Area type="monotone" dataKey="sessions" name="Sessions" stroke="#38bdf8" fillOpacity={1} fill="url(#colorSessions)" strokeWidth={2} />
              <Area type="monotone" dataKey="activeUsers" name="Active Users" stroke="#10b981" fillOpacity={1} fill="url(#colorUsers)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 4. PLATFORM USAGE DISTRIBUTION & MOST USED FEATURES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Platform Usage Distribution */}
        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center">
              <PieIcon className="w-5 h-5 mr-2 text-indigo-400" />
              Platform Section Usage
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Breakdown of how often users interact with each application module.
            </p>
          </div>

          <div className="space-y-4 pt-2">
            {platformUsage.breakdown.map((item) => (
              <div key={item.name} className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-200 flex items-center">
                    {item.name === 'YouTube' && <Youtube className="w-3.5 h-3.5 mr-1.5 text-red-500" />}
                    {item.name === 'GitHub' && <Github className="w-3.5 h-3.5 mr-1.5 text-slate-300" />}
                    {item.name === 'Trends' && <Flame className="w-3.5 h-3.5 mr-1.5 text-amber-400" />}
                    {item.name === 'Dashboard' && <Globe2 className="w-3.5 h-3.5 mr-1.5 text-brand-400" />}
                    {item.name}
                  </span>
                  <span className="text-slate-400 font-mono">
                    <strong className="text-white">{item.percentage}%</strong> ({item.count} actions)
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      item.name === 'YouTube' ? 'bg-red-500' :
                      item.name === 'GitHub' ? 'bg-sky-400' :
                      item.name === 'Trends' ? 'bg-amber-400' :
                      item.name === 'Dashboard' ? 'bg-brand-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Most Used Features */}
        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center">
              <Zap className="w-5 h-5 mr-2 text-amber-400" />
              Most Used Features
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Ranked list of highest frequency telemetry actions performed by users.
            </p>
          </div>

          <div className="space-y-3">
            {mostUsedFeatures.map((item) => (
              <div 
                key={item.rank} 
                className="p-3 rounded-xl bg-slate-900/50 border border-slate-800/80 flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <span className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 font-bold text-xs flex items-center justify-center">
                    {item.rank}
                  </span>
                  <div>
                    <h5 className="text-xs font-bold text-white">{item.feature}</h5>
                    <p className="text-[10px] text-slate-400">{item.count} total executions</p>
                  </div>
                </div>

                <span className="text-xs font-bold text-brand-400 bg-brand-500/10 border border-brand-500/20 px-2.5 py-1 rounded-md">
                  {item.percentage}% share
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 5. USER ACTIVITY TELEMETRY TABLE */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center">
              <Users className="w-5 h-5 mr-2 text-brand-400" />
              User Activity Telemetry
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Detailed list of users, session frequencies, active time, and action counts.
            </p>
          </div>

          <input
            type="text"
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-brand-500 w-full sm:w-64"
          />
        </div>

        <DataTable
          headers={tableHeaders}
          data={filteredUsers}
          loading={isLoading}
          emptyMessage="No user telemetry activity recorded for the selected period."
          renderRow={(user) => (
            <tr 
              key={user.id} 
              className="hover:bg-slate-800/40 transition-all border-b border-slate-800/40 text-slate-300"
            >
              <td className="p-4 text-xs font-bold text-white font-mono">
                <div>
                  <span className="text-white font-bold block">{user.name}</span>
                  <span className="text-[10px] text-slate-400 font-normal">{user.email}</span>
                </div>
              </td>
              <td className="p-4 text-xs font-bold">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] border font-bold ${
                  user.role === 'ADMIN'
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                    : 'bg-sky-500/10 border-sky-500/30 text-sky-400'
                }`}>
                  {user.role}
                </span>
              </td>
              <td className="p-4 text-xs text-slate-400">
                {new Date(user.lastActive).toLocaleString()}
              </td>
              <td className="p-4 text-xs font-bold text-white">
                {user.sessionsCount} sessions
              </td>
              <td className="p-4 text-xs font-bold text-emerald-400">
                {user.usageTime}
              </td>
              <td className="p-4 text-xs font-bold text-brand-400">
                {user.actionsCount} actions
              </td>
              <td className="p-4 text-xs">
                <button
                  onClick={() => handleUserClick(user.id)}
                  className="px-3 py-1.5 rounded-lg bg-brand-600/20 hover:bg-brand-600/30 border border-brand-500/30 text-brand-400 text-[11px] font-bold flex items-center space-x-1 transition-colors"
                >
                  <span>View Telemetry</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </td>
            </tr>
          )}
        />
      </div>

      {/* 6. RECENT APPLICATION ACTIVITY STREAM */}
      <div className="glass-panel p-6 rounded-2xl space-y-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center">
            <Activity className="w-5 h-5 mr-2 text-emerald-400" />
            Recent Application Activity Stream
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time feed of meaningful telemetry actions recorded across the application.
          </p>
        </div>

        <div className="space-y-3">
          {recentEvents.map((evt) => (
            <div 
              key={evt.id} 
              className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800/80 flex items-center justify-between"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-pine-500/10 border border-pine-500/20 text-pine-400 flex items-center justify-center">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-white">
                    <span className="text-slate-300 font-semibold">{evt.userName}</span> ({evt.userEmail}) executed <span className="text-brand-400 font-mono">{evt.eventType}</span>
                  </h5>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Feature: <span className="text-slate-200 font-semibold">{evt.feature}</span>
                  </p>
                </div>
              </div>

              <span className="text-[10px] text-slate-400 font-mono bg-slate-800 px-2.5 py-1 rounded-md border border-slate-700">
                {new Date(evt.createdAt).toLocaleTimeString()}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 7. USER DETAIL TELEMETRY MODAL */}
      {isUserModalOpen && selectedUserDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl p-6 space-y-6 shadow-2xl relative">
            <button
              onClick={() => dispatch(closeUserModal())}
              className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-xl font-bold text-white">{selectedUserDetail.user.name}</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-brand-500/10 border border-brand-500/30 text-brand-400">
                  {selectedUserDetail.user.role}
                </span>
              </div>
              <p className="text-xs text-slate-400">{selectedUserDetail.user.email}</p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/50">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Total Sessions</span>
                <span className="text-lg font-black text-white">{selectedUserDetail.totalSessions}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/50">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Total Usage Time</span>
                <span className="text-lg font-black text-emerald-400">{selectedUserDetail.totalUsageTime}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/50">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Avg Session</span>
                <span className="text-lg font-black text-sky-400">{selectedUserDetail.avgSessionDuration}</span>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Recent User Actions</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {selectedUserDetail.recentEvents.map(e => (
                  <div key={e.id} className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 flex justify-between items-center text-xs">
                    <span className="font-mono text-slate-200">{e.eventType} ({e.feature})</span>
                    <span className="text-[10px] text-slate-400">{new Date(e.createdAt).toLocaleTimeString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

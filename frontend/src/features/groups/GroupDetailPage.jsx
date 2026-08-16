import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchGroupById,
  fetchGroupMembers,
  fetchGroupAnalytics,
  fetchOrgEmployees,
  updateGroup,
  deleteGroup,
  addGroupMember,
  removeGroupMember,
  leaveGroup,
  clearGroupError,
  clearActionSuccess
} from './groupsSlice';
import BackButton from '../../components/common/BackButton';
import DataTable from '../../components/common/DataTable';
import GroupChatTab from './GroupChatTab';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';
import {
  Users,
  Clock,
  Activity,
  Layers,
  Edit,
  Trash2,
  UserPlus,
  UserX,
  Sparkles,
  Copy,
  Check,
  X,
  Shield,
  Youtube,
  Github,
  TrendingUp,
  BarChart3,
  MessageSquare,
  Info,
  AlertCircle
} from 'lucide-react';

export default function GroupDetailPage() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user: currentUser } = useSelector((state) => state.auth);
  const {
    currentGroup,
    groupMembers,
    groupAnalytics,
    orgEmployees,
    isLoading,
    error,
    actionSuccess,
    successMessage
  } = useSelector((state) => state.groups);

  const [activeTab, setActiveTab] = useState('overview');
  const [copiedId, setCopiedId] = useState(false);

  // Modal States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Edit Group Form
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');

  // Add Member Select
  const [selectedUserId, setSelectedUserId] = useState('');

  const isOrgAdmin = currentUser?.accountType === 'ORGANIZATION' && currentUser?.role === 'ADMIN';

  useEffect(() => {
    if (groupId) {
      dispatch(fetchGroupById(groupId));
      dispatch(fetchGroupMembers(groupId));
      dispatch(fetchGroupAnalytics(groupId));
    }
  }, [dispatch, groupId]);

  useEffect(() => {
    if (currentGroup) {
      setEditName(currentGroup.name || '');
      setEditDesc(currentGroup.description || '');
    }
  }, [currentGroup]);

  useEffect(() => {
    if (isAddMemberModalOpen) {
      dispatch(fetchOrgEmployees());
    }
  }, [dispatch, isAddMemberModalOpen]);

  const handleCopyId = () => {
    if (currentGroup?.id) {
      navigator.clipboard.writeText(currentGroup.id);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  const handleUpdateGroup = (e) => {
    e.preventDefault();
    if (!editName.trim()) return;
    dispatch(updateGroup({ id: groupId, groupData: { name: editName, description: editDesc } }));
    setIsEditModalOpen(false);
  };

  const handleDeleteGroup = () => {
    dispatch(deleteGroup(groupId)).then((res) => {
      if (!res.error) {
        navigate('/groups');
      }
    });
  };

  const handleAddMember = (e) => {
    e.preventDefault();
    if (!selectedUserId) return;
    dispatch(addGroupMember({ groupId, userId: selectedUserId }));
    setSelectedUserId('');
    setIsAddMemberModalOpen(false);
  };

  const handleRemoveMember = (userId, name) => {
    if (window.confirm(`Are you sure you want to remove ${name} from this group?`)) {
      dispatch(removeGroupMember({ groupId, userId }));
    }
  };

  const handleLeaveGroup = () => {
    if (window.confirm('Are you sure you want to leave this workspace group?')) {
      dispatch(leaveGroup(groupId)).then((res) => {
        if (!res.error) {
          navigate('/groups');
        }
      });
    }
  };

  if (isLoading && !currentGroup) {
    return (
      <div className="p-8 max-w-7xl mx-auto text-center py-24 space-y-4">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs text-slate-400">Loading group details...</p>
      </div>
    );
  }

  if (error && !currentGroup) {
    return (
      <div className="p-8 max-w-lg mx-auto mt-16 rounded-2xl bg-midnight-900 border border-coral-500/30 text-center space-y-4 shadow-2xl">
        <div className="w-14 h-14 rounded-full bg-coral-500/10 border border-coral-500/20 text-coral-400 font-bold text-2xl flex items-center justify-center mx-auto">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-white">Group Not Accessible</h2>
        <p className="text-xs text-slate-400 leading-relaxed">{error}</p>
        <BackButton fallbackRoute="/groups" />
      </div>
    );
  }

  const platformData = groupAnalytics?.activityChart || [];
  const topFeatures = groupAnalytics?.topFeatures || [];
  const platformBreakdown = currentGroup?.platformUsage || { YouTube: 0, GitHub: 0, Trends: 0 };

  // Filter employees available to add (exclude current members)
  const memberUserIds = new Set((groupMembers || []).map(m => m.userId));
  const availableEmployees = (orgEmployees || []).filter(emp => !memberUserIds.has(emp.id));

  const memberHeaders = [
    { name: 'Name' },
    { name: 'Email' },
    { name: 'Role' },
    { name: 'Last Active' },
    { name: 'Sessions' },
    { name: 'Usage Time' },
    ...(isOrgAdmin ? [{ name: 'Actions', className: 'text-center' }] : [])
  ];

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header bar with BackButton */}
      <div className="flex flex-col space-y-4 md:flex-row md:justify-between md:items-start md:space-y-0">
        <div className="flex items-start space-x-4">
          <BackButton fallbackRoute="/groups" />
          <div className="space-y-1">
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-bold text-black tracking-tight">{currentGroup?.name}</h1>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 flex items-center space-x-1">
                <Users className="w-3 h-3 mr-1" />
                <span>{currentGroup?.memberCount} Members</span>
              </span>
            </div>
            <p className="text-slate-400 text-sm text-black max-w-2xl">
              {currentGroup?.description || 'No description provided for this group.'}
            </p>
            {/* Group UUID Badge */}
            <div className="flex items-center space-x-2 pt-1 text-slate-400 text-[11px] font-mono">
              <span className="text-slate-500">Group ID:</span>
              <span className="bg-slate-900 border border-slate-800 px-2 py-0.5 rounded select-all text-slate-300">
                {currentGroup?.id}
              </span>
              <button
                onClick={handleCopyId}
                className="text-slate-500 hover:text-white transition-colors cursor-pointer"
                title="Copy Group ID"
              >
                {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons for Org Admin */}
        <div className="flex flex-wrap items-center gap-2">
          {isOrgAdmin ? (
            <>
              <button
                onClick={() => setIsAddMemberModalOpen(true)}
                className="px-3 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-medium text-xs shadow-glass-indigo transition-all flex items-center space-x-1.5 cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>Manage Members</span>
              </button>

              <button
                onClick={() => setIsEditModalOpen(true)}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs border border-slate-700 transition-all flex items-center space-x-1.5 cursor-pointer"
              >
                <Edit className="w-4 h-4" />
                <span>Edit Group</span>
              </button>

              <button
                onClick={() => setIsDeleteModalOpen(true)}
                className="px-3 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 font-medium text-xs transition-all flex items-center space-x-1.5 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Group</span>
              </button>
            </>
          ) : (
            <button
              onClick={handleLeaveGroup}
              className="px-3 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 font-medium text-xs transition-all flex items-center space-x-1.5 cursor-pointer"
            >
              <UserX className="w-4 h-4" />
              <span>Leave Group</span>
            </button>
          )}
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-3 rounded-xl bg-coral-500/10 border border-coral-500/20 text-xs text-coral-400 font-semibold text-center flex items-center justify-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {actionSuccess && successMessage && (
        <div className="p-3 rounded-xl bg-pine-500/10 border border-pine-500/20 text-xs text-pine-400 font-semibold text-center flex items-center justify-center space-x-2">
          <Check className="w-4 h-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Tabs Navigation: Overview | Chat | Members | Analytics */}
      <div className="flex border-b border-slate-200 space-x-8">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 text-xs font-extrabold transition-colors cursor-pointer border-b-2 flex items-center space-x-2 ${activeTab === 'overview'
            ? 'border-pine-500 text-pine-700'
            : 'border-transparent text-slate-600 hover:text-black'
            }`}
        >
          <Layers className="w-4 h-4" />
          <span>Overview</span>
        </button>

        <button
          onClick={() => setActiveTab('chat')}
          className={`pb-3 text-xs font-extrabold transition-colors cursor-pointer border-b-2 flex items-center space-x-2 ${activeTab === 'chat'
            ? 'border-pine-500 text-pine-700'
            : 'border-transparent text-slate-600 hover:text-black'
            }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Chat</span>
        </button>

        <button
          onClick={() => setActiveTab('members')}
          className={`pb-3 text-xs font-extrabold transition-colors cursor-pointer border-b-2 flex items-center space-x-2 ${activeTab === 'members'
            ? 'border-pine-500 text-pine-700'
            : 'border-transparent text-slate-600 hover:text-black'
            }`}
        >
          <Users className="w-4 h-4" />
          <span>Members ({groupMembers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`pb-3 text-xs font-extrabold transition-colors cursor-pointer border-b-2 flex items-center space-x-2 ${activeTab === 'analytics'
            ? 'border-pine-500 text-pine-700'
            : 'border-transparent text-slate-600 hover:text-black'
            }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Analytics</span>
        </button>
      </div>

      {/* TAB CONTENT: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Top Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Members</span>
              <p className="text-2xl font-black text-white">{currentGroup?.memberCount || 0}</p>
            </div>

            <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Active Today</span>
              <p className="text-2xl font-black text-emerald-400">{currentGroup?.activeMembers || 0}</p>
            </div>

            <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Sessions</span>
              <p className="text-2xl font-black text-brand-400">{currentGroup?.totalSessions || 0}</p>
            </div>

            <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Usage Time</span>
              <p className="text-2xl font-black text-amber-400">{currentGroup?.totalUsageTime || '0m'}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 7-Day Activity Chart */}
            <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-base font-bold text-white">Group Activity — Last 7 Days</h3>
                  <p className="text-xs text-slate-400">Daily session volume and active members for this workspace.</p>
                </div>
                <Activity className="w-5 h-5 text-brand-400" />
              </div>

              <div className="h-64 w-full pt-4">
                {platformData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={platformData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
                      <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px', color: '#fff' }}
                      />
                      <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                      <Bar dataKey="sessions" name="Sessions" fill="#6366f1" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="activeMembers" name="Active Members" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-slate-500 text-xs">
                    <Info className="w-6 h-6 mb-2" />
                    <span>No activity recorded yet.</span>
                  </div>
                )}
              </div>
            </div>

            {/* Platform Usage Breakdown */}
            <div className="lg:col-span-1 glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
              <div>
                <h3 className="text-base font-bold text-white">Platform Usage</h3>
                <p className="text-xs text-slate-400">Distribution of telemetry activity across platforms.</p>
              </div>

              <div className="space-y-4">
                {/* YouTube */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-300 flex items-center"><Youtube className="w-3.5 h-3.5 mr-1.5 text-red-500" /> YouTube</span>
                    <span className="text-white font-mono">{platformBreakdown.YouTube}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                    <div className="h-full bg-red-500 rounded-full transition-all duration-500" style={{ width: `${platformBreakdown.YouTube}%` }}></div>
                  </div>
                </div>

                {/* GitHub */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-300 flex items-center"><Github className="w-3.5 h-3.5 mr-1.5 text-slate-200" /> GitHub</span>
                    <span className="text-white font-mono">{platformBreakdown.GitHub}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                    <div className="h-full bg-slate-200 rounded-full transition-all duration-500" style={{ width: `${platformBreakdown.GitHub}%` }}></div>
                  </div>
                </div>

                {/* Trends */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-300 flex items-center"><TrendingUp className="w-3.5 h-3.5 mr-1.5 text-emerald-400" /> Trends</span>
                    <span className="text-white font-mono">{platformBreakdown.Trends}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                    <div className="h-full bg-emerald-400 rounded-full transition-all duration-500" style={{ width: `${platformBreakdown.Trends}%` }}></div>
                  </div>
                </div>
              </div>

              {/* Group Workspace Summary Callout */}
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Organization Workspace</span>
                <p className="text-slate-400">
                  Analytics are computed exclusively from employees in this group. All access is organization-isolated.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: CHAT */}
      {activeTab === 'chat' && (
        <GroupChatTab group={currentGroup} />
      )}

      {/* TAB CONTENT: MEMBERS */}
      {activeTab === 'members' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center space-y-3 sm:space-y-0">
            <div>
              <h3 className="text-lg font-bold text-white">Group Members</h3>
              <p className="text-xs text-slate-400">Roster of organization employees assigned to this group.</p>
            </div>

            {isOrgAdmin && (
              <button
                onClick={() => setIsAddMemberModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-medium text-xs shadow-glass-indigo transition-all flex items-center space-x-2 cursor-pointer w-fit"
              >
                <UserPlus className="w-4 h-4" />
                <span>Add Member</span>
              </button>
            )}
          </div>

          <DataTable
            headers={memberHeaders}
            data={groupMembers}
            loading={isLoading}
            emptyMessage="No members in this group yet."
            renderRow={(member) => (
              <tr key={member.userId} className="hover:bg-slate-800/20 transition-colors border-b border-slate-800/40 text-slate-300">
                <td className="p-4 text-xs font-semibold text-white">
                  <div className="flex items-center space-x-2">
                    <span>{member.name}</span>
                    {member.userId === currentUser.id && (
                      <span className="text-[9px] bg-brand-600 text-white px-1.5 py-0.25 rounded font-bold uppercase">You</span>
                    )}
                  </div>
                </td>
                <td className="p-4 text-xs font-mono text-slate-400">{member.email}</td>
                <td className="p-4 text-xs">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${member.role === 'ADMIN'
                    ? 'bg-red-500/10 border-red-500/20 text-red-400'
                    : 'bg-slate-800 border-slate-700 text-slate-300'
                    }`}>
                    {member.role}
                  </span>
                </td>
                <td className="p-4 text-xs text-slate-400">{member.lastActive}</td>
                <td className="p-4 text-xs text-slate-300 font-medium">{member.sessions}</td>
                <td className="p-4 text-xs text-amber-400 font-medium">{member.usageTime}</td>
                {isOrgAdmin && (
                  <td className="p-4 text-center">
                    <button
                      onClick={() => handleRemoveMember(member.userId, member.name)}
                      className="px-2.5 py-1 rounded-lg border border-red-500/20 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[10px] font-semibold transition-colors cursor-pointer"
                      title="Remove member from group"
                    >
                      Remove
                    </button>
                  </td>
                )}
              </tr>
            )}
          />
        </div>
      )}

      {/* TAB CONTENT: ANALYTICS */}
      {activeTab === 'analytics' && (
        <div className="space-y-8">
          {/* Key Analytics Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Group Sessions</span>
              <p className="text-3xl font-black text-white">{groupAnalytics?.totalSessions || 0}</p>
              <p className="text-[11px] text-slate-500">Aggregated session volume across group members.</p>
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Usage Duration</span>
              <p className="text-3xl font-black text-amber-400">{groupAnalytics?.totalUsageTime || '0m'}</p>
              <p className="text-[11px] text-slate-500">Total active duration recorded for group members.</p>
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Members</span>
              <p className="text-3xl font-black text-emerald-400">{groupAnalytics?.activeMembers || 0}</p>
              <p className="text-[11px] text-slate-500">Members with active telemetry today.</p>
            </div>
          </div>

          {/* Most Used Features & Detailed Platform Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Most Used Features */}
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
              <div>
                <h3 className="text-base font-bold text-white">Most Used Features</h3>
                <p className="text-xs text-slate-400">Ranked feature engagement among members of this group.</p>
              </div>

              {topFeatures.length > 0 ? (
                <ol className="divide-y divide-slate-800/60">
                  {topFeatures.map((item, index) => (
                    <li key={index} className="py-3 flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-3">
                        <span className="w-6 h-6 rounded-lg bg-brand-500/10 border border-brand-500/20 text-brand-400 font-bold flex items-center justify-center text-[11px]">
                          #{index + 1}
                        </span>
                        <span className="font-semibold text-slate-200">{item.feature}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-slate-400 text-[11px]">{item.count} events</span>
                        <span className="font-mono text-brand-400 font-bold bg-brand-500/10 px-2 py-0.5 rounded text-[11px]">
                          {item.percentage}%
                        </span>
                      </div>
                    </li>
                  ))}
                </ol>
              ) : (
                <div className="p-8 text-center text-slate-500 text-xs">
                  <Info className="w-6 h-6 mx-auto mb-2" />
                  <span>No feature telemetry recorded yet for this group.</span>
                </div>
              )}
            </div>

            {/* Platform Analytics Breakdown */}
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
              <div>
                <h3 className="text-base font-bold text-white">Platform Activity Breakdown</h3>
                <p className="text-xs text-slate-400">Telemetry event distribution by target module.</p>
              </div>

              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                  <Youtube className="w-6 h-6 text-red-500 mx-auto mb-1" />
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">YouTube</span>
                  <span className="text-lg font-black text-white">{groupAnalytics?.youtubeUsage || 0}%</span>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                  <Github className="w-6 h-6 text-slate-200 mx-auto mb-1" />
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">GitHub</span>
                  <span className="text-lg font-black text-white">{groupAnalytics?.githubUsage || 0}%</span>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                  <TrendingUp className="w-6 h-6 text-emerald-400 mx-auto mb-1" />
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Trends</span>
                  <span className="text-lg font-black text-white">{groupAnalytics?.trendsUsage || 0}%</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-brand-500/5 border border-brand-500/10 text-xs text-slate-400 space-y-1">
                <span className="font-semibold text-brand-400 flex items-center">
                  <Shield className="w-3.5 h-3.5 mr-1" /> Data Integrity Verification
                </span>
                <p className="text-[11px]">
                  All telemetry values are calculated strictly from real database ApplicationEvent & ApplicationSession entries.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Edit Group */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md glass-panel p-6 rounded-2xl border border-slate-800 relative space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center">
                <Edit className="w-5 h-5 mr-2 text-brand-400" />
                Edit Group Details
              </h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-500 hover:text-white transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateGroup} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Group Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl glass-input text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Description</label>
                <textarea
                  rows="3"
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl glass-input text-white resize-none"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-800 text-xs text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-medium shadow-glass-indigo transition-all cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Add Member */}
      {isAddMemberModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md glass-panel p-6 rounded-2xl border border-slate-800 relative space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center">
                <UserPlus className="w-5 h-5 mr-2 text-brand-400" />
                Add Organization Employee
              </h3>
              <button onClick={() => setIsAddMemberModalOpen(false)} className="text-slate-500 hover:text-white transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddMember} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Select Organization Employee</label>
                {availableEmployees.length > 0 ? (
                  <select
                    required
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                    className="w-full p-2.5 text-xs rounded-xl glass-input text-white bg-slate-900"
                  >
                    <option value="">-- Choose Employee --</option>
                    {availableEmployees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} ({emp.email}) - {emp.role}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl">
                    All organization employees are already members of this group or no employees exist.
                  </p>
                )}
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddMemberModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-800 text-xs text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedUserId || availableEmployees.length === 0}
                  className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white text-xs font-medium shadow-glass-indigo transition-all cursor-pointer"
                >
                  Add Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Delete Confirmation */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md glass-panel p-6 rounded-2xl border border-red-500/30 relative space-y-4">
            <div className="flex items-center space-x-3 text-red-400">
              <Trash2 className="w-6 h-6" />
              <h3 className="text-lg font-bold text-white">Delete Group?</h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to delete <strong className="text-white">{currentGroup?.name}</strong>? This action cannot be undone and will remove all group memberships.
            </p>

            <div className="flex justify-end space-x-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-800 text-xs text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteGroup}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-medium transition-all cursor-pointer"
              >
                Yes, Delete Group
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

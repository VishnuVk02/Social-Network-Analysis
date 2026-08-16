import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { 
  fetchGroups, 
  createGroup, 
  joinGroup, 
  clearGroupError,
  clearActionSuccess
} from './groupsSlice';
import BackButton from '../../components/common/BackButton';
import { 
  FolderGit2, 
  Plus, 
  Users, 
  Copy, 
  Check, 
  Sparkles,
  X,
  Clock,
  Activity,
  Layers,
  ArrowRight,
  Shield,
  Layers3,
  Search
} from 'lucide-react';

export default function GroupManagement() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user: currentUser } = useSelector((state) => state.auth);
  const { list: groups, overviewMetrics, isLoading, error, actionSuccess, successMessage } = useSelector((state) => state.groups);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  // Create Group Form
  const [groupName, setGroupName] = useState('');
  const [groupDesc, setGroupDesc] = useState('');

  // Join Group Input (Group ID UUID)
  const [joinGroupIdInput, setJoinGroupIdInput] = useState('');

  const isOrgAdmin = currentUser?.accountType === 'ORGANIZATION' && currentUser?.role === 'ADMIN';

  useEffect(() => {
    dispatch(fetchGroups());
  }, [dispatch]);

  useEffect(() => {
    dispatch(clearGroupError());
    dispatch(clearActionSuccess());
  }, [dispatch]);

  const handleCopyId = (id, e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCreateGroup = (e) => {
    e.preventDefault();
    if (!groupName.trim()) return;

    dispatch(createGroup({ name: groupName, description: groupDesc })).then((res) => {
      if (!res.error) {
        setGroupName('');
        setGroupDesc('');
        setIsCreateModalOpen(false);
      }
    });
  };

  const handleJoinById = (e) => {
    e.preventDefault();
    if (!joinGroupIdInput.trim()) return;
    dispatch(joinGroup(joinGroupIdInput.trim())).then((res) => {
      if (!res.error) {
        setJoinGroupIdInput('');
      }
    });
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header bar */}
      <div className="flex flex-col space-y-4 md:flex-row md:justify-between md:items-center md:space-y-0">
        <div className="flex items-center space-x-4">
          <BackButton fallbackRoute="/" />
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Collaboration Groups</h1>
            <p className="text-slate-400 text-xs">Organize organization teams, track joint application telemetry, and share analytics.</p>
          </div>
        </div>

        {isOrgAdmin && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-brand-600 hover:bg-brand-500 text-white font-medium px-4 py-2.5 rounded-xl shadow-glass-indigo hover:shadow-indigo-500/20 transition-all flex items-center space-x-2 text-xs cursor-pointer"
          >
            <Plus className="w-4.5 h-4.5" />
            <span>Create Group</span>
          </button>
        )}
      </div>

      {/* Error / Success banners */}
      {error && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 font-semibold text-center flex items-center justify-center space-x-2">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {actionSuccess && successMessage && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 font-semibold text-center flex items-center justify-center space-x-2">
          <span>✓</span>
          <span>{successMessage}</span>
        </div>
      )}

      {/* TOP OVERVIEW METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Groups</span>
          <p className="text-2xl font-black text-white">{overviewMetrics?.totalGroups || 0}</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Members</span>
          <p className="text-2xl font-black text-brand-400">{overviewMetrics?.totalMembers || 0}</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Active Members</span>
          <p className="text-2xl font-black text-emerald-400">{overviewMetrics?.activeMembers || 0}</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Group Usage</span>
          <p className="text-2xl font-black text-amber-400">{overviewMetrics?.totalGroupUsage || '0m'}</p>
        </div>
      </div>

      {/* JOIN VIA GROUP ID BAR */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 relative overflow-hidden">
        <form onSubmit={handleJoinById} className="flex flex-col md:flex-row items-end space-y-3 md:space-y-0 md:space-x-4">
          <div className="flex-1 w-full space-y-1">
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center">
              <Search className="w-3.5 h-3.5 mr-1 text-slate-400" />
              Join Group via Workspace UUID
            </label>
            <input
              type="text"
              required
              value={joinGroupIdInput}
              onChange={(e) => setJoinGroupIdInput(e.target.value)}
              placeholder="Paste Group ID (e.g. 550e8400-e29b-41d4-a716-446655440000)"
              className="w-full p-2.5 text-xs rounded-xl glass-input text-white font-mono"
            />
          </div>
          <button
            type="submit"
            className="w-full md:w-auto px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-medium transition-all shadow-glass-indigo shrink-0 cursor-pointer"
          >
            Join Group
          </button>
        </form>
      </div>

      {/* GROUP CARDS GRID */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <Layers className="w-4 h-4 text-brand-400" />
            <span>Organization Workspaces ({groups.length})</span>
          </h3>
        </div>

        {groups && groups.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map((group) => (
              <div
                key={group.id}
                onClick={() => navigate(`/groups/${group.id}`)}
                className="glass-panel p-6 rounded-2xl border border-slate-800/80 hover:border-brand-500/50 hover:bg-slate-900/60 transition-all cursor-pointer group flex flex-col justify-between space-y-6"
              >
                {/* Top Section */}
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <h4 className="text-lg font-bold text-white group-hover:text-brand-300 transition-colors leading-tight">
                      {group.name}
                    </h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-brand-500/10 text-brand-400 border border-brand-500/20">
                      {group.memberCount} Members
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2 min-h-[2rem]">
                    {group.description || 'No description provided.'}
                  </p>
                </div>

                {/* Metrics Breakdown Grid */}
                <div className="grid grid-cols-2 gap-3 p-3 bg-slate-950/60 rounded-xl border border-slate-800/50 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-semibold block">Active Today</span>
                    <span className="font-bold text-emerald-400">{group.activeMembers}</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-semibold block">Sessions</span>
                    <span className="font-bold text-white">{group.totalSessions}</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-semibold block">Usage Time</span>
                    <span className="font-bold text-amber-400">{group.totalUsageTime}</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-semibold block">Most Used</span>
                    <span className="font-bold text-slate-300">{group.mostUsedPlatform}</span>
                  </div>
                </div>

                {/* Footer bar */}
                <div className="pt-2 border-t border-slate-800/60 flex justify-between items-center text-xs">
                  <div className="flex items-center space-x-1.5 text-slate-500 text-[11px]">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Last active {group.lastActivity}</span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/groups/${group.id}`);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-brand-600/80 hover:bg-brand-500 text-white font-medium text-xs flex items-center space-x-1 transition-all cursor-pointer"
                  >
                    <span>Open Group</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* EMPTY STATE */
          <div className="glass-panel p-12 rounded-2xl border border-slate-800 text-center space-y-4 max-w-md mx-auto my-8">
            <div className="w-12 h-12 rounded-2xl bg-brand-500/10 border border-brand-500/20 text-brand-400 flex items-center justify-center mx-auto">
              <FolderGit2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">No groups yet</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Create a group to organize your team and collaborate around analytics.
            </p>
            {isOrgAdmin && (
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-medium text-xs shadow-glass-indigo transition-all inline-flex items-center space-x-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Create Group</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* CREATE GROUP MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md glass-panel p-6 rounded-2xl border border-slate-800 relative space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center">
                <Sparkles className="w-5 h-5 mr-2 text-brand-400" />
                Create New Group
              </h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-500 hover:text-white transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateGroup} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Group Name</label>
                <input
                  type="text"
                  required
                  maxLength={100}
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="e.g. AI Research & Data Team"
                  className="w-full p-2.5 text-xs rounded-xl glass-input text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Description (Optional)</label>
                <textarea
                  rows="3"
                  value={groupDesc}
                  onChange={(e) => setGroupDesc(e.target.value)}
                  placeholder="Describe the group workspace objective..."
                  className="w-full p-2.5 text-xs rounded-xl glass-input text-white resize-none"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-800 text-xs text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-medium shadow-glass-indigo transition-all cursor-pointer"
                >
                  Create Group
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

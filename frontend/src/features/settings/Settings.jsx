import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUsers, addUser, modifyUser, removeUser } from '../users/usersSlice';
import { 
  fetchGroups, 
  fetchGroupById, 
  createGroup, 
  joinGroup, 
  leaveGroup,
  clearGroupError,
  clearActionSuccess
} from '../groups/groupsSlice';
import DataTable from '../../components/common/DataTable';
import BackButton from '../../components/common/BackButton';
import { 
  Settings as SettingsIcon,
  FolderGit2, 
  Plus, 
  Users, 
  Copy, 
  Check, 
  LogOut, 
  LogIn, 
  ShieldAlert, 
  X, 
  UserCheck, 
  UserPlus, 
  Edit3, 
  Trash2,
  Lock,
  User,
  Sparkles,
  Info
} from 'lucide-react';

export default function Settings() {
  const dispatch = useDispatch();
  const { user: currentUser } = useSelector((state) => state.auth);
  const { list: users, isLoading: usersLoading } = useSelector((state) => state.users);
  const { list: groups, currentGroup, isLoading: groupsLoading, error: groupError, actionSuccess: groupSuccess } = useSelector((state) => state.groups);

  const [activeTab, setActiveTab] = useState('workspaces'); // 'workspaces' or 'users'
  const [copiedId, setCopiedId] = useState(null);

  // Group Workspace Forms
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupDesc, setGroupDesc] = useState('');
  const [joinGroupIdInput, setJoinGroupIdInput] = useState('');

  // User Management Forms
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isEditUserMode, setIsEditUserMode] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [userRole, setUserRole] = useState('ANALYST');

  useEffect(() => {
    dispatch(fetchGroups());
    if (currentUser?.role === 'ADMIN') {
      dispatch(fetchUsers());
    }
  }, [dispatch, currentUser]);

  useEffect(() => {
    dispatch(clearGroupError());
    dispatch(clearActionSuccess());
  }, [dispatch, activeTab]);

  const handleCopyId = (id) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // -------------------------------------------------------------
  // Group Handlers
  // -------------------------------------------------------------
  const handleCreateGroup = (e) => {
    e.preventDefault();
    if (!groupName) return;
    dispatch(createGroup({ name: groupName, description: groupDesc }));
    setGroupName('');
    setGroupDesc('');
    setIsCreateGroupOpen(false);
  };

  const handleJoinById = (e) => {
    e.preventDefault();
    if (!joinGroupIdInput) return;
    dispatch(joinGroup(joinGroupIdInput));
    setJoinGroupIdInput('');
  };

  const handleLeaveGroup = (id) => {
    if (window.confirm('Are you sure you want to leave this workspace?')) {
      dispatch(leaveGroup(id));
    }
  };

  // -------------------------------------------------------------
  // User Handlers
  // -------------------------------------------------------------
  const handleOpenAddUser = () => {
    setIsEditUserMode(false);
    setSelectedUserId(null);
    setUserName('');
    setUserEmail('');
    setUserPassword('');
    setUserRole('ANALYST');
    setIsUserModalOpen(true);
  };

  const handleOpenEditUser = (user) => {
    setIsEditUserMode(true);
    setSelectedUserId(user.id);
    setUserName(user.name);
    setUserEmail(user.email);
    setUserPassword('');
    setUserRole(user.role);
    setIsUserModalOpen(true);
  };

  const handleUserSubmit = (e) => {
    e.preventDefault();
    if (isEditUserMode) {
      const payload = { name: userName, email: userEmail, role: userRole };
      if (userPassword) payload.password = userPassword;
      dispatch(modifyUser({ id: selectedUserId, data: payload }));
    } else {
      dispatch(addUser({ name: userName, email: userEmail, password: userPassword, role: userRole }));
    }
    setIsUserModalOpen(false);
  };

  const handleDeleteUser = (id) => {
    if (id === currentUser.id) {
      alert('You cannot delete your own active administrator account.');
      return;
    }
    if (window.confirm('Are you sure you want to delete this user account?')) {
      dispatch(removeUser(id));
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col space-y-4 md:flex-row md:justify-between md:items-center md:space-y-0">
        <div className="flex items-center space-x-4">
          <BackButton fallbackRoute="/" />
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">System Settings</h1>
            <p className="text-slate-400 text-sm">Configure collaborative workspaces, share group IDs, and manage accounts.</p>
          </div>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex space-x-2 border-b border-slate-800 pb-px">
        <button
          onClick={() => setActiveTab('workspaces')}
          className={`px-5 py-3 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
            activeTab === 'workspaces'
              ? 'border-brand-500 text-brand-400 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Workspaces ({groups.length})
        </button>
        {currentUser?.role === 'ADMIN' && (
          <button
            onClick={() => setActiveTab('users')}
            className={`px-5 py-3 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
              activeTab === 'users'
                ? 'border-brand-500 text-brand-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            User Provisioning ({users.length})
          </button>
        )}
      </div>

      {/* -------------------------------------------------------------
          TAB 1: WORKSPACES CONFIGURATION
          ------------------------------------------------------------- */}
      {activeTab === 'workspaces' && (
        <div className="space-y-6">
          {groupError && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 text-center font-medium">
              {groupError}
            </div>
          )}

          {groupSuccess && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 text-center font-medium">
              Workspace actions completed successfully.
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left 2 Columns: Lists and Join Panel */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Join Workspace Form */}
              <div className="glass-panel p-5 rounded-2xl">
                <form onSubmit={handleJoinById} className="flex flex-col md:flex-row items-end space-y-3 md:space-y-0 md:space-x-4">
                  <div className="flex-1 w-full space-y-1">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Join Workspace via ID</label>
                    <input
                      type="text"
                      required
                      value={joinGroupIdInput}
                      onChange={(e) => setJoinGroupIdInput(e.target.value)}
                      placeholder="Paste Workspace ID UUID here (e.g. 550e8400-e29b-41d4-a716-446655440000)"
                      className="w-full p-2.5 text-xs rounded-xl glass-input text-white font-mono"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full md:w-auto px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-medium transition-all shadow-glass-brand shrink-0 cursor-pointer"
                  >
                    Join Workspace
                  </button>
                </form>
              </div>

              {/* Workspace directory list */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Workspace List</h3>
                  <button
                    onClick={() => setIsCreateGroupOpen(true)}
                    className="px-3 py-1.5 bg-brand-600 hover:bg-brand-500 text-white text-[10px] font-bold uppercase rounded-lg shadow-glass-brand transition-all cursor-pointer flex items-center space-x-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Create Workspace</span>
                  </button>
                </div>

                <DataTable
                  headers={[
                    { name: 'Workspace Name' },
                    { name: 'Workspace ID' },
                    { name: 'Members Count' },
                    { name: 'Actions', className: 'text-center' }
                  ]}
                  data={groups}
                  loading={groupsLoading}
                  emptyMessage="No workspaces available."
                  renderRow={(group) => (
                    <tr key={group.id} className="hover:bg-slate-800/20 transition-colors border-b border-slate-800/40 text-slate-300">
                      <td className="p-4 text-xs font-semibold">
                        <button
                          onClick={() => dispatch(fetchGroupById(group.id))}
                          className="text-white hover:text-brand-400 font-bold text-left block"
                        >
                          {group.name}
                        </button>
                        {group.description && <span className="block text-[10px] text-slate-500 font-normal mt-0.5">{group.description}</span>}
                      </td>
                      <td className="p-4 text-xs font-mono text-slate-400">
                        <div className="flex items-center space-x-1 bg-slate-900 border border-slate-800 px-2 py-0.75 rounded w-fit">
                          <span>{group.id.slice(0, 8)}...</span>
                          <button onClick={() => handleCopyId(group.id)} className="text-slate-500 hover:text-slate-200 transition-colors cursor-pointer">
                            {copiedId === group.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </td>
                      <td className="p-4 text-xs font-medium">
                        {group.memberCount} users
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => dispatch(fetchGroupById(group.id))}
                          className="px-2 py-1 rounded border border-slate-800 hover:bg-slate-800 text-[9px] uppercase font-bold text-white transition-colors"
                        >
                          Manage Members
                        </button>
                      </td>
                    </tr>
                  )}
                />
              </div>

            </div>

            {/* Right Column: Member Inspector */}
            <div className="lg:col-span-1">
              {currentGroup ? (
                <div className="glass-panel p-6 rounded-2xl space-y-6">
                  <div>
                    <h3 className="text-base font-bold text-white leading-tight">{currentGroup.name}</h3>
                    <p className="text-xs text-slate-400 mt-1">{currentGroup.description || 'No description provided.'}</p>
                  </div>

                  <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl space-y-1">
                    <span className="text-[9px] uppercase font-semibold text-slate-500 tracking-wider">Share Workspace ID</span>
                    <div className="flex items-center justify-between font-mono text-xs text-white">
                      <span className="truncate">{currentGroup.id}</span>
                      <button onClick={() => handleCopyId(currentGroup.id)} className="ml-2 p-1 text-slate-500 hover:text-white rounded hover:bg-slate-800 transition-all cursor-pointer">
                        {copiedId === currentGroup.id ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Workspace Members ({currentGroup.members?.length || 0})</h4>
                    <ul className="divide-y divide-slate-800/50">
                      {currentGroup.members?.map((m) => (
                        <li key={m.id} className="py-2 flex items-center justify-between text-xs">
                          <div className="flex items-center space-x-2">
                            <User className="w-4 h-4 text-slate-500" />
                            <div>
                              <p className="font-semibold text-slate-200">
                                {m.user?.name}
                                {m.user?.id === currentUser.id && <span className="ml-1 text-[8px] bg-brand-600 px-1 py-0.25 rounded text-white font-bold">You</span>}
                              </p>
                              <p className="text-[9px] text-slate-500">{m.user?.email}</p>
                            </div>
                          </div>
                          <span className={`text-[8px] font-bold px-1.5 py-0.25 rounded border uppercase tracking-wider ${
                            m.role === 'ADMIN' ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-slate-800 border-slate-700 text-slate-400'
                          }`}>
                            {m.role}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-4 border-t border-slate-800">
                    {currentGroup.members?.some((m) => m.userId === currentUser.id) ? (
                      <button
                        onClick={() => handleLeaveGroup(currentGroup.id)}
                        className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all font-semibold text-xs cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Leave Workspace</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => dispatch(joinGroup(currentGroup.id))}
                        className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white transition-all shadow-glass-brand font-semibold text-xs cursor-pointer"
                      >
                        <LogIn className="w-4 h-4" />
                        <span>Join Workspace</span>
                      </button>
                    )}
                  </div>

                </div>
              ) : (
                <div className="glass-panel p-6 rounded-2xl text-center space-y-2 text-slate-500 py-12">
                  <Info className="w-8 h-8 text-slate-600 mx-auto" />
                  <p className="text-xs font-medium">Select a workspace name in the list to examine active members, copy sharing IDs or trigger leave protocols.</p>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          TAB 2: USER PROVISIONING
          ------------------------------------------------------------- */}
      {activeTab === 'users' && currentUser?.role === 'ADMIN' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Provisioned Analyst Accounts</h3>
              <p className="text-xs text-slate-400">Review system credentials, provision access levels and reset passwords.</p>
            </div>
            <button
              onClick={handleOpenAddUser}
              className="bg-brand-600 hover:bg-brand-500 text-white font-medium px-4 py-2 rounded-xl shadow-glass-brand hover:shadow-brand-500/20 transition-all flex items-center space-x-2 text-xs cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Provision User</span>
            </button>
          </div>

          <DataTable
            headers={[
              { name: 'Full Name' },
              { name: 'Email Address' },
              { name: 'System Role' },
              { name: 'Date Provisioned' },
              { name: 'Actions', className: 'text-center' }
            ]}
            data={users}
            loading={usersLoading}
            renderRow={(user) => (
              <tr key={user.id} className="hover:bg-slate-800/20 transition-colors border-b border-slate-800/40 text-slate-300">
                <td className="p-4 text-xs font-semibold text-white">
                  {user.name}
                  {user.id === currentUser.id && <span className="ml-2 bg-slate-800 border border-slate-700 px-1 py-0.5 rounded text-brand-400 font-bold uppercase text-[8px]">You</span>}
                </td>
                <td className="p-4 text-xs">{user.email}</td>
                <td className="p-4 text-xs">
                  <span className={`px-2 py-0.5 rounded border text-[9px] uppercase font-bold tracking-wider ${
                    user.role === 'ADMIN' ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-brand-500/10 border-brand-500/20 text-brand-400'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="p-4 text-xs text-slate-400">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="p-4 text-center">
                  <div className="flex items-center justify-center space-x-2">
                    <button onClick={() => handleOpenEditUser(user)} className="p-1 text-slate-500 hover:text-brand-400 rounded hover:bg-brand-500/10 transition-colors">
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDeleteUser(user.id)} disabled={user.id === currentUser.id} className="p-1 text-slate-500 hover:text-red-400 rounded hover:bg-red-500/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            )}
          />
        </div>
      )}

      {/* Initialize Workspace Modal */}
      {isCreateGroupOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md glass-panel p-6 rounded-2xl shadow-glass-md relative space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center"><Sparkles className="w-5 h-5 mr-2 text-brand-400" />Initialize Workspace</h3>
              <button onClick={() => setIsCreateGroupOpen(false)} className="text-slate-500 hover:text-white transition-colors cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleCreateGroup} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Workspace Name</label>
                <input type="text" required value={groupName} onChange={(e) => setGroupName(e.target.value)} placeholder="e.g. Content Analytics" className="w-full p-2.5 text-xs rounded-xl glass-input text-white" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Description</label>
                <textarea rows="3" value={groupDesc} onChange={(e) => setGroupDesc(e.target.value)} placeholder="Describe workspace operations..." className="w-full p-2.5 text-xs rounded-xl glass-input text-white resize-none" />
              </div>
              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-800">
                <button type="button" onClick={() => setIsCreateGroupOpen(false)} className="px-4 py-2 rounded-xl border border-slate-800 text-xs text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-medium shadow-glass-brand transition-all cursor-pointer">Create Group</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* User Add/Edit Modal */}
      {isUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md glass-panel p-6 rounded-2xl shadow-glass-md relative space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center">
                <UserCheck className="w-5 h-5 mr-2 text-brand-400" />
                {isEditUserMode ? 'Modify Profile Settings' : 'Provision User'}
              </h3>
              <button onClick={() => setIsUserModalOpen(false)} className="text-slate-500 hover:text-white transition-colors cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleUserSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Full Name</label>
                <input type="text" required value={userName} onChange={(e) => setUserName(e.target.value)} placeholder="e.g. Sarah Jenkins" className="w-full p-2.5 text-xs rounded-xl glass-input text-white" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Email Address</label>
                <input type="email" required value={userEmail} onChange={(e) => setUserEmail(e.target.value)} placeholder="sjenkins@company.com" className="w-full p-2.5 text-xs rounded-xl glass-input text-white" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{isEditUserMode ? 'Update Password (leave blank to retain)' : 'Default Password'}</label>
                <input type="password" required={!isEditUserMode} value={userPassword} onChange={(e) => setUserPassword(e.target.value)} placeholder={isEditUserMode ? '••••••••' : 'password123'} className="w-full p-2.5 text-xs rounded-xl glass-input text-white" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">System Role Type</label>
                <select value={userRole} onChange={(e) => setUserRole(e.target.value)} className="w-full p-2.5 text-xs rounded-xl glass-input text-white bg-dark-900 cursor-pointer">
                  <option value="ANALYST">Analyst (View metrics & saved queries)</option>
                  <option value="ADMIN">Administrator (Full RBAC controls)</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-800">
                <button type="button" onClick={() => setIsUserModalOpen(false)} className="px-4 py-2 rounded-xl border border-slate-800 text-xs text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-medium shadow-glass-brand transition-all cursor-pointer">Save Account</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

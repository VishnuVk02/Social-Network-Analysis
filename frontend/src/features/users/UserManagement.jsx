import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUsers, addUser, modifyUser, removeUser } from './usersSlice';
import DataTable from '../../components/common/DataTable';
import BackButton from '../../components/common/BackButton';
import { 
  Users, 
  UserPlus, 
  Trash2, 
  Edit3, 
  ShieldAlert, 
  X, 
  Check, 
  UserCheck 
} from 'lucide-react';

export default function UserManagement() {
  const dispatch = useDispatch();
  const { user: currentUser } = useSelector((state) => state.auth);
  const { list: users, isLoading, error } = useSelector((state) => state.users);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('ANALYST');

  useEffect(() => {
    if (currentUser?.role === 'ADMIN') {
      dispatch(fetchUsers());
    }
  }, [dispatch, currentUser]);

  // Handle access boundary
  if (currentUser?.role !== 'ADMIN') {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-8">
        <div className="max-w-md w-full glass-panel p-8 rounded-3xl text-center space-y-4">
          <div className="mx-auto w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-white">Access Forbidden</h2>
          <p className="text-sm text-slate-400">
            You do not have administrative permissions to view or edit system users. Please contact your architect.
          </p>
          <BackButton fallbackRoute="/" className="mx-auto mt-2" />
        </div>
      </div>
    );
  }

  const handleOpenAddModal = () => {
    setIsEditMode(false);
    setSelectedUserId(null);
    setName('');
    setEmail('');
    setPassword('');
    setRole('ANALYST');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (user) => {
    setIsEditMode(true);
    setSelectedUserId(user.id);
    setName(user.name);
    setEmail(user.email);
    setPassword(''); // leave blank if no password update
    setRole(user.role);
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (isEditMode) {
      const editPayload = { name, email, role };
      if (password) editPayload.password = password;
      dispatch(modifyUser({ id: selectedUserId, data: editPayload }));
    } else {
      dispatch(addUser({ name, email, password, role }));
    }

    setIsModalOpen(false);
  };

  const handleDeleteUser = (id) => {
    if (id === currentUser.id) {
      alert('You cannot delete your own active administrator account.');
      return;
    }
    if (window.confirm('Are you sure you want to delete this user?')) {
      dispatch(removeUser(id));
    }
  };

  const headers = [
    { name: 'Full Name' },
    { name: 'Email Address' },
    { name: 'System Role' },
    { name: 'Joined Date' },
    { name: 'Actions', className: 'text-center' }
  ];

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header section */}
      <div className="flex flex-col space-y-4 md:flex-row md:justify-between md:items-center md:space-y-0">
        <div className="flex items-center space-x-4">
          <BackButton fallbackRoute="/" />
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">User Management</h1>
            <p className="text-slate-400 text-sm">Provision access roles, update user profiles and edit dashboard authorization.</p>
          </div>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="bg-brand-600 hover:bg-brand-500 text-white font-medium px-4 py-2.5 rounded-xl shadow-glass-indigo hover:shadow-indigo-500/20 transition-all flex items-center space-x-2 text-xs cursor-pointer"
        >
          <UserPlus className="w-4.5 h-4.5" />
          <span>Provision User</span>
        </button>
      </div>

      {/* Error Boundary */}
      {error && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 text-center font-medium">
          {error}
        </div>
      )}

      {/* Users table */}
      <DataTable
        headers={headers}
        data={users}
        loading={isLoading}
        emptyMessage="No users found."
        renderRow={(user) => (
          <tr key={user.id} className="hover:bg-slate-800/20 transition-colors border-b border-slate-800/40 text-slate-300">
            <td className="p-4 text-xs font-semibold text-white">
              {user.name}
              {user.id === currentUser.id && (
                <span className="ml-2 text-[9px] bg-slate-800 border border-slate-700 px-1 py-0.5 rounded text-brand-400 uppercase font-bold">
                  You
                </span>
              )}
            </td>
            <td className="p-4 text-xs">
              {user.email}
            </td>
            <td className="p-4 text-xs">
              <span className={`px-2 py-0.75 rounded-md border text-[10px] uppercase font-bold tracking-wider ${
                user.role === 'ADMIN' 
                  ? 'bg-red-500/10 border-red-500/20 text-red-400' 
                  : 'bg-brand-500/10 border-brand-500/20 text-brand-400'
              }`}>
                {user.role}
              </span>
            </td>
            <td className="p-4 text-xs text-slate-400">
              {new Date(user.createdAt).toLocaleDateString()}
            </td>
            <td className="p-4 text-center">
              <div className="flex items-center justify-center space-x-2">
                <button
                  onClick={() => handleOpenEditModal(user)}
                  className="p-1.5 text-slate-500 hover:text-brand-400 rounded-lg hover:bg-brand-500/10 transition-colors"
                  title="Modify Profile"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteUser(user.id)}
                  disabled={user.id === currentUser.id}
                  className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Revoke User"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </td>
          </tr>
        )}
      />

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md glass-panel p-6 rounded-2xl shadow-glass-md relative space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center">
                <UserCheck className="w-5 h-5 mr-2 text-brand-400" />
                {isEditMode ? 'Modify Profile Settings' : 'Provision System User'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-white transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full name */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sarah Jenkins"
                  className="w-full p-2.5 text-xs rounded-xl glass-input text-white"
                />
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="sjenkins@company.com"
                  className="w-full p-2.5 text-xs rounded-xl glass-input text-white"
                />
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  {isEditMode ? 'Update Password (leave blank to retain)' : 'Default Password'}
                </label>
                <input
                  type="password"
                  required={!isEditMode}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isEditMode ? '••••••••' : 'password123'}
                  className="w-full p-2.5 text-xs rounded-xl glass-input text-white"
                />
              </div>

              {/* System Role */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">System Role Type</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl glass-input text-white bg-dark-900 cursor-pointer"
                >
                  <option value="ANALYST">Analyst (View metrics & post data)</option>
                  <option value="ADMIN">Administrator (Full RBAC controls)</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-800 text-xs text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-medium shadow-glass-indigo transition-all cursor-pointer"
                >
                  Save Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

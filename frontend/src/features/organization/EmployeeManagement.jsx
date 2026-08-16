import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import DataTable from '../../components/common/DataTable';
import BackButton from '../../components/common/BackButton';
import { 
  Users, 
  UserPlus, 
  Trash2, 
  ShieldCheck, 
  Building2, 
  X, 
  Loader2, 
  Mail, 
  Lock, 
  User, 
  Layers 
} from 'lucide-react';

const api = axios.create({
  baseURL: '/api/organization'
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default function EmployeeManagement() {
  const { user } = useSelector((state) => state.auth);

  const [employees, setEmployees] = useState([]);
  const [groups, setGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form inputs
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState('');

  const fetchRoster = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/employees');
      setEmployees(res.data.employees || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch employee roster');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchOrgGroups = async () => {
    try {
      const res = await axios.get('/api/groups', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setGroups(res.data.data || []);
    } catch (err) {
      // Ignore if groups call fails
    }
  };

  useEffect(() => {
    fetchRoster();
    fetchOrgGroups();
  }, []);

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('Please provide name, email, and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post('/employees', {
        name,
        email,
        password,
        groupId: selectedGroupId || null
      });

      setSuccessMsg(`Employee ${name} created successfully.`);
      setName('');
      setEmail('');
      setPassword('');
      setSelectedGroupId('');
      setIsModalOpen(false);
      fetchRoster();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create employee');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEmployee = async (empId, empName) => {
    if (!window.confirm(`Are you sure you want to remove employee ${empName}?`)) return;

    try {
      await api.delete(`/employees/${empId}`);
      setSuccessMsg(`Employee ${empName} removed.`);
      fetchRoster();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete employee');
    }
  };

  const tableHeaders = [
    { name: 'Employee Name' },
    { name: 'Email' },
    { name: 'Role' },
    { name: 'Groups' },
    { name: 'Date Joined' },
    { name: 'Actions' }
  ];

  if (user?.accountType !== 'ORGANIZATION' || user?.role !== 'ADMIN') {
    return (
      <div className="p-8 max-w-lg mx-auto mt-20 rounded-2xl bg-slate-900 border border-rose-500/30 text-center space-y-4 shadow-2xl">
        <div className="w-14 h-14 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 font-black text-2xl flex items-center justify-center mx-auto">
          403
        </div>
        <h2 className="text-xl font-bold text-white">Access Restricted</h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          Employee Management is available exclusively for <strong className="text-emerald-400">Organization Administrators</strong>.
        </p>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 w-full max-w-[1700px] mx-auto min-h-full bg-white text-slate-900">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-6 gap-4">
        <div className="flex items-center space-x-4">
          <BackButton fallbackRoute="/" />
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-3xl font-extrabold text-black tracking-tight">
                Employee Management
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-pine-500/10 border border-pine-500/30 text-pine-700 uppercase tracking-wider">
                {user?.organization?.name || 'Organization'}
              </span>
            </div>
            <p className="text-slate-700 text-xs font-bold mt-0.5">
              Add employees, assign collaboration groups, and manage team access permissions.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs font-bold flex items-center space-x-2 shadow-glass-brand transition-all cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Employee</span>
        </button>
      </div>

      {/* Success / Error Banners */}
      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-400 font-medium">
          {successMsg}
        </div>
      )}
      {error && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-400 font-medium">
          {error}
        </div>
      )}

      {/* Roster Data Table */}
      <DataTable
        headers={tableHeaders}
        data={employees}
        loading={isLoading}
        emptyMessage="No employees created in this organization yet. Click 'Add Employee' to invite your team."
        renderRow={(emp) => (
          <tr 
            key={emp.id}
            className="hover:bg-slate-800/40 transition-all border-b border-slate-800/40 text-slate-300"
          >
            <td className="p-4 text-xs font-bold text-white flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-slate-800 text-slate-300 font-bold text-xs flex items-center justify-center">
                {emp.name.charAt(0)}
              </div>
              <span>{emp.name}</span>
            </td>
            <td className="p-4 text-xs font-mono text-slate-300">
              {emp.email}
            </td>
            <td className="p-4 text-xs font-bold">
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] border font-bold ${
                emp.role === 'ADMIN'
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                  : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              }`}>
                {emp.role}
              </span>
            </td>
            <td className="p-4 text-xs text-slate-400">
              {emp.groups && emp.groups.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {emp.groups.map(g => (
                    <span key={g.id} className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] text-slate-200 font-medium">
                      {g.name}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-[10px] text-slate-500 italic">No Groups</span>
              )}
            </td>
            <td className="p-4 text-xs text-slate-400">
              {new Date(emp.createdAt).toLocaleDateString()}
            </td>
            <td className="p-4 text-xs">
              {emp.id !== user?.id && (
                <button
                  onClick={() => handleDeleteEmployee(emp.id, emp.name)}
                  className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors"
                  title="Remove Employee"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </td>
          </tr>
        )}
      />

      {/* Add Employee Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-6 shadow-2xl relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-lg font-bold text-white flex items-center">
                <UserPlus className="w-5 h-5 mr-2 text-emerald-400" />
                Add Employee to {user?.organization?.name || 'Organization'}
              </h3>
              <p className="text-xs text-slate-400 mt-1">Create credentials for a new team member.</p>
            </div>

            <form onSubmit={handleAddEmployee} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400">Employee Full Name</label>
                <div className="relative flex items-center">
                  <User className="absolute left-3 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jordan Smith"
                    className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl glass-input text-white outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400">Work Email</label>
                <div className="relative flex items-center">
                  <Mail className="absolute left-3 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="jordan@company.com"
                    className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl glass-input text-white outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400">Temporary Password</label>
                <div className="relative flex items-center">
                  <Lock className="absolute left-3 w-4 h-4 text-slate-500" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl glass-input text-white outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {groups.length > 0 && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400">Assign to Group (Optional)</label>
                  <select
                    value={selectedGroupId}
                    onChange={(e) => setSelectedGroupId(e.target.value)}
                    className="w-full px-3 py-2.5 text-xs rounded-xl bg-slate-950 text-slate-200 border border-slate-800 outline-none focus:border-emerald-500"
                  >
                    <option value="">No Group Selected</option>
                    {groups.map(g => (
                      <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-glass-brand flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Creating Employee Account...</span>
                    </>
                  ) : (
                    <span>Create Employee Account</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

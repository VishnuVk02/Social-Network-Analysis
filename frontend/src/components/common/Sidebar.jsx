import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../features/auth/authSlice';
import { stopTelemetryHeartbeat } from '../../utils/telemetry';
import {
  LayoutDashboard,
  LogOut,
  UserCircle,
  Settings,
  Flame,
  Users,
  Tv,
  Github,
  ShieldCheck,
  BarChart3,
  UserCheck,
  MessageSquare,
  FileText
} from 'lucide-react';

export default function Sidebar({ isOpen }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    stopTelemetryHeartbeat();
    dispatch(logout());
    navigate('/login');
  };

  const navItems = [
    { name: 'Overview Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'YouTube Analytics', path: '/youtube', icon: Tv },
    { name: 'GitHub Analytics', path: '/github', icon: Github },
    { name: 'Reports', path: '/reports', icon: FileText },
  ];

  // Groups & Private Messages are available exclusively for Organization accounts
  if (user?.accountType === 'ORGANIZATION') {
    navItems.push({ name: 'Group Management', path: '/groups', icon: Users });
    navItems.push({ name: 'Private Messages', path: '/messages', icon: MessageSquare });
  }

  // Employee Management for Organization Admins
  if (user?.accountType === 'ORGANIZATION' && user?.role === 'ADMIN') {
    navItems.push({ name: 'Employee Management', path: '/employees', icon: UserCheck });
  }

  navItems.push({ name: 'Trends Index', path: '/trends', icon: Flame });
  navItems.push({ name: 'System Settings', path: '/settings', icon: Settings });

  // Admin Application Analytics for System Admins
  if (user?.role === 'ADMIN') {
    navItems.push({ name: 'Application Analytics', path: '/admin/analytics', icon: ShieldCheck });
  }

  return (
    <aside className={`h-screen glass-panel flex flex-col justify-between border-r border-slate-800 text-slate-300 transition-all duration-500 ease-in-out transform shrink-0 z-50 ${
      isOpen ? 'w-64 translate-x-0 opacity-100' : 'w-0 -translate-x-64 opacity-0 border-r-0 overflow-hidden'
    }`}>
      <div className="w-64 flex flex-col justify-between h-full">
        <div>
          {/* Brand Header */}
          <div className="pt-6 px-6 pb-2 flex items-center space-x-3 border-b border-slate-800/80">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-emerald-400 flex items-center justify-center shadow-glass-brand">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-black text-white tracking-wider uppercase">Telemetron</h2>
              <p className="text-[10px] text-slate-400">Analytics Intelligence</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="pt-6 px-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-4 py-2.5 rounded-xl transition-all duration-200 group ${isActive
                      ? 'bg-brand-600 text-white shadow-glass-brand font-medium'
                      : 'hover:bg-slate-800/50 hover:text-slate-100'
                    }`
                  }
                >
                  <Icon className="w-4.5 h-4.5 shrink-0 group-hover:scale-105 transition-transform" />
                  <span className="text-xs font-semibold">{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* User Session profile panel */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40 space-y-3">
          <div className="flex items-center space-x-3 p-1.5">
            <UserCircle className="w-9 h-9 text-slate-400 shrink-0" />
            <div className="overflow-hidden">
              <h4 className="text-xs font-bold text-white truncate">{user?.name || 'User Session'}</h4>
              <div className="flex items-center space-x-1 mt-0.5">
                <span className={`text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.25 rounded-md ${
                  user?.accountType === 'ORGANIZATION' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-brand-500/20 text-brand-400 border border-brand-500/30'
                }`}>
                  {user?.accountType || 'INDIVIDUAL'}
                </span>
                <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.25 rounded-md bg-slate-800 text-slate-300">
                  {user?.role}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-xl border border-slate-800 hover:border-rose-500/30 hover:bg-rose-500/10 hover:text-rose-400 transition-all duration-200 text-xs font-medium cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out Session</span>
          </button>
        </div>
      </div>
    </aside>
  );
}

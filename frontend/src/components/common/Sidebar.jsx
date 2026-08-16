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
    <aside className={`h-screen bg-midnight-800 border-r border-midnight-700/60 text-slate-200 flex flex-col justify-between transition-all duration-500 ease-in-out transform shrink-0 z-50 ${
      isOpen ? 'w-64 translate-x-0 opacity-100' : 'w-0 -translate-x-64 opacity-0 border-r-0 overflow-hidden'
    }`}>
      <div className="w-64 flex flex-col justify-between h-full">
        <div>
          {/* Brand Header */}
          <div className="pt-6 px-6 pb-4 flex items-center justify-between border-b border-midnight-700/60">
            <div>
              <h2 className="text-base font-bold text-white tracking-wider uppercase">Telemetron</h2>
              <p className="text-[10px] text-pine-300 font-medium">Analytics Intelligence</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="pt-6 px-4 space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center px-4 py-2.5 rounded-xl transition-all duration-200 ${isActive
                      ? 'bg-pine-500 text-white font-bold shadow-sm'
                      : 'hover:bg-midnight-700/60 hover:text-white text-slate-300'
                    }`
                  }
                >
                  <Icon className="w-4.5 h-4.5 mr-3 shrink-0" />
                  <span className="text-xs font-semibold">{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* User Session profile panel */}
        <div className="p-4 border-t border-midnight-700/60 bg-midnight-900/60 space-y-3">
          <div className="flex items-center space-x-3 p-1">
            <div className="w-9 h-9 rounded-full border border-midnight-600 bg-midnight-900 text-white font-bold flex items-center justify-center shrink-0 text-xs">
              {(user?.name || 'U').charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <h4 className="text-xs font-bold text-white truncate">{user?.name || 'Nitish J'}</h4>
              <div className="flex items-center space-x-1.5 mt-1">
                <span className={`text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.25 rounded-md ${
                  user?.accountType === 'ORGANIZATION' ? 'bg-pine-500/20 text-pine-300 border border-pine-500/30' : 'bg-midnight-700 text-slate-300 border border-midnight-600'
                }`}>
                  {user?.accountType || 'ORGANIZATION'}
                </span>
                <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.25 rounded-md bg-midnight-700 text-slate-300">
                  {user?.role || 'ADMIN'}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-xl border border-midnight-700 bg-midnight-900/40 hover:border-coral-500/40 hover:bg-coral-500/10 hover:text-coral-400 transition-all duration-200 text-xs font-semibold cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out Session</span>
          </button>
        </div>
      </div>
    </aside>
  );
}

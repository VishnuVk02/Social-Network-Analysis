import React from 'react';
import { useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';

export default function Navbar({ onToggleSidebar, isSidebarOpen }) {
  const location = useLocation();

  const getHeaderTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Overview Dashboard';
    if (path.startsWith('/youtube')) return 'YouTube Analytics';
    if (path.startsWith('/github')) return 'GitHub Analytics';
    if (path === '/groups') return 'Group Management';
    if (path === '/messages') return 'Private Messages';
    if (path === '/reports') return 'Reports';
    if (path === '/employees') return 'Employee Management';
    if (path === '/trends') return 'Trends Index';
    if (path === '/settings') return 'System Settings';
    if (path === '/admin/analytics') return 'Application Analytics';
    return 'Telemetron Analytics';
  };

  return (
    <header className="h-20 border-b border-slate-200 bg-[#F8F9FA] flex items-center justify-between px-8 text-black sticky top-0 z-40 shadow-sm">

      {/* Left side: Slide Toggle and Page Title */}
      <div className="flex items-center space-x-4">
        <button
          onClick={onToggleSidebar}
          className="p-2.5 rounded-xl border border-slate-200 bg-slate-100 text-black hover:bg-slate-200 transition-all cursor-pointer font-bold"
          title={isSidebarOpen ? 'Hide Sidebar' : 'Show Sidebar'}
        >
          <Menu className="w-4.5 h-4.5 text-black" />
        </button>

        <div>
          <h2 className="text-xl font-extrabold text-black tracking-tight">{getHeaderTitle()}</h2>
          <p className="text-xs text-slate-600 font-semibold mt-0.5">Real-time analytical telemetry</p>
        </div>
      </div>

      {/* Right side: Gateway Online status pill */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2 bg-slate-100 border border-slate-200 px-4 py-1.5 rounded-full text-xs text-pine-700 font-extrabold">
          <span className="w-2 h-2 rounded-full bg-pine-500 animate-pulse"></span>
          <span>Gateway Online</span>
        </div>
      </div>

    </header>
  );
}

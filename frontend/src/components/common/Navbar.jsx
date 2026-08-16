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
    if (path === '/employees') return 'Employee Management';
    if (path === '/trends') return 'Trends Index';
    if (path === '/settings') return 'System Settings';
    if (path === '/admin/analytics') return 'Application Analytics';
    return 'Telemetron Analytics';
  };

  return (
    <header className="h-20 border-b border-slate-800/80 bg-slate-900/20 backdrop-blur-md flex items-center justify-between px-8 text-slate-300 relative sticky top-0 z-40">
      
      {/* Left side: Slide Toggle and Page Title */}
      <div className="flex items-center space-x-4">
        <button
          onClick={onToggleSidebar}
          className="p-1.5 rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-900/40 text-slate-400 hover:text-white transition-all cursor-pointer"
          title={isSidebarOpen ? 'Hide Sidebar' : 'Show Sidebar'}
        >
          <Menu className="w-4.5 h-4.5" />
        </button>

        <div>
          <h2 className="text-xl font-semibold text-white tracking-tight">{getHeaderTitle()}</h2>
          <p className="text-xs text-slate-450 mt-0.5">Real-time analytical telemetry</p>
        </div>
      </div>

      {/* Center Top Sticky Project Name */}
      <div className="absolute left-1/2 -translate-x-1/2 text-white font-black text-lg tracking-widest uppercase select-none hidden md:block">
        Telemetron
      </div>

      {/* Right side: Connection status */}
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-2 bg-slate-800/30 border border-slate-800 px-3 py-1.5 rounded-full text-xs text-brand-400 font-medium">
          <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse"></span>
          <span>Gateway Online</span>
        </div>
      </div>

    </header>
  );
}

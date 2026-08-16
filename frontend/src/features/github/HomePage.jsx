import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Flame, GitBranch, Github, Code2, Users2, Cpu, User } from 'lucide-react';

export default function HomePage() {
  const navigate = useNavigate();

  const handleQuickRepo = (owner, repo) => {
    navigate(`/github/repository/${owner}/${repo}`);
  };

  const handleQuickUser = (username) => {
    navigate(`/github/user/${username}`);
  };

  const handleQuickOrg = (org) => {
    navigate(`/github/organization/${org}`);
  };

  const quickRepos = [
    { name: 'react', owner: 'facebook', desc: 'Library for web and native user interfaces.', color: 'from-blue-600 to-cyan-500' },
    { name: 'vscode', owner: 'microsoft', desc: 'Sleek, modular, and fast code editor.', color: 'from-sky-600 to-indigo-500' },
    { name: 'spring-boot', owner: 'spring-projects', desc: 'Production-grade Spring applications framework.', color: 'from-emerald-600 to-teal-500' },
    { name: 'node', owner: 'nodejs', desc: 'Event-driven asynchronous JavaScript runtime.', color: 'from-green-600 to-lime-500' }
  ];

  const quickUsers = [
    { username: 'torvalds', label: 'Linus Torvalds', bio: 'Creator of Linux & Git.' },
    { username: 'gaearon', label: 'Dan Abramov', bio: 'Co-creator of Redux & Hooks.' },
    { username: 'tj', label: 'TJ Holowaychuk', bio: 'Apex software & Express creator.' }
  ];

  const quickOrgs = [
    { name: 'facebook', label: 'Meta Open Source', desc: 'React, PyTorch, React Native.' },
    { name: 'microsoft', label: 'Microsoft Open Source', desc: 'VS Code, TypeScript, .NET.' },
    { name: 'google', label: 'Google Open Source', desc: 'Kubernetes, TensorFlow, Angular.' }
  ];

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto text-slate-300">
      {/* Banner */}
      <div className="glass-panel p-8 rounded-3xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between space-y-6 md:space-y-0">
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
          <Github className="w-56 h-56 text-white" />
        </div>

        <div className="space-y-4 max-w-2xl text-center md:text-left">
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-brand-500/10 border border-brand-500/20 text-brand-400 rounded-md">
            GitHub Analytics Studio
          </span>
          <h1 className="text-3xl font-extrabold text-white tracking-tight leading-tight">
            Comprehensive Telemetry Analysis for GitHub Ecosystems
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            Analyze public repositories, evaluate developer commit frequencies, map organization-wide languages distributions, and view trending open-source projects.
          </p>
          <div className="flex flex-wrap justify-center md:justify-start gap-4">
            <button
              onClick={() => navigate('/github/search')}
              className="inline-flex items-center space-x-2 px-5 py-3 rounded-xl bg-brand-650 hover:bg-brand-600 text-white text-xs font-bold transition-all shadow-glass cursor-pointer"
            >
              <Search className="w-4 h-4" />
              <span>Launch Search Terminal</span>
            </button>
            <button
              onClick={() => navigate('/github/trending')}
              className="inline-flex items-center space-x-2 px-5 py-3 rounded-xl border border-slate-800 bg-slate-900/40 hover:border-brand-500/30 text-slate-300 hover:text-white text-xs font-bold transition-all cursor-pointer"
            >
              <Flame className="w-4 h-4 text-orange-500 animate-pulse" />
              <span>Trending Repositories</span>
            </button>
          </div>
        </div>

        <div className="w-full md:w-fit flex items-center justify-center shrink-0">
          <div className="w-32 h-32 rounded-3xl bg-gradient-to-tr from-slate-800 to-slate-950 border border-slate-700 flex items-center justify-center shadow-glass-brand">
            <Github className="w-16 h-16 text-white" />
          </div>
        </div>
      </div>

      {/* Grid of Quick Launches */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Repositories column */}
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-bold text-white tracking-wide flex items-center">
              <GitBranch className="w-4 h-4 mr-2 text-brand-400" />
              Quick-Launch Repos
            </h3>
            <p className="text-slate-500 text-xs mt-0.5">Explore pre-seeded telemetry for popular repositories.</p>
          </div>

          <div className="flex flex-col gap-4">
            {quickRepos.map((r) => (
              <div
                key={r.name}
                onClick={() => handleQuickRepo(r.owner, r.name)}
                className="glass-panel p-4 rounded-2xl hover:border-brand-500/30 hover:shadow-glass transition-all duration-300 cursor-pointer group flex items-start space-x-4"
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${r.color} flex items-center justify-center text-white shrink-0`}>
                  <Code2 className="w-5 h-5" />
                </div>
                <div className="overflow-hidden">
                  <h4 className="text-sm font-bold text-white group-hover:text-brand-400 transition-colors truncate">
                    {r.owner}/{r.name}
                  </h4>
                  <p className="text-slate-400 text-xs mt-1 leading-relaxed line-clamp-2">
                    {r.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Developer Profiles column */}
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-bold text-white tracking-wide flex items-center">
              <User className="w-4 h-4 mr-2 text-brand-400" />
              Quick-Launch Users
            </h3>
            <p className="text-slate-500 text-xs mt-0.5">Audit developer profiles, star distributions, and languages.</p>
          </div>

          <div className="flex flex-col gap-4">
            {quickUsers.map((u) => (
              <div
                key={u.username}
                onClick={() => handleQuickUser(u.username)}
                className="glass-panel p-4 rounded-2xl hover:border-brand-500/30 hover:shadow-glass transition-all duration-300 cursor-pointer group flex items-center space-x-4"
              >
                <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-brand-400 font-bold shrink-0">
                  {u.username.substring(0, 2).toUpperCase()}
                </div>
                <div className="overflow-hidden">
                  <h4 className="text-sm font-bold text-white group-hover:text-brand-400 transition-colors truncate">
                    {u.label}
                  </h4>
                  <p className="text-slate-400 text-xs mt-0.5 truncate font-mono text-slate-500">
                    @{u.username}
                  </p>
                  <p className="text-slate-400 text-xs mt-1 leading-relaxed line-clamp-1">
                    {u.bio}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Organizations column */}
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-bold text-white tracking-wide flex items-center">
              <Users2 className="w-4 h-4 mr-2 text-brand-400" />
              Quick-Launch Orgs
            </h3>
            <p className="text-slate-500 text-xs mt-0.5">Explore org scale repos distributions and technology usage.</p>
          </div>

          <div className="flex flex-col gap-4">
            {quickOrgs.map((o) => (
              <div
                key={o.name}
                onClick={() => handleQuickOrg(o.name)}
                className="glass-panel p-4 rounded-2xl hover:border-brand-500/30 hover:shadow-glass transition-all duration-300 cursor-pointer group flex items-start space-x-4"
              >
                <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-brand-400 shrink-0">
                  <Cpu className="w-5 h-5 text-indigo-400" />
                </div>
                <div className="overflow-hidden">
                  <h4 className="text-sm font-bold text-white group-hover:text-brand-400 transition-colors truncate">
                    {o.label}
                  </h4>
                  <p className="text-slate-400 text-xs mt-0.5 truncate font-mono text-slate-500">
                    github.com/{o.name}
                  </p>
                  <p className="text-slate-400 text-xs mt-1 leading-relaxed line-clamp-2">
                    {o.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchTrendingIndex } from '../trends/trendsSlice';
import { 
  Flame, 
  LayoutDashboard, 
  Youtube,
  Github,
  Award,
  Cpu,
  Search,
  Code2
} from 'lucide-react';

import { trackAppEvent } from '../../utils/telemetry';

export default function Dashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { trendsData } = useSelector((state) => state.trends);
  const [platform, setPlatform] = useState('youtube'); // 'youtube', 'github'

  useEffect(() => {
    dispatch(fetchTrendingIndex());
    trackAppEvent({ eventType: 'dashboard_view', feature: 'Dashboard', platform: 'Dashboard' });
  }, [dispatch]);

  const previewTopics = trendsData?.topTrendingTopics || [];

  // Quick Launch YouTube Channels
  const handleQuickChannel = (channelName) => {
    navigate(`/youtube/channel/${channelName}`);
  };

  const quickChannels = [
    { name: 'MrBeast', icon: Award, desc: 'Highest subscribed individual channel. Heavy stunts and charity.', color: 'from-blue-600 to-cyan-400' },
    { name: 'OpenAI', icon: Cpu, desc: 'AI research, voice mode presentations, and tech demos.', color: 'from-emerald-600 to-teal-400' },
    { name: 'Fireship', icon: Flame, desc: 'Code reports and 100-second programming guides.', color: 'from-amber-600 to-orange-400' }
  ];

  // Quick Launch GitHub Repositories
  const handleQuickRepo = (owner, repo) => {
    navigate(`/github/repository/${owner}/${repo}`);
  };

  const quickRepos = [
    { name: 'react', owner: 'facebook', desc: 'Library for web and native user interfaces.', color: 'from-blue-600 to-cyan-500' },
    { name: 'vscode', owner: 'microsoft', desc: 'Sleek, modular, and fast code editor.', color: 'from-sky-600 to-indigo-500' },
    { name: 'spring-boot', owner: 'spring-projects', desc: 'Production-grade Spring applications framework.', color: 'from-emerald-600 to-teal-500' },
    { name: 'node', owner: 'nodejs', desc: 'Event-driven asynchronous JavaScript runtime.', color: 'from-green-600 to-lime-500' }
  ];

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      
      {/* Platform Switcher Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-800 pb-5 gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center">
            <LayoutDashboard className="w-6 h-6 mr-2 text-brand-400" />
            Unified Analytics Dashboard
          </h1>
          <p className="text-slate-400 text-xs mt-0.5">Toggle between supported platforms to audit telemetry data.</p>
        </div>

        {/* Switcher Tabs */}
        <div className="flex bg-slate-950/60 border border-slate-800 rounded-xl p-1 space-x-1">
          {[
            { id: 'youtube', label: 'YouTube Analytics', icon: Youtube },
            { id: 'github', label: 'GitHub Analytics', icon: Github }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setPlatform(tab.id)}
                className={`flex items-center space-x-1.5 px-4 py-2 text-xs font-bold rounded-lg transition-all duration-200 cursor-pointer ${
                  platform === tab.id
                    ? 'bg-brand-600 text-white shadow-glass-brand'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Conditional Rendering of Platform Views */}
      {platform === 'youtube' && (
        <div className="space-y-8">
          {/* Welcome banner */}
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">YouTube Analytics Gateway</h2>
              <p className="text-slate-400 text-xs mt-0.5">Search channels, evaluate comment sentiments, and track video performance.</p>
            </div>
          </div>

          {/* Banner Card */}
          <div className="glass-panel p-8 rounded-3xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between space-y-6 md:space-y-0">
            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
              <Youtube className="w-48 h-48 text-white" />
            </div>

            <div className="space-y-4 max-w-2xl text-center md:text-left">
              <h3 className="text-lg font-bold text-white tracking-tight">
                Comprehensive Channel Telemetry and Search
              </h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Connect channels to analyze sentiment distributions, view trending topics, and view historical subscriber growth snapshots.
              </p>
              <button
                onClick={() => navigate('/youtube/search')}
                className="inline-flex items-center space-x-2 px-5 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-all shadow-glass cursor-pointer"
              >
                <Search className="w-4 h-4" />
                <span>Launch YouTube Search</span>
              </button>
            </div>

            <div className="w-full md:w-fit flex items-center justify-center shrink-0">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-450 flex items-center justify-center shadow">
                <Youtube className="w-12 h-12 text-white" />
              </div>
            </div>
          </div>

          {/* Quick-Launch Channels & Trends Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Quick-Launch Channels</h3>
                <p className="text-slate-500 text-xs mt-0.5">Explore pre-seeded telemetry dashboards instantly.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {quickChannels.map((c) => {
                  const Icon = c.icon;
                  return (
                    <div
                      key={c.name}
                      onClick={() => handleQuickChannel(c.name)}
                      className="glass-panel p-5 rounded-2xl hover:border-red-500/30 hover:shadow-glass transition-all duration-300 cursor-pointer group flex flex-col justify-between space-y-4"
                    >
                      <div className="space-y-3">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${c.color} flex items-center justify-center text-white shadow`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white group-hover:text-red-400 transition-colors">
                            {c.name}
                          </h4>
                          <p className="text-slate-400 text-xs mt-1 leading-relaxed line-clamp-3">
                            {c.desc}
                          </p>
                        </div>
                      </div>

                      <span className="text-[10px] text-brand-400 font-bold group-hover:translate-x-1 transition-transform inline-block">
                        Analyze Channel &rarr;
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Trending Keywords Preview */}
            <div className="lg:col-span-1 space-y-4">
              <div>
                <h3 className="text-base font-semibold text-white flex items-center">
                  <Flame className="w-5 h-5 mr-2 text-red-500" />
                  Trends Index Preview
                </h3>
                <p className="text-xs text-slate-400">Popular topics parsed across platforms.</p>
              </div>

              <div className="glass-panel p-5 rounded-2xl flex flex-col space-y-4">
                <ul className="divide-y divide-slate-800/60 text-xs">
                  {previewTopics.slice(0, 5).map((t, idx) => (
                    <li key={t.id || idx} className="py-2.5 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-500">#{idx + 1}</span>
                        <span className="font-bold text-white font-mono">{t.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] text-slate-400">Score: {t.trendScore}</span>
                        <span className="text-[10px] text-emerald-400 border border-emerald-500/20 bg-emerald-500/10 px-1 py-0.25 rounded font-bold">
                          +{t.growthRate}%
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => navigate('/trends')}
                  className="w-full text-center text-xs text-brand-400 hover:text-white font-semibold transition-colors pt-2 cursor-pointer"
                >
                  View Full Trends Grid &rarr;
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {platform === 'github' && (
        <div className="space-y-8">
          {/* Welcome banner */}
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">GitHub Analytics Gateway</h2>
              <p className="text-slate-400 text-xs mt-0.5">Analyze public repositories, evaluate developer profiles and track organization metrics.</p>
            </div>
          </div>

          {/* Banner Card */}
          <div className="glass-panel p-8 rounded-3xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between space-y-6 md:space-y-0">
            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
              <Github className="w-48 h-48 text-white" />
            </div>

            <div className="space-y-4 max-w-2xl text-center md:text-left">
              <h3 className="text-lg font-bold text-white tracking-tight">
                Complete Repository and Profile Telemetry Search
              </h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Connect and audit repositories to evaluate resolved issue ratios, pull request velocities, commit timelines and language distributions.
              </p>
              <div className="flex flex-wrap justify-center md:justify-start gap-4">
                <button
                  onClick={() => navigate('/github/search')}
                  className="inline-flex items-center space-x-2 px-5 py-3 rounded-xl bg-brand-650 hover:bg-brand-600 text-white text-xs font-bold transition-all shadow-glass cursor-pointer"
                >
                  <Search className="w-4 h-4" />
                  <span>Launch GitHub Search</span>
                </button>
                <button
                  onClick={() => navigate('/github/trending')}
                  className="inline-flex items-center space-x-2 px-5 py-3 rounded-xl border border-slate-800 bg-slate-900/40 hover:border-brand-500/30 text-slate-350 hover:text-white text-xs font-bold transition-all cursor-pointer"
                >
                  <Flame className="w-4 h-4 text-orange-500 animate-pulse" />
                  <span>Trending Repositories</span>
                </button>
              </div>
            </div>

            <div className="w-full md:w-fit flex items-center justify-center shrink-0">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-slate-800 to-slate-950 border border-slate-700 flex items-center justify-center shadow">
                <Github className="w-12 h-12 text-white" />
              </div>
            </div>
          </div>

          {/* Quick-Launch Repositories */}
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Quick-Launch Repositories</h3>
              <p className="text-slate-500 text-xs mt-0.5">Explore pre-seeded telemetry dashboards instantly.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {quickRepos.map((r) => (
                <div
                  key={r.name}
                  onClick={() => handleQuickRepo(r.owner, r.name)}
                  className="glass-panel p-5 rounded-2xl hover:border-brand-500/30 hover:shadow-glass transition-all duration-300 cursor-pointer group flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${r.color} flex items-center justify-center text-white shadow`}>
                      <Code2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white group-hover:text-brand-450 transition-colors truncate">
                        {r.owner}/{r.name}
                      </h4>
                      <p className="text-slate-400 text-xs mt-1 leading-relaxed line-clamp-3">
                        {r.desc}
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] text-brand-400 font-bold group-hover:translate-x-1 transition-transform inline-block">
                    Analyze Repo &rarr;
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

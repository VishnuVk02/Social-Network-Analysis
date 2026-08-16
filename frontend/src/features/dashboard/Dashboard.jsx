import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchTrendingIndex } from '../trends/trendsSlice';
import { trackAppEvent } from '../../utils/telemetry';
import { Search, Youtube, Github, Users, Cpu, Code2 } from 'lucide-react';

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
    { name: 'MrBeast', icon: Users, desc: 'Highest subscribed individual channel. Heavy stunts and charity.' },
    { name: 'OpenAI', icon: Cpu, desc: 'AI research, voice mode presentations, and tech demos.' },
    { name: 'Fireship', icon: Code2, desc: 'Code reports and 100-second programming guides.' }
  ];

  // Quick Launch GitHub Repositories
  const handleQuickRepo = (owner, repo) => {
    navigate(`/github/repository/${owner}/${repo}`);
  };

  const quickRepos = [
    { name: 'react', owner: 'facebook', desc: 'Library for web and native user interfaces.' },
    { name: 'vscode', owner: 'microsoft', desc: 'Sleek, modular, and fast code editor.' },
    { name: 'spring-boot', owner: 'spring-projects', desc: 'Production-grade Spring applications framework.' },
    { name: 'node', owner: 'nodejs', desc: 'Event-driven asynchronous JavaScript runtime.' }
  ];

  return (
    <div className="min-h-full bg-[#EFE9E9] p-8 space-y-8 w-full max-w-[1700px] mx-auto text-slate-900">

      {/* Platform Switcher Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-200 pb-5 gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-black tracking-tight">
            Unified Analytics Dashboard
          </h1>
          <p className="text-slate-700 text-xs font-bold mt-0.5">Toggle between supported platforms to audit telemetry data.</p>
        </div>

        {/* Switcher Tabs */}
        <div className="flex bg-slate-100 border border-slate-200 rounded-xl p-1 space-x-1">
          {[
            { id: 'youtube', label: 'YouTube Analytics' },
            { id: 'github', label: 'GitHub Analytics' }
          ].map((tab) => {
            return (
              <button
                key={tab.id}
                onClick={() => setPlatform(tab.id)}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all duration-200 cursor-pointer ${platform === tab.id
                  ? 'bg-pine-500 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200'
                  }`}
              >
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
          <div>
            <h2 className="text-xl font-extrabold text-black tracking-tight">YouTube Analytics Gateway</h2>
            <p className="text-slate-700 text-xs font-bold mt-0.5">Search channels, evaluate comment sentiments, and track video performance.</p>
          </div>

          {/* Banner Card - Dark Midnight Green Card on White Canvas */}
          <div className="bg-midnight-800 border border-midnight-700/60 p-8 rounded-3xl text-white relative overflow-hidden flex flex-col md:flex-row items-center justify-between space-y-6 md:space-y-0 shadow-sm">
            <div className="flex items-start space-x-5 max-w-2xl">
              <div className="w-12 h-12 rounded-full border border-pine-500/30 bg-pine-500/20 text-white flex items-center justify-center shrink-0 mt-1">
                <Youtube className="w-6 h-6 text-white" />
              </div>
              <div className="space-y-3">
                <h3 className="text-lg font-extrabold text-white tracking-tight">
                  Comprehensive Channel Telemetry and Search
                </h3>
                <p className="text-slate-300 text-xs leading-relaxed">
                  Connect channels to analyze sentiment distributions, view trending topics, and view historical subscriber growth snapshots.
                </p>
                <button
                  onClick={() => navigate('/youtube')}
                  className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-pine-500 hover:bg-pine-600 text-white text-xs font-bold transition-all shadow-sm cursor-pointer mt-2"
                >
                  <Search className="w-4 h-4 mr-1" />
                  <span>Launch YouTube Search</span>
                </button>
              </div>
            </div>
          </div>

          {/* Quick-Launch Channels & Trends Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div>
                <h3 className="text-sm font-extrabold text-black uppercase tracking-wider">Quick-Launch Channels</h3>
                <p className="text-slate-700 text-xs font-bold mt-0.5">Explore pre-seeded telemetry dashboards instantly.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {quickChannels.map((c) => {
                  const Icon = c.icon;
                  return (
                    <div
                      key={c.name}
                      onClick={() => handleQuickChannel(c.name)}
                      className="bg-midnight-800 border border-midnight-700/60 p-6 rounded-2xl hover:border-pine-500/50 transition-all duration-300 cursor-pointer group flex flex-col justify-between space-y-5 shadow-sm"
                    >
                      <div className="space-y-3">
                        <div className="w-10 h-10 rounded-xl bg-pine-500/20 border border-pine-500/30 text-pine-400 flex items-center justify-center">
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-base font-bold text-white group-hover:text-pine-300 transition-colors">
                            {c.name}
                          </h4>
                          <p className="text-slate-300 text-xs leading-relaxed mt-1 line-clamp-3">
                            {c.desc}
                          </p>
                        </div>
                      </div>

                      <span className="text-xs text-pine-400 font-bold group-hover:translate-x-1 transition-transform inline-block">
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
                <h3 className="text-sm font-extrabold text-black tracking-tight">
                  Trends Index Preview
                </h3>
                <p className="text-slate-700 text-xs font-bold mt-0.5">Popular topics parsed across platforms.</p>
              </div>

              <div className="bg-midnight-800 border border-midnight-700/60 p-6 rounded-2xl flex flex-col space-y-4 shadow-sm text-white">
                <ul className="divide-y divide-midnight-700/50 text-xs">
                  {previewTopics.slice(0, 5).map((t, idx) => (
                    <li key={t.id || idx} className="py-3 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-400">#{idx + 1}</span>
                        <span className="font-bold text-white font-mono">{t.name}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-[10px] text-slate-400">Score: {t.trendScore}</span>
                        <span className="text-[10px] text-pine-300 border border-pine-500/30 bg-pine-500/20 px-2 py-0.5 rounded-md font-bold">
                          +{t.growthRate}%
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => navigate('/trends')}
                  className="w-full text-center text-xs text-pine-400 hover:text-pine-300 font-bold transition-colors pt-2 cursor-pointer"
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
          <div>
            <h2 className="text-xl font-extrabold text-black tracking-tight">GitHub Analytics Gateway</h2>
            <p className="text-slate-700 text-xs font-bold mt-0.5">Analyze public repositories, evaluate developer profiles and track organization metrics.</p>
          </div>

          {/* Banner Card */}
          <div className="bg-midnight-800 border border-midnight-700/60 p-8 rounded-3xl text-white relative overflow-hidden flex flex-col md:flex-row items-center justify-between space-y-6 md:space-y-0 shadow-sm">
            <div className="flex items-start space-x-5 max-w-2xl">
              <div className="w-12 h-12 rounded-full border border-pine-500/30 bg-pine-500/20 text-white flex items-center justify-center shrink-0 mt-1">
                <Github className="w-6 h-6 text-white" />
              </div>
              <div className="space-y-3">
                <h3 className="text-lg font-bold text-white tracking-tight">
                  Complete Repository and Profile Telemetry Search
                </h3>
                <p className="text-slate-300 text-xs leading-relaxed">
                  Connect and audit repositories to evaluate resolved issue ratios, pull request velocities, commit timelines and language distributions.
                </p>
                <div className="flex flex-wrap gap-3 mt-2">
                  <button
                    onClick={() => navigate('/github/search')}
                    className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-pine-500 hover:bg-pine-600 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                  >
                    <Search className="w-4 h-4 mr-1" />
                    <span>Launch GitHub Search</span>
                  </button>
                  <button
                    onClick={() => navigate('/github/trending')}
                    className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl border border-midnight-600 bg-midnight-900 hover:bg-midnight-700 text-slate-200 text-xs font-bold transition-all cursor-pointer"
                  >
                    <span>Trending Repositories</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Quick-Launch Repositories */}
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-extrabold text-black uppercase tracking-wider">Quick-Launch Repositories</h3>
              <p className="text-slate-700 text-xs font-bold mt-0.5">Explore pre-seeded telemetry dashboards instantly.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {quickRepos.map((r) => (
                <div
                  key={r.name}
                  onClick={() => handleQuickRepo(r.owner, r.name)}
                  className="bg-midnight-800 border border-midnight-700/60 p-6 rounded-2xl hover:border-pine-500/50 transition-all duration-300 cursor-pointer group flex flex-col justify-between space-y-5 shadow-sm"
                >
                  <div className="space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-pine-500/20 border border-pine-500/30 text-pine-400 flex items-center justify-center">
                      <Code2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-white group-hover:text-pine-300 transition-colors truncate">
                        {r.owner}/{r.name}
                      </h4>
                      <p className="text-slate-300 text-xs leading-relaxed mt-1 line-clamp-3">
                        {r.desc}
                      </p>
                    </div>
                  </div>

                  <span className="text-xs text-pine-400 font-bold group-hover:translate-x-1 transition-transform inline-block">
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

import React, { useState } from 'react';
import { 
  X, 
  Flame, 
  Youtube, 
  Github, 
  TrendingUp, 
  ExternalLink, 
  RefreshCw, 
  Star, 
  GitFork, 
  Eye, 
  CheckCircle2, 
  Tag 
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';

export default function TopicDetailModal({ isOpen, onClose, topicDetail, isLoading, onSelectTopic }) {
  const [activeTab, setActiveTab] = useState('youtube'); // 'youtube' | 'github'

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md transition-opacity">
      <div className="glass-panel w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-800 p-6 md:p-8 space-y-6 shadow-2xl relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-xl border border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {isLoading || !topicDetail ? (
          <div className="h-96 flex flex-col items-center justify-center space-y-4">
            <RefreshCw className="w-10 h-10 text-brand-500 animate-spin" />
            <p className="text-sm text-slate-400 font-medium">Aggregating YouTube & GitHub signals...</p>
          </div>
        ) : (
          <>
            {/* Modal Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 pb-5 gap-4">
              <div>
                <div className="flex items-center space-x-3 mb-1">
                  <span className="px-2.5 py-1 rounded-md bg-brand-500/10 border border-brand-500/20 text-brand-400 text-[10px] uppercase font-bold tracking-wider flex items-center space-x-1">
                    <Tag className="w-3 h-3 mr-1" />
                    {topicDetail.category}
                  </span>
                  <span className="text-xs text-emerald-400 font-bold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                    +{topicDetail.growthRate}% Growth
                  </span>
                </div>
                <h2 className="text-3xl font-black text-white tracking-tight flex items-center">
                  {topicDetail.name}
                  <span className="ml-3 text-xs font-semibold text-slate-400 bg-slate-850 px-3 py-1 rounded-full border border-slate-800">
                    Status: {topicDetail.status}
                  </span>
                </h2>
              </div>

              {/* Overall Trend Score Badge */}
              <div className="flex items-center space-x-4 bg-slate-900/60 border border-slate-800 p-3.5 rounded-2xl shrink-0">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white font-black text-xl shadow">
                  {topicDetail.overallTrendScore}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Combined Trend Score</h4>
                  <p className="text-[10px] text-slate-400">Normalized YouTube + GitHub Signal</p>
                </div>
              </div>
            </div>

            {/* Platform Signals Tabs */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-base font-bold text-white flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-brand-400" />
                  Platform Breakdown
                </h3>

                <div className="flex bg-slate-950/60 border border-slate-800 rounded-xl p-1 space-x-1">
                  <button
                    onClick={() => setActiveTab('youtube')}
                    className={`flex items-center space-x-1.5 px-4 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      activeTab === 'youtube'
                        ? 'bg-red-600 text-white shadow-glass'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Youtube className="w-3.5 h-3.5" />
                    <span>YouTube Signal</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('github')}
                    className={`flex items-center space-x-1.5 px-4 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      activeTab === 'github'
                        ? 'bg-slate-800 text-white border border-slate-700 shadow-glass'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Github className="w-3.5 h-3.5" />
                    <span>GitHub Signal</span>
                  </button>
                </div>
              </div>

              {/* Tab Content */}
              {activeTab === 'youtube' && (
                <div className="glass-panel p-6 rounded-2xl space-y-4 border border-red-500/20 bg-gradient-to-br from-red-950/10 via-dark-900 to-dark-950">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Activity Score</span>
                      <p className="text-xl font-bold text-red-400 mt-1">{topicDetail.youtube.activityScore} / 100</p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Growth Rate</span>
                      <p className="text-xl font-bold text-emerald-400 mt-1">{topicDetail.youtube.growthRate}</p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Mentions & Views</span>
                      <p className="text-xl font-bold text-white mt-1">{topicDetail.youtube.mentions}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2">Popular YouTube Videos & Topics</h4>
                    <div className="space-y-2">
                      {topicDetail.youtube.relatedVideos.map((v, idx) => (
                        <div key={idx} className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/80 flex items-center justify-between">
                          <div className="flex items-center space-x-3 overflow-hidden">
                            <Youtube className="w-5 h-5 text-red-500 shrink-0" />
                            <div className="truncate">
                              <h5 className="text-xs font-semibold text-white truncate">{v.title}</h5>
                              <p className="text-[10px] text-slate-400">Channel: {v.channel}</p>
                            </div>
                          </div>
                          <span className="text-[10px] font-bold text-slate-300 bg-slate-800 px-2 py-1 rounded shrink-0 flex items-center">
                            <Eye className="w-3 h-3 mr-1 text-slate-400" />
                            {v.views} views
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'github' && (
                <div className="glass-panel p-6 rounded-2xl space-y-4 border border-slate-700/40 bg-gradient-to-br from-slate-900/30 via-dark-900 to-dark-950">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Activity Score</span>
                      <p className="text-xl font-bold text-brand-400 mt-1">{topicDetail.github.activityScore} / 100</p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Growth Rate</span>
                      <p className="text-xl font-bold text-emerald-400 mt-1">{topicDetail.github.growthRate}</p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Repositories Count</span>
                      <p className="text-xl font-bold text-white mt-1">{topicDetail.github.repositoryCount}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2">High Impact GitHub Repositories</h4>
                    <div className="space-y-2">
                      {topicDetail.github.relatedRepos.map((r, idx) => (
                        <div key={idx} className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/80 flex items-center justify-between">
                          <div className="flex items-center space-x-3 overflow-hidden">
                            <Github className="w-5 h-5 text-slate-300 shrink-0" />
                            <div className="truncate">
                              <h5 className="text-xs font-mono font-bold text-white truncate">{r.repo}</h5>
                              <p className="text-[10px] text-slate-400">Open source repository</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3 shrink-0">
                            <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded flex items-center">
                              <Star className="w-3 h-3 mr-1" />
                              {r.stars}
                            </span>
                            <span className="text-[10px] font-bold text-slate-300 bg-slate-800 px-2 py-0.5 rounded flex items-center">
                              <GitFork className="w-3 h-3 mr-1 text-slate-400" />
                              {r.forks}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Timeline Line Chart */}
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-3">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center">
                  <TrendingUp className="w-4 h-4 mr-2 text-brand-400" />
                  7-Day Cross-Platform Activity Timeline
                </h4>
                <p className="text-xs text-slate-400">Normalized daily volume progression across YouTube, GitHub, and Combined score.</p>
              </div>

              <div className="w-full h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={topicDetail.history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }} 
                    />
                    <Legend verticalAlign="top" height={30} wrapperStyle={{ fontSize: 11, color: '#94a3b8' }} />
                    <Line type="monotone" dataKey="youtube" name="YouTube Signal" stroke="#ef4444" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="github" name="GitHub Signal" stroke="#38bdf8" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="combined" name="Combined Score" stroke="#6366f1" strokeWidth={3} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Related Topics */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Related Topics in {topicDetail.category}</h4>
              <div className="flex flex-wrap gap-2">
                {topicDetail.relatedTopics.map((rel, idx) => (
                  <button
                    key={idx}
                    onClick={() => onSelectTopic(rel.name)}
                    className="px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold transition-all cursor-pointer flex items-center space-x-2"
                  >
                    <span>{rel.name}</span>
                    <span className="text-[10px] text-emerald-400 font-bold">+{rel.growthRate}%</span>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  );
}

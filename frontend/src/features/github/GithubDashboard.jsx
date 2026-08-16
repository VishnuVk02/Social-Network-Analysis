import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  fetchTrendingRepositories, 
  fetchGithubNews, 
  fetchGithubLanguages, 
  fetchTopDevelopers, 
  fetchGithubInsights 
} from './githubSlice';
import { 
  selectGithubTrending, 
  selectGithubNews, 
  selectGithubLanguages, 
  selectTopDevelopers, 
  selectGithubInsights,
  selectGithubLoading,
  selectGithubError
} from './githubSelectors';
import SearchPage from './SearchPage';
import Loader from '../../components/common/Loader';
import ErrorState from '../../components/common/ErrorState';
import BackButton from '../../components/common/BackButton';
import { 
  Compass, 
  Flame, 
  Cpu, 
  Newspaper, 
  Users, 
  GitBranch, 
  Search,
  Star,
  GitFork,
  Activity,
  Code2,
  Calendar,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  UserCheck
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1'];

export default function GithubDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('explore');
  const [sortBy, setSortBy] = useState('intelligenceScore');

  const trending = useSelector(selectGithubTrending);
  const news = useSelector(selectGithubNews);
  const languages = useSelector(selectGithubLanguages);
  const topDevelopers = useSelector(selectTopDevelopers);
  const insights = useSelector(selectGithubInsights);
  const isLoading = useSelector(selectGithubLoading);
  const error = useSelector(selectGithubError);

  useEffect(() => {
    dispatch(fetchGithubInsights());
    dispatch(fetchTrendingRepositories(sortBy));
    dispatch(fetchGithubNews());
    dispatch(fetchGithubLanguages());
    dispatch(fetchTopDevelopers());
  }, [dispatch, sortBy]);

  if (isLoading && (!trending.repositories || trending.repositories.length === 0)) {
    return (
      <div className="p-8 w-full px-10 text-slate-350">
        <Loader message="Loading GitHub Trends and Intelligence data collector..." />
      </div>
    );
  }

  const sidebarItems = [
    { id: 'explore', label: 'Explore Hub', icon: Compass, desc: 'Insights and summary' },
    { id: 'trending', label: 'Trending Repos', icon: Flame, desc: 'Fastest growing repos' },
    { id: 'technology', label: 'Technology Trends', icon: Cpu, desc: 'Languages distribution' },
    { id: 'news', label: 'GitHub News', icon: Newspaper, desc: 'OS updates & releases' },
    { id: 'developers', label: 'Trending Devs', icon: Users, desc: 'Top developer rosters' },
    { id: 'analytics', label: 'Repo Analytics', icon: Search, desc: 'Audit specific repositories' }
  ];

  return (
    <div className="p-8 w-full px-12 text-slate-350 space-y-10">
      
      {/* Page Header */}
      <div className="flex items-center space-x-5">
        <BackButton fallbackRoute="/" />
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center">
            <Compass className="w-8 h-8 mr-3 text-brand-400" />
            GitHub Trends & Intelligence Dashboard
          </h1>
          <p className="text-slate-400 text-sm">Explore real-time telemetry updates, news, and technology analytics on GitHub.</p>
        </div>
      </div>

      {error && <ErrorState error={error} />}

      {/* Tab Menu Navigation (Horizontal style matching YouTube Analytics) */}
      <div className="flex space-x-2 border-b border-slate-800 pb-px w-full overflow-x-auto scrollbar-none">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center space-x-2 shrink-0 ${
                activeTab === item.id
                  ? 'border-brand-500 text-brand-400 font-bold'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className={`w-4 h-4 ${activeTab === item.id ? 'text-brand-400' : 'text-slate-500'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Details Panel Viewport */}
      <div className="w-full space-y-8">
        
        {/* Sub-view: Explore Hub */}
        {activeTab === 'explore' && insights && (
          <div className="space-y-8">
            
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              {[
                { label: 'Trending Repos', value: insights.totalTrendingRepositories, icon: GitBranch, color: 'text-indigo-400 bg-indigo-500/10' },
                { label: 'Total Stars Volume', value: insights.totalStars.toLocaleString(), icon: Star, color: 'text-yellow-400 bg-yellow-500/10' },
                { label: 'Total Forks Volume', value: insights.totalForks.toLocaleString(), icon: GitFork, color: 'text-blue-400 bg-blue-500/10' },
                { label: 'Total Contributors', value: insights.totalContributors.toLocaleString(), icon: Users, color: 'text-teal-400 bg-teal-500/10' },
                { label: 'Dominant Tech', value: insights.mostPopularLanguage, icon: Code2, color: 'text-emerald-400 bg-emerald-500/10' }
              ].map((card, idx) => {
                const Icon = card.icon;
                return (
                  <div key={idx} className="glass-panel p-6 rounded-2xl flex flex-col justify-between space-y-4 shadow-glass-md">
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">{card.label}</span>
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-extrabold text-white font-mono truncate">{card.value}</span>
                      <div className={`p-2 rounded-lg ${card.color}`}>
                        <Icon className="w-4.5 h-4.5" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Grid: Mini table + Tech distributions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Mini Repos list */}
              <div className="glass-panel p-8 rounded-3xl space-y-6 shadow-glass-md">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold text-white uppercase tracking-wider">Top Intelligence Repositories</h3>
                  <button 
                    onClick={() => setActiveTab('trending')} 
                    className="text-xs text-brand-450 hover:text-white font-bold transition-all cursor-pointer flex items-center"
                  >
                    <span>Explore All</span>
                    <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                  </button>
                </div>
                <ul className="divide-y divide-slate-850">
                  {trending.repositories?.slice(0, 4).map((r, idx) => (
                    <li key={r.id} className="py-4 flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-3 overflow-hidden">
                        <span className="font-bold text-slate-500 font-mono">#{idx+1}</span>
                        <div className="overflow-hidden">
                          <span className="font-bold text-white truncate block font-mono">{r.full_name}</span>
                          <span className="text-xs text-slate-500 block truncate">{r.description}</span>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-brand-400 bg-brand-500/10 border border-brand-500/20 px-3 py-1 rounded font-mono ml-4 shrink-0">
                        Score: {r.intelligenceScore}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Tech frequencies chart */}
              <div className="glass-panel p-8 rounded-3xl space-y-6 shadow-glass-md flex flex-col justify-between">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold text-white uppercase tracking-wider">Primary Language Distribution</h3>
                  <button 
                    onClick={() => setActiveTab('technology')}
                    className="text-xs text-brand-450 hover:text-white font-bold transition-all cursor-pointer flex items-center"
                  >
                    <span>View Trends</span>
                    <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                  </button>
                </div>
                <div className="h-72 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={trending.trendingTechnologies?.slice(0, 5)}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={95}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {trending.trendingTechnologies?.slice(0, 5).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: 'rgba(10, 10, 10, 0.9)', borderColor: 'rgba(255,255,255,0.08)', borderRadius: '10px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                {/* Languages list / legend */}
                <div className="grid grid-cols-2 gap-3 text-xs font-semibold pt-4 border-t border-slate-800/60">
                  {trending.trendingTechnologies?.slice(0, 4).map((lang, idx) => (
                    <div key={lang.name} className="flex items-center space-x-2">
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                      <span className="text-slate-350 truncate">{lang.name}</span>
                      <span className="text-white font-mono ml-auto">{lang.value} repos</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        )}

          {/* Sub-view: Trending Repositories */}
          {activeTab === 'trending' && (
            <div className="space-y-8">
              
              {/* Sort filter Controls */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-slate-900/40 border border-slate-800 p-6 rounded-2xl gap-6 shadow-glass-md">
                <div>
                  <h3 className="text-lg font-extrabold text-white uppercase tracking-wider">Filter & Sort Roster</h3>
                  <p className="text-slate-500 text-xs">Rank repositories based on stars count, fork counts, or intelligence score.</p>
                </div>
                <div className="flex bg-slate-950 border border-slate-850 rounded-xl p-1 space-x-1">
                  {[
                    { id: 'intelligenceScore', label: 'Intelligence Score' },
                    { id: 'stars', label: 'Stars' },
                    { id: 'forks', label: 'Forks' },
                    { id: 'updatedAt', label: 'Recently Active' }
                  ].map((filter) => (
                    <button
                      key={filter.id}
                      onClick={() => setSortBy(filter.id)}
                      className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                        sortBy === filter.id
                          ? 'bg-brand-650 text-white'
                          : 'text-slate-450 hover:text-slate-200'
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grid of Repository Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {trending.repositories?.map((r) => (
                  <div key={r.id} className="glass-panel p-8 rounded-3xl flex flex-col justify-between space-y-6 hover:border-brand-500/25 transition-all shadow-glass-md">
                    
                    <div className="space-y-4">
                      {/* Title block */}
                      <div className="flex justify-between items-start gap-4">
                        <div className="overflow-hidden">
                          <span className="text-xs text-slate-500 block font-mono">@{r.owner.login}</span>
                          <span className="text-lg font-extrabold text-white block truncate font-mono mt-0.5">{r.name}</span>
                        </div>
                        <span className="text-xs font-black text-brand-400 bg-brand-500/10 border border-brand-500/25 px-2.5 py-1 rounded font-mono shrink-0">
                          IQ Score: {r.intelligenceScore}
                        </span>
                      </div>
                      
                      {/* Description */}
                      <p className="text-slate-400 text-xs leading-relaxed line-clamp-3">
                        {r.description || 'No description provided.'}
                      </p>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 border-t border-b border-slate-850 py-4 text-center text-sm font-semibold">
                      <div className="space-y-0.5">
                        <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">Stars</span>
                        <span className="text-white font-mono font-bold">{r.stargazers_count.toLocaleString()}</span>
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">Forks</span>
                        <span className="text-white font-mono font-bold">{r.forks_count.toLocaleString()}</span>
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">Language</span>
                        <span className="text-brand-400 truncate block font-mono">{r.language || 'Markdown'}</span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex justify-between items-center text-xs font-bold pt-2">
                      <a
                        href={r.repoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-1.5 text-slate-400 hover:text-white transition-colors"
                      >
                        <span>GitHub URL</span>
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      <button
                        onClick={() => navigate(`/github/repository/${r.owner.login}/${r.name}`)}
                        className="px-4.5 py-2.5 rounded-xl bg-brand-650 hover:bg-brand-600 text-white shadow-glass cursor-pointer"
                      >
                        Analyze Repo Details
                      </button>
                    </div>

                  </div>
                ))}
              </div>

            </div>
          )}

          {/* Sub-view: Technology Trends */}
          {activeTab === 'technology' && (
            <div className="space-y-8">
              
              {/* Technology Distribution Pie & Bar charts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Pie Chart of Frequencies */}
                <div className="glass-panel p-8 rounded-3xl space-y-6 shadow-glass-md">
                  <div>
                    <h3 className="text-lg font-extrabold text-white uppercase tracking-wider">Technology Frequency</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Primary language occurrences count in trending repo list.</p>
                  </div>
                  <div className="w-full h-96 flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={languages}
                          cx="50%"
                          cy="50%"
                          innerRadius={80}
                          outerRadius={120}
                          paddingAngle={3}
                          dataKey="frequency"
                          nameKey="languageName"
                        >
                          {languages.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: 'rgba(10, 10, 10, 0.9)', borderColor: 'rgba(255,255,255,0.08)', borderRadius: '10px' }} />
                        <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: 11, color: '#94a3b8' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Bar Chart of Trend Scores */}
                <div className="glass-panel p-8 rounded-3xl space-y-6 shadow-glass-md">
                  <div>
                    <h3 className="text-lg font-extrabold text-white uppercase tracking-wider">Technology Trend Score</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Calculated score based on stargazer volume and growth rates.</p>
                  </div>
                  <div className="w-full h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={languages} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis dataKey="languageName" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                        <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                        <Tooltip contentStyle={{ backgroundColor: 'rgba(10, 10, 10, 0.9)', borderColor: 'rgba(255,255,255,0.08)', borderRadius: '12px' }} />
                        <Bar dataKey="trendScore" name="Trend Score" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={30}>
                          {languages.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

              </div>

              {/* Technologies Table */}
              <div className="glass-panel p-8 rounded-3xl space-y-6 shadow-glass-md">
                <h3 className="text-lg font-extrabold text-white uppercase tracking-wider">Technology Trend Index</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs md:text-sm">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-500 uppercase font-bold tracking-wider">
                        <th className="pb-4 pl-2">Language</th>
                        <th className="pb-4 text-right">Roster Frequency</th>
                        <th className="pb-4 text-right">Trend Score</th>
                        <th className="pb-4 text-right pr-2">Last captured</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                      {languages.map((lang, idx) => (
                        <tr key={lang.id} className="hover:bg-slate-800/20 text-slate-300">
                          <td className="py-4 pl-2 flex items-center space-x-2.5 font-bold text-white">
                            <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                            <span className="font-mono text-xs md:text-sm">{lang.languageName}</span>
                          </td>
                          <td className="py-4 text-right font-mono font-bold text-white">
                            {lang.frequency} repos
                          </td>
                          <td className="py-4 text-right font-mono text-brand-400 font-black">
                            {lang.trendScore} pts
                          </td>
                          <td className="py-4 text-right text-slate-500 pr-2">
                            {new Date(lang.capturedAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* Sub-view: GitHub News Feed */}
          {activeTab === 'news' && (
            <div className="space-y-8">
              
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-white">Open Source News Feed</h3>
                <p className="text-xs text-slate-500 mt-0.5">Real-time alerts on repository releases, updates, and trending status.</p>
              </div>

              <div className="flex flex-col space-y-6">
                {news.map((item) => (
                  <div key={item.id} className="glass-panel p-8 rounded-3xl relative overflow-hidden flex flex-col space-y-4 shadow-glass-md">
                    
                    <div className="flex flex-wrap justify-between items-start gap-3">
                      <div className="space-y-1.5">
                        <div className="flex items-center space-x-2">
                          <span className={`px-2.5 py-0.75 rounded text-[9px] uppercase font-black tracking-wider border ${
                            item.type === 'RELEASE' 
                              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                              : item.type === 'UPDATE'
                              ? 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                              : 'bg-orange-500/10 border-orange-500/20 text-orange-400'
                          }`}>
                            {item.type}
                          </span>
                          {item.repoName && <span className="text-xs text-slate-500 font-bold font-mono">@{item.repoName}</span>}
                        </div>
                        <h4 className="text-lg font-extrabold text-white leading-tight mt-1">{item.title}</h4>
                      </div>
                      
                      <span className="text-xs text-slate-550 font-bold flex items-center font-mono">
                        <Calendar className="w-4 h-4 mr-1.5 text-slate-500" />
                        {new Date(item.publishedAt).toLocaleDateString()}
                      </span>
                    </div>

                    <p className="text-xs md:text-sm text-slate-400 leading-relaxed">
                      {item.content}
                    </p>

                    {item.url && (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-bold text-brand-450 hover:text-white flex items-center w-fit pt-2"
                      >
                        <span>View Release Notes</span>
                        <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
                      </a>
                    )}

                  </div>
                ))}
              </div>

            </div>
          )}

          {/* Sub-view: Trending Developers */}
          {activeTab === 'developers' && (
            <div className="space-y-8">
              
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-white flex items-center">
                  <UserCheck className="w-6 h-6 mr-2 text-brand-400" />
                  Top Trending Developers
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Top-performing public GitHub developers based on subscriber volumes.</p>
              </div>

              <div className="grid grid-cols-1 gap-6">
                {topDevelopers.map((dev) => (
                  <div key={dev.id} className="glass-panel p-8 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6 hover:border-brand-500/20 transition-all shadow-glass-md">
                    
                    <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-5">
                      {/* Avatar */}
                      <div className="w-16 h-16 rounded-2xl overflow-hidden border border-slate-750 bg-slate-800 shrink-0 shadow">
                        <img src={dev.avatarUrl} alt={dev.username} className="w-full h-full object-cover" />
                      </div>
                      
                      {/* Profile details */}
                      <div className="text-center md:text-left space-y-1.5">
                        <h4 className="text-lg font-extrabold text-white leading-tight">{dev.name || dev.username}</h4>
                        <span className="text-xs text-slate-500 font-bold block font-mono">@{dev.username}</span>
                        <div className="flex flex-wrap justify-center md:justify-start gap-x-4 gap-y-1 text-xs text-slate-400 pt-1 font-semibold">
                          <span>Followers: <strong className="text-white font-mono">{dev.followers.toLocaleString()}</strong></span>
                          <span>Public Repos: <strong className="text-white font-mono">{dev.publicRepos.toLocaleString()}</strong></span>
                        </div>
                      </div>
                    </div>

                    {/* Popular repo */}
                    {dev.popularRepoName && (
                      <div className="p-4 bg-slate-950/60 border border-slate-850 rounded-2xl space-y-1.5 text-xs shrink-0 w-full md:w-64 text-center md:text-left shadow">
                        <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">Popular Repository</span>
                        <a
                          href={dev.popularRepoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-bold text-brand-400 hover:text-white transition-colors truncate block font-mono text-sm"
                        >
                          {dev.popularRepoName}
                        </a>
                        <span className="text-xs text-slate-400 font-semibold font-mono block">
                          ⭐ {dev.popularRepoStars.toLocaleString()} stars
                        </span>
                      </div>
                    )}

                  </div>
                ))}
              </div>

            </div>
          )}

          {/* Sub-view: Repository Analytics (Manual search) */}
          {activeTab === 'analytics' && (
            <SearchPage />
          )}

      </div>

    </div>
  );
}

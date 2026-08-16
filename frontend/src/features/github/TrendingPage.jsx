import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTrendingRepositories } from './githubSlice';
import { selectGithubTrending, selectGithubLoading, selectGithubError } from './githubSelectors';
import BackButton from '../../components/common/BackButton';
import Loader from '../../components/common/Loader';
import ErrorState from '../../components/common/ErrorState';
import { Flame, Star, GitFork, FileCode2, TrendingUp, Cpu } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1'];

export default function TrendingPage() {
  const dispatch = useDispatch();
  const trendingData = useSelector(selectGithubTrending);
  const isLoading = useSelector(selectGithubLoading);
  const error = useSelector(selectGithubError);

  useEffect(() => {
    dispatch(fetchTrendingRepositories());
  }, [dispatch]);

  if (isLoading || !trendingData || !trendingData.repositories) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <Loader message="Scanning GitHub API for trending repositories, analyzing growth velocity and compiling language distribution grids..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 max-w-7xl mx-auto space-y-4">
        <BackButton fallbackRoute="/github" />
        <ErrorState error={error} />
      </div>
    );
  }

  const { repositories, trendingTechnologies } = trendingData;

  // Sorting repositories for charts:
  // 1. Most Starred (by stargazers_count)
  const mostStarred = [...repositories].sort((a, b) => b.stargazers_count - a.stargazers_count);

  // 2. Fastest Growing (by growthRate)
  const fastestGrowing = [...repositories].sort((a, b) => b.growthRate - a.growthRate);

  return (
    <div className="p-8 w-full px-12 text-slate-355 space-y-10">
      
      {/* Header */}
      <div className="flex items-center space-x-4">
        <BackButton fallbackRoute="/github" />
        <div>
          <span className="text-xs uppercase font-bold tracking-wider px-2 py-0.5 bg-brand-500/10 border border-brand-500/20 text-brand-400 rounded-md">
            TRENDS DASHBOARD
          </span>
          <h1 className="text-2xl font-extrabold text-white tracking-tight mt-1 flex items-center">
            <Flame className="w-6 h-6 mr-2 text-orange-500 animate-pulse" />
            Trending Repositories
          </h1>
        </div>
      </div>

      {/* Grid of Lists and Tech Pie Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Trending Repos list table */}
        <div className="lg:col-span-2 glass-panel p-8 rounded-3xl space-y-6">
          <div>
            <h3 className="text-lg font-extrabold text-white uppercase tracking-wider flex items-center">
              <Star className="w-4 h-4 mr-2 text-yellow-400" />
              Most Starred Repositories
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Top trending repositories rated by stars count and weekly growth.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500 uppercase font-bold tracking-wider">
                  <th className="pb-3 pl-2">Repository</th>
                  <th className="pb-3">Primary Language</th>
                  <th className="pb-3 text-right">Stars</th>
                  <th className="pb-3 text-right pr-2">Weekly Growth</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {mostStarred.map((r, index) => (
                  <tr key={r.id} className="hover:bg-slate-800/20 text-slate-355">
                    <td className="py-3.5 pl-2">
                      <div className="flex items-center space-x-3">
                        <span className="font-bold text-slate-500 font-mono">#{index + 1}</span>
                        <div className="w-7 h-7 rounded-lg overflow-hidden border border-slate-700 bg-slate-800 flex items-center justify-center shrink-0">
                          <img src={r.owner.avatar_url} alt={r.owner.login} className="w-full h-full object-cover" />
                        </div>
                        <div className="overflow-hidden">
                          <span className="font-bold text-white font-mono block truncate">{r.full_name}</span>
                          <span className="text-[10px] text-slate-450 line-clamp-1">{r.description}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5">
                      <span className="px-2 py-0.5 bg-slate-800 border border-slate-700 text-slate-300 rounded text-[10px] font-semibold">
                        {r.language || 'Markdown'}
                      </span>
                    </td>
                    <td className="py-3.5 text-right font-mono font-bold text-yellow-400">
                      {r.stargazers_count.toLocaleString()}
                    </td>
                    <td className="py-3.5 text-right font-mono text-emerald-400 pr-2">
                      <span className="border border-emerald-500/20 bg-emerald-500/10 px-1.5 py-0.5 rounded font-bold">
                        +{r.growthRate}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Trending Technologies Pie Chart */}
        <div className="lg:col-span-1 glass-panel p-8 rounded-3xl flex flex-col justify-between space-y-6">
          <div>
            <h3 className="text-lg font-extrabold text-white uppercase tracking-wider flex items-center">
              <Cpu className="w-4 h-4 mr-2 text-indigo-400" />
              Trending Technologies
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Most common primary languages in trending repos.</p>
          </div>

          <div className="w-full h-72 flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={trendingTechnologies}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {trendingTechnologies.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(val) => `${val} repos`}
                  contentStyle={{ backgroundColor: 'rgba(10, 10, 10, 0.9)', borderColor: 'rgba(255,255,255,0.08)', borderRadius: '10px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Languages list */}
          <div className="space-y-2 text-xs font-semibold">
            {trendingTechnologies.map((tech, idx) => (
              <div key={tech.name} className="flex items-center space-x-2">
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                <span className="text-slate-350 truncate">{tech.name}</span>
                <span className="text-white font-mono ml-auto">{tech.value} repos</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Visual Charts of Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Stargazers Comparison Chart */}
        <div className="glass-panel p-8 rounded-3xl space-y-6">
          <div>
            <h3 className="text-lg font-extrabold text-white uppercase tracking-wider flex items-center">
              <Star className="w-4 h-4 mr-2 text-yellow-400" />
              Stargazers Volume Analysis
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Stargazer counts comparison among trending repositories.</p>
          </div>

          <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mostStarred} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(10, 10, 10, 0.9)', borderColor: 'rgba(255,255,255,0.08)', borderRadius: '12px' }} />
                <Bar dataKey="stargazers_count" name="Stars" fill="#f59e0b" radius={[4, 4, 0, 0]} maxBarSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Growth Velocity Comparison Chart */}
        <div className="glass-panel p-8 rounded-3xl space-y-6">
          <div>
            <h3 className="text-lg font-extrabold text-white uppercase tracking-wider flex items-center">
              <TrendingUp className="w-4 h-4 mr-2 text-brand-400" />
              Growth Velocity Comparison
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Weekly growth percentage comparisons among trending projects.</p>
          </div>

          <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={fastestGrowing} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  formatter={(val) => `+${val}%`}
                  contentStyle={{ backgroundColor: 'rgba(10, 10, 10, 0.9)', borderColor: 'rgba(255,255,255,0.08)', borderRadius: '12px' }}
                />
                <Bar dataKey="growthRate" name="Growth Rate %" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
}

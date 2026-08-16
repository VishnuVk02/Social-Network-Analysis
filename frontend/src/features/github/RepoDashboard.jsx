import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRepositoryDetails } from './githubSlice';
import { selectGithubRepository, selectGithubLoading, selectGithubError } from './githubSelectors';
import BackButton from '../../components/common/BackButton';
import Loader from '../../components/common/Loader';
import ErrorState from '../../components/common/ErrorState';
import ShareReportModal from '../../components/common/ShareReportModal';
import GenerateReportModal from '../../components/common/GenerateReportModal';
import { 
  Star, 
  GitFork, 
  Eye, 
  AlertCircle, 
  GitPullRequest, 
  Users, 
  Calendar, 
  RefreshCw, 
  Activity,
  CheckCircle,
  FileCode2,
  TrendingUp,
  Share2,
  Sparkles
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1'];

export default function RepoDashboard() {
  const { owner, repo } = useParams();
  const dispatch = useDispatch();
  const repositoryData = useSelector(selectGithubRepository);
  const isLoading = useSelector(selectGithubLoading);
  const error = useSelector(selectGithubError);

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isGenerateReportModalOpen, setIsGenerateReportModalOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchRepositoryDetails({ owner, repo }));
  }, [dispatch, owner, repo]);

  const handleRefresh = () => {
    dispatch(fetchRepositoryDetails({ owner, repo, refresh: true }));
  };

  if (isLoading || !repositoryData) {
    return (
      <div className="p-8 w-full px-12 text-slate-350">
        <Loader message="Provisioning repository telemetry, compiling snapshot growth trendlines, mapping contributor graphs & performing health scans..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 w-full px-12 space-y-6">
        <BackButton fallbackRoute="/github" />
        <ErrorState error={error} />
      </div>
    );
  }

  const { repository, languages, commits, commitAnalytics, healthMetrics } = repositoryData;
  const { snapshots, contributors } = repository;

  // Format Dates
  const createdDate = new Date(repository.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  const updatedDate = new Date(repository.updatedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  // Map Language Distribution for Chart
  const totalLanguageBytes = Object.values(languages).reduce((a, b) => a + b, 0);
  const languageChartData = Object.entries(languages).map(([name, bytes]) => ({
    name,
    value: parseFloat(((bytes / (totalLanguageBytes || 1)) * 100).toFixed(1)),
    bytes
  })).sort((a, b) => b.bytes - a.bytes);

  // Map Contributors Distribution for Pie/Bar
  const totalContributions = contributors.reduce((acc, c) => acc + c.contributions, 0);
  const contributorChartData = contributors.slice(0, 5).map((c) => ({
    name: c.username,
    value: c.contributions,
    percentage: totalContributions > 0 ? parseFloat(((c.contributions / totalContributions) * 100).toFixed(1)) : 0
  }));

  // Activity level color
  const getActivityColor = (level) => {
    switch (level) {
      case 'Excellent': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'Good': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      case 'Average': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      default: return 'text-red-400 bg-red-500/10 border-red-500/20';
    }
  };

  return (
    <div className="p-8 w-full px-12 text-slate-355 space-y-10">
      
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-6 md:space-y-0">
        <div className="flex items-center space-x-5">
          <BackButton fallbackRoute="/github" />
          <div className="space-y-1">
            <div className="flex items-center space-x-2.5">
              <span className="text-xs uppercase font-bold tracking-wider px-2.5 py-1 bg-brand-500/10 border border-brand-500/20 text-brand-400 rounded-md">
                REPOSITORY TELEMETRY
              </span>
              <span className="text-xs font-semibold px-2.5 py-1 bg-slate-800 border border-slate-700 rounded-md text-slate-300">
                {repository.language || 'Markdown'}
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center mt-1">
              {repository.owner} <span className="text-slate-500 font-normal mx-2.5">/</span> {repository.name}
            </h1>
            <p className="text-slate-400 text-sm max-w-4xl leading-relaxed mt-1.5">
              {repository.description || 'No description provided for this repository.'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={() => setIsGenerateReportModalOpen(true)}
            className="flex items-center space-x-2 px-5 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs cursor-pointer shadow-glass-indigo transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate Report</span>
          </button>

          <button
            onClick={() => setIsShareModalOpen(true)}
            className="flex items-center space-x-2 px-5 py-3 rounded-xl border border-brand-500/30 bg-brand-500/10 hover:bg-brand-500/20 text-brand-400 font-bold text-xs cursor-pointer shadow-glass transition-all"
          >
            <Share2 className="w-4 h-4" />
            <span>Share Report</span>
          </button>

          <button
            onClick={handleRefresh}
            className="flex items-center space-x-2 px-5 py-3 rounded-xl border border-slate-800 bg-slate-900/40 hover:border-brand-500/35 hover:text-white transition-all text-xs font-bold cursor-pointer shrink-0 shadow-glass"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh Details</span>
          </button>
        </div>
      </div>

      <GenerateReportModal
        isOpen={isGenerateReportModalOpen}
        onClose={() => setIsGenerateReportModalOpen(false)}
        sourcePlatform="GITHUB"
        sourceReference={`${repository.owner}/${repository.name}`}
        defaultTitle={`${repository.owner}/${repository.name} Formal Analytics Report`}
      />

      <ShareReportModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        reportData={{
          type: 'GITHUB',
          title: `${repository.owner}/${repository.name} Repository Report`,
          subtitle: `${repository.stars.toLocaleString()} Stars • ${repository.forks.toLocaleString()} Forks • Primary: ${repository.language || 'Multi-language'}`,
          targetUrl: `/github/repository/${owner}/${repo}`,
          metrics: [
            { label: 'Stars', value: repository.stars.toLocaleString() },
            { label: 'Forks', value: repository.forks.toLocaleString() },
            { label: 'Open Issues', value: repository.openIssues.toLocaleString() },
            { label: 'Contributors', value: contributors.length }
          ]
        }}
      />

      {/* Grid of Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
        {[
          { label: 'Stars Count', value: repository.stars.toLocaleString(), icon: Star, color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' },
          { label: 'Forks Count', value: repository.forks.toLocaleString(), icon: GitFork, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
          { label: 'Watchers Count', value: repository.watchers.toLocaleString(), icon: Eye, color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
          { label: 'Open Issues', value: repository.openIssues.toLocaleString(), icon: AlertCircle, color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' },
          { label: 'Pull Requests', value: healthMetrics.stats.totalPRs.toLocaleString(), icon: GitPullRequest, color: 'text-teal-400 bg-teal-500/10 border-teal-500/20' },
          { label: 'Contributors', value: contributors.length.toLocaleString(), icon: Users, color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' },
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="glass-panel p-6 rounded-2xl flex flex-col justify-between space-y-4 shadow-glass-md">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">{item.label}</span>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-black text-white font-mono">{item.value}</span>
                <div className={`p-2.5 rounded-xl border ${item.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Health Metrics & Activity Score Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Activity Score circular summary */}
        <div className="glass-panel p-8 rounded-3xl flex flex-col justify-between space-y-6 shadow-glass-md">
          <div>
            <h3 className="text-lg font-extrabold text-white uppercase tracking-wider flex items-center">
              <Activity className="w-5 h-5 mr-2.5 text-brand-400" />
              Repository Health & Activity
            </h3>
            <p className="text-xs text-slate-500 mt-1.5">Aggregated evaluation score of code checkins and contributions.</p>
          </div>

          <div className="flex items-center justify-around py-2">
            <div className="relative flex items-center justify-center">
              <div className="w-32 h-32 rounded-full border-4 border-slate-800 flex flex-col items-center justify-center bg-slate-950/40">
                <span className="text-3xl font-black text-white font-mono">{healthMetrics.activityScore}</span>
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Score</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">Activity level</span>
                <span className={`px-3 py-1.5 rounded-xl border text-xs font-black tracking-wide ${getActivityColor(healthMetrics.activityLevel)}`}>
                  {healthMetrics.activityLevel}
                </span>
              </div>
              <div className="text-xs leading-relaxed text-slate-400 font-semibold">
                Weekly commits: <span className="font-bold text-white font-mono">{healthMetrics.commitFrequency} / wk</span>
              </div>
            </div>
          </div>
        </div>

        {/* Issue Resolution Ratio Card */}
        <div className="glass-panel p-8 rounded-3xl flex flex-col justify-between space-y-6 shadow-glass-md">
          <div>
            <h3 className="text-lg font-extrabold text-white uppercase tracking-wider flex items-center">
              <CheckCircle className="w-5 h-5 mr-2.5 text-emerald-400" />
              Issue Resolution Ratio
            </h3>
            <p className="text-xs text-slate-500 mt-1.5">Ratio of resolved (closed) issues relative to lifetime issues.</p>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <span className="text-3xl font-black text-white font-mono">{Math.round(healthMetrics.issueResolutionRatio * 100)}%</span>
              <span className="text-xs text-slate-450 font-bold">
                {healthMetrics.stats.closedIssues.toLocaleString()} of {healthMetrics.stats.totalIssues.toLocaleString()} Closed
              </span>
            </div>
            <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full" 
                style={{ width: `${healthMetrics.issueResolutionRatio * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* PR Activity Card */}
        <div className="glass-panel p-8 rounded-3xl flex flex-col justify-between space-y-6 shadow-glass-md">
          <div>
            <h3 className="text-lg font-extrabold text-white uppercase tracking-wider flex items-center">
              <GitPullRequest className="w-5 h-5 mr-2.5 text-teal-400" />
              Pull Request Merge Rate
            </h3>
            <p className="text-xs text-slate-500 mt-1.5">Evaluation of PR velocity and integration success rate.</p>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <span className="text-3xl font-black text-white font-mono">{Math.round(healthMetrics.pullRequestActivity * 100)}%</span>
              <span className="text-xs text-slate-450 font-bold">
                {healthMetrics.stats.closedPRs.toLocaleString()} of {healthMetrics.stats.totalPRs.toLocaleString()} Merged
              </span>
            </div>
            <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-teal-500 to-cyan-400 rounded-full" 
                style={{ width: `${healthMetrics.pullRequestActivity * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

      </div>

      {/* Historical Growth Area Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Stars Trend */}
        <div className="glass-panel p-8 rounded-3xl space-y-6 shadow-glass-md">
          <div>
            <h3 className="text-lg font-extrabold text-white uppercase tracking-wider flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-yellow-400" />
              Stars Trend Chart
            </h3>
            <p className="text-xs text-slate-500 mt-1">Historical growth timeline of repository stargazers.</p>
          </div>

          <div className="w-full h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={snapshots} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="starsColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis 
                  dataKey="capturedAt" 
                  tickFormatter={(tick) => new Date(tick).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  stroke="#94a3b8" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
                <Tooltip 
                  labelFormatter={(lbl) => new Date(lbl).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                  contentStyle={{ backgroundColor: 'rgba(10, 10, 10, 0.9)', borderColor: 'rgba(255,255,255,0.08)', borderRadius: '12px' }}
                />
                <Area type="monotone" dataKey="stars" name="Stars" stroke="#f59e0b" strokeWidth={2.5} fillOpacity={1} fill="url(#starsColor)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Forks Trend */}
        <div className="glass-panel p-8 rounded-3xl space-y-6 shadow-glass-md">
          <div>
            <h3 className="text-lg font-extrabold text-white uppercase tracking-wider flex items-center">
              <GitFork className="w-5 h-5 mr-2 text-blue-400" />
              Forks Trend Chart
            </h3>
            <p className="text-xs text-slate-500 mt-1">Historical growth timeline of repository forks.</p>
          </div>

          <div className="w-full h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={snapshots} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="forksColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis 
                  dataKey="capturedAt" 
                  tickFormatter={(tick) => new Date(tick).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  stroke="#94a3b8" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
                <Tooltip 
                  labelFormatter={(lbl) => new Date(lbl).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                  contentStyle={{ backgroundColor: 'rgba(10, 10, 10, 0.9)', borderColor: 'rgba(255,255,255,0.08)', borderRadius: '12px' }}
                />
                <Area type="monotone" dataKey="forks" name="Forks" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#forksColor)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Commit Activity and Technology Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Commit Activity Chart */}
        <div className="lg:col-span-2 glass-panel p-8 rounded-3xl space-y-6 shadow-glass-md">
          <div>
            <h3 className="text-lg font-extrabold text-white uppercase tracking-wider flex items-center">
              <Activity className="w-5 h-5 mr-2 text-indigo-400" />
              Commit Activity Chart
            </h3>
            <p className="text-xs text-slate-500 mt-1">Development checkin volumes aggregated weekly over recent period.</p>
          </div>

          <div className="w-full h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={commitAnalytics.commitsPerWeek} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis 
                  dataKey="week" 
                  tickFormatter={(tick) => new Date(tick).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  stroke="#94a3b8" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  labelFormatter={(lbl) => `Week of: ${new Date(lbl).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}`}
                  contentStyle={{ backgroundColor: 'rgba(10, 10, 10, 0.9)', borderColor: 'rgba(255,255,255,0.08)', borderRadius: '12px' }}
                />
                <Bar dataKey="count" name="Commits Count" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Technology Distribution Pie */}
        <div className="lg:col-span-1 glass-panel p-8 rounded-3xl flex flex-col justify-between space-y-6 shadow-glass-md">
          <div>
            <h3 className="text-lg font-extrabold text-white uppercase tracking-wider flex items-center">
              <FileCode2 className="w-5 h-5 mr-2 text-brand-400" />
              Technology Distribution
            </h3>
            <p className="text-xs text-slate-500 mt-1">Codebase bytes percentage allocated per language.</p>
          </div>

          <div className="w-full h-72 flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={languageChartData.slice(0, 4)}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {languageChartData.slice(0, 4).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(val) => `${val}%`}
                  contentStyle={{ backgroundColor: 'rgba(10, 10, 10, 0.9)', borderColor: 'rgba(255,255,255,0.08)', borderRadius: '10px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Languages legend list */}
          <div className="grid grid-cols-2 gap-3 text-xs font-semibold">
            {languageChartData.slice(0, 4).map((lang, idx) => (
              <div key={lang.name} className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                <span className="text-slate-350 truncate">{lang.name}</span>
                <span className="text-white font-mono ml-auto">{lang.value}%</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Contributor Analytics Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Contributor leaderboard table */}
        <div className="lg:col-span-2 glass-panel p-8 rounded-3xl space-y-6 shadow-glass-md">
          <div>
            <h3 className="text-lg font-extrabold text-white uppercase tracking-wider flex items-center">
              <Users className="w-5 h-5 mr-2 text-brand-400" />
              Contributor Leaderboard
            </h3>
            <p className="text-xs text-slate-500 mt-1">List of top developer contributors and their lifetime contribution logs.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs md:text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500 uppercase font-bold tracking-wider">
                  <th className="pb-4 pl-2">Developer</th>
                  <th className="pb-4 text-right">Contributions</th>
                  <th className="pb-4 text-right pr-2">Percentage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {contributors.slice(0, 5).map((c, index) => {
                  const pct = totalContributions > 0 ? ((c.contributions / totalContributions) * 100).toFixed(1) : 0;
                  return (
                    <tr key={c.id} className="hover:bg-slate-800/20 text-slate-300">
                      <td className="py-4 pl-2 flex items-center space-x-3.5">
                        <span className="font-bold text-slate-500 font-mono">#{index + 1}</span>
                        <div className="w-8 h-8 rounded-xl overflow-hidden border border-slate-700 bg-slate-800 shrink-0">
                          <img src={`https://avatars.githubusercontent.com/u/${c.githubUserId}?v=4`} alt={c.username} className="w-full h-full object-cover" />
                        </div>
                        <span className="font-bold text-white font-mono">{c.username}</span>
                      </td>
                      <td className="py-4 text-right font-mono font-bold text-white">
                        {c.contributions.toLocaleString()}
                      </td>
                      <td className="py-4 text-right font-mono text-slate-400 pr-2">
                        {pct}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Contributor Distribution Pie Chart */}
        <div className="lg:col-span-1 glass-panel p-8 rounded-3xl flex flex-col justify-between space-y-6 shadow-glass-md">
          <div>
            <h3 className="text-lg font-extrabold text-white uppercase tracking-wider flex items-center">
              <Users className="w-5 h-5 mr-2 text-indigo-400" />
              Contributor Distribution
            </h3>
            <p className="text-xs text-slate-500 mt-1">Participation balance ratio between top contributors.</p>
          </div>

          <div className="w-full h-60 flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={contributorChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {contributorChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(val) => `${val} commits`}
                  contentStyle={{ backgroundColor: 'rgba(10, 10, 10, 0.9)', borderColor: 'rgba(255,255,255,0.08)', borderRadius: '10px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs font-semibold">
            {contributorChartData.map((c, idx) => (
              <div key={c.name} className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: COLORS[(idx + 2) % COLORS.length] }}></div>
                <span className="text-slate-350 truncate">{c.name}</span>
                <span className="text-white font-mono ml-auto">{c.percentage}%</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Footer Snapshot Information */}
      <div className="flex justify-between items-center text-xs text-slate-500 font-bold uppercase tracking-wider pt-6 border-t border-slate-800/60">
        <span className="flex items-center">
          <Calendar className="w-4 h-4 mr-1.5" />
          Created: {createdDate}
        </span>
        <span>
          Last Telemetry Scan: {updatedDate}
        </span>
      </div>

    </div>
  );
}

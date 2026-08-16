import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  fetchTrendingIndex, 
  fetchTopicDetail, 
  setFilters, 
  closeTopicModal 
} from './trendsSlice';
import TopicDetailModal from '../../components/trends/TopicDetailModal';
import MetricCard from '../../components/common/MetricCard';
import DataTable from '../../components/common/DataTable';
import BackButton from '../../components/common/BackButton';
import ShareReportModal from '../../components/common/ShareReportModal';
import { trackAppEvent } from '../../utils/telemetry';
import { 
  Flame, 
  TrendingUp, 
  Zap, 
  MessageSquare, 
  Layers, 
  Filter, 
  Calendar, 
  Globe2, 
  Youtube, 
  Github, 
  ArrowUpRight, 
  Sparkles,
  ChevronRight,
  Award,
  Share2
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';

export default function Trends() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { 
    trendsData, 
    activeTopicDetail, 
    isModalOpen, 
    isLoading, 
    isModalLoading, 
    filters 
  } = useSelector((state) => state.trends);

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isGenerateReportModalOpen, setIsGenerateReportModalOpen] = useState(false);

  const categories = [
    'All Categories',
    'Technology',
    'Artificial Intelligence',
    'Software Development',
    'Cloud & DevOps',
    'Programming',
    'Startups & Business',
    'Gaming',
    'Science',
    'Education'
  ];

  const sources = [
    { label: 'Combined (YouTube + GitHub)', value: 'Combined' },
    { label: 'YouTube Only', value: 'YouTube' },
    { label: 'GitHub Only', value: 'GitHub' }
  ];

  const timeRanges = [
    { label: 'Last 24 Hours', value: '24h' },
    { label: 'Last 7 Days', value: '7d' },
    { label: 'Last 30 Days', value: '30d' }
  ];

  // Fetch data when filters change
  useEffect(() => {
    dispatch(fetchTrendingIndex(filters));
    trackAppEvent({ eventType: 'trends_view', feature: 'Trends', platform: 'Trends', metadata: filters });
  }, [dispatch, filters]);

  const handleCategoryChange = (e) => {
    dispatch(setFilters({ category: e.target.value }));
  };

  const handleSourceChange = (e) => {
    dispatch(setFilters({ source: e.target.value }));
  };

  const handleTimeRangeChange = (e) => {
    dispatch(setFilters({ timeRange: e.target.value }));
  };

  const handleTopicClick = (topicName) => {
    dispatch(fetchTopicDetail(topicName));
  };

  const handleModalClose = () => {
    dispatch(closeTopicModal());
  };

  const headers = [
    { name: 'Rank' },
    { name: 'Topic Name' },
    { name: 'Category' },
    { name: 'Trend Score' },
    { name: 'Growth %' },
    { name: 'YouTube Signal' },
    { name: 'GitHub Signal' },
    { name: 'Trend Status' }
  ];

  const overview = trendsData?.overview || {
    trendingTopicsCount: 24,
    fastestGrowing: { name: 'AI Agents', growthRate: 67.2 },
    mostDiscussed: 'AI',
    crossPlatformCount: 12
  };

  const topTopics = trendsData?.topTrendingTopics || [];
  const comparisonChartData = trendsData?.comparisonChart || [];
  const fastestRising = trendsData?.fastestRising || [];
  const crossPlatformInsights = trendsData?.crossPlatformInsights || [];
  
  const rawPlatformDifferences = trendsData?.platformDifferences || {};
  
  // Safely extract YouTube Dominant data (topChannel & topics list)
  const youtubeDominantChannel = rawPlatformDifferences.youtubeDominant?.topChannel || {
    name: 'Marques Brownlee (MKBHD)',
    channelId: 'MKBHD',
    subscribers: '18.6M subscribers',
    views: '4.2B total views',
    description: 'Premier consumer tech reviews, hardware benchmarks, and emerging future tech breakdown.'
  };

  const youtubeDominantTopics = Array.isArray(rawPlatformDifferences.youtubeDominant)
    ? rawPlatformDifferences.youtubeDominant
    : (rawPlatformDifferences.youtubeDominant?.topics || []);

  const githubDominantTopics = Array.isArray(rawPlatformDifferences.githubDominant)
    ? rawPlatformDifferences.githubDominant
    : [];

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      
      {/* 1. PAGE HEADER & FILTERS */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between border-b border-slate-800 pb-6 gap-6">
        <div className="flex items-center space-x-4">
          <BackButton fallbackRoute="/" />
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight flex items-center">
              <Flame className="w-7 h-7 mr-3 text-brand-400" />
              Trends Index
            </h1>
            <p className="text-slate-400 text-sm mt-0.5">
              Discover emerging topics and conversations across YouTube and GitHub.
            </p>
          </div>
        </div>

        {/* Controls: [Category ▼] [Source ▼] [Time Range ▼] */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Category Dropdown */}
          <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 focus-within:border-brand-500 transition-colors">
            <Filter className="w-4 h-4 text-brand-400 shrink-0" />
            <select
              value={filters.category}
              onChange={handleCategoryChange}
              className="bg-transparent text-xs text-slate-200 font-semibold border-none outline-none focus:ring-0 cursor-pointer pr-4"
            >
              {categories.map(cat => (
                <option key={cat} value={cat} className="bg-dark-900 text-slate-200">
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Source Dropdown */}
          <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 focus-within:border-brand-500 transition-colors">
            <Globe2 className="w-4 h-4 text-brand-400 shrink-0" />
            <select
              value={filters.source}
              onChange={handleSourceChange}
              className="bg-transparent text-xs text-slate-200 font-semibold border-none outline-none focus:ring-0 cursor-pointer pr-4"
            >
              {sources.map(s => (
                <option key={s.value} value={s.value} className="bg-dark-900 text-slate-200">
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          {/* Time Range Dropdown */}
          <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 focus-within:border-brand-500 transition-colors">
            <Calendar className="w-4 h-4 text-brand-400 shrink-0" />
            <select
              value={filters.timeRange}
              onChange={handleTimeRangeChange}
              className="bg-transparent text-xs text-slate-200 font-semibold border-none outline-none focus:ring-0 cursor-pointer pr-4"
            >
              {timeRanges.map(t => (
                <option key={t.value} value={t.value} className="bg-dark-900 text-slate-200">
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {/* Share Report Button */}
          <button
            onClick={() => setIsShareModalOpen(true)}
            className="px-4 py-2 border border-brand-500/30 bg-brand-500/10 hover:bg-brand-500/20 text-brand-400 font-semibold rounded-xl text-xs shadow transition-all cursor-pointer flex items-center space-x-2 shrink-0"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share Report</span>
          </button>
        </div>
      </div>

      <ShareReportModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        reportData={{
          type: 'TRENDS',
          title: `Trends Index Report (${filters.category})`,
          subtitle: `Category: ${filters.category} • Source: ${filters.source} • Timeframe: ${filters.timeRange}`,
          targetUrl: `/trends`,
          metrics: [
            { label: 'Active Topics', value: overview.trendingTopicsCount || 0 },
            { label: 'Fastest Growing', value: `${overview.fastestGrowing?.name || 'AI'} (+${overview.fastestGrowing?.growthRate || 0}%)` },
            { label: 'Most Discussed', value: overview.mostDiscussed || 'AI' },
            { label: 'Cross Platform', value: overview.crossPlatformCount || 0 }
          ]
        }}
      />

      {/* 4. TREND OVERVIEW SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Trending Topics"
          value={overview.trendingTopicsCount}
          icon={Layers}
          description={`Topics active in ${filters.category}`}
        />
        <MetricCard
          title="Fastest Growing"
          value={`${overview.fastestGrowing.name} +${overview.fastestGrowing.growthRate}%`}
          icon={Zap}
          description="Highest growth rate velocity"
        />
        <MetricCard
          title="Most Discussed"
          value={overview.mostDiscussed}
          icon={MessageSquare}
          description="Highest total volume & activity"
        />
        <MetricCard
          title="Cross-Platform Trends"
          value={overview.crossPlatformCount}
          icon={Sparkles}
          description="Active on YouTube + GitHub"
        />
      </div>

      {/* 5. TOP TRENDING TOPICS LEADERBOARD */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center">
              <Flame className="w-5 h-5 mr-2 text-red-500" />
              Top Trending Topics
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Ranked cross-platform topics for <span className="text-white font-semibold">{filters.category}</span> ({filters.source}). Click any topic for detailed analysis.
            </p>
          </div>
        </div>

        <DataTable
          headers={headers}
          data={topTopics}
          loading={isLoading}
          emptyMessage="No trending topics found for the selected filter combination."
          renderRow={(item, idx) => (
            <tr 
              key={item.id || idx} 
              onClick={() => handleTopicClick(item.name)}
              className="hover:bg-slate-800/40 transition-all border-b border-slate-800/40 text-slate-300 cursor-pointer group"
            >
              <td className="p-4 text-xs font-bold text-slate-500 group-hover:text-white">
                {item.rank || `#${idx + 1}`}
              </td>
              <td className="p-4 text-xs font-bold text-white font-mono flex items-center space-x-2">
                <span className="group-hover:text-brand-400 transition-colors">{item.name}</span>
                <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-brand-400" />
              </td>
              <td className="p-4 text-xs text-slate-400 font-medium">
                {item.category}
              </td>
              <td className="p-4 text-xs font-black text-white">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-brand-600/20 border border-brand-500/30 flex items-center justify-center text-brand-400 font-bold">
                    {item.trendScore}
                  </div>
                </div>
              </td>
              <td className="p-4 text-xs font-bold">
                <span className={`px-2.5 py-1 rounded-md border font-medium ${
                  item.growthRate >= 0 
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                    : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                }`}>
                  {item.growthRate >= 0 ? `+${item.growthRate}%` : `${item.growthRate}%`}
                </span>
              </td>
              <td className="p-4 text-xs text-slate-400">
                <span className="flex items-center space-x-1.5">
                  <Youtube className="w-3.5 h-3.5 text-red-500 shrink-0" />
                  <span className="truncate max-w-xs">{item.youtubeSignal}</span>
                </span>
              </td>
              <td className="p-4 text-xs text-slate-400">
                <span className="flex items-center space-x-1.5">
                  <Github className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                  <span className="truncate max-w-xs">{item.githubSignal}</span>
                </span>
              </td>
              <td className="p-4 text-xs font-bold">
                <span className="px-2.5 py-1 rounded-lg border border-slate-800 bg-slate-900 text-slate-200">
                  {item.status}
                </span>
              </td>
            </tr>
          )}
        />
      </div>

      {/* 6. TREND COMPARISON CHART */}
      <div className="glass-panel p-6 rounded-2xl space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-base font-bold text-white flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-brand-400" />
              Cross-Platform Trend Activity
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Normalized signal comparison across YouTube vs GitHub vs Combined score.
            </p>
          </div>
        </div>

        <div className="w-full h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={comparisonChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
              />
              <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: 11, color: '#94a3b8' }} />
              <Bar dataKey="YouTube" fill="#ef4444" radius={[4, 4, 0, 0]} />
              <Bar dataKey="GitHub" fill="#38bdf8" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Combined" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 7. TREND VELOCITY & 8. CROSS-PLATFORM INSIGHTS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* 7. Fastest Rising Topics */}
        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center">
              <Zap className="w-5 h-5 mr-2 text-amber-400" />
              Fastest Rising Topics (Velocity)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Highest growth percentage velocity in current window.</p>
          </div>

          <div className="space-y-3">
            {fastestRising.map((topic, idx) => (
              <div
                key={idx}
                onClick={() => handleTopicClick(topic.name)}
                className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800/80 hover:border-amber-500/30 transition-all flex items-center justify-between cursor-pointer group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 font-bold text-xs flex items-center justify-center">
                    #{idx + 1}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors">{topic.name}</h4>
                    <p className="text-[10px] text-slate-400">{topic.category}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-md flex items-center">
                    <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
                    +{topic.growthRate}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 8. Cross-Platform Insights */}
        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center">
              <Sparkles className="w-5 h-5 mr-2 text-emerald-400" />
              Cross-Platform Insights
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Topics simultaneously gaining traction on BOTH YouTube and GitHub.</p>
          </div>

          <div className="space-y-3">
            {crossPlatformInsights.map((insight, idx) => (
              <div
                key={idx}
                onClick={() => handleTopicClick(insight.name)}
                className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800/80 hover:border-emerald-500/30 transition-all flex items-center justify-between cursor-pointer group"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-lg">🔥</span>
                  <div>
                    <h4 className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors">{insight.name}</h4>
                    <p className="text-[10px] text-slate-400">{insight.description}</p>
                  </div>
                </div>

                <span className="text-[10px] font-bold text-slate-300 bg-slate-800 px-2.5 py-1 rounded-md border border-slate-700">
                  {insight.status}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 9. PLATFORM DIFFERENCES WITH CATEGORY TOP YOUTUBE CHANNEL */}
      <div className="glass-panel p-6 rounded-2xl space-y-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center">
            <Layers className="w-5 h-5 mr-2 text-indigo-400" />
            Platform Differences
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Identify topics that perform strongly on one platform compared to the other.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* YouTube Dominant */}
          <div className="p-5 rounded-2xl bg-red-950/10 border border-red-500/20 space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider flex items-center">
                <Youtube className="w-4 h-4 mr-2 text-red-500" />
                YouTube Dominant
              </h4>
              <span className="text-[10px] text-slate-400 font-medium">Video Telemetry Heavy</span>
            </div>

            {/* Category Highest Popular YouTube Channel Card */}
            {youtubeDominantChannel && (
              <div className="p-4 rounded-xl bg-slate-900/80 border border-red-500/30 flex flex-col space-y-2 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5">
                    <Award className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">
                      Highest Popular Channel ({filters.category})
                    </span>
                  </div>
                  <button
                    onClick={() => navigate(`/youtube/channel/${youtubeDominantChannel.channelId}`)}
                    className="text-[10px] font-bold text-red-400 hover:text-white flex items-center space-x-1 cursor-pointer transition-colors"
                  >
                    <span>Analyze Channel</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </button>
                </div>

                <div>
                  <h5 className="text-sm font-black text-white">{youtubeDominantChannel.name}</h5>
                  <div className="flex items-center space-x-3 text-[10px] text-slate-400 mt-0.5">
                    <span className="text-red-400 font-bold">{youtubeDominantChannel.subscribers}</span>
                    <span>•</span>
                    <span>{youtubeDominantChannel.views}</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                  {youtubeDominantChannel.description}
                </p>
              </div>
            )}

            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                YouTube Dominant Topics
              </span>
              {youtubeDominantTopics.map((item, idx) => (
                <div 
                  key={idx} 
                  onClick={() => handleTopicClick(item.name)}
                  className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between cursor-pointer hover:border-red-500/40 transition-colors"
                >
                  <div>
                    <h5 className="text-xs font-bold text-white">{item.name}</h5>
                    <p className="text-[10px] text-slate-400">{item.reason}</p>
                  </div>
                  <span className="text-[10px] text-red-400 font-semibold bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">
                    Video Heavy
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* GitHub Dominant */}
          <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-700/40 space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center">
                <Github className="w-4 h-4 mr-2 text-slate-300" />
                GitHub Dominant
              </h4>
              <span className="text-[10px] text-slate-400 font-medium">Repo & Commit Heavy</span>
            </div>

            <div className="space-y-2 pt-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                GitHub Dominant Topics
              </span>
              {githubDominantTopics.map((item, idx) => (
                <div 
                  key={idx} 
                  onClick={() => handleTopicClick(item.name)}
                  className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between cursor-pointer hover:border-sky-500/40 transition-colors"
                >
                  <div>
                    <h5 className="text-xs font-bold text-white">{item.name}</h5>
                    <p className="text-[10px] text-slate-400">{item.reason}</p>
                  </div>
                  <span className="text-[10px] text-sky-400 font-semibold bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
                    Repo Heavy
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 10. TOPIC DETAIL MODAL */}
      <TopicDetailModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        topicDetail={activeTopicDetail}
        isLoading={isModalLoading}
        onSelectTopic={handleTopicClick}
      />

    </div>
  );
}

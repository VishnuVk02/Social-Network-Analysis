import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrganizationProfile } from './githubSlice';
import { selectGithubOrganization, selectGithubLoading, selectGithubError } from './githubSelectors';
import BackButton from '../../components/common/BackButton';
import Loader from '../../components/common/Loader';
import ErrorState from '../../components/common/ErrorState';
import { 
  Users, 
  Building2, 
  Calendar, 
  GitBranch, 
  Star, 
  FileCode2, 
  Activity,
  ExternalLink
} from 'lucide-react';
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
  Tooltip,
  Legend
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1'];

export default function OrgDashboard() {
  const { org } = useParams();
  const dispatch = useDispatch();
  const orgData = useSelector(selectGithubOrganization);
  const isLoading = useSelector(selectGithubLoading);
  const error = useSelector(selectGithubError);

  useEffect(() => {
    dispatch(fetchOrganizationProfile(org));
  }, [dispatch, org]);

  if (isLoading || !orgData) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <Loader message="Provisioning organization profile telemetry, auditing repositories index, compiling tech stacks and evaluating activity metrics..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 max-w-7xl mx-auto space-y-4">
        <BackButton fallbackRoute="/github/search" />
        <ErrorState error={error} />
      </div>
    );
  }

  const { profile, topRepos, technologyDistribution, repositoryActivity } = orgData;

  const creationDate = profile.created_at ? new Date(profile.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long' }) : 'Unknown';

  return (
    <div className="p-8 w-full px-12 text-slate-355 space-y-10">
      
      {/* Back Button and Title */}
      <div className="flex items-center space-x-4">
        <BackButton fallbackRoute="/github" />
        <div>
          <span className="text-xs uppercase font-bold tracking-wider px-2 py-0.5 bg-brand-500/10 border border-brand-500/20 text-brand-400 rounded-md">
            ORGANIZATION AUDIT
          </span>
          <h1 className="text-2xl font-extrabold text-white tracking-tight mt-1">
            Organization: {profile.name || profile.login}
          </h1>
        </div>
      </div>

      {/* Org Profile Card */}
      <div className="glass-panel p-8 rounded-3xl flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8 shadow-glass-md">
        
        {/* Avatar */}
        <div className="w-24 h-24 rounded-2xl overflow-hidden border border-slate-700 bg-slate-800 shrink-0 shadow-glass-brand">
          <img src={profile.avatar_url} alt={profile.name || profile.login} className="w-full h-full object-cover" />
        </div>

        {/* Info */}
        <div className="flex-1 space-y-4 text-center md:text-left overflow-hidden">
          <div>
            <h2 className="text-xl font-bold text-white leading-tight">{profile.name || profile.login}</h2>
            <span className="text-xs font-semibold text-slate-500 font-mono">github.com/{profile.login}</span>
          </div>

          <p className="text-slate-400 text-xs leading-relaxed max-w-2xl">
            {profile.description || 'This organization has no description configured on their GitHub profile.'}
          </p>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-y-2 gap-x-4 text-xs font-semibold text-slate-500">
            <span className="flex items-center">
              <Calendar className="w-3.5 h-3.5 mr-1" />
              Member Since: {creationDate}
            </span>
          </div>
        </div>

        {/* External Link */}
        <div className="shrink-0">
          <a
            href={`https://github.com/${profile.login}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1.5 px-4 py-2 text-xs font-bold text-slate-355 hover:text-white border border-slate-800 bg-slate-900/40 hover:border-brand-500/30 rounded-xl transition-all"
          >
            <span>GitHub Org</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

      </div>

      {/* Key Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { label: 'Public Repositories', value: profile.public_repos.toLocaleString(), icon: GitBranch, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
          { label: 'Followers', value: profile.followers.toLocaleString(), icon: Users, color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' },
          { label: 'Estimated Members', value: profile.membersCount.toLocaleString(), icon: Building2, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
          { label: 'Activity Rating', value: 'High Scale', icon: Activity, color: 'text-teal-400 bg-teal-500/10 border-teal-500/20' },
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="glass-panel p-6 rounded-2xl flex flex-col justify-between space-y-3 shadow-glass-md">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">{item.label}</span>
              <div className="flex items-center justify-between">
                <span className="text-xl font-extrabold text-white font-mono">{item.value}</span>
                <div className={`p-2 rounded-lg border ${item.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Technology Distribution Pie */}
        <div className="lg:col-span-1 glass-panel p-8 rounded-3xl flex flex-col justify-between space-y-6 shadow-glass-md">
          <div>
            <h3 className="text-lg font-extrabold text-white uppercase tracking-wider flex items-center">
              <FileCode2 className="w-4 h-4 mr-2 text-brand-400" />
              Technology Distribution
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Primary language byte weights aggregated across org repos.</p>
          </div>

          {technologyDistribution.length > 0 ? (
            <>
              <div className="w-full h-72 flex items-center justify-center relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={technologyDistribution.slice(0, 4)}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={95}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {technologyDistribution.slice(0, 4).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(val) => `${val.toLocaleString()} bytes`}
                      contentStyle={{ backgroundColor: 'rgba(10, 10, 10, 0.9)', borderColor: 'rgba(255,255,255,0.08)', borderRadius: '10px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-semibold pt-2">
                {technologyDistribution.slice(0, 4).map((lang, idx) => (
                  <div key={lang.name} className="flex items-center space-x-2">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                    <span className="text-slate-350 truncate">{lang.name}</span>
                    <span className="text-white font-mono ml-auto">{lang.percentage}%</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="py-20 text-center text-xs text-slate-500 font-bold">
              No language data available.
            </div>
          )}
        </div>

        {/* Top Repositories Bar Chart */}
        <div className="lg:col-span-2 glass-panel p-8 rounded-3xl space-y-6 shadow-glass-md">
          <div>
            <h3 className="text-lg font-extrabold text-white uppercase tracking-wider flex items-center">
              <Star className="w-4 h-4 mr-2 text-yellow-400" />
              Top Starred Repositories
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Top performing organization public repositories by stars count.</p>
          </div>

          <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topRepos} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#94a3b8" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(10, 10, 10, 0.9)', borderColor: 'rgba(255,255,255,0.08)', borderRadius: '12px' }}
                />
                <Bar dataKey="stargazers_count" name="Stars" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Repository Activity Score distribution & Org Repos List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Repo Activity Score Distribution */}
        <div className="lg:col-span-1 glass-panel p-8 rounded-3xl space-y-6 flex flex-col justify-between shadow-glass-md">
          <div>
            <h3 className="text-lg font-extrabold text-white uppercase tracking-wider flex items-center">
              <Activity className="w-4 h-4 mr-2 text-indigo-400" />
              Repository Activity Score
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Activity performance calculations for organization repositories.</p>
          </div>

          <div className="space-y-4 py-2">
            {repositoryActivity.map((r, idx) => (
              <div key={r.name} className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-white truncate font-mono">{r.name}</span>
                  <span className="text-slate-400 font-mono">{r.activityScore} pts</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-brand-500 to-indigo-400 rounded-full" 
                    style={{ width: `${Math.min(100, (r.activityScore / 2500) * 100)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Repos Table */}
        <div className="lg:col-span-2 glass-panel p-8 rounded-3xl space-y-6 shadow-glass-md">
          <div>
            <h3 className="text-lg font-extrabold text-white uppercase tracking-wider flex items-center">
              <Building2 className="w-4 h-4 mr-2 text-brand-400" />
              Repositories Index
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Public repositories hosted under this organization.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500 uppercase font-bold tracking-wider">
                  <th className="pb-3 pl-2">Repository Name</th>
                  <th className="pb-3">Language</th>
                  <th className="pb-3 text-right">Stars</th>
                  <th className="pb-3 text-right pr-2">Forks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {topRepos.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-800/20 text-slate-350">
                    <td className="py-3 pl-2 font-bold text-white font-mono">
                      {r.name}
                    </td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 bg-slate-800 border border-slate-700 text-slate-300 rounded text-[10px] font-semibold">
                        {r.language || 'Markdown'}
                      </span>
                    </td>
                    <td className="py-3 text-right font-mono font-bold text-yellow-400">
                      {r.stargazers_count.toLocaleString()}
                    </td>
                    <td className="py-3 text-right font-mono text-slate-400 pr-2">
                      {r.forks_count.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
}

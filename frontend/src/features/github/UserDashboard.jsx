import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserProfile } from './githubSlice';
import { selectGithubUser, selectGithubLoading, selectGithubError } from './githubSelectors';
import BackButton from '../../components/common/BackButton';
import Loader from '../../components/common/Loader';
import ErrorState from '../../components/common/ErrorState';
import { 
  Users, 
  BookOpen, 
  Calendar, 
  GitBranch, 
  Star, 
  FileCode2, 
  Info,
  ExternalLink
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1'];

export default function UserDashboard() {
  const { username } = useParams();
  const dispatch = useDispatch();
  const userData = useSelector(selectGithubUser);
  const isLoading = useSelector(selectGithubLoading);
  const error = useSelector(selectGithubError);

  useEffect(() => {
    dispatch(fetchUserProfile(username));
  }, [dispatch, username]);

  if (isLoading || !userData) {
    return (
      <div className="p-8 w-full px-12 text-slate-350">
        <Loader message="Gathering developer profile telemetry, analyzing public repositories, indexing languages, and building followers growth timelines..." />
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

  const { profile, mostStarred, languageDistribution, followersGrowth, reposCount } = userData;

  const creationDate = new Date(profile.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="p-8 w-full px-12 text-slate-355 space-y-10">
      
      {/* Back Button and Title */}
      <div className="flex items-center space-x-5">
        <BackButton fallbackRoute="/github" />
        <div className="space-y-1">
          <span className="text-xs uppercase font-bold tracking-wider px-2.5 py-1 bg-brand-500/10 border border-brand-500/20 text-brand-400 rounded-md font-mono">
            DEVELOPER PROFILE AUDIT
          </span>
          <h1 className="text-3xl font-extrabold text-white tracking-tight mt-1 flex items-center">
            Developer Analysis: <span className="text-brand-400 font-mono ml-2">@{profile.login}</span>
          </h1>
        </div>
      </div>

      {/* User Profile Card */}
      <div className="glass-panel p-8 rounded-3xl flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8 shadow-glass-md">
        
        {/* Avatar */}
        <div className="w-32 h-32 rounded-2xl overflow-hidden border border-slate-700 bg-slate-800 shrink-0 shadow-glass-brand">
          <img src={profile.avatar_url} alt={profile.name || profile.login} className="w-full h-full object-cover" />
        </div>

        {/* Info */}
        <div className="flex-1 space-y-4 text-center md:text-left overflow-hidden">
          <div>
            <h2 className="text-2xl font-bold text-white leading-tight">{profile.name || profile.login}</h2>
            <span className="text-sm font-semibold text-slate-500 font-mono">github.com/{profile.login}</span>
          </div>

          <p className="text-slate-400 text-sm leading-relaxed max-w-4xl">
            {profile.bio || 'This developer has no bio configured on their GitHub profile.'}
          </p>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-y-2 gap-x-4 text-xs font-semibold text-slate-405">
            <span className="flex items-center">
              <Calendar className="w-4 h-4 mr-1.5 text-slate-500" />
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
            className="flex items-center space-x-1.5 px-5 py-3 text-xs font-bold text-slate-300 hover:text-white border border-slate-800 bg-slate-900/40 hover:border-brand-500/35 rounded-xl transition-all shadow-glass"
          >
            <span>GitHub Profile</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

      </div>

      {/* Key Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { label: 'Followers', value: profile.followers.toLocaleString(), icon: Users, color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' },
          { label: 'Following', value: profile.following.toLocaleString(), icon: Users, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
          { label: 'Public Repositories', value: profile.public_repos.toLocaleString(), icon: GitBranch, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
          { label: 'Public Gists', value: profile.public_gists.toLocaleString(), icon: BookOpen, color: 'text-teal-400 bg-teal-500/10 border-teal-500/20' },
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

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Most Used Languages */}
        <div className="lg:col-span-1 glass-panel p-8 rounded-3xl flex flex-col justify-between space-y-6 shadow-glass-md">
          <div>
            <h3 className="text-lg font-extrabold text-white uppercase tracking-wider flex items-center">
              <FileCode2 className="w-5 h-5 mr-2 text-brand-400" />
              Most Used Languages
            </h3>
            <p className="text-xs text-slate-500 mt-1">Top languages based on repository primary language counts.</p>
          </div>

          {languageDistribution.length > 0 ? (
            <>
              <div className="w-full h-72 flex items-center justify-center relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={languageDistribution.slice(0, 4)}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={100}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {languageDistribution.slice(0, 4).map((entry, index) => (
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

              <div className="grid grid-cols-2 gap-3 text-xs font-semibold">
                {languageDistribution.slice(0, 4).map((lang, idx) => (
                  <div key={lang.name} className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                    <span className="text-slate-355 truncate font-semibold">{lang.name}</span>
                    <span className="text-white font-mono ml-auto">{lang.percentage}%</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="py-24 text-center text-xs text-slate-500 font-bold">
              No language data available.
            </div>
          )}
        </div>

        {/* Most Starred Repositories Bar Chart */}
        <div className="lg:col-span-2 glass-panel p-8 rounded-3xl space-y-6 shadow-glass-md">
          <div>
            <h3 className="text-lg font-extrabold text-white uppercase tracking-wider flex items-center">
              <Star className="w-5 h-5 mr-2 text-yellow-400" />
              Most Starred Repositories
            </h3>
            <p className="text-xs text-slate-500 mt-1">Top public projects rated by stargazers count.</p>
          </div>

          <div className="w-full h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mostStarred} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                <Bar dataKey="stargazers_count" name="Stars" fill="#f59e0b" radius={[4, 4, 0, 0]} maxBarSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Followers Growth Tracking & Top Repos Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Followers Growth Area Chart */}
        <div className="lg:col-span-1 glass-panel p-8 rounded-3xl space-y-6 shadow-glass-md">
          <div>
            <h3 className="text-lg font-extrabold text-white uppercase tracking-wider flex items-center">
              <Users className="w-5 h-5 mr-2 text-brand-400" />
              Followers Growth Tracking
            </h3>
            <p className="text-xs text-slate-500 mt-1">Historical growth tracking of user followers count.</p>
          </div>

          <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={followersGrowth} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="userFollowersColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(10, 10, 10, 0.9)', borderColor: 'rgba(255,255,255,0.08)', borderRadius: '12px' }} />
                <Area type="monotone" dataKey="followers" name="Followers" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#userFollowersColor)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Repositories Details Table */}
        <div className="lg:col-span-2 glass-panel p-8 rounded-3xl space-y-6 shadow-glass-md">
          <div>
            <h3 className="text-lg font-extrabold text-white uppercase tracking-wider flex items-center">
              <BookOpen className="w-5 h-5 mr-2 text-brand-400" />
              Repositories Index
            </h3>
            <p className="text-xs text-slate-500 mt-1">Index of public developer repositories with stars and language tags.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs md:text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500 uppercase font-bold tracking-wider">
                  <th className="pb-4 pl-2">Repository Name</th>
                  <th className="pb-4">Language</th>
                  <th className="pb-4 text-right">Stars</th>
                  <th className="pb-4 text-right pr-2">Forks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {mostStarred.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-800/20 text-slate-350">
                    <td className="py-4 pl-2 font-bold text-white font-mono">
                      {r.name}
                    </td>
                    <td className="py-4">
                      <span className="px-2.5 py-1 bg-slate-800 border border-slate-700 text-slate-300 rounded text-[10px] font-semibold">
                        {r.language || 'Markdown'}
                      </span>
                    </td>
                    <td className="py-4 text-right font-mono font-bold text-yellow-400">
                      {r.stargazers_count.toLocaleString()}
                    </td>
                    <td className="py-4 text-right font-mono text-slate-400 pr-2">
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

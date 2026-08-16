import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchRepositoryDetails, fetchUserProfile, fetchOrganizationProfile } from './githubSlice';
import BackButton from '../../components/common/BackButton';
import Loader from '../../components/common/Loader';
import ErrorState from '../../components/common/ErrorState';
import { Search, Github, GitBranch, User, Users2, Sparkles } from 'lucide-react';

export default function SearchPage() {
  const [searchType, setSearchType] = useState('repository'); // 'repository', 'user', 'organization'
  const [query, setQuery] = useState('');
  const [validationError, setValidationError] = useState('');

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error } = useSelector((state) => state.github);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!query) return;
    setValidationError('');

    if (searchType === 'repository') {
      const parts = query.trim().split('/');
      if (parts.length !== 2 || !parts[0] || !parts[1]) {
        setValidationError('Please enter repository in "owner/repo" format (e.g., facebook/react)');
        return;
      }
      const [owner, repo] = parts;
      dispatch(fetchRepositoryDetails({ owner, repo, refresh: true }))
        .unwrap()
        .then((data) => {
          navigate(`/github/repository/${owner}/${repo}`);
        });
    } else if (searchType === 'user') {
      dispatch(fetchUserProfile(query.trim()))
        .unwrap()
        .then((data) => {
          navigate(`/github/user/${query.trim()}`);
        });
    } else if (searchType === 'organization') {
      dispatch(fetchOrganizationProfile(query.trim()))
        .unwrap()
        .then((data) => {
          navigate(`/github/organization/${query.trim()}`);
        });
    }
  };

  const handleQuickClick = (type, qValue) => {
    setSearchType(type);
    setQuery(qValue);
    setValidationError('');

    if (type === 'repository') {
      const [owner, repo] = qValue.split('/');
      dispatch(fetchRepositoryDetails({ owner, repo, refresh: true }))
        .unwrap()
        .then(() => navigate(`/github/repository/${owner}/${repo}`));
    } else if (type === 'user') {
      dispatch(fetchUserProfile(qValue))
        .unwrap()
        .then(() => navigate(`/github/user/${qValue}`));
    } else if (type === 'organization') {
      dispatch(fetchOrganizationProfile(qValue))
        .unwrap()
        .then(() => navigate(`/github/organization/${qValue}`));
    }
  };

  const tabs = [
    { id: 'repository', label: 'Repository', icon: GitBranch, placeholder: 'e.g. facebook/react, microsoft/vscode' },
    { id: 'user', label: 'Developer User', icon: User, placeholder: 'e.g. torvalds, gaearon, tj' },
    { id: 'organization', label: 'Organization', icon: Users2, placeholder: 'e.g. facebook, microsoft, google' }
  ];

  const activeTab = tabs.find(t => t.id === searchType);

  return (
    <div className="space-y-10 max-w-4xl mx-auto text-slate-300">
      <div className="flex items-center space-x-4">
        <BackButton fallbackRoute="/github" />
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">GitHub Analytics Search</h1>
          <p className="text-slate-400 text-sm">Search repositories, users, or orgs to cache and run deep analytics.</p>
        </div>
      </div>

      {isLoading ? (
        <div className="glass-panel p-10 rounded-2xl">
          <Loader message={`Querying GitHub REST API, calculating health metrics, commit frequencies & caching records...`} />
        </div>
      ) : (
        <div className="space-y-8">
          {(error || validationError) && (
            <ErrorState error={error || validationError} />
          )}

          {/* Search Panel Card */}
          <div className="glass-panel p-10 rounded-3xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
              <Github className="w-24 h-24 text-white" />
            </div>

            {/* Selector tabs */}
            <div className="flex border-b border-slate-800 pb-3 mb-5 space-x-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setSearchType(tab.id);
                      setQuery('');
                      setValidationError('');
                    }}
                    className={`flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                      searchType === tab.id
                        ? 'bg-brand-650 text-white shadow-glass'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            <form onSubmit={handleSearchSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Enter {activeTab.label} Query
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={activeTab.placeholder}
                    className="w-full pl-10 pr-4 py-3 text-xs rounded-xl glass-input text-white"
                  />
                  <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl bg-brand-650 hover:bg-brand-600 text-white text-xs font-bold transition-all shadow-glass cursor-pointer"
              >
                <Search className="w-4 h-4" />
                <span>Analyze GitHub {activeTab.label}</span>
              </button>
            </form>
          </div>

          {/* Quick links suggestions */}
          <div className="space-y-4">
            <div>
              <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Popular Searches</h4>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-[10px] text-slate-400 font-bold block mb-1.5">REPOSITORIES</span>
                <div className="flex flex-wrap gap-2">
                  {['facebook/react', 'microsoft/vscode', 'spring-projects/spring-boot', 'nodejs/node'].map((r) => (
                    <button
                      key={r}
                      onClick={() => handleQuickClick('repository', r)}
                      className="px-3 py-1.5 border border-slate-800 bg-slate-900/40 text-slate-350 hover:text-white hover:border-brand-500/30 rounded-lg text-[11px] font-medium transition-all cursor-pointer flex items-center"
                    >
                      <Sparkles className="w-3 h-3 mr-1 text-yellow-500" />
                      <span>{r}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block mb-1.5">DEVELOPER PROFILES</span>
                  <div className="flex flex-wrap gap-2">
                    {['torvalds', 'gaearon', 'tj'].map((u) => (
                      <button
                        key={u}
                        onClick={() => handleQuickClick('user', u)}
                        className="px-3 py-1.5 border border-slate-800 bg-slate-900/40 text-slate-350 hover:text-white hover:border-brand-500/30 rounded-lg text-[11px] font-medium transition-all cursor-pointer"
                      >
                        @{u}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 font-bold block mb-1.5">ORGANIZATIONS</span>
                  <div className="flex flex-wrap gap-2">
                    {['facebook', 'microsoft', 'google'].map((o) => (
                      <button
                        key={o}
                        onClick={() => handleQuickClick('organization', o)}
                        className="px-3 py-1.5 border border-slate-800 bg-slate-900/40 text-slate-350 hover:text-white hover:border-brand-500/30 rounded-lg text-[11px] font-medium transition-all cursor-pointer"
                      >
                        {o}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

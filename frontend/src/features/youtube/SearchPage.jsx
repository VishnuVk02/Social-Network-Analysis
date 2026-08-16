import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchChannelOverview } from './youtubeSlice';
import BackButton from '../../components/common/BackButton';
import Loader from '../../components/common/Loader';
import ErrorState from '../../components/common/ErrorState';
import { Search, Youtube, Sparkles, HelpCircle } from 'lucide-react';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error } = useSelector((state) => state.youtube);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!query) return;

    dispatch(fetchChannelOverview({ channelName: query, refresh: true }))
      .unwrap()
      .then((channelData) => {
        // Navigate to ChannelDashboard using the internal DB UUID
        navigate(`/youtube/channel/${channelData.id}`);
      });
  };

  const handleQuickClick = (channelName) => {
    setQuery(channelName);
    dispatch(fetchChannelOverview({ channelName, refresh: true }))
      .unwrap()
      .then((channelData) => {
        navigate(`/youtube/channel/${channelData.id}`);
      });
  };

  return (
    <div className="p-8 space-y-8 max-w-2xl mx-auto text-slate-300">
      <div className="flex items-center space-x-4">
        <BackButton fallbackRoute="/youtube" />
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">YouTube Channel Search</h1>
          <p className="text-slate-400 text-xs">Search and provision channels into the PostgreSQL local analytics engine.</p>
        </div>
      </div>

      {isLoading ? (
        <div className="glass-panel p-8 rounded-2xl">
          <Loader message="Querying YouTube API, pulling videos, analyzing sentiments & caching records..." />
        </div>
      ) : (
        <div className="space-y-6">
          {error && <ErrorState error={error} />}

          <div className="glass-panel p-6 rounded-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
              <Youtube className="w-24 h-24 text-white" />
            </div>

            <form onSubmit={handleSearchSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Channel Handle or Name</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Enter channel handle (e.g. MrBeast, OpenAI, Fireship)"
                    className="w-full pl-10 pr-4 py-3 text-xs rounded-xl glass-input text-white"
                  />
                  <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-all shadow-glass cursor-pointer"
              >
                <Search className="w-4 h-4" />
                <span>Search and Analyze Channel</span>
              </button>
            </form>
          </div>

          {/* Prompt quick items */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Popular Searches</h4>
            <div className="flex flex-wrap gap-2.5">
              {['MrBeast', 'OpenAI', 'Fireship', 'TechWithTim'].map((name) => (
                <button
                  key={name}
                  onClick={() => handleQuickClick(name)}
                  className="px-3.5 py-2 border border-slate-800 bg-slate-900/40 text-slate-300 hover:text-white hover:border-red-500/30 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center"
                >
                  <Sparkles className="w-3.5 h-3.5 mr-1.5 text-red-500" />
                  <span>{name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

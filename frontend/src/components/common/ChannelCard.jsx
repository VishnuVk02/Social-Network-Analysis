import React from 'react';
import { Tv, Users, Eye, Video } from 'lucide-react';

export default function ChannelCard({ channel }) {
  if (!channel) return null;

  // Format statistics numbers cleanly
  const formatNumber = (num) => {
    if (num >= 1000000000) return (num / 1000000000).toFixed(1) + 'B';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  return (
    <div className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6 relative overflow-hidden border border-midnight-700/60 bg-midnight-900/80">

      <img
        src={channel.thumbnail || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=150&h=150&q=80'}
        alt={channel.name}
        className="w-24 h-24 rounded-full border-2 border-pine-500/40 object-cover shrink-0"
      />

      <div className="flex-1 space-y-3 text-center md:text-left">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center justify-center md:justify-start space-x-2">
            <span>{channel.name}</span>
            <span className="w-2.5 h-2.5 rounded-full bg-coral-500 inline-block animate-pulse" title="Live Analytics Sync"></span>
          </h2>
          <p className="text-slate-400 text-xs mt-1 leading-relaxed max-w-2xl line-clamp-3">
            {channel.description || 'No channel description provided.'}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 pt-2 max-w-md">
          <div className="bg-midnight-950/60 border border-midnight-700/60 p-2.5 rounded-xl text-center">
            <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider block">
              Subscribers
            </span>
            <span className="block text-sm font-bold text-white mt-0.5">{formatNumber(channel.subscriberCount)}</span>
          </div>

          <div className="bg-midnight-950/60 border border-midnight-700/60 p-2.5 rounded-xl text-center">
            <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider block">
              Total Views
            </span>
            <span className="block text-sm font-bold text-white mt-0.5">{formatNumber(channel.viewCount)}</span>
          </div>

          <div className="bg-midnight-950/60 border border-midnight-700/60 p-2.5 rounded-xl text-center">
            <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider block">
              Videos
            </span>
            <span className="block text-sm font-bold text-white mt-0.5">{formatNumber(channel.videoCount)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

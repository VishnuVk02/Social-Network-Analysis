import React from 'react';
import { Eye, Heart, MessageSquare, Calendar } from 'lucide-react';

export default function VideoTable({ videos }) {
  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (!videos || videos.length === 0) {
    return (
      <div className="p-8 text-center text-xs text-slate-500 font-medium">
        No video records captured for this channel.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto w-full">
      <table className="w-full border-collapse text-left text-xs text-slate-300">
        <thead>
          <tr className="border-b border-slate-800/80 text-slate-400 font-bold uppercase tracking-wider bg-slate-900/20">
            <th className="p-4">Video Info</th>
            <th className="p-4 text-right"><span className="flex items-center justify-end"><Eye className="w-3.5 h-3.5 mr-1" /> Views</span></th>
            <th className="p-4 text-right"><span className="flex items-center justify-end"><Heart className="w-3.5 h-3.5 mr-1" /> Likes</span></th>
            <th className="p-4 text-right"><span className="flex items-center justify-end"><MessageSquare className="w-3.5 h-3.5 mr-1" /> Comments</span></th>
            <th className="p-4 text-center"><span className="flex items-center justify-center"><Calendar className="w-3.5 h-3.5 mr-1" /> Upload Date</span></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/40">
          {videos.map((video) => (
            <tr key={video.id || video.youtubeVideoId} className="hover:bg-slate-800/20 transition-colors">
              <td className="p-4 flex items-center space-x-3 min-w-[280px]">
                <img
                  src={video.thumbnail || 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=120&h=67&q=80'}
                  alt={video.title}
                  className="w-16 h-9 rounded object-cover border border-slate-800 shrink-0 shadow-glass-sm"
                />
                <div className="overflow-hidden">
                  <h4 className="font-bold text-white truncate hover:text-brand-400 transition-colors" title={video.title}>
                    {video.title}
                  </h4>
                  <p className="text-[10px] text-slate-500 truncate mt-0.5 max-w-md">
                    {video.description || 'No description available.'}
                  </p>
                </div>
              </td>
              <td className="p-4 text-right font-semibold text-slate-200 font-mono">
                {formatNumber(video.views)}
              </td>
              <td className="p-4 text-right font-semibold text-slate-200 font-mono">
                {formatNumber(video.likes)}
              </td>
              <td className="p-4 text-right font-semibold text-slate-200 font-mono">
                {formatNumber(video.comments)}
              </td>
              <td className="p-4 text-center text-slate-400 font-medium">
                {formatDate(video.publishedAt)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

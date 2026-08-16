import React from 'react';
import { useSelector } from 'react-redux';
import Loader from '../../components/common/Loader';
import { Tag, Sparkles, BarChart2 } from 'lucide-react';

export default function TrendingTopicsPage({ channelId }) {
  const { trending, isLoading } = useSelector((state) => state.youtube);

  if (isLoading) {
    return <Loader message="Extracting keyword frequencies..." />;
  }

  const { keywords, topicRanking, wordCloud } = trending;

  if (!keywords || keywords.length === 0) {
    return (
      <div className="glass-panel p-8 rounded-2xl text-center text-xs text-slate-500 font-medium">
        No keywords extracted yet. Sync channel data to analyze.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Left 2 Columns: Keyword Frequency Table */}
      <div className="lg:col-span-2 glass-panel p-6 rounded-2xl space-y-4">
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Keyword Frequency Spectrum</h3>
          <p className="text-slate-500 text-[10px] mt-0.5">Top keywords extracted from video metadata and comment datasets.</p>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full border-collapse text-left text-xs text-slate-300">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase bg-slate-900/20">
                <th className="p-3">Keyword</th>
                <th className="p-3 text-right">Occurrence Count</th>
                <th className="p-3 text-right">Relative density</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40">
              {keywords.map((kw, index) => (
                <tr key={kw.id || index} className="hover:bg-slate-800/20 transition-colors">
                  <td className="p-3 font-semibold text-white flex items-center">
                    <Tag className="w-3.5 h-3.5 mr-2 text-red-500" />
                    <span>{kw.keyword}</span>
                  </td>
                  <td className="p-3 text-right font-mono text-slate-300 font-bold">
                    {kw.frequency}
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <div className="w-24 bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-red-500 h-full rounded-full"
                          style={{ width: `${Math.min((kw.frequency / keywords[0].frequency) * 100, 100)}%` }}
                        ></div>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {Math.round((kw.frequency / keywords[0].frequency) * 100)}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Right 1 Column: Word Cloud List & Topic Ranking */}
      <div className="lg:col-span-1 space-y-6">
        
        {/* Word Cloud Dataset */}
        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center">
            <Sparkles className="w-4 h-4 mr-2 text-amber-500" /> Word Density Map
          </h3>
          <div className="flex flex-wrap gap-2 pt-2">
            {wordCloud.map((w, index) => {
              // Font sizes based on frequency
              const baseSize = 10;
              const maxFreq = keywords[0]?.frequency || 1;
              const computedSize = Math.min(baseSize + Math.round((w.value / maxFreq) * 10), 22);

              return (
                <span
                  key={index}
                  className="font-bold tracking-tight rounded px-1.5 py-0.5 inline-block hover:scale-105 transition-transform"
                  style={{
                    fontSize: `${computedSize}px`,
                    color: index % 3 === 0 ? '#ef4444' : index % 3 === 1 ? '#3b82f6' : '#10b981',
                    opacity: 0.5 + (w.value / maxFreq) * 0.5
                  }}
                >
                  {w.text}
                </span>
              );
            })}
          </div>
        </div>

        {/* Topic Ranking */}
        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center">
            <BarChart2 className="w-4 h-4 mr-2 text-emerald-500" /> Topic Rankings
          </h3>
          <ul className="space-y-3.5 text-xs">
            {topicRanking.map((topic, index) => (
              <li key={index} className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">#{index + 1} {topic.keyword}</span>
                <span className="font-bold text-white font-mono">{topic.frequency} references</span>
              </li>
            ))}
          </ul>
        </div>

      </div>
    </div>
  );
}

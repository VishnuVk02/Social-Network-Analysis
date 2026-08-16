import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

export default function MetricCard({ title, value, change, changeType, icon: Icon, description }) {
  // Determine trend color and icon based on changeType
  const getTrendStyles = () => {
    switch (changeType) {
      case 'positive':
        return {
          bg: 'bg-pine-500/10 border-pine-500/20 text-pine-400',
          icon: ArrowUpRight
        };
      case 'negative':
        return {
          bg: 'bg-coral-500/10 border-coral-500/20 text-coral-400',
          icon: ArrowDownRight
        };
      default:
        return {
          bg: 'bg-midnight-700/60 border-midnight-600 text-slate-400',
          icon: Minus
        };
    }
  };

  const trend = getTrendStyles();
  const TrendIcon = trend.icon;

  return (
    <div className="glass-panel glass-card-hover p-6 rounded-2xl relative overflow-hidden group border border-midnight-700/60 bg-midnight-900/80">

      <div className="flex justify-between items-start">
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</span>
          <h3 className="text-3xl font-bold text-white mt-2 tracking-tight">{value}</h3>
        </div>
      </div>

      <div className="flex items-center space-x-2 mt-4">
        {change && (
          <span className={`flex items-center text-xs px-2 py-0.75 rounded-md border font-semibold ${trend.bg}`}>
            <TrendIcon className="w-3.5 h-3.5 mr-0.5 shrink-0" />
            {change}
          </span>
        )}
        <span className="text-xs text-slate-400 truncate">{description}</span>
      </div>
    </div>
  );
}

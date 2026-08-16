import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

export default function MetricCard({ title, value, change, changeType, icon: Icon, description }) {
  // Determine trend color and icon based on changeType
  const getTrendStyles = () => {
    switch (changeType) {
      case 'positive':
        return {
          bg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
          icon: ArrowUpRight
        };
      case 'negative':
        return {
          bg: 'bg-rose-500/10 border-rose-500/20 text-rose-400',
          icon: ArrowDownRight
        };
      default:
        return {
          bg: 'bg-slate-500/10 border-slate-500/20 text-slate-400',
          icon: Minus
        };
    }
  };

  const trend = getTrendStyles();
  const TrendIcon = trend.icon;

  return (
    <div className="glass-panel glass-card-hover p-6 rounded-2xl relative overflow-hidden group">
      {/* Background soft glowing circle */}
      <div className="absolute -right-6 -top-6 w-24 h-24 bg-brand-600/10 rounded-full blur-2xl group-hover:bg-brand-600/15 transition-all"></div>

      <div className="flex justify-between items-start">
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</span>
          <h3 className="text-3xl font-bold text-white mt-2 tracking-tight">{value}</h3>
        </div>
        <div className="p-3 bg-brand-500/10 rounded-xl border border-brand-500/20 text-brand-400 group-hover:scale-105 transition-transform">
          {React.isValidElement(Icon) ? Icon : <Icon className="w-5 h-5" />}
        </div>
      </div>

      <div className="flex items-center space-x-2 mt-4">
        {change && (
          <span className={`flex items-center text-xs px-2 py-0.75 rounded-md border font-medium ${trend.bg}`}>
            <TrendIcon className="w-3.5 h-3.5 mr-0.5 shrink-0" />
            {change}
          </span>
        )}
        <span className="text-xs text-slate-400 truncate">{description}</span>
      </div>
    </div>
  );
}

import React from 'react';
import { useSelector } from 'react-redux';
import PieChart from '../../components/common/PieChart';
import MetricCard from '../../components/common/MetricCard';
import Loader from '../../components/common/Loader';
import { Smile, Meh, Frown, Users } from 'lucide-react';

export default function SentimentAnalysisPage({ channelId }) {
  const { sentiment, isLoading } = useSelector((state) => state.youtube);

  if (isLoading) {
    return <Loader message="Analyzing comments linguistic distributions..." />;
  }

  const { overallCounts, positivePercent, negativePercent, neutralPercent, pieData } = sentiment;

  const totalComments = overallCounts.POSITIVE + overallCounts.NEUTRAL + overallCounts.NEGATIVE;

  return (
    <div className="space-y-8">
      {/* Sentiment Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="Positive Comments"
          value={`${positivePercent}%`}
          icon={<Smile className="w-5 h-5 text-emerald-500" />}
          description={`${overallCounts.POSITIVE} comments expressing positive sentiment`}
        />
        <MetricCard
          title="Neutral Comments"
          value={`${neutralPercent}%`}
          icon={<Meh className="w-5 h-5 text-slate-400" />}
          description={`${overallCounts.NEUTRAL} comments expressing neutral sentiment`}
        />
        <MetricCard
          title="Negative Comments"
          value={`${negativePercent}%`}
          icon={<Frown className="w-5 h-5 text-red-500" />}
          description={`${overallCounts.NEGATIVE} comments expressing critical sentiment`}
        />
      </div>

      {/* Pie Chart and statistics table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pie Chart Card */}
        <div className="lg:col-span-1 glass-panel p-6 rounded-2xl space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Linguistic Ratios</h3>
            <p className="text-slate-500 text-[10px] mt-0.5">Linguistic classifications pie chart.</p>
          </div>
          <div className="flex items-center justify-center">
            <PieChart data={pieData} nameKey="name" valueKey="value" height={220} />
          </div>
        </div>

        {/* Sentiment breakdown list */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Sentiment Intelligence Statistics</h3>
              <p className="text-slate-500 text-[10px] mt-0.5">Aggregated metrics evaluated across top viewed video comment threads.</p>
            </div>
            <span className="text-[10px] font-bold text-slate-400 bg-slate-900 border border-slate-800 px-2 py-1 rounded-md">
              Sample Size: {totalComments} comments
            </span>
          </div>

          <div className="divide-y divide-slate-800/40 text-xs">
            <div className="flex justify-between py-3">
              <span className="text-slate-400 flex items-center"><Smile className="w-4 h-4 mr-2 text-emerald-500" /> Positive Expressions</span>
              <span className="font-bold text-emerald-400">{overallCounts.POSITIVE} ({positivePercent}%)</span>
            </div>
            <div className="flex justify-between py-3">
              <span className="text-slate-400 flex items-center"><Meh className="w-4 h-4 mr-2 text-slate-400" /> Neutral Statements</span>
              <span className="font-bold text-slate-300">{overallCounts.NEUTRAL} ({neutralPercent}%)</span>
            </div>
            <div className="flex justify-between py-3">
              <span className="text-slate-400 flex items-center"><Frown className="w-4 h-4 mr-2 text-red-500" /> Negative Sentiments</span>
              <span className="font-bold text-red-400">{overallCounts.NEGATIVE} ({negativePercent}%)</span>
            </div>
            <div className="flex justify-between py-3">
              <span className="text-slate-400 flex items-center font-semibold text-white">Sentiment Health Index</span>
              <span className="font-bold text-white">
                {positivePercent > 60 ? 'HIGHLY SATISFIED' : positivePercent > 40 ? 'STABLE / DECENT' : 'CRITICAL'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

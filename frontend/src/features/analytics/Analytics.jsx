import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSentimentDistribution, fetchGrowthAndForecast } from './analyticsSlice';
import PieChartWrapper from '../../components/charts/PieChartWrapper';
import BarChartWrapper from '../../components/charts/BarChartWrapper';
import LineChartWrapper from '../../components/charts/LineChartWrapper';
import BackButton from '../../components/common/BackButton';
import { Smile, HelpCircle, Frown, Sparkles, TrendingUp } from 'lucide-react';

export default function Analytics() {
  const dispatch = useDispatch();
  const { selectedPlatform } = useSelector((state) => state.dashboard);
  const { sentiment, forecasts, growthHistory } = useSelector((state) => state.analytics);

  useEffect(() => {
    dispatch(fetchSentimentDistribution(selectedPlatform));
    dispatch(fetchGrowthAndForecast(selectedPlatform));
  }, [dispatch, selectedPlatform]);

  // Map forecast data to nice readable labels
  const formattedForecasts = forecasts.map(f => ({
    ...f,
    formattedDate: new Date(f.date).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }),
    metricLabel: f.metricName === 'engagement_rate' ? 'Engagement (%)' : 'Followers count'
  }));

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header bar with back button */}
      <div className="flex flex-col space-y-4 md:flex-row md:justify-between md:items-center md:space-y-0">
        <div className="flex items-center space-x-4">
          <BackButton fallbackRoute="/" />
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Performance Analytics</h1>
            <p className="text-slate-400 text-sm">Deep-dive sentiments, historical growth indices and model forecasts.</p>
          </div>
        </div>
      </div>

      {/* Grid containing sentiment and forecasts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Sentiment breakdown card */}
        <div className="glass-panel p-6 rounded-2xl lg:col-span-1 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-semibold text-white flex items-center">
              <Smile className="w-5 h-5 mr-2 text-emerald-400" />
              Audience Sentiment
            </h3>
            <p className="text-xs text-slate-400 mt-1">Ratio of positive, neutral and negative remarks in current campaign.</p>
          </div>

          <div className="my-2">
            <PieChartWrapper 
              positive={sentiment.positive}
              neutral={sentiment.neutral}
              negative={sentiment.negative}
            />
          </div>

          {/* Sentiment Metrics Grid */}
          <div className="grid grid-cols-3 gap-2 text-center border-t border-slate-800/80 pt-4 text-xs font-semibold">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="block text-[10px] text-slate-400 uppercase font-medium">Positive</span>
              <span>{sentiment.positive}%</span>
            </div>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <span className="block text-[10px] text-slate-400 uppercase font-medium">Neutral</span>
              <span>{sentiment.neutral}%</span>
            </div>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <span className="block text-[10px] text-slate-400 uppercase font-medium">Negative</span>
              <span>{sentiment.negative}%</span>
            </div>
          </div>
        </div>

        {/* Forecast chart card */}
        <div className="glass-panel p-6 rounded-2xl lg:col-span-2">
          <div className="mb-4">
            <h3 className="text-base font-semibold text-white flex items-center">
              <Sparkles className="w-5 h-5 mr-2 text-indigo-400" />
              Predictive Models & Forecasts
            </h3>
            <p className="text-xs text-slate-400 mt-1">3-Month forecasts modeling follower and engagement expansion.</p>
          </div>

          {formattedForecasts.length > 0 ? (
            <BarChartWrapper
              data={formattedForecasts}
              xKey="formattedDate"
              yKey="forecastedValue"
              name="Forecasted Metric"
              barColor="#818cf8"
            />
          ) : (
            <div className="h-80 flex items-center justify-center text-slate-500 text-xs">
              No forecast model active for the current platform selection.
            </div>
          )}
        </div>

      </div>

      {/* Historical growth card */}
      <div className="glass-panel p-6 rounded-2xl">
        <div className="mb-4">
          <h3 className="text-base font-semibold text-white flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-brand-400" />
            Like Growth Statistics
          </h3>
          <p className="text-xs text-slate-400 mt-1">Accumulated likes growth rate grouped by month.</p>
        </div>

        {growthHistory.length > 0 ? (
          <LineChartWrapper
            data={growthHistory}
            xKey="period"
            dataKey="likes"
            name="Likes"
            strokeColor="#10b981"
          />
        ) : (
          <div className="h-80 flex items-center justify-center text-slate-500 text-xs">
            No history data logged.
          </div>
        )}
      </div>

    </div>
  );
}

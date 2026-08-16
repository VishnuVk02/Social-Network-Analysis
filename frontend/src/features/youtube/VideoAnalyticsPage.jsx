import React from 'react';
import { useSelector } from 'react-redux';
import VideoTable from '../../components/common/VideoTable';
import BarChart from '../../components/common/BarChart';
import LineChart from '../../components/common/LineChart';
import MetricCard from '../../components/common/MetricCard';
import Loader from '../../components/common/Loader';
import { Eye, Heart, MessageSquare, Award } from 'lucide-react';

export default function VideoAnalyticsPage({ channelId }) {
  const { video, isLoading } = useSelector((state) => state.youtube);

  if (isLoading) {
    return <Loader message="Compiling video distribution curves..." />;
  }

  const { topViewed, topLiked, averages, distributions } = video;

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return (num || 0).toString();
  };

  return (
    <div className="space-y-8">
      {/* Average Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="Average Views / Video"
          value={formatNumber(averages.averageViews)}
          icon={<Eye className="w-5 h-5 text-blue-500" />}
          description="Average views across latest uploads"
        />
        <MetricCard
          title="Average Likes / Video"
          value={formatNumber(averages.averageLikes)}
          icon={<Heart className="w-5 h-5 text-red-500" />}
          description="Average likes across latest uploads"
        />
        <MetricCard
          title="Average Comments / Video"
          value={formatNumber(averages.averageComments)}
          icon={<MessageSquare className="w-5 h-5 text-amber-500" />}
          description="Average comments across latest uploads"
        />
      </div>

      {/* Distribution Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Views Distribution */}
        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Views Distribution</h3>
            <p className="text-slate-500 text-[10px] mt-0.5">Compares view counts chronologically across recent uploads.</p>
          </div>
          <BarChart
            data={distributions}
            xKey="title"
            series={[{ key: 'views', name: 'Views Count', color: '#3b82f6' }]}
            height={260}
          />
        </div>

        {/* Likes / Comments Distribution */}
        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Likes & Engagement Distribution</h3>
            <p className="text-slate-500 text-[10px] mt-0.5">Plots likes and comments counts side-by-side.</p>
          </div>
          <LineChart
            data={distributions}
            xKey="title"
            series={[
              { key: 'likes', name: 'Likes', color: '#ef4444' },
              { key: 'comments', name: 'Comments', color: '#f59e0b' }
            ]}
            height={260}
          />
        </div>
      </div>

      {/* Top Viewed Videos Section */}
      <div className="glass-panel p-6 rounded-2xl space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center">
          <Award className="w-4 h-4 mr-2 text-red-500" /> Top Performing Uploads
        </h3>
        <VideoTable videos={topViewed} />
      </div>
    </div>
  );
}

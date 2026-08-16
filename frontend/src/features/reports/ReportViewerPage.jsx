import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchReportById, deleteReportById, downloadReportPdf } from './reportsSlice';
import BackButton from '../../components/common/BackButton';
import ShareReportModal from '../../components/common/ShareReportModal';
import {
  FileText,
  Download,
  Share2,
  Trash2,
  Github,
  Youtube,
  TrendingUp,
  Layers,
  Calendar,
  User,
  Shield,
  Sparkles,
  BarChart2,
  CheckCircle2,
  Lock,
  Globe,
  ExternalLink
} from 'lucide-react';

export default function ReportViewerPage() {
  const { reportId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user: currentUser } = useSelector((state) => state.auth);
  const { activeReport, isLoadingReport, isExportingPdf, error } = useSelector((state) => state.reports);

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  useEffect(() => {
    if (reportId) {
      dispatch(fetchReportById(reportId));
    }
  }, [dispatch, reportId]);

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this Telemetron Report snapshot?')) {
      dispatch(deleteReportById(reportId)).then((res) => {
        if (!res.error) {
          navigate('/reports');
        }
      });
    }
  };

  const handleDownloadPdf = () => {
    if (activeReport) {
      dispatch(downloadReportPdf({ reportId: activeReport.id, title: activeReport.title }));
    }
  };

  const getCategoryIcon = (type) => {
    switch (type) {
      case 'GITHUB':
        return <Github className="w-5 h-5 text-slate-200" />;
      case 'YOUTUBE':
        return <Youtube className="w-5 h-5 text-red-400" />;
      case 'TRENDS':
        return <TrendingUp className="w-5 h-5 text-emerald-400" />;
      default:
        return <FileText className="w-5 h-5 text-brand-400" />;
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });
  };

  if (isLoadingReport) {
    return (
      <div className="p-12 text-center text-slate-500 text-xs space-y-3 max-w-7xl mx-auto">
        <div className="w-8 h-8 border-3 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p>Loading Telemetron Report Document...</p>
      </div>
    );
  }

  if (error || !activeReport) {
    return (
      <div className="p-8 max-w-xl mx-auto space-y-4 text-center">
        <div className="glass-panel p-8 rounded-2xl border border-coral-500/20 bg-midnight-900/80 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-coral-500/10 text-coral-400 flex items-center justify-center mx-auto">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">Report Unavailable</h3>
          <p className="text-xs text-coral-400">{error || 'This report is no longer available or has been deleted.'}</p>
          <button
            onClick={() => navigate('/reports')}
            className="px-4 py-2 rounded-xl bg-midnight-800 border border-midnight-700 text-slate-200 hover:text-white hover:border-pine-500/40 text-xs font-semibold cursor-pointer"
          >
            Back to Saved Reports
          </button>
        </div>
      </div>
    );
  }

  const data = activeReport.reportData || {};
  const isOwner = activeReport.createdById === currentUser?.id;
  const canDelete = isOwner || currentUser?.role === 'ADMIN';

  const platformName = activeReport.sourcePlatform === 'YOUTUBE' ? 'YouTube' : 'GitHub';
  const entityTypeName = activeReport.sourcePlatform === 'YOUTUBE' ? 'Channel' : 'Repository';

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-5xl mx-auto text-slate-300">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center space-y-3 sm:space-y-0 border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <BackButton fallbackRoute="/reports" />
          <div>
            <span className="text-[10px] font-mono text-brand-400 uppercase tracking-widest block font-bold">
              TELEMETRON ANALYTICS REPORT
            </span>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center space-x-2">
              <span>{activeReport.title}</span>
            </h1>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="flex items-center space-x-2.5">
          <button
            onClick={handleDownloadPdf}
            disabled={isExportingPdf}
            className="px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white font-semibold text-xs transition-all shadow-glass-indigo flex items-center space-x-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>{isExportingPdf ? 'Exporting PDF...' : 'Download PDF'}</span>
          </button>

          <button
            onClick={() => setIsShareModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-200 font-semibold text-xs transition-all flex items-center space-x-1.5 cursor-pointer"
          >
            <Share2 className="w-4 h-4 text-brand-400" />
            <span>Share</span>
          </button>

          {canDelete && (
            <button
              onClick={handleDelete}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-all cursor-pointer"
              title="Delete Report"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 6-PAGE DOCUMENT PREVIEW WRAPPER */}
      <div className="bg-slate-950 p-6 sm:p-10 rounded-2xl border border-slate-800 space-y-12 shadow-2xl relative">
        {/* DOCUMENT HEADER / SPECS (Page 1 Web Preview) */}
        <div className="bg-white text-slate-900 p-8 rounded-xl shadow-lg space-y-6">
          <div className="flex justify-between items-start border-b border-slate-200 pb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">TELEMETRON</span>
              <h2 className="text-3xl font-black text-slate-900 mt-1">{platformName} {entityTypeName}</h2>
              <h2 className="text-3xl font-black text-slate-900">Analytics Report</h2>
              <p className="text-xs text-slate-500 mt-2">Formal performance analysis and historical snapshot</p>
            </div>
            {data.targetUrl && (
              <button
                onClick={() => navigate(data.targetUrl)}
                className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center space-x-1 border border-indigo-200 cursor-pointer"
              >
                <span>Live Dashboard</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="divide-y divide-slate-200 border border-slate-200 rounded-lg overflow-hidden text-xs">
            <div className="flex"><div className="w-44 bg-slate-50 font-bold p-3 uppercase text-slate-600 border-r border-slate-200">{entityTypeName.toUpperCase()}</div><div className="p-3 font-semibold text-slate-900 flex-1">{activeReport.targetReference}</div></div>
            <div className="flex"><div className="w-44 bg-slate-50 font-bold p-3 uppercase text-slate-600 border-r border-slate-200">{entityTypeName.toUpperCase()} ID</div><div className="p-3 font-mono text-slate-800 flex-1">{data.targetId || activeReport.targetReference}</div></div>
            <div className="flex"><div className="w-44 bg-slate-50 font-bold p-3 uppercase text-slate-600 border-r border-slate-200">REPORT PERIOD</div><div className="p-3 text-slate-800 flex-1">Last 30 Days</div></div>
            <div className="flex"><div className="w-44 bg-slate-50 font-bold p-3 uppercase text-slate-600 border-r border-slate-200">GENERATED</div><div className="p-3 text-slate-800 flex-1">{formatDate(activeReport.createdAt)}</div></div>
            <div className="flex"><div className="w-44 bg-slate-50 font-bold p-3 uppercase text-slate-600 border-r border-slate-200">REPORT TYPE</div><div className="p-3 text-slate-800 flex-1">{platformName} {entityTypeName} Analytics</div></div>
            <div className="flex"><div className="w-44 bg-slate-50 font-bold p-3 uppercase text-slate-600 border-r border-slate-200">VISIBILITY</div><div className="p-3 font-bold text-indigo-600 flex-1">{activeReport.visibility}</div></div>
          </div>
        </div>

        {/* 1. EXECUTIVE SUMMARY & 2. KPIS & 3. OVERVIEW (Page 2 Web Preview) */}
        <div className="bg-white text-slate-900 p-8 rounded-xl shadow-lg space-y-6">
          <div className="space-y-2">
            <h3 className="text-xl font-black text-slate-900 border-b border-slate-200 pb-2">1. Executive Summary</h3>
            <p className="text-xs text-slate-700 leading-relaxed">{data.executiveSummary}</p>
          </div>

          <div className="space-y-3 pt-2">
            <h3 className="text-xl font-black text-slate-900 border-b border-slate-200 pb-2">2. Key Performance Indicators</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {(data.kpis || []).map((kpi, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">{kpi.label}</span>
                  <span className="text-2xl font-black text-slate-900 block">{kpi.value}</span>
                  <span className="text-xs font-bold text-emerald-600">{kpi.change}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <h3 className="text-xl font-black text-slate-900 border-b border-slate-200 pb-2">3. {entityTypeName} Overview</h3>
            <div className="divide-y divide-slate-200 border border-slate-200 rounded-lg overflow-hidden text-xs">
              <div className="bg-slate-900 text-white font-bold grid grid-cols-12 p-3">
                <div className="col-span-3">Metric</div>
                <div className="col-span-3">Current Value</div>
                <div className="col-span-3">Period Change</div>
                <div className="col-span-3">Interpretation</div>
              </div>
              {(data.overviewRows || []).map((r, idx) => (
                <div key={idx} className="grid grid-cols-12 p-3 bg-white hover:bg-slate-50">
                  <div className="col-span-3 font-semibold text-slate-900">{r.metric}</div>
                  <div className="col-span-3 font-mono">{r.currentValue}</div>
                  <div className="col-span-3 font-bold text-emerald-600">{r.periodChange}</div>
                  <div className="col-span-3 text-slate-600">{r.interpretation}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 4. HISTORICAL PERFORMANCE (Page 3 Web Preview) */}
        <div className="bg-white text-slate-900 p-8 rounded-xl shadow-lg space-y-6">
          <div className="space-y-2">
            <h3 className="text-xl font-black text-slate-900 border-b border-slate-200 pb-2">4. Historical Performance</h3>
            <p className="text-xs text-slate-700">The following trends show channel performance across the selected 30-day period. Values are presented as a report snapshot and highlight direction and momentum.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <h4 className="text-sm font-bold text-slate-900">{data.lineChart1?.title || 'Growth Velocity'}</h4>
              <div className="h-40 bg-white rounded border border-slate-200 p-4 flex items-end justify-between space-x-1">
                {(data.lineChart1?.values || [50, 60, 70, 80, 90]).map((val, idx) => (
                  <div key={idx} className="flex-1 bg-indigo-600 rounded-t transition-all" style={{ height: `${Math.min(val / 10, 100)}%` }}></div>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <h4 className="text-sm font-bold text-slate-900">{data.lineChart2?.title || 'Daily Velocity'}</h4>
              <div className="h-40 bg-white rounded border border-slate-200 p-4 flex items-end justify-between space-x-1">
                {(data.lineChart2?.values || [40, 50, 60, 70, 80]).map((val, idx) => (
                  <div key={idx} className="flex-1 bg-indigo-600 rounded-t transition-all" style={{ height: `${Math.min(val / 10, 100)}%` }}></div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 5. CONTENT PERFORMANCE (Page 4 Web Preview) */}
        <div className="bg-white text-slate-900 p-8 rounded-xl shadow-lg space-y-6">
          <div className="space-y-2">
            <h3 className="text-xl font-black text-slate-900 border-b border-slate-200 pb-2">
              5. {activeReport.sourcePlatform === 'YOUTUBE' ? 'Content Performance' : 'Repository Contributors'}
            </h3>
            <p className="text-xs text-slate-700">The table identifies the strongest items in the selected period based on volume and engagement.</p>
          </div>

          <div className="divide-y divide-slate-200 border border-slate-200 rounded-lg overflow-hidden text-xs">
            <div className="bg-slate-900 text-white font-bold grid grid-cols-12 p-3">
              <div className="col-span-1">RANK</div>
              <div className="col-span-5">{activeReport.sourcePlatform === 'YOUTUBE' ? 'VIDEO' : 'CONTRIBUTOR'}</div>
              <div className="col-span-2">{activeReport.sourcePlatform === 'YOUTUBE' ? 'VIEWS' : 'COMMITS'}</div>
              <div className="col-span-2">{activeReport.sourcePlatform === 'YOUTUBE' ? 'LIKES' : 'LINES'}</div>
              <div className="col-span-2">ENGAGEMENT</div>
            </div>
            {(data.topContent || []).map((item, idx) => (
              <div key={idx} className="grid grid-cols-12 p-3 bg-white hover:bg-slate-50">
                <div className="col-span-1 font-bold text-indigo-600">#{item.rank}</div>
                <div className="col-span-5 font-bold text-slate-900 truncate">{item.name}</div>
                <div className="col-span-2 font-mono text-slate-700">{item.views}</div>
                <div className="col-span-2 font-mono text-slate-700">{item.likes}</div>
                <div className="col-span-2 font-bold text-emerald-600">{item.engagement}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 6. ENGAGEMENT & 7. INSIGHTS (Page 5 Web Preview) */}
        <div className="bg-white text-slate-900 p-8 rounded-xl shadow-lg space-y-6">
          <div className="space-y-2">
            <h3 className="text-xl font-black text-slate-900 border-b border-slate-200 pb-2">6. Engagement Analysis</h3>
            <p className="text-xs text-slate-700">Engagement increased during the reporting period. The highest-performing content demonstrates stronger interaction relative to the average.</p>
          </div>

          <div className="space-y-3 pt-2">
            <h3 className="text-xl font-black text-slate-900 border-b border-slate-200 pb-2">7. Data-Driven Insights</h3>
            <div className="divide-y divide-slate-200 border border-slate-200 rounded-lg overflow-hidden text-xs">
              {(data.insightsRows || []).map((row, idx) => (
                <div key={idx} className="flex">
                  <div className="w-44 bg-slate-50 font-bold p-3 uppercase text-slate-700 border-r border-slate-200">{row.category}</div>
                  <div className="p-3 text-slate-800 flex-1 leading-relaxed">{row.detail}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 8. CONCLUSION & 9. METADATA (Page 6 Web Preview) */}
        <div className="bg-white text-slate-900 p-8 rounded-xl shadow-lg space-y-6">
          <div className="space-y-2">
            <h3 className="text-xl font-black text-slate-900 border-b border-slate-200 pb-2">8. Conclusion</h3>
            <p className="text-xs text-slate-700 leading-relaxed">{data.conclusion}</p>
          </div>

          <div className="space-y-3 pt-2">
            <h3 className="text-xl font-black text-slate-900 border-b border-slate-200 pb-2">9. Report Metadata</h3>
            <div className="divide-y divide-slate-200 border border-slate-200 rounded-lg overflow-hidden text-xs">
              {(data.metadataRows || []).map((row, idx) => (
                <div key={idx} className="flex">
                  <div className="w-44 bg-slate-50 font-bold p-3 uppercase text-slate-700 border-r border-slate-200">{row.key}</div>
                  <div className="p-3 text-slate-800 flex-1">{row.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Share Report Modal */}
      <ShareReportModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        reportData={{
          ...data,
          reportId: activeReport.id,
          targetUrl: `/reports/${activeReport.id}`
        }}
      />
    </div>
  );
}

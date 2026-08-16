import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchSavedReports, deleteReportById, downloadReportPdf } from './reportsSlice';
import BackButton from '../../components/common/BackButton';
import {
  FileText,
  Search,
  Github,
  Youtube,
  Clock,
  User,
  Trash2,
  ExternalLink,
  Lock,
  Globe,
  Download
} from 'lucide-react';

export default function ReportsPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user: currentUser } = useSelector((state) => state.auth);
  const { savedReports, isLoadingList } = useSelector((state) => state.reports);

  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    dispatch(fetchSavedReports({ category: categoryFilter, search: searchQuery }));
  }, [dispatch, categoryFilter, searchQuery]);

  const handleDelete = (e, reportId) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this Telemetron Report snapshot?')) {
      dispatch(deleteReportById(reportId));
    }
  };

  const handleDownloadPdf = (e, report) => {
    e.stopPropagation();
    dispatch(downloadReportPdf({ reportId: report.id, title: report.title }));
  };

  const getCategoryIcon = (type) => {
    switch (type) {
      case 'GITHUB':
        return <Github className="w-4 h-4 text-slate-200" />;
      case 'YOUTUBE':
        return <Youtube className="w-4 h-4 text-red-400" />;
      default:
        return <FileText className="w-4 h-4 text-brand-400" />;
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto text-slate-300">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center space-y-3 sm:space-y-0 border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <BackButton fallbackRoute="/" />
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center space-x-2">
              <FileText className="w-6 h-6 text-brand-400" />
              <span>Report History</span>
            </h1>
            <p className="text-xs text-slate-400">View, search, download, and manage historical formal analytics reports.</p>
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 glass-panel p-4 rounded-2xl border border-slate-800/80">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search saved reports by title or target entity..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl glass-input text-white bg-slate-900/80"
          />
        </div>

        {/* Category Tabs */}
        <div className="flex space-x-1 overflow-x-auto bg-slate-950/60 p-1 rounded-xl border border-slate-800/80">
          {[
            { id: 'ALL', label: 'All Reports' },
            { id: 'GITHUB', label: 'GitHub' },
            { id: 'YOUTUBE', label: 'YouTube' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setCategoryFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                categoryFilter === tab.id
                  ? 'bg-brand-600 text-white shadow-glass-indigo'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Reports Grid */}
      {isLoadingList ? (
        <div className="p-12 text-center text-slate-500 text-xs space-y-2">
          <div className="w-8 h-8 border-3 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <span>Loading report history...</span>
        </div>
      ) : savedReports.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-2xl border border-slate-800 space-y-4 max-w-md mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-brand-500/10 border border-brand-500/20 text-brand-400 flex items-center justify-center mx-auto">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">No Saved Reports Found</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            No historical reports match your search criteria. Reports must be generated directly from an active YouTube Channel or GitHub Repository analytics dashboard.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedReports.map((report) => {
            const isOwner = report.createdById === currentUser?.id;
            const canDelete = isOwner || currentUser?.role === 'ADMIN';

            return (
              <div
                key={report.id}
                onClick={() => navigate(`/reports/${report.id}`)}
                className="glass-panel p-5 rounded-2xl border border-slate-800/80 hover:border-brand-500/40 transition-all cursor-pointer flex flex-col justify-between space-y-4 group relative shadow-lg"
              >
                {/* Header */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border bg-slate-900 border-slate-800 text-slate-300 flex items-center space-x-1.5">
                      {getCategoryIcon(report.reportType)}
                      <span>{report.sourcePlatform}</span>
                    </span>

                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] text-slate-500 flex items-center space-x-1">
                        {report.visibility === 'ORGANIZATION' ? (
                          <Globe className="w-3 h-3 text-brand-400" title="Organization Visible" />
                        ) : (
                          <Lock className="w-3 h-3 text-slate-500" title="Private Report" />
                        )}
                      </span>

                      {canDelete && (
                        <button
                          onClick={(e) => handleDelete(e, report.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-slate-500 hover:text-red-400 cursor-pointer"
                          title="Delete Report"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <h3 className="text-sm font-bold text-white group-hover:text-brand-400 transition-colors leading-tight">
                    {report.title}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {report.description}
                  </p>
                </div>

                {/* Target entity badge */}
                <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/60 text-xs">
                  <span className="text-[10px] text-slate-500 font-semibold block uppercase">Target Source</span>
                  <span className="font-bold text-slate-200 truncate block">{report.targetReference}</span>
                </div>

                {/* Footer metadata */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                  <div className="flex items-center space-x-1.5">
                    <User className="w-3.5 h-3.5 text-slate-500" />
                    <span>{report.createdByName}</span>
                  </div>

                  <div className="flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>{formatDate(report.createdAt)}</span>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="pt-1 flex space-x-2">
                  <button
                    onClick={() => navigate(`/reports/${report.id}`)}
                    className="flex-1 py-2 px-3 rounded-xl bg-slate-900 group-hover:bg-brand-600 text-slate-200 group-hover:text-white font-semibold text-xs transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
                  >
                    <span>Open</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={(e) => handleDownloadPdf(e, report)}
                    className="py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-emerald-400 font-semibold text-xs transition-all flex items-center justify-center space-x-1 cursor-pointer"
                    title="Download PDF Document"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>PDF</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

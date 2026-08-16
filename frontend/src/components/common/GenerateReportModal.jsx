import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { generateNewReport, downloadReportPdf } from '../../features/reports/reportsSlice';
import ShareReportModal from './ShareReportModal';
import {
  FileText,
  X,
  Sparkles,
  Github,
  Youtube,
  Check,
  AlertCircle,
  Lock,
  Globe,
  Download,
  ExternalLink,
  Share2,
  Loader2
} from 'lucide-react';

export default function GenerateReportModal({
  isOpen,
  onClose,
  sourcePlatform = 'GITHUB',
  sourceReference = 'facebook/react',
  defaultTitle = ''
}) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user: currentUser } = useSelector((state) => state.auth);
  const { isGenerating, error } = useSelector((state) => state.reports);

  const [title, setTitle] = useState('');
  const [visibility, setVisibility] = useState('PRIVATE');
  const [sections, setSections] = useState(['summary', 'metrics', 'charts', 'topItems', 'insights']);
  const [step, setStep] = useState('config'); // 'config' | 'generating' | 'success'
  const [generationProgress, setGenerationProgress] = useState(0);
  const [progressStatus, setProgressStatus] = useState('Preparing analytics snapshot...');
  const [createdReport, setCreatedReport] = useState(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      setTitle(defaultTitle || `${sourcePlatform === 'GITHUB' ? 'GitHub Repository' : 'YouTube Channel'} Telemetry Report`);
      setErrorMsg('');
      setStep('config');
      setGenerationProgress(0);
      setCreatedReport(null);
    }
  }, [isOpen, sourcePlatform, sourceReference, defaultTitle]);

  if (!isOpen) return null;

  const handleToggleSection = (sectionId) => {
    if (sections.includes(sectionId)) {
      setSections(sections.filter(s => s !== sectionId));
    } else {
      setSections([...sections, sectionId]);
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setStep('generating');
    setGenerationProgress(20);
    setProgressStatus('Fetching verified analytics metrics...');

    const payload = {
      sourcePlatform,
      sourceReference,
      title: title.trim() || `${sourcePlatform} Report`,
      visibility,
      sections
    };

    setTimeout(() => {
      setGenerationProgress(50);
      setProgressStatus('Constructing structured formal report snapshot...');
    }, 600);

    const action = await dispatch(generateNewReport(payload));

    if (generateNewReport.fulfilled.match(action)) {
      setGenerationProgress(90);
      setProgressStatus('Building PDF layout and document metadata...');

      setTimeout(() => {
        setGenerationProgress(100);
        setCreatedReport(action.payload);
        setStep('success');
      }, 500);
    } else {
      setStep('config');
      setErrorMsg(action.payload || 'Failed to generate report snapshot.');
    }
  };

  const handleDownloadPdf = () => {
    if (createdReport) {
      dispatch(downloadReportPdf({ reportId: createdReport.id, title: createdReport.title }));
    }
  };

  const isOrgUser = currentUser?.accountType === 'ORGANIZATION';

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
        <div className="w-full max-w-md glass-panel p-6 rounded-2xl border border-slate-800 relative space-y-4 shadow-2xl">
          {/* Header */}
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-brand-400" />
              <span>Generate Formal Report</span>
            </h3>
            <button
              onClick={onClose}
              className="text-slate-500 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold text-center">
              ⚠️ {errorMsg}
            </div>
          )}

          {/* STEP 1: CONFIGURATION */}
          {step === 'config' && (
            <form onSubmit={handleGenerate} className="space-y-4">
              {/* Verified Source Target Badge */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                <div className="flex items-center space-x-2.5">
                  {sourcePlatform === 'GITHUB' ? (
                    <Github className="w-5 h-5 text-slate-200" />
                  ) : (
                    <Youtube className="w-5 h-5 text-red-400" />
                  )}
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Verified {sourcePlatform} Analytics Source
                    </span>
                    <h4 className="text-xs font-bold text-white leading-tight">{sourceReference}</h4>
                  </div>
                </div>
              </div>

              {/* Title Input */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Formal Report Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. GitHub Repository Telemetry Report"
                  className="w-full p-2.5 text-xs rounded-xl glass-input text-white bg-slate-900"
                />
              </div>

              {/* Sections Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Report Sections
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'summary', label: 'Executive Summary' },
                    { id: 'metrics', label: 'Key Metrics Table' },
                    { id: 'charts', label: 'Growth Trend Charts' },
                    { id: 'topItems', label: 'Top Highlights' },
                    { id: 'insights', label: 'Data-Driven Insights' }
                  ].map((sec) => (
                    <label
                      key={sec.id}
                      className={`p-2 rounded-xl border text-xs flex items-center space-x-2 cursor-pointer transition-all ${
                        sections.includes(sec.id)
                          ? 'bg-brand-600/10 border-brand-500/40 text-white font-medium'
                          : 'bg-slate-950/40 border-slate-800 text-slate-400'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={sections.includes(sec.id)}
                        onChange={() => handleToggleSection(sec.id)}
                        className="rounded border-slate-700 bg-slate-900 text-brand-600 focus:ring-brand-500"
                      />
                      <span>{sec.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Visibility Selector */}
              {isOrgUser && (
                <div className="space-y-1.5 border-t border-slate-800/80 pt-3">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Report Visibility
                  </label>
                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={() => setVisibility('PRIVATE')}
                      className={`flex-1 p-2.5 rounded-xl border text-xs flex items-center justify-center space-x-1.5 cursor-pointer ${
                        visibility === 'PRIVATE'
                          ? 'bg-slate-900 border-brand-500 text-white font-semibold'
                          : 'bg-slate-950/40 border-slate-800 text-slate-400'
                      }`}
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Private</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setVisibility('ORGANIZATION')}
                      className={`flex-1 p-2.5 rounded-xl border text-xs flex items-center justify-center space-x-1.5 cursor-pointer ${
                        visibility === 'ORGANIZATION'
                          ? 'bg-slate-900 border-brand-500 text-white font-semibold'
                          : 'bg-slate-950/40 border-slate-800 text-slate-400'
                      }`}
                    >
                      <Globe className="w-3.5 h-3.5 text-brand-400" />
                      <span>Organization</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl border border-slate-800 text-xs text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white text-xs font-medium shadow-glass-indigo transition-all flex items-center space-x-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Generate Formal Report</span>
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: GENERATING ANIMATION */}
          {step === 'generating' && (
            <div className="py-8 text-center space-y-4">
              <div className="relative flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-brand-400 animate-spin" />
              </div>

              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white">Generating Telemetron Report</h4>
                <p className="text-xs text-slate-400 font-mono">{progressStatus}</p>
              </div>

              <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                <div
                  className="bg-brand-500 h-full transition-all duration-300 rounded-full"
                  style={{ width: `${generationProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* STEP 3: SUCCESS OPTIONS */}
          {step === 'success' && createdReport && (
            <div className="py-4 space-y-4 text-center">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                <Check className="w-6 h-6" />
              </div>

              <div>
                <h4 className="text-base font-bold text-white">Report Generated Successfully</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Formal report snapshot created for <strong className="text-white">{sourceReference}</strong>.
                </p>
              </div>

              <div className="space-y-2.5 pt-2">
                <button
                  onClick={() => {
                    onClose();
                    navigate(`/reports/${createdReport.id}`);
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs transition-all shadow-glass flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>View Formal Report</span>
                </button>

                <button
                  onClick={handleDownloadPdf}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-200 font-semibold text-xs transition-all flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <Download className="w-4 h-4 text-emerald-400" />
                  <span>Download PDF Document</span>
                </button>

                <button
                  onClick={() => setIsShareModalOpen(true)}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-200 font-semibold text-xs transition-all flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <Share2 className="w-4 h-4 text-brand-400" />
                  <span>Share Report to Group or Person</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Share Report Modal */}
      {createdReport && (
        <ShareReportModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          reportData={{
            ...createdReport.reportData,
            reportId: createdReport.id,
            targetUrl: `/reports/${createdReport.id}`
          }}
        />
      )}
    </>
  );
}

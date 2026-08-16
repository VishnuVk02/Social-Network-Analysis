import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function ErrorState({ error, onRetry }) {
  return (
    <div className="glass-panel p-8 rounded-2xl border border-red-500/10 bg-red-500/5 text-center max-w-lg mx-auto my-8 space-y-4">
      <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mx-auto text-red-500">
        <AlertCircle className="w-6 h-6" />
      </div>
      <div>
        <h3 className="text-base font-bold text-white leading-tight">Sync Action Failed</h3>
        <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">
          {error || 'An unexpected error occurred while communicating with the telemetry server.'}
        </p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-slate-900 border border-slate-800 hover:border-brand-500 hover:bg-brand-600 hover:text-white text-slate-300 rounded-xl text-xs font-semibold shadow-glass transition-all cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry Sync</span>
        </button>
      )}
    </div>
  );
}

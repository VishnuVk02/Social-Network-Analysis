import React from 'react';
import { HelpCircle } from 'lucide-react';

export default function DataTable({ headers, data, loading, renderRow, emptyMessage = 'No records found.' }) {
  return (
    <div className="glass-panel rounded-2xl overflow-hidden border border-midnight-700/60 bg-midnight-900/80">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-midnight-800/90 border-b border-midnight-700/60 text-slate-300">
              {headers.map((h, idx) => (
                <th 
                  key={idx} 
                  className={`px-6 py-4 text-xs font-semibold uppercase tracking-wider ${h.className || ''}`}
                >
                  {h.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-midnight-700/40 bg-midnight-950/30">
            {loading ? (
              // Loading Skeleton
              Array.from({ length: 4 }).map((_, rIdx) => (
                <tr key={rIdx} className="animate-pulse">
                  {headers.map((_, cIdx) => (
                    <td key={cIdx} className="p-4">
                      <div className="h-4 bg-midnight-700/60 rounded w-3/4"></div>
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              // Empty State
              <tr>
                <td colSpan={headers.length} className="p-8 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <HelpCircle className="w-8 h-8 text-pine-400/60" />
                    <span className="text-sm font-medium">{emptyMessage}</span>
                  </div>
                </td>
              </tr>
            ) : (
              // Data Rows
              data.map((row, idx) => renderRow(row, idx))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

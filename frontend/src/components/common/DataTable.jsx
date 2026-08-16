import React from 'react';
import { HelpCircle } from 'lucide-react';

export default function DataTable({ headers, data, loading, renderRow, emptyMessage = 'No records found.' }) {
  return (
    <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-900/60 border-b border-slate-800 text-slate-400">
              {headers.map((h, idx) => (
                <th 
                  key={idx} 
                  className={`p-4 text-xs font-semibold uppercase tracking-wider ${h.className || ''}`}
                >
                  {h.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 bg-slate-950/20">
            {loading ? (
              // Loading Skeleton
              Array.from({ length: 4 }).map((_, rIdx) => (
                <tr key={rIdx} className="animate-pulse">
                  {headers.map((_, cIdx) => (
                    <td key={cIdx} className="p-4">
                      <div className="h-4 bg-slate-800 rounded w-3/4"></div>
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              // Empty State
              <tr>
                <td colSpan={headers.length} className="p-8 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <HelpCircle className="w-8 h-8 text-slate-600" />
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

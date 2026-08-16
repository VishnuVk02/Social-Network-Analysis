import React from 'react';

export default function Loader({ message = 'Loading analytics intelligence...' }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 space-y-4">
      {/* Outer spinning gradient ring */}
      <div className="relative w-14 h-14">
        <div className="absolute inset-0 rounded-full border-[3px] border-slate-800"></div>
        <div className="absolute inset-0 rounded-full border-[3px] border-t-brand-500 border-r-brand-400 animate-spin"></div>
      </div>
      <p className="text-xs font-semibold text-slate-400 tracking-wider animate-pulse uppercase">
        {message}
      </p>
    </div>
  );
}

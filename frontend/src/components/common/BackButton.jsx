import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

export default function BackButton({ fallbackRoute, className = '' }) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else if (fallbackRoute) {
      navigate(fallbackRoute);
    } else {
      navigate('/');
    }
  };

  return (
    <button
      onClick={handleBack}
      className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-100 text-slate-700 hover:text-white hover:bg-pine-500 hover:border-pine-500 transition-all duration-200 text-xs font-bold select-none cursor-pointer ${className}`}
      title="Go back"
    >
      <ChevronLeft className="w-4 h-4 shrink-0" />
      <span>Back</span>
    </button>
  );
}

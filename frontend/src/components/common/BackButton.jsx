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
      className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white hover:bg-brand-600 hover:border-brand-500 hover:shadow-glass-brand transition-all duration-200 text-xs font-semibold select-none ${className}`}
      title="Go back"
    >
      <ChevronLeft className="w-4 h-4 shrink-0 transition-transform group-hover:-translate-x-0.5" />
      <span>Back</span>
    </button>
  );
}

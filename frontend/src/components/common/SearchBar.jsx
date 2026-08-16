import React, { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';

export default function SearchBar({ placeholder = 'Search...', buttonText = 'Analyze', onSubmit, isLoading }) {
  const [value, setValue] = useState('');

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (value.trim()) {
      onSubmit(value.trim());
    }
  };

  return (
    <form onSubmit={handleFormSubmit} className="w-full flex items-center space-x-3">
      <div className="relative flex-1 flex items-center">
        <Search className="absolute left-4 w-4 h-4 text-slate-500" />
        <input
          type="text"
          value={value}
          required
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-11 pr-4 py-3 text-sm rounded-xl glass-input text-white font-medium"
        />
      </div>
      <button
        type="submit"
        disabled={isLoading || !value.trim()}
        className="px-6 py-3 bg-gradient-to-r from-brand-600 to-emerald-500 hover:from-brand-500 hover:to-emerald-400 text-white font-medium text-sm rounded-xl shadow-glass-brand hover:shadow-emerald-500/20 transition-all flex items-center space-x-2 shrink-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Analyzing...</span>
          </>
        ) : (
          <span>{buttonText}</span>
        )}
      </button>
    </form>
  );
}

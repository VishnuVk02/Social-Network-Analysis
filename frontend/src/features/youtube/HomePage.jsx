import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Flame, Award, Cpu, Code2, Youtube } from 'lucide-react';
import BackButton from '../../components/common/BackButton';

export default function HomePage() {
  const navigate = useNavigate();

  const handleQuickChannel = (channelName) => {
    navigate(`/youtube/channel/${channelName}`);
  };

  const quickChannels = [
    { name: 'MrBeast', icon: Award, desc: 'Highest subscribed individual channel. Heavy stunts and charity.', color: 'from-blue-600 to-cyan-400' },
    { name: 'OpenAI', icon: Cpu, desc: 'AI research, voice mode presentations, and tech demos.', color: 'from-emerald-600 to-teal-400' },
    { name: 'Fireship', icon: Flame, desc: 'Code reports and 100-second programming guides.', color: 'from-amber-600 to-orange-400' }
  ];

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto text-slate-300">
      <div className="flex items-center">
        <BackButton fallbackRoute="/" />
      </div>
      
      {/* Banner */}
      <div className="glass-panel p-8 rounded-3xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between space-y-6 md:space-y-0">
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
          <Youtube className="w-56 h-56 text-white" />
        </div>

        <div className="space-y-4 max-w-2xl text-center md:text-left">
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-md">
            YouTube Analytics Studio
          </span>
          <h1 className="text-3xl font-extrabold text-white tracking-tight leading-tight">
            Comprehensive Telemetry Analysis for YouTube Channels
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            Search for channels, evaluate comment sentiment distributions, dissect trending tags, and track growth analytics via PostgreSQL databases.
          </p>
          <button
            onClick={() => navigate('/youtube/search')}
            className="inline-flex items-center space-x-2 px-5 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-all shadow-glass cursor-pointer"
          >
            <Search className="w-4 h-4" />
            <span>Launch Search Terminal</span>
          </button>
        </div>

        <div className="w-full md:w-fit flex items-center justify-center shrink-0">
          <div className="w-32 h-32 rounded-3xl bg-gradient-to-tr from-red-600 to-rose-400 flex items-center justify-center shadow-glass-brand">
            <Youtube className="w-16 h-16 text-white" />
          </div>
        </div>
      </div>

      {/* Quick Launch Cards */}
      <div className="space-y-4">
        <div>
          <h3 className="text-base font-bold text-white tracking-wide">Quick-Launch Channels</h3>
          <p className="text-slate-500 text-xs mt-0.5">Explore pre-compiled simulated channel dashboards instantly.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quickChannels.map((c) => {
            const Icon = c.icon;
            return (
              <div
                key={c.name}
                onClick={() => handleQuickChannel(c.name)}
                className="glass-panel p-5 rounded-2xl hover:border-red-500/30 hover:shadow-glass-indigo transition-all duration-300 cursor-pointer group flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${c.color} flex items-center justify-center text-white shadow`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white group-hover:text-red-400 transition-colors">
                      {c.name}
                    </h4>
                    <p className="text-slate-400 text-xs mt-1 leading-relaxed line-clamp-3">
                      {c.desc}
                    </p>
                  </div>
                </div>

                <span className="text-[10px] text-brand-400 font-bold group-hover:translate-x-1 transition-transform inline-block">
                  Analyze Channel &rarr;
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

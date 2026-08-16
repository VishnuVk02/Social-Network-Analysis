import React from 'react';
import BackButton from '../../components/common/BackButton';
import { Key, Youtube, Settings, HelpCircle, Code } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="p-8 space-y-8 max-w-3xl mx-auto text-slate-300">
      
      {/* Header bar */}
      <div className="flex items-center space-x-4">
        <BackButton fallbackRoute="/youtube" />
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">YouTube Integration Settings</h1>
          <p className="text-slate-400 text-xs">Configure access keys, rate parameters, and API options.</p>
        </div>
      </div>

      {/* Main instructions block */}
      <div className="glass-panel p-6 rounded-2xl space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
          <Settings className="w-24 h-24 text-white" />
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center">
            <Key className="w-4 h-4 mr-2 text-red-500" /> YouTube Data API Key Installation
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            The YouTube Analytics dashboard leverages the official Google YouTube Data API v3. 
            Follow the instructions below to supply your API credentials:
          </p>

          <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl space-y-2">
            <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Configuration Path</p>
            <p className="text-xs text-white font-mono font-bold select-all">
              backend/.env
            </p>
            <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mt-4">Example Block</p>
            <pre className="text-xs text-slate-300 font-mono bg-dark-950 p-2.5 rounded border border-slate-900 select-all overflow-x-auto">
{`# YouTube Credentials
YOUTUBE_API_KEY=YOUR_API_KEY_HERE
YOUTUBE_BASE_URL=https://www.googleapis.com/youtube/v3`}
            </pre>
          </div>
        </div>

        <div className="space-y-3 pt-4 border-t border-slate-800">
          <h4 className="text-xs font-bold text-white flex items-center">
            <HelpCircle className="w-4 h-4 mr-2 text-blue-400" /> Where do I get an API Key?
          </h4>
          <ol className="list-decimal pl-5 text-xs text-slate-400 space-y-1.5 leading-relaxed">
            <li>Navigate to the <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="text-red-400 hover:underline">Google Cloud Console</a>.</li>
            <li>Create a new developer project or select an existing one.</li>
            <li>Go to <strong>APIs & Services &gt; Library</strong>, search for <strong>YouTube Data API v3</strong>, and click <strong>Enable</strong>.</li>
            <li>Go to <strong>APIs & Services &gt; Credentials</strong>, click <strong>Create Credentials</strong>, and select <strong>API key</strong>.</li>
            <li>Copy the generated key and paste it inside your `backend/.env` file.</li>
          </ol>
        </div>

        <div className="space-y-3 pt-4 border-t border-slate-800">
          <h4 className="text-xs font-bold text-white flex items-center">
            <Code className="w-4 h-4 mr-2 text-emerald-400" /> API Quota Optimization
          </h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Google restricts free YouTube accounts to 10,000 quota units per day. 
            To minimize consumption, this application utilizes the <strong>uploads playlist cache</strong> rather than running raw video search commands. 
            This reduces the quota cost from 100 units per video list query down to only 1 unit.
          </p>
        </div>
      </div>

    </div>
  );
}

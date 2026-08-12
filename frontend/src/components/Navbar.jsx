import React from 'react';
import { Wifi, WifiOff, Activity, Maximize2, Radio, Server } from 'lucide-react';

export function Navbar({ isConnected, fleetState, isPresentationMode, setIsPresentationMode }) {
  const kpis = fleetState?.kpis || {};
  const totalRobots = kpis.total_robots || 5;
  const activeJobs = kpis.active_jobs || 0;
  const activeAlerts = kpis.active_alerts || 0;

  const systemStatus = isConnected ? 'ONLINE' : 'CONNECTING';

  return (
    <header className="h-14 border-b border-slate-800/80 bg-[#0F172A]/95 backdrop-blur-xl flex items-center justify-between px-6 sticky top-0 z-40 select-none font-mono">
      {/* Real Infrastructure Indicators */}
      <div className="flex items-center gap-3 text-xs">
        <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-900 border border-slate-800">
          <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
          <span className="font-bold text-slate-200">
            SYSTEM: <span className={isConnected ? 'text-emerald-400' : 'text-amber-400'}>{systemStatus}</span>
          </span>
        </div>

        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
          <Radio className="w-3.5 h-3.5 text-cyan-400" />
          <span>MQTT: <strong className={isConnected ? 'text-emerald-400' : 'text-amber-400'}>{isConnected ? 'ONLINE' : 'CONNECTING'}</strong></span>
        </div>

        <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
          <Activity className="w-3.5 h-3.5 text-emerald-400" />
          <span>AGVs: <strong className="text-emerald-400">{totalRobots}</strong></span>
        </div>

        <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
          <span>JOBS: <strong className="text-cyan-400">{activeJobs}</strong></span>
        </div>

        {activeAlerts > 0 && (
          <div className="hidden xl:flex items-center gap-2 px-3 py-1 rounded-lg bg-rose-950/40 border border-rose-800 text-rose-300">
            <span>ALERTS: <strong className="text-rose-400 font-bold">{activeAlerts}</strong></span>
          </div>
        )}
      </div>

      {/* Connection & Presentation Mode Controls */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setIsPresentationMode(!isPresentationMode)}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border text-xs font-semibold transition-all ${
            isPresentationMode
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-md shadow-cyan-500/10'
              : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
          }`}
          title="Toggle Presentation Mode to maximize Digital Twin canvas space"
        >
          <Maximize2 className="w-3.5 h-3.5" />
          <span>{isPresentationMode ? 'EXIT PRESENTATION' : 'PRESENTATION MODE'}</span>
        </button>

        <div className={`flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-semibold border ${
          isConnected 
            ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/30' 
            : 'bg-amber-950/40 text-amber-300 border-amber-500/30'
        }`}>
          {isConnected ? <Wifi className="w-3.5 h-3.5 text-emerald-400" /> : <WifiOff className="w-3.5 h-3.5 text-amber-400" />}
          <span>WS: 250ms</span>
        </div>
      </div>
    </header>
  );
}

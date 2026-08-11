import React from 'react';
import { Cpu, Wifi, WifiOff, Activity, ShieldCheck } from 'lucide-react';

export function Navbar({ isConnected, fleetState }) {
  const kpis = fleetState?.kpis || {};

  return (
    <header className="h-16 border-b border-[var(--border-glass)] bg-[var(--bg-card)] backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-40">
      {/* Brand Title */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
          <Cpu className="w-6 h-6 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold tracking-tight text-white">UNIFLEET</h1>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-400 border border-blue-500/30">
              MVP 1.0
            </span>
          </div>
          <p className="text-xs text-gray-400">Open-Source Intelligent AGV/AMR Fleet Manager</p>
        </div>
      </div>

      {/* Quick Live KPI Pills */}
      <div className="hidden md:flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-800/60 border border-gray-700/50 text-xs">
          <span className="text-gray-400">Active Robots:</span>
          <span className="font-bold text-white">{kpis.total_robots || 5}</span>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-800/50 text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-emerald-300">Available:</span>
          <span className="font-bold text-emerald-200">{kpis.available ?? 5}</span>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-950/40 border border-blue-800/50 text-xs">
          <span className="text-blue-300">Moving:</span>
          <span className="font-bold text-blue-200">{kpis.moving ?? 0}</span>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-950/40 border border-purple-800/50 text-xs">
          <span className="text-purple-300">Conflicts Resolved:</span>
          <span className="font-bold text-purple-200">{kpis.predicted_conflicts_resolved ?? 0}</span>
        </div>
      </div>

      {/* Connection Indicator */}
      <div className="flex items-center gap-3">
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${
          isConnected 
            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' 
            : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
        }`}>
          {isConnected ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
          <span>{isConnected ? 'MQTT / WS ONLINE' : 'RECONNECTING'}</span>
        </div>
      </div>
    </header>
  );
}

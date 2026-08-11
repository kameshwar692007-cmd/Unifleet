import React from 'react';
import { Truck, Activity, Battery, Zap, AlertTriangle, ShieldCheck, ArrowUpRight } from 'lucide-react';

export function OverviewPage({ fleetState, onNavigateTwin }) {
  const kpis = fleetState?.kpis || {};
  const eventLogs = fleetState?.event_logs || [];
  const robots = fleetState?.robots || [];

  return (
    <div className="p-6 space-y-6">
      {/* Top Welcome Banner */}
      <div className="glass-panel p-6 flex items-center justify-between bg-gradient-to-r from-blue-950/40 via-gray-900/60 to-purple-950/40 border-blue-500/20">
        <div>
          <h1 className="text-2xl font-bold text-white">Unified Fleet Operations Dashboard</h1>
          <p className="text-sm text-gray-400 mt-1">Vendor-Agnostic AGV/AMR Fleet Orchestration • Synchronized Live Digital Twin</p>
        </div>
        <button
          onClick={onNavigateTwin}
          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold flex items-center gap-2 shadow-lg shadow-blue-500/25 transition-all"
        >
          <span>Open Live Digital Twin</span>
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5 space-y-2 border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between text-gray-400 text-xs">
            <span>Total Fleet Size</span>
            <Truck className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-3xl font-bold text-white">{kpis.total_robots || 5} AGVs</div>
          <div className="text-xs text-blue-400 font-medium">3 Vendor Profiles Active</div>
        </div>

        <div className="glass-panel p-5 space-y-2 border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between text-gray-400 text-xs">
            <span>Available Units</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-bold text-white">{kpis.available ?? 5}</div>
          <div className="text-xs text-emerald-400 font-medium">Ready for job assignment</div>
        </div>

        <div className="glass-panel p-5 space-y-2 border-l-4 border-l-purple-500">
          <div className="flex items-center justify-between text-gray-400 text-xs">
            <span>Route Conflicts Resolved</span>
            <ShieldCheck className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-3xl font-bold text-white">{kpis.predicted_conflicts_resolved ?? 0}</div>
          <div className="text-xs text-purple-400 font-medium">Harmony Engine Priority Pass</div>
        </div>

        <div className="glass-panel p-5 space-y-2 border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between text-gray-400 text-xs">
            <span>Active Transport Jobs</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-bold text-white">{kpis.active_jobs ?? 0}</div>
          <div className="text-xs text-amber-400 font-medium">{kpis.completed_jobs ?? 0} jobs completed</div>
        </div>
      </div>

      {/* Fleet Telemetry Status & Activity Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active AGVs Snapshot */}
        <div className="lg:col-span-1 glass-panel p-5 space-y-4">
          <h3 className="text-base font-bold text-white">Live AGV Fleet Telemetry</h3>
          <div className="space-y-3">
            {robots.map((r) => (
              <div key={r.id} className="p-3 rounded-xl bg-gray-900/60 border border-gray-800 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{r.id}</span>
                    <span className="text-[10px] text-gray-400 font-mono">({r.vendor})</span>
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5 font-mono">
                    Pos: ({r.x.toFixed(1)}, {r.y.toFixed(1)}) • {r.current_node}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-emerald-400">{Math.round(r.battery)}%</span>
                  <div className="text-[10px] uppercase text-gray-400">{r.status}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Real-time Event Stream */}
        <div className="lg:col-span-2 glass-panel p-5 space-y-4">
          <h3 className="text-base font-bold text-white">Real-Time Event Stream</h3>
          <div className="space-y-2 max-h-[380px] overflow-y-auto">
            {eventLogs.length === 0 ? (
              <div className="text-sm text-gray-500 py-8 text-center">No system events logged yet.</div>
            ) : (
              eventLogs.map((log) => (
                <div key={log.id} className="p-3 rounded-xl bg-gray-900/50 border border-gray-800/80 flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                    log.severity === 'WARNING' ? 'bg-amber-400' :
                    log.severity === 'SUCCESS' ? 'bg-emerald-400' : 'bg-blue-400'
                  }`}></div>
                  <div className="flex-1 text-xs space-y-0.5">
                    <div className="flex items-center justify-between text-gray-400">
                      <span className="font-mono font-semibold text-blue-300">{log.event_type}</span>
                      <span className="text-[10px]">{new Date(log.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-gray-200">{log.message}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

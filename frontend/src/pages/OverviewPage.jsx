import React from 'react';
import { Truck, Activity, Zap, ShieldCheck, ArrowUpRight } from 'lucide-react';

export function OverviewPage({ fleetState, onNavigateTwin }) {
  const kpis = fleetState?.kpis || {};
  const eventLogs = fleetState?.events || fleetState?.event_logs || [];
  const robots = fleetState?.robots || [];

  return (
    <div className="p-6 space-y-6 bg-[#090D16] min-h-screen text-slate-100 font-sans select-none">
      {/* Top Welcome Banner */}
      <div className="glass-panel p-6 flex items-center justify-between bg-gradient-to-r from-cyan-950/30 via-slate-900/60 to-indigo-950/30 border-cyan-500/30">
        <div>
          <h1 className="text-xl font-bold text-white tracking-wider flex items-center gap-2">
            UNIFLEET OPERATIONS CENTER
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              LIVE SYSTEM
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Vendor-Agnostic AGV/AMR Orchestration Platform • Real-Time Synchronized Telemetry
          </p>
        </div>
        <button
          onClick={onNavigateTwin}
          className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold font-mono flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition-all"
        >
          <span>OPEN DIGITAL TWIN</span>
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
        <div className="glass-panel p-5 space-y-2 border-l-4 border-l-cyan-500 bg-slate-900/80">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>TOTAL FLEET SIZE</span>
            <Truck className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-bold text-white">{kpis.total_robots || 5} AGVs</div>
          <div className="text-xs text-cyan-400 font-semibold">3 Active Vendor Protocols</div>
        </div>

        <div className="glass-panel p-5 space-y-2 border-l-4 border-l-emerald-500 bg-slate-900/80">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>AVAILABLE UNITS</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-bold text-white">{kpis.available ?? 5}</div>
          <div className="text-xs text-emerald-400 font-semibold">Ready for Job Dispatch</div>
        </div>

        <div className="glass-panel p-5 space-y-2 border-l-4 border-l-rose-500 bg-slate-900/80">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>CONFLICTS RESOLVED</span>
            <ShieldCheck className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-3xl font-bold text-white">{kpis.predicted_conflicts_resolved ?? 0}</div>
          <div className="text-xs text-rose-400 font-semibold">Harmony Engine Auto-Pass</div>
        </div>

        <div className="glass-panel p-5 space-y-2 border-l-4 border-l-indigo-500 bg-slate-900/80">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>ACTIVE TRANSPORT JOBS</span>
            <Zap className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-3xl font-bold text-white">{kpis.active_jobs ?? 0}</div>
          <div className="text-xs text-indigo-400 font-semibold">{kpis.completed_jobs ?? 0} Jobs Completed</div>
        </div>
      </div>

      {/* Fleet Telemetry Status & Activity Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active AGVs Snapshot */}
        <div className="lg:col-span-1 glass-panel p-5 space-y-4 bg-slate-900/80">
          <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">Live AGV Telemetry</h3>
          <div className="space-y-3 font-mono">
            {robots.map((r) => {
              const r_id = r.robot_id || r.id;
              return (
                <div key={r_id} className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-xs">{r_id}</span>
                      <span className="text-[10px] text-slate-400">({r.vendor})</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Way: {r.current_node} ({r.x.toFixed(1)}, {r.y.toFixed(1)})
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-emerald-400">{Math.round(r.battery)}%</span>
                    <div className="text-[10px] uppercase text-cyan-400">{r.status}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Real-time Event Stream */}
        <div className="lg:col-span-2 glass-panel p-5 space-y-4 bg-slate-900/80">
          <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">System Event Stream</h3>
          <div className="space-y-2 max-h-[380px] overflow-y-auto font-mono">
            {eventLogs.length === 0 ? (
              <div className="text-xs text-slate-500 py-8 text-center">No system events logged yet.</div>
            ) : (
              eventLogs.map((log, idx) => (
                <div key={log.id || idx} className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-start gap-3 text-xs">
                  <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                    log.severity === 'WARNING' ? 'bg-amber-400' :
                    log.severity === 'SUCCESS' ? 'bg-emerald-400' : 'bg-cyan-400'
                  }`} />
                  <div className="flex-1 space-y-0.5">
                    <div className="flex items-center justify-between text-slate-400">
                      <span className="font-bold text-cyan-300">{log.event_type || 'SYSTEM'}</span>
                      <span className="text-[10px]">{log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : '12:00:00'}</span>
                    </div>
                    <p className="text-slate-200">{log.message}</p>
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

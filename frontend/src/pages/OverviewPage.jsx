import React from 'react';
import { Truck, Activity, Zap, ShieldCheck, ArrowUpRight, ArrowRight, Radio } from 'lucide-react';

export function OverviewPage({ fleetState, onNavigateTwin, onNavigateEvents }) {
  const kpis = fleetState?.kpis || {};
  const eventLogs = fleetState?.events || fleetState?.event_logs || [];
  const robots = fleetState?.robots || [];

  // Show top 5-7 meaningful recent events
  const recentEvents = eventLogs.slice(0, 6);

  return (
    <div className="p-6 space-y-6 bg-[#090D16] min-h-screen text-slate-100 font-sans select-none">
      {/* Top Executive Header */}
      <div className="glass-panel p-6 flex items-center justify-between bg-gradient-to-r from-cyan-950/30 via-slate-900/60 to-indigo-950/30 border-cyan-500/30">
        <div>
          <h1 className="text-xl font-bold text-white tracking-wider flex items-center gap-2 font-mono">
            UNIFLEET EXECUTIVE MISSION CONTROL
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              OPERATIONAL
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Heterogeneous Autonomous Mobile Robot Management & Real-Time Digital Twin Engine
          </p>
        </div>
        <button
          onClick={onNavigateTwin}
          className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold font-mono flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition-all hover:scale-105"
        >
          <span>OPEN DIGITAL TWIN</span>
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>

      {/* 4 Primary Executive KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 font-mono">
        <div className="glass-panel p-5 space-y-2 border-l-4 border-l-cyan-500 bg-slate-900/80 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>TOTAL FLEET</span>
            <Truck className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-bold text-white">{kpis.total_robots || 5} AGVs</div>
          <div className="text-xs text-cyan-400 font-semibold">3 Active Vendor Profiles</div>
        </div>

        <div className="glass-panel p-5 space-y-2 border-l-4 border-l-emerald-500 bg-slate-900/80 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>AVAILABLE AGVS</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-bold text-white">{kpis.available ?? 5} AGVs</div>
          <div className="text-xs text-emerald-400 font-semibold">Ready for Job Dispatch</div>
        </div>

        <div className="glass-panel p-5 space-y-2 border-l-4 border-l-indigo-500 bg-slate-900/80 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>ACTIVE JOBS</span>
            <Zap className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-3xl font-bold text-white">{kpis.active_jobs ?? 0} Jobs</div>
          <div className="text-xs text-indigo-400 font-semibold">{kpis.completed_jobs ?? 0} Jobs Completed</div>
        </div>

        <div className="glass-panel p-5 space-y-2 border-l-4 border-l-amber-500 bg-slate-900/80 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>CONFLICTS RESOLVED</span>
            <ShieldCheck className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-bold text-white">{kpis.predicted_conflicts_resolved ?? 0}</div>
          <div className="text-xs text-amber-400 font-semibold">Harmony Engine Collision-Free</div>
        </div>
      </div>

      {/* Two Balanced Primary Regions: FLEET SNAPSHOT & RECENT ACTIVITY */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-mono">
        {/* Region 1: Fleet Snapshot */}
        <div className="lg:col-span-1 glass-panel p-5 space-y-4 bg-slate-900/80 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Truck className="w-4 h-4 text-cyan-400" />
                <span>Fleet Snapshot</span>
              </h3>
              <span className="text-[10px] text-slate-500">{robots.length} UNITS</span>
            </div>

            <div className="space-y-3 pt-3">
              {robots.map((r) => {
                const r_id = r.robot_id || r.id;
                return (
                  <div key={r_id} className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between hover:border-slate-700 transition-all">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{r_id}</span>
                        <span className="text-[10px] text-slate-400 px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800">{r.vendor}</span>
                      </div>
                      <div className="text-xs text-slate-400 mt-1 font-mono">
                        Node: <span className="text-emerald-300 font-bold">{r.current_node}</span> ({r.x.toFixed(1)}, {r.y.toFixed(1)})
                      </div>
                    </div>
                    <div className="text-right space-y-0.5">
                      <span className={`text-xs font-bold ${r.battery < 20 ? 'text-rose-400 animate-pulse' : 'text-emerald-400'}`}>{Math.round(r.battery)}%</span>
                      <div className="text-[10px] font-bold uppercase text-cyan-300">{r.status}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            onClick={onNavigateTwin}
            className="w-full mt-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-2 border border-slate-700 transition-all"
          >
            <span>VIEW ON DIGITAL TWIN MAP</span>
            <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
          </button>
        </div>

        {/* Region 2: Recent Activity Ticker */}
        <div className="lg:col-span-2 glass-panel p-5 space-y-4 bg-slate-900/80 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Radio className="w-4 h-4 text-emerald-400" />
                <span>Recent System Activity</span>
              </h3>
              <span className="text-[10px] text-slate-500">LATEST 6 EVENTS</span>
            </div>

            <div className="space-y-2.5 pt-3">
              {recentEvents.length === 0 ? (
                <div className="text-xs text-slate-500 py-12 text-center">No recent activity logged. System operating normally.</div>
              ) : (
                recentEvents.map((log, idx) => (
                  <div key={log.id || idx} className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs hover:border-slate-700 transition-all">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-2 h-2 rounded-full shrink-0 ${
                        log.severity === 'WARNING' ? 'bg-amber-400' :
                        log.severity === 'SUCCESS' ? 'bg-emerald-400' : 'bg-cyan-400'
                      }`} />
                      <div className="min-w-0">
                        <div className="font-bold text-cyan-300 text-[11px]">{log.event_type || 'SYSTEM'}</div>
                        <p className="text-slate-200 truncate font-sans text-xs">{log.message}</p>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono shrink-0 ml-3">{log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : '12:00'}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-end">
            <button
              onClick={onNavigateEvents}
              className="px-4 py-2 rounded-xl bg-cyan-600/20 text-cyan-300 hover:bg-cyan-600/30 border border-cyan-500/40 text-xs font-bold flex items-center gap-2 transition-all"
            >
              <span>VIEW ALL EVENTS & ALERTS</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

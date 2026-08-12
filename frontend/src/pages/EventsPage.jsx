import React from 'react';
import { Bell } from 'lucide-react';

export function EventsPage({ fleetState }) {
  const eventLogs = fleetState?.events || fleetState?.event_logs || [];
  const alerts = fleetState?.alerts || [];

  return (
    <div className="p-6 space-y-6 bg-[#090D16] min-h-screen text-slate-100 font-sans select-none">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white tracking-wider font-mono flex items-center gap-2">
          SYSTEM EVENTS & OPERATOR ALERTS
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
            AUDIT TRAIL
          </span>
        </h1>
        <p className="text-xs text-slate-400 mt-1 font-mono">
          Immutable Operational Audit Log & Real-Time Security Notifications
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-mono">
        {/* Active Alerts List */}
        <div className="glass-panel p-5 space-y-4 bg-slate-900/80">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Bell className="w-4 h-4 text-amber-400" />
            <span>Active Operator Alerts</span>
          </h3>

          <div className="space-y-3">
            {alerts.length === 0 ? (
              <div className="text-xs text-slate-500 py-6 text-center">No active alerts. System healthy.</div>
            ) : (
              alerts.map((alt, idx) => (
                <div key={alt.id || idx} className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/30 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-300">{alt.title || 'System Notification'}</span>
                    <span className="text-[10px] text-slate-400">{alt.id || 'ALT-01'}</span>
                  </div>
                  <p className="text-slate-300">{alt.message}</p>
                  <div className="text-[10px] text-slate-500">
                    Target: {alt.robot_id || 'SYSTEM'} • {alt.timestamp ? new Date(alt.timestamp).toLocaleTimeString() : '12:00:00'}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* System Event Logs Table */}
        <div className="lg:col-span-2 glass-panel p-5 space-y-4 bg-slate-900/80">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Full Event Audit Log</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3">Event Type</th>
                  <th className="py-2.5 px-3">Severity</th>
                  <th className="py-2.5 px-3">Target AGV</th>
                  <th className="py-2.5 px-3">Log Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {eventLogs.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-slate-500">No events logged yet.</td>
                  </tr>
                ) : (
                  eventLogs.map((evt, idx) => (
                    <tr key={evt.id || idx} className="hover:bg-slate-800/40">
                      <td className="py-2.5 px-3 text-slate-400">{evt.timestamp ? new Date(evt.timestamp).toLocaleTimeString() : '12:00:00'}</td>
                      <td className="py-2.5 px-3 font-bold text-cyan-300">{evt.event_type || 'INFO'}</td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          evt.severity === 'WARNING' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                          evt.severity === 'SUCCESS' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                        }`}>
                          {evt.severity}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-300">{evt.robot_id || '-'}</td>
                      <td className="py-2.5 px-3 text-slate-200">{evt.message}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

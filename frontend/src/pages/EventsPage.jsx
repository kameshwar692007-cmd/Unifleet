import React from 'react';
import { Bell, ShieldAlert, CheckCircle2, Info } from 'lucide-react';

export function EventsPage({ fleetState }) {
  const eventLogs = fleetState?.event_logs || [];
  const alerts = fleetState?.alerts || [];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">System Events & Active Operator Alerts</h1>
        <p className="text-sm text-gray-400 mt-1">Audit Trail & Real-Time Operational Notifications</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Alerts List */}
        <div className="glass-panel p-5 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Bell className="w-4 h-4 text-amber-400" />
            <span>Active Operator Alerts</span>
          </h3>

          <div className="space-y-3">
            {alerts.length === 0 ? (
              <div className="text-xs text-gray-500 py-6 text-center">No active alerts. System healthy.</div>
            ) : (
              alerts.map((alt) => (
                <div key={alt.id} className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/30 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-300">{alt.title}</span>
                    <span className="text-[10px] font-mono text-gray-400">{alt.id}</span>
                  </div>
                  <p className="text-gray-300">{alt.message}</p>
                  <div className="text-[10px] text-gray-500 font-mono">
                    Robot: {alt.robot_id || 'SYSTEM'} • {new Date(alt.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* System Event Logs Table */}
        <div className="lg:col-span-2 glass-panel p-5 space-y-4">
          <h3 className="text-base font-bold text-white">Full Event Audit Log</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-800 text-gray-400">
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3">Event Type</th>
                  <th className="py-2.5 px-3">Severity</th>
                  <th className="py-2.5 px-3">Robot</th>
                  <th className="py-2.5 px-3">Message</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {eventLogs.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-gray-500">No events logged yet.</td>
                  </tr>
                ) : (
                  eventLogs.map((evt) => (
                    <tr key={evt.id} className="hover:bg-gray-900/40">
                      <td className="py-2.5 px-3 text-gray-400">{new Date(evt.timestamp).toLocaleTimeString()}</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-blue-300">{evt.event_type}</td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          evt.severity === 'WARNING' ? 'bg-amber-500/20 text-amber-300' :
                          evt.severity === 'SUCCESS' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-blue-500/20 text-blue-300'
                        }`}>
                          {evt.severity}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-gray-300">{evt.robot_id || '-'}</td>
                      <td className="py-2.5 px-3 text-gray-200">{evt.message}</td>
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

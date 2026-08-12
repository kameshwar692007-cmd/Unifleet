import React, { useState, useEffect } from 'react';
import { Zap, ArrowRight, ArrowDown } from 'lucide-react';
import { api } from '../services/api';

export function WorkflowsPage() {
  const [workflowsData, setWorkflowsData] = useState({ rules: [], logs: [] });
  const [showAllLogs, setShowAllLogs] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.getWorkflows();
        setWorkflowsData(res.data);
      } catch (e) {
        console.error(e);
      }
    };
    load();
    const interval = setInterval(load, 2000);
    return () => clearInterval(interval);
  }, []);

  const displayedLogs = showAllLogs ? workflowsData.logs : workflowsData.logs.slice(0, 5);

  return (
    <div className="p-6 space-y-6 bg-[#090D16] min-h-screen text-slate-100 font-sans select-none">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white tracking-wider font-mono flex items-center gap-2">
          VISUAL WORKFLOW AUTOMATION ENGINE
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
            EVENT-DRIVEN AUTOMATION
          </span>
        </h1>
        <p className="text-xs text-slate-400 mt-1 font-mono">
          Zero-Code Event-Condition-Action Automation Framework
        </p>
      </div>

      {/* Dominant Visual Execution Flow Hero Card */}
      <div className="glass-panel p-6 space-y-4 bg-slate-900/80 border-l-4 border-l-amber-500 font-mono shadow-2xl">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-amber-300 uppercase tracking-wider flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400 animate-pulse" />
            ACT 05 — LOW-BATTERY AUTOMATION RULE (WF-001)
          </span>
          <span className="text-xs px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
            ACTIVE & MONITORED
          </span>
        </div>

        {/* High Impact Visual Node Chain */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 pt-2 text-center font-mono">
          <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 space-y-1.5 shadow-md">
            <span className="text-[10px] text-slate-500 uppercase font-bold block">1. EVENT TRIGGER</span>
            <div className="font-bold text-rose-400 text-sm">Battery &lt; 20.0%</div>
            <p className="text-[11px] text-slate-400 font-sans">Telemetry update detected</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/90 border border-amber-500/40 space-y-1.5 shadow-md">
            <span className="text-[10px] text-amber-400 uppercase font-bold block">2. RULE MATCH</span>
            <div className="font-bold text-amber-300 text-sm">Rule WF-001</div>
            <p className="text-[11px] text-slate-400 font-sans">Low Battery Automation</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 space-y-1.5 shadow-md">
            <span className="text-[10px] text-slate-500 uppercase font-bold block">3. POOL STATE</span>
            <div className="font-bold text-purple-300 text-sm">Mark Unavailable</div>
            <p className="text-[11px] text-slate-400 font-sans">Removed from job pool</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 space-y-1.5 shadow-md">
            <span className="text-[10px] text-slate-500 uppercase font-bold block">4. ACTION DISPATCH</span>
            <div className="font-bold text-cyan-300 text-sm">Reroute to Charger N08</div>
            <p className="text-[11px] text-slate-400 font-sans">Fast Charging Dispatched</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/90 border border-emerald-500/40 space-y-1.5 shadow-md">
            <span className="text-[10px] text-emerald-400 uppercase font-bold block">5. NOTIFICATION</span>
            <div className="font-bold text-emerald-400 text-sm">Alert Created</div>
            <p className="text-[11px] text-slate-400 font-sans">Operator Notified</p>
          </div>
        </div>
      </div>

      {/* Active Rules Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono">
        {workflowsData.rules.map((rule) => (
          <div key={rule.id} className="glass-panel p-5 space-y-4 border-l-4 border-l-cyan-500 bg-slate-900/80 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-cyan-400">{rule.id}</span>
              <span className="px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                ACTIVE
              </span>
            </div>

            <h3 className="text-sm font-bold text-white">{rule.name}</h3>

            <div className="space-y-2 text-xs bg-slate-950/90 p-3 rounded-xl border border-slate-800">
              <div className="flex justify-between"><span className="text-slate-500 text-[10px]">TRIGGER:</span><span className="text-slate-200 font-bold">{rule.trigger_event}</span></div>
              <div className="flex justify-between"><span className="text-slate-500 text-[10px]">ACTION:</span><span className="text-emerald-300 font-bold">{rule.action}</span></div>
            </div>

            <div className="text-xs text-slate-400 flex justify-between pt-2 border-t border-slate-800">
              <span>Executions:</span>
              <span className="font-bold text-white">{rule.executions_count || 0} times</span>
            </div>
          </div>
        ))}
      </div>

      {/* Execution Activity Log (Secondary) */}
      <div className="glass-panel p-5 space-y-4 bg-slate-900/80 font-mono shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Workflow Execution History</span>
          </h3>
          <button
            onClick={() => setShowAllLogs(!showAllLogs)}
            className="text-xs text-cyan-400 hover:underline font-bold"
          >
            {showAllLogs ? 'SHOW RECENT 5' : `VIEW ALL LOGS (${workflowsData.logs.length}) →`}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Rule ID</th>
                <th className="py-2.5 px-3">Rule Name</th>
                <th className="py-2.5 px-3">Action Executed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {displayedLogs.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-8 text-center text-slate-500 font-sans">
                    No executions recorded yet. Trigger Act 5 in Guided Demo to execute low-battery rule.
                  </td>
                </tr>
              ) : (
                displayedLogs.map((log, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40">
                    <td className="py-3 px-3 text-slate-400">{new Date(log.timestamp).toLocaleTimeString()}</td>
                    <td className="py-3 px-3 font-bold text-amber-400">{log.rule_id}</td>
                    <td className="py-3 px-3 text-white font-medium">{log.rule_name}</td>
                    <td className="py-3 px-3 text-emerald-300 font-bold">{log.action_taken}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

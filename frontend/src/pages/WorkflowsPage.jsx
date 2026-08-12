import React, { useState, useEffect } from 'react';
import { Zap, ShieldCheck, ArrowRight } from 'lucide-react';
import { api } from '../services/api';

export function WorkflowsPage() {
  const [workflowsData, setWorkflowsData] = useState({ rules: [], logs: [] });

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

  return (
    <div className="p-6 space-y-6 bg-[#090D16] min-h-screen text-slate-100 font-sans select-none">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white tracking-wider font-mono flex items-center gap-2">
          ZERO-CODE WORKFLOW AUTOMATION ENGINE
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
            EVENT-DRIVEN
          </span>
        </h1>
        <p className="text-xs text-slate-400 mt-1 font-mono">
          Visual Trigger → Condition → Action Event Engine
        </p>
      </div>

      {/* Rules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono">
        {workflowsData.rules.map((rule) => (
          <div key={rule.id} className="glass-panel p-5 space-y-4 border-l-4 border-l-amber-500 bg-slate-900/80 hover:border-amber-400 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-400">{rule.id}</span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                ACTIVE RULE
              </span>
            </div>

            <h3 className="text-sm font-bold text-white">{rule.name}</h3>

            {/* Visual Node Flow */}
            <div className="space-y-2 text-xs bg-slate-950/90 p-3.5 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between text-cyan-400">
                <span className="text-[10px] text-slate-500">TRIGGER:</span>
                <span className="font-bold text-slate-200">{rule.trigger_event}</span>
              </div>
              <div className="flex items-center justify-between text-purple-400">
                <span className="text-[10px] text-slate-500">CONDITION:</span>
                <span className="font-bold text-slate-200">{JSON.stringify(rule.condition)}</span>
              </div>
              <div className="flex items-center justify-between text-emerald-400">
                <span className="text-[10px] text-slate-500">ACTION:</span>
                <span className="font-bold text-emerald-300">{rule.action}</span>
              </div>
            </div>

            <div className="text-xs text-slate-400 flex items-center justify-between pt-2 border-t border-slate-800">
              <span>Execution Count:</span>
              <span className="font-bold text-white">{rule.executions_count || 0} times</span>
            </div>
          </div>
        ))}
      </div>

      {/* Execution Activity Log */}
      <div className="glass-panel p-5 space-y-4 bg-slate-900/80 font-mono">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-400" />
          <span>Workflow Execution Log</span>
        </h3>

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
              {workflowsData.logs.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-8 text-center text-slate-500">
                    No workflow executions recorded yet. Trigger Act 5 in Guided Demo to test low-battery auto-charging workflow.
                  </td>
                </tr>
              ) : (
                workflowsData.logs.map((log, idx) => (
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

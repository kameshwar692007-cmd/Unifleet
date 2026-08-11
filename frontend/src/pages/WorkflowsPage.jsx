import React, { useState, useEffect } from 'react';
import { Zap, Play, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
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
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Zero-Code Visual Workflow Automation</h1>
        <p className="text-sm text-gray-400 mt-1">Event-Driven Trigger → Condition → Action Automation Engine</p>
      </div>

      {/* Rules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {workflowsData.rules.map((rule) => (
          <div key={rule.id} className="glass-panel p-5 space-y-4 border-l-4 border-l-amber-500 hover:border-amber-400 transition-all">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-amber-400">{rule.id}</span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                ACTIVE
              </span>
            </div>

            <h3 className="text-base font-bold text-white">{rule.name}</h3>

            {/* Visual Node Flow */}
            <div className="space-y-2 text-xs font-mono bg-black/60 p-3 rounded-xl border border-gray-800">
              <div className="flex items-center justify-between text-blue-300">
                <span>TRIGGER:</span>
                <span className="font-bold text-white">{rule.trigger_event}</span>
              </div>
              <div className="flex items-center justify-between text-purple-300">
                <span>CONDITION:</span>
                <span className="font-bold text-white">{JSON.stringify(rule.condition)}</span>
              </div>
              <div className="flex items-center justify-between text-emerald-300">
                <span>ACTION:</span>
                <span className="font-bold text-white">{rule.action}</span>
              </div>
            </div>

            <div className="text-xs text-gray-400 flex items-center justify-between pt-2 border-t border-gray-800">
              <span>Executions:</span>
              <span className="font-bold text-white font-mono">{rule.executions_count || 0} times</span>
            </div>
          </div>
        ))}
      </div>

      {/* Execution Activity Log */}
      <div className="glass-panel p-5 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-400" />
          <span>Workflow Execution Log</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-800 text-gray-400">
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Rule ID</th>
                <th className="py-2.5 px-3">Rule Name</th>
                <th className="py-2.5 px-3">Action Executed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {workflowsData.logs.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-8 text-center text-gray-500">No workflow executions recorded yet. Trigger Act 5 in Demo Controller to test low battery workflow.</td>
                </tr>
              ) : (
                workflowsData.logs.map((log, idx) => (
                  <tr key={idx} className="hover:bg-gray-900/40">
                    <td className="py-3 px-3 text-gray-400">{new Date(log.timestamp).toLocaleTimeString()}</td>
                    <td className="py-3 px-3 font-mono font-bold text-amber-400">{log.rule_id}</td>
                    <td className="py-3 px-3 text-white font-medium">{log.rule_name}</td>
                    <td className="py-3 px-3 text-emerald-300 font-mono">{log.action_taken}</td>
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

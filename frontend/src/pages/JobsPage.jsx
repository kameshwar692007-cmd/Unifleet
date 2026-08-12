import React, { useState } from 'react';
import { Plus, Briefcase, HelpCircle, X, ShieldCheck } from 'lucide-react';
import { api } from '../services/api';

export function JobsPage({ fleetState }) {
  const [sourceNode, setSourceNode] = useState('N01');
  const [targetNode, setTargetNode] = useState('N05');
  const [priority, setPriority] = useState(1);
  const [explainModalData, setExplainModalData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const jobs = fleetState?.jobs || [];
  const nodes = [
    { id: 'N01', name: 'Receiving Dock' },
    { id: 'N02', name: 'Storage Rack A' },
    { id: 'N03', name: 'Storage Rack B' },
    { id: 'N04', name: 'Picking Hub' },
    { id: 'N05', name: 'Packing Line 1' },
    { id: 'N06', name: 'Packing Line 2' },
    { id: 'N07', name: 'Dispatch Dock' },
    { id: 'N08', name: 'Fast Charger Alpha' },
    { id: 'N09', name: 'Fast Charger Beta' }
  ];

  const handleCreateJob = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.createJob(sourceNode, targetNode, priority);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInspectReasoning = async (source, target) => {
    try {
      const res = await api.explainScheduling(source, target);
      setExplainModalData(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6 space-y-6 bg-[#090D16] min-h-screen text-slate-100 select-none font-sans">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white tracking-wider font-mono flex items-center gap-2">
          DISPATCH & EXPLAINABLE SCHEDULER
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
            COMPOSITE SCORE MATRIX
          </span>
        </h1>
        <p className="text-xs text-slate-400 mt-1 font-mono">
          Multi-Criteria Autonomous Job Dispatch • Transparent Decision Score Breakdown
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Create Job Dispatcher Form */}
        <div className="glass-panel p-5 space-y-4 bg-slate-900/80">
          <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
            <Plus className="w-4 h-4 text-cyan-400" />
            <span>Dispatch Transport Job</span>
          </h3>

          <form onSubmit={handleCreateJob} className="space-y-4 font-mono">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Pickup Location (Source Node)</label>
              <select
                value={sourceNode}
                onChange={(e) => setSourceNode(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-cyan-500"
              >
                {nodes.map(n => <option key={n.id} value={n.id}>{n.id} — {n.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Dropoff Location (Target Node)</label>
              <select
                value={targetNode}
                onChange={(e) => setTargetNode(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-cyan-500"
              >
                {nodes.map(n => <option key={n.id} value={n.id}>{n.id} — {n.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Task Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-cyan-500"
              >
                <option value={1}>Normal (Priority 1)</option>
                <option value={2}>High (Priority 2)</option>
                <option value={3}>Critical (Priority 3)</option>
              </select>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all"
              >
                Dispatch Job
              </button>

              <button
                type="button"
                onClick={() => handleInspectReasoning(sourceNode, targetNode)}
                className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1 border border-slate-700 transition-colors"
              >
                <HelpCircle className="w-4 h-4 text-purple-400" />
                <span>Score Matrix</span>
              </button>
            </div>
          </form>
        </div>

        {/* Job Queue Table */}
        <div className="lg:col-span-2 glass-panel p-5 space-y-4 bg-slate-900/80">
          <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-purple-400" />
            <span>Active & Historical Jobs</span>
          </h3>

          <div className="overflow-x-auto font-mono">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase">
                  <th className="py-2.5 px-3">Job ID</th>
                  <th className="py-2.5 px-3">Route</th>
                  <th className="py-2.5 px-3">Assigned AGV</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Score Matrix</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {jobs.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-slate-500">No jobs created yet. Use form to dispatch a job.</td>
                  </tr>
                ) : (
                  jobs.map((job) => (
                    <tr key={job.id} className="hover:bg-slate-800/40">
                      <td className="py-3 px-3 font-bold text-cyan-300">{job.id}</td>
                      <td className="py-3 px-3 text-slate-300">{job.source_node} → {job.target_node}</td>
                      <td className="py-3 px-3 font-bold text-emerald-400">{job.assigned_robot_id || 'QUEUED'}</td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                          job.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-300' :
                          job.status === 'ASSIGNED' ? 'bg-cyan-500/20 text-cyan-300' : 'bg-amber-500/20 text-amber-300'
                        }`}>
                          {job.status}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <button
                          onClick={() => setExplainModalData(job.scheduling_reason)}
                          className="text-purple-400 hover:underline text-[11px]"
                        >
                          View Matrix
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Explainable Scheduling Modal */}
      {explainModalData && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="glass-panel p-6 max-w-2xl w-full space-y-4 border-purple-500/40 shadow-2xl relative bg-[#0F172A]">
            <button
              onClick={() => setExplainModalData(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white font-mono">Explainable Scheduling Decision Matrix</h3>
                <p className="text-xs text-slate-400 font-mono">
                  Route: {explainModalData.source_node} → {explainModalData.target_node}
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-800 text-xs text-purple-200 font-mono">
              {explainModalData.decision_summary}
            </div>

            {/* Candidates Table */}
            <div className="overflow-x-auto font-mono">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="py-2 px-2">AGV ID</th>
                    <th className="py-2 px-2">Vendor</th>
                    <th className="py-2 px-2">Eligible</th>
                    <th className="py-2 px-2">Distance</th>
                    <th className="py-2 px-2">Battery</th>
                    <th className="py-2 px-2">Composite Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {explainModalData.candidates?.map((c) => (
                    <tr key={c.robot_id} className={c.robot_id === explainModalData.winning_robot_id ? 'bg-purple-900/40 font-bold text-white' : 'text-slate-300'}>
                      <td className="py-2 px-2 text-cyan-300">{c.robot_id}</td>
                      <td className="py-2 px-2 text-[11px]">{c.vendor || 'N/A'}</td>
                      <td className="py-2 px-2">
                        {c.eligible ? <span className="text-emerald-400">YES</span> : <span className="text-rose-400">NO</span>}
                      </td>
                      <td className="py-2 px-2">{c.distance_to_pickup_m ? `${c.distance_to_pickup_m}m` : '-'}</td>
                      <td className="py-2 px-2">{c.battery_pct ? `${c.battery_pct}%` : '-'}</td>
                      <td className="py-2 px-2 text-purple-300 font-bold">{c.composite_score || 0} pts</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

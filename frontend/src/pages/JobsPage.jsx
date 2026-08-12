import React, { useState } from 'react';
import { Plus, Briefcase, HelpCircle, X, ShieldCheck, Compass } from 'lucide-react';
import { api } from '../services/api';

export function JobsPage({ fleetState }) {
  const [sourceNode, setSourceNode] = useState('N01');
  const [targetNode, setTargetNode] = useState('N05');
  const [priority, setPriority] = useState(1);
  const [explainModalData, setExplainModalData] = useState(null);
  const [routeComparisonData, setRouteComparisonData] = useState(null);
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
      const [explainRes, routeRes] = await Promise.all([
        api.explainScheduling(source, target),
        api.compareRoutes(source, target)
      ]);
      setExplainModalData(explainRes.data);
      setRouteComparisonData(routeRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6 space-y-6 bg-[#090D16] min-h-screen text-slate-100 select-none font-sans flex flex-col justify-between">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-xl font-bold text-white tracking-wider font-mono flex items-center gap-2">
            DISPATCH & EXPLAINABLE SCHEDULER
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              MULTI-CRITERIA SCORING
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Autonomous Job Allocation • Formula: Composite = (0.4 × Distance) + (0.4 × Battery) + (0.2 × Capability)
          </p>
        </div>

        {/* Top Split Layout: Dispatch Form (Left) & Decision Quick Matrix (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-mono">
          {/* Dispatch Job Form */}
          <div className="glass-panel p-5 space-y-4 bg-slate-900/80 shadow-xl">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Plus className="w-4 h-4 text-cyan-400" />
              <span>Dispatch Transport Job</span>
            </h3>

            <form onSubmit={handleCreateJob} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Pickup Location (Source)</label>
                <select
                  value={sourceNode}
                  onChange={(e) => setSourceNode(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-cyan-500"
                >
                  {nodes.map(n => <option key={n.id} value={n.id}>{n.id} — {n.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Dropoff Location (Target)</label>
                <select
                  value={targetNode}
                  onChange={(e) => setTargetNode(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-cyan-500"
                >
                  {nodes.map(n => <option key={n.id} value={n.id}>{n.id} — {n.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Task Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(Number(e.target.value))}
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-cyan-500"
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
                  className="flex-1 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all"
                >
                  Dispatch Transport Job
                </button>

                <button
                  type="button"
                  onClick={() => handleInspectReasoning(sourceNode, targetNode)}
                  className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1 border border-slate-700 transition-colors"
                >
                  <HelpCircle className="w-4 h-4 text-purple-400" />
                  <span>Inspect Score Matrix</span>
                </button>
              </div>
            </form>
          </div>

          {/* Scheduler Multi-Criteria Formula Explanation */}
          <div className="lg:col-span-2 glass-panel p-5 space-y-4 bg-slate-900/80 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-purple-400" />
                  <span>Transparent Scoring Criteria</span>
                </h3>
                <span className="text-[10px] text-purple-300 px-2 py-0.5 rounded bg-purple-500/20 border border-purple-500/30">
                  EXPLAINABLE AI
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3">
                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                  <div className="text-[10px] text-slate-400 font-bold">40% WEIGHT</div>
                  <div className="font-bold text-cyan-300 text-sm">Proximity Distance</div>
                  <p className="text-[11px] text-slate-400 font-sans">Evaluates geometric A* path distance to pickup location.</p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                  <div className="text-[10px] text-slate-400 font-bold">40% WEIGHT</div>
                  <div className="font-bold text-emerald-300 text-sm">Battery State of Charge</div>
                  <p className="text-[11px] text-slate-400 font-sans">Ensures assigned AGV has sufficient power reserve for full job execution.</p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                  <div className="text-[10px] text-slate-400 font-bold">20% WEIGHT</div>
                  <div className="font-bold text-indigo-300 text-sm">Payload Capability</div>
                  <p className="text-[11px] text-slate-400 font-sans">Verifies hardware suitability and availability status.</p>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-800 text-xs text-purple-200 font-sans flex items-center justify-between mt-3">
              <span>UniFleet automatically ranks available AGVs and selects the optimal unit with maximum composite score.</span>
              <button
                onClick={() => handleInspectReasoning(sourceNode, targetNode)}
                className="text-purple-300 hover:underline font-mono text-[11px] font-bold shrink-0 ml-3"
              >
                View Live Candidate Breakdown →
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Full-Width Active Jobs Table */}
        <div className="glass-panel p-5 space-y-4 bg-slate-900/80 shadow-xl font-mono">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-cyan-400" />
              <span>Active & Recent Transport Jobs</span>
            </h3>
            <span className="text-xs text-slate-400">{jobs.length} TOTAL JOBS IN QUEUE</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase">
                  <th className="py-3 px-4">Job ID</th>
                  <th className="py-3 px-4">Pickup → Dropoff</th>
                  <th className="py-3 px-4">Assigned AGV</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Score Matrix</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {jobs.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-12 text-center text-slate-500 font-sans">
                      No jobs currently dispatched. Use the form above to trigger a transport job.
                    </td>
                  </tr>
                ) : (
                  jobs.map((job) => (
                    <tr key={job.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-cyan-300">{job.id}</td>
                      <td className="py-3.5 px-4 text-slate-200 font-semibold">{job.source_node} → {job.target_node}</td>
                      <td className="py-3.5 px-4 font-bold text-emerald-400">{job.assigned_robot_id || 'QUEUED'}</td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded-md font-bold text-[11px] ${
                          job.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                          job.status === 'ASSIGNED' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}>
                          {job.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => handleInspectReasoning(job.source_node, job.target_node)}
                          className="text-purple-400 hover:underline text-xs font-bold"
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

      {/* Explainable Scheduling & Route Comparison Modal */}
      {explainModalData && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-6">
          <div className="glass-panel p-6 max-w-3xl w-full space-y-5 border-purple-500/40 shadow-2xl relative bg-[#0F172A] font-mono">
            <button
              onClick={() => { setExplainModalData(null); setRouteComparisonData(null); }}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
              <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">EXPLAINABLE SCHEDULER & PREDICTIVE ROUTE MATRIX</h3>
                <p className="text-xs text-slate-400 font-sans">
                  Route: {explainModalData.source_node} → {explainModalData.target_node} • Formula: Composite = (0.4×Distance) + (0.4×Battery) + (0.2×Capability)
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-800 text-xs text-purple-200">
              {explainModalData.decision_summary}
            </div>

            {/* Candidates Table */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">Candidate AGV Scoring Breakdown</span>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400">
                      <th className="py-2.5 px-3">AGV ID</th>
                      <th className="py-2.5 px-3">Vendor</th>
                      <th className="py-2.5 px-3">Eligible</th>
                      <th className="py-2.5 px-3">Distance</th>
                      <th className="py-2.5 px-3">Battery</th>
                      <th className="py-2.5 px-3">Composite Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {explainModalData.candidates?.map((c) => (
                      <tr key={c.robot_id} className={c.robot_id === explainModalData.winning_robot_id ? 'bg-purple-900/40 font-bold text-white' : 'text-slate-300'}>
                        <td className="py-2.5 px-3 text-cyan-300">{c.robot_id}</td>
                        <td className="py-2.5 px-3 text-xs">{c.vendor || 'N/A'}</td>
                        <td className="py-2.5 px-3">
                          {c.eligible ? <span className="text-emerald-400 font-bold">YES</span> : <span className="text-rose-400">NO ({c.reason})</span>}
                        </td>
                        <td className="py-2.5 px-3">{c.distance_to_pickup_m ? `${c.distance_to_pickup_m}m` : '-'}</td>
                        <td className="py-2.5 px-3">{c.battery_pct ? `${c.battery_pct}%` : '-'}</td>
                        <td className="py-2.5 px-3 text-purple-300 font-bold">{c.composite_score || 0} pts</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Predictive Route Comparison */}
            {routeComparisonData && (
              <div className="space-y-2 pt-3 border-t border-slate-800">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
                  <Compass className="w-4 h-4 text-cyan-400" />
                  <span>Predictive Route Alternatives (A* Router)</span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className={`p-3 rounded-xl border ${routeComparisonData.recommended_choice.includes('Route A') ? 'bg-cyan-950/40 border-cyan-500/60' : 'bg-slate-900/80 border-slate-800'}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-200">ROUTE A (Direct)</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${routeComparisonData.route_a.congestion === 'HIGH' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-300'}`}>
                        {routeComparisonData.route_a.congestion} CONGESTION
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 space-y-0.5">
                      <div>Path: <span className="text-cyan-300">{routeComparisonData.route_a.path.join(' → ')}</span></div>
                      <div>Distance: {routeComparisonData.route_a.distance_m}m | Est. Delay: {routeComparisonData.route_a.expected_delay_s}s</div>
                    </div>
                  </div>

                  <div className={`p-3 rounded-xl border ${routeComparisonData.recommended_choice.includes('Route B') ? 'bg-emerald-950/40 border-emerald-500/60' : 'bg-slate-900/80 border-slate-800'}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-200">ROUTE B (Bypass)</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-emerald-500/20 text-emerald-300">
                        {routeComparisonData.route_b.congestion} CONGESTION
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 space-y-0.5">
                      <div>Path: <span className="text-emerald-300">{routeComparisonData.route_b.path.join(' → ')}</span></div>
                      <div>Distance: {routeComparisonData.route_b.distance_m}m | Est. Delay: {routeComparisonData.route_b.expected_delay_s}s</div>
                    </div>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-cyan-950/40 border border-cyan-800 text-[11px] text-cyan-200">
                  <span className="font-bold text-cyan-400">AI Insight:</span> {routeComparisonData.ai_insight}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

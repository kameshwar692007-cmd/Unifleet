import React, { useState, useEffect } from 'react';
import { BrainCircuit, Compass, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';

export function IntelligencePage() {
  const [sourceNode, setSourceNode] = useState('N01');
  const [targetNode, setTargetNode] = useState('N06');
  const [comparisonData, setComparisonData] = useState(null);
  const [congestionData, setCongestionData] = useState(null);

  useEffect(() => {
    const fetchCongestion = async () => {
      try {
        const res = await api.getCongestion();
        setCongestionData(res.data);
      } catch (e) {
        console.error(e);
      }
    };
    fetchCongestion();
    handleCompare('N01', 'N06');
  }, []);

  const handleCompare = async (src, tgt) => {
    try {
      const res = await api.compareRoutes(src, tgt);
      setComparisonData(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="p-6 space-y-6 bg-[#090D16] min-h-screen text-slate-100 font-sans select-none">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white tracking-wider font-mono flex items-center gap-2">
          AI FLEET INTELLIGENCE & PREDICTIVE ROUTING
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
            A* COST ENGINE
          </span>
        </h1>
        <p className="text-xs text-slate-400 mt-1 font-mono">
          Route Delay Cost Optimization • Proof: Shorter Geometric Distance ≠ Always Faster Path
        </p>
      </div>

      {/* Dominant Hero Decision Banner */}
      <div className="glass-panel p-6 space-y-5 border-l-4 border-l-purple-500 bg-slate-900/80 font-mono shadow-2xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white uppercase tracking-wider">Predictive Route Cost Comparison</h3>
              <p className="text-xs text-slate-400 font-sans">Evaluating real-time bottleneck congestion delay vs bypass distance</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <select
              value={sourceNode}
              onChange={(e) => { setSourceNode(e.target.value); handleCompare(e.target.value, targetNode); }}
              className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
            >
              <option value="N01">N01 — Receiving Dock</option>
              <option value="N02">N02 — Storage Rack A</option>
              <option value="N03">N03 — Storage Rack B</option>
            </select>
            <span className="text-slate-400">→</span>
            <select
              value={targetNode}
              onChange={(e) => { setTargetNode(e.target.value); handleCompare(sourceNode, e.target.value); }}
              className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
            >
              <option value="N06">N06 — Packing Line 2</option>
              <option value="N07">N07 — Dispatch Dock</option>
            </select>
          </div>
        </div>

        {comparisonData && (
          <div className="space-y-4">
            {/* Clear AI Recommendation Banner */}
            <div className="p-4 rounded-xl bg-purple-950/40 border border-purple-800 text-sm text-purple-200 flex items-start gap-3">
              <div className="p-1 rounded bg-purple-500/20 text-purple-300 shrink-0">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <span className="font-bold text-white uppercase block text-xs">AI RECOMMENDATION DECISION</span>
                <p className="text-xs text-purple-200 mt-0.5 font-sans leading-relaxed">{comparisonData.ai_insight}</p>
              </div>
            </div>

            {/* Side-by-Side Large Comparison Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Route A Card */}
              <div className="p-5 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-4 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-white text-base block">{comparisonData.route_a.name}</span>
                    <span className="text-xs text-slate-400 font-sans">Direct Bottleneck Segment</span>
                  </div>
                  <span className="px-3 py-1 rounded-lg bg-rose-500/20 text-rose-300 text-xs font-bold border border-rose-500/30">
                    CONGESTION: {comparisonData.route_a.congestion}
                  </span>
                </div>

                <div className="text-xs text-slate-300">
                  Path: <code className="text-rose-400 font-bold">{comparisonData.route_a.path?.join(' → ')}</code>
                </div>

                <div className="grid grid-cols-3 gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
                  <div><span className="text-slate-500 block text-[10px]">Distance</span><span className="font-bold text-white text-sm">{comparisonData.route_a.distance_m}m</span></div>
                  <div><span className="text-slate-500 block text-[10px]">Est. Delay</span><span className="font-bold text-amber-400 text-sm">+{comparisonData.route_a.expected_delay_s}s</span></div>
                  <div><span className="text-slate-500 block text-[10px]">Cost Score</span><span className="font-bold text-purple-300 text-sm">{comparisonData.route_a.total_cost_score}</span></div>
                </div>
              </div>

              {/* Route B Card */}
              <div className="p-5 rounded-2xl bg-emerald-950/20 border-2 border-emerald-500/50 space-y-4 shadow-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-emerald-300 text-base block">{comparisonData.route_b.name}</span>
                    <span className="text-xs text-emerald-400 font-sans">Clear Bypass Corridor</span>
                  </div>
                  <span className="px-3 py-1 rounded-lg bg-emerald-500/30 text-emerald-200 text-xs font-bold border border-emerald-400/50 shadow-md animate-pulse">
                    ★ RECOMMENDED CHOICE
                  </span>
                </div>

                <div className="text-xs text-slate-300">
                  Path: <code className="text-emerald-300 font-bold">{comparisonData.route_b.path?.join(' → ')}</code>
                </div>

                <div className="grid grid-cols-3 gap-3 p-3 rounded-xl bg-slate-900 border border-emerald-500/30 text-center">
                  <div><span className="text-slate-500 block text-[10px]">Distance</span><span className="font-bold text-white text-sm">{comparisonData.route_b.distance_m}m</span></div>
                  <div><span className="text-slate-500 block text-[10px]">Est. Delay</span><span className="font-bold text-emerald-400 text-sm">+{comparisonData.route_b.expected_delay_s}s</span></div>
                  <div><span className="text-slate-500 block text-[10px]">Cost Score</span><span className="font-bold text-emerald-300 text-sm">{comparisonData.route_b.total_cost_score}</span></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Segment Density Overview (Secondary) */}
      <div className="glass-panel p-5 space-y-4 bg-slate-900/80 font-mono shadow-xl">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Live Segment Congestion Density</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {congestionData?.segments?.slice(0, 8).map((seg) => (
            <div key={seg.edge} className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs space-y-1">
              <div className="flex items-center justify-between text-slate-400">
                <span className="font-bold text-cyan-300">{seg.edge}</span>
                <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                  seg.congestion_level === 'HIGH' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                }`}>
                  {seg.congestion_level}
                </span>
              </div>
              <div className="text-[11px] text-slate-400">Active AGVs: <span className="font-bold text-white">{seg.active_robots_count}</span></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

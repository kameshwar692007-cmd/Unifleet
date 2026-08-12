import React, { useState, useEffect } from 'react';
import { BrainCircuit } from 'lucide-react';
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
            ANALYTICAL ENGINE
          </span>
        </h1>
        <p className="text-xs text-slate-400 mt-1 font-mono">
          Route Delay Cost Optimization • Dynamic Segment Congestion Density
        </p>
      </div>

      {/* Route Cost Comparison Tool */}
      <div className="glass-panel p-5 space-y-5 border-l-4 border-l-purple-500 bg-slate-900/80 font-mono">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-purple-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Predictive Route Cost Comparison</h3>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <select
              value={sourceNode}
              onChange={(e) => { setSourceNode(e.target.value); handleCompare(e.target.value, targetNode); }}
              className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
            >
              <option value="N01">N01 — Receiving Dock</option>
              <option value="N02">N02 — Storage Rack A</option>
              <option value="N03">N03 — Storage Rack B</option>
            </select>
            <span className="text-slate-400">→</span>
            <select
              value={targetNode}
              onChange={(e) => { setTargetNode(e.target.value); handleCompare(sourceNode, e.target.value); }}
              className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
            >
              <option value="N06">N06 — Packing Line 2</option>
              <option value="N07">N07 — Dispatch Dock</option>
            </select>
          </div>
        </div>

        {comparisonData && (
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-800 text-xs text-purple-200">
              💡 {comparisonData.ai_insight}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Route A */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs">{comparisonData.route_a.name}</span>
                  <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 text-[10px] font-bold border border-rose-500/30">
                    CONGESTION: {comparisonData.route_a.congestion}
                  </span>
                </div>
                <div className="text-xs text-slate-400">
                  Path: {comparisonData.route_a.path?.join(' → ')}
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div><span className="text-slate-500 block text-[10px]">Distance</span><span className="font-bold text-white">{comparisonData.route_a.distance_m}m</span></div>
                  <div><span className="text-slate-500 block text-[10px]">Est. Delay</span><span className="font-bold text-amber-400">+{comparisonData.route_a.expected_delay_s}s</span></div>
                  <div><span className="text-slate-500 block text-[10px]">Total Score</span><span className="font-bold text-purple-300">{comparisonData.route_a.total_cost_score}</span></div>
                </div>
              </div>

              {/* Route B */}
              <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/40 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-300 text-xs">{comparisonData.route_b.name}</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                    RECOMMENDED CHOICE
                  </span>
                </div>
                <div className="text-xs text-slate-400">
                  Path: {comparisonData.route_b.path?.join(' → ')}
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div><span className="text-slate-500 block text-[10px]">Distance</span><span className="font-bold text-white">{comparisonData.route_b.distance_m}m</span></div>
                  <div><span className="text-slate-500 block text-[10px]">Est. Delay</span><span className="font-bold text-emerald-400">+{comparisonData.route_b.expected_delay_s}s</span></div>
                  <div><span className="text-slate-500 block text-[10px]">Total Score</span><span className="font-bold text-emerald-300">{comparisonData.route_b.total_cost_score}</span></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Segment Density Grid */}
      <div className="glass-panel p-5 space-y-4 bg-slate-900/80 font-mono">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Segment Congestion & Bottleneck Density</h3>
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
              <div className="w-full bg-slate-800 rounded-full h-1.5 mt-1 overflow-hidden">
                <div className="bg-cyan-400 h-full rounded-full" style={{ width: `${Math.max(10, seg.congestion_score * 100)}%` }}></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

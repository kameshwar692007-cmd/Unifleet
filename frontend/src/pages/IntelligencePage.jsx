import React, { useState, useEffect } from 'react';
import { BrainCircuit, GitMerge, Zap, ArrowRight, ShieldCheck } from 'lucide-react';
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
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">AI Fleet Intelligence & Predictive Routing</h1>
        <p className="text-sm text-gray-400 mt-1">Honest Operational Analytics • Route Cost Delay Comparisons • Segment Density Heatmap</p>
      </div>

      {/* Route Cost Comparison Tool */}
      <div className="glass-panel p-5 space-y-5 border-l-4 border-l-purple-500">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-purple-400" />
            <h3 className="text-base font-bold text-white">Predictive Route Cost Comparison (Route A vs Route B)</h3>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <select
              value={sourceNode}
              onChange={(e) => { setSourceNode(e.target.value); handleCompare(e.target.value, targetNode); }}
              className="p-2 rounded-xl bg-gray-900 border border-gray-800 text-white"
            >
              <option value="N01">N01 — Receiving Dock</option>
              <option value="N02">N02 — Storage Rack A</option>
              <option value="N03">N03 — Storage Rack B</option>
            </select>
            <span className="text-gray-400">→</span>
            <select
              value={targetNode}
              onChange={(e) => { setTargetNode(e.target.value); handleCompare(sourceNode, e.target.value); }}
              className="p-2 rounded-xl bg-gray-900 border border-gray-800 text-white"
            >
              <option value="N06">N06 — Packing Line 2</option>
              <option value="N07">N07 — Dispatch Dock</option>
            </select>
          </div>
        </div>

        {comparisonData && (
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-800 text-xs text-purple-200 font-medium">
              💡 {comparisonData.ai_insight}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Route A */}
              <div className="p-4 rounded-xl bg-gray-900/60 border border-gray-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-sm">{comparisonData.route_a.name}</span>
                  <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 text-[10px] font-bold">
                    CONGESTION: {comparisonData.route_a.congestion}
                  </span>
                </div>
                <div className="text-xs font-mono text-gray-400">
                  Path: {comparisonData.route_a.path?.join(' → ')}
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div><span className="text-gray-500 block">Distance</span><span className="font-bold text-white">{comparisonData.route_a.distance_m}m</span></div>
                  <div><span className="text-gray-500 block">Est. Delay</span><span className="font-bold text-amber-400">+{comparisonData.route_a.expected_delay_s}s</span></div>
                  <div><span className="text-gray-500 block">Total Score</span><span className="font-bold text-purple-300 font-mono">{comparisonData.route_a.total_cost_score}</span></div>
                </div>
              </div>

              {/* Route B */}
              <div className="p-4 rounded-xl bg-gray-900/60 border border-emerald-500/40 bg-emerald-950/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-300 text-sm">{comparisonData.route_b.name}</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                    RECOMMENDED CHOICE
                  </span>
                </div>
                <div className="text-xs font-mono text-gray-400">
                  Path: {comparisonData.route_b.path?.join(' → ')}
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div><span className="text-gray-500 block">Distance</span><span className="font-bold text-white">{comparisonData.route_b.distance_m}m</span></div>
                  <div><span className="text-gray-500 block">Est. Delay</span><span className="font-bold text-emerald-400">+{comparisonData.route_b.expected_delay_s}s</span></div>
                  <div><span className="text-gray-500 block">Total Score</span><span className="font-bold text-emerald-300 font-mono">{comparisonData.route_b.total_cost_score}</span></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Segment Density Grid */}
      <div className="glass-panel p-5 space-y-4">
        <h3 className="text-base font-bold text-white">Segment Congestion & Bottleneck Analysis</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {congestionData?.segments?.slice(0, 8).map((seg) => (
            <div key={seg.edge} className="p-3 rounded-xl bg-gray-900/60 border border-gray-800 text-xs space-y-1">
              <div className="flex items-center justify-between text-gray-400">
                <span className="font-mono font-bold text-blue-300">{seg.edge}</span>
                <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                  seg.congestion_level === 'HIGH' ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'
                }`}>
                  {seg.congestion_level}
                </span>
              </div>
              <div className="text-[11px] text-gray-400">Active AGVs: <span className="font-bold text-white">{seg.active_robots_count}</span></div>
              <div className="w-full bg-gray-800 rounded-full h-1.5 mt-1 overflow-hidden">
                <div className="bg-blue-500 h-full rounded-full" style={{ width: `${seg.congestion_score * 100}%` }}></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

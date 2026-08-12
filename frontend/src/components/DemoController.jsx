import React, { useState } from 'react';
import { Play, Sparkles, CheckCircle2, RotateCcw, Compass } from 'lucide-react';
import { api } from '../services/api';

export function DemoController({ onActTriggered }) {
  const [activeAct, setActiveAct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);

  const acts = [
    { num: 1, label: '01 — Unified Fleet', desc: '5 AGVs across 3 vendors initialized' },
    { num: 2, label: '02 — Digital Twin', desc: 'Inspect live telemetry stream' },
    { num: 3, label: '03 — Smart Job', desc: 'Storage A (N02) -> Packing B (N06)' },
    { num: 4, label: '04 — HERO MOMENT', desc: 'Conflict Prediction at Junction N11', isHero: true },
    { num: 5, label: '05 — Low Battery', desc: 'Zero-code workflow auto-charge' },
    { num: 6, label: '06 — Open Adapters', desc: 'Multi-vendor architecture showcase' }
  ];

  const handleRunAct = async (actNum) => {
    setLoading(true);
    setActiveAct(actNum);
    setStatusMsg(null);
    try {
      const res = await api.triggerDemoAct(actNum);
      setStatusMsg(res.data.message || `Act ${actNum} Executed Successfully!`);
      if (onActTriggered) onActTriggered(actNum);
    } catch (err) {
      console.error(err);
      setStatusMsg(`Act ${actNum} Trigger Failed`);
    } finally {
      setLoading(false);
    }
  };

  const handleResetDemo = async () => {
    setLoading(true);
    setActiveAct(null);
    setStatusMsg(null);
    try {
      const res = await api.resetDemo();
      setStatusMsg(res.data.message || 'Demo Reset Successfully!');
      if (onActTriggered) onActTriggered('reset');
    } catch (err) {
      console.error(err);
      setStatusMsg('Demo Reset Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 p-4 w-96 space-y-3 shadow-2xl backdrop-blur-2xl bg-[#0F172A]/95 border border-slate-700/80 rounded-2xl select-none font-mono">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-cyan-400 animate-spin" />
          <h3 className="text-xs font-bold text-white tracking-widest uppercase">GUIDED DEMO COMMAND CENTER</h3>
        </div>
        <button
          onClick={handleResetDemo}
          disabled={loading}
          className="flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 transition-colors"
          title="Reset fleet positions, jobs & routes cleanly for repeat judge evaluation"
        >
          <RotateCcw className="w-3 h-3" />
          RESET DEMO
        </button>
      </div>

      {/* Grid of Acts 1 through 6 */}
      <div className="grid grid-cols-2 gap-2">
        {acts.map((act) => (
          <button
            key={act.num}
            onClick={() => handleRunAct(act.num)}
            disabled={loading}
            className={`p-2.5 rounded-xl border text-left transition-all duration-200 ${
              act.isHero
                ? 'bg-rose-950/40 border-rose-500/60 hover:border-rose-400 shadow-lg shadow-rose-500/10'
                : activeAct === act.num
                ? 'bg-cyan-600/25 border-cyan-400 text-white font-bold'
                : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-800/80'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-[11px] font-bold ${act.isHero ? 'text-rose-300' : 'text-slate-100'}`}>
                {act.label}
              </span>
              <Play className="w-3 h-3 text-cyan-400 shrink-0" />
            </div>
            <p className="text-[9px] text-slate-400 mt-1 line-clamp-1 font-sans">{act.desc}</p>
          </button>
        ))}
      </div>

      {/* Execution Toast / Status */}
      {statusMsg && (
        <div className="p-2 rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-[11px] text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">{statusMsg}</span>
        </div>
      )}
    </div>
  );
}

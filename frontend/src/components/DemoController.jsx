import React, { useState } from 'react';
import { Play, Sparkles, CheckCircle2, RotateCcw } from 'lucide-react';
import { api } from '../services/api';

export function DemoController({ onActTriggered }) {
  const [activeAct, setActiveAct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);

  const acts = [
    { num: 1, label: 'Act 1: Unified Fleet', desc: '5 AGVs across 3 vendors initialized' },
    { num: 2, label: 'Act 2: Digital Twin', desc: 'Inspect live telemetry stream' },
    { num: 3, label: 'Act 3: Assign Job', desc: 'Storage A -> Packing B' },
    { num: 4, label: 'Act 4: HERO MOMENT', desc: 'Conflict Prediction at N11', isHero: true },
    { num: 5, label: 'Act 5: Low Battery', desc: 'Zero-code workflow auto-charge' },
    { num: 6, label: 'Act 6: Adapters', desc: 'Open Architecture showcase' }
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
    <div className="fixed bottom-6 right-6 z-50 glass-panel-glow p-4 w-96 space-y-3 shadow-2xl backdrop-blur-xl border border-blue-500/40">
      <div className="flex items-center justify-between border-b border-gray-800 pb-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-blue-400 animate-spin" />
          <h3 className="text-sm font-bold text-white tracking-wide">JUDGE DEMO CONTROLLER</h3>
        </div>
        <button
          onClick={handleResetDemo}
          disabled={loading}
          className="flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 transition-colors"
          title="Reset fleet positions & jobs for repeat demo"
        >
          <RotateCcw className="w-3 h-3" />
          RESET DEMO
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {acts.map((act) => (
          <button
            key={act.num}
            onClick={() => handleRunAct(act.num)}
            disabled={loading}
            className={`p-2.5 rounded-xl border text-left transition-all duration-200 ${
              act.isHero
                ? 'bg-gradient-to-r from-rose-900/40 to-amber-900/40 border-rose-500/50 hover:border-rose-400 shadow-lg shadow-rose-500/10'
                : activeAct === act.num
                ? 'bg-blue-600/30 border-blue-400 text-white'
                : 'bg-gray-900/70 border-gray-800 text-gray-300 hover:bg-gray-800'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-xs font-bold ${act.isHero ? 'text-rose-300' : 'text-white'}`}>
                {act.label}
              </span>
              <Play className="w-3 h-3 text-blue-400" />
            </div>
            <p className="text-[10px] text-gray-400 mt-1 line-clamp-1">{act.desc}</p>
          </button>
        ))}
      </div>

      {statusMsg && (
        <div className="p-2 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">{statusMsg}</span>
        </div>
      )}
    </div>
  );
}

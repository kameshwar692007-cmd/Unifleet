import React from 'react';
import { LayoutDashboard, Map, Truck, Briefcase, Zap, BrainCircuit, Bell, ShieldCheck, Cpu } from 'lucide-react';

export function Sidebar({ activeTab, setActiveTab }) {
  const menuItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'digital-twin', label: 'Digital Twin', icon: Map, isHero: true },
    { id: 'robots', label: 'AGV Fleet', icon: Truck },
    { id: 'jobs', label: 'Jobs & Scheduling', icon: Briefcase },
    { id: 'workflows', label: 'Workflows', icon: Zap },
    { id: 'intelligence', label: 'AI Intelligence', icon: BrainCircuit },
    { id: 'events', label: 'Events & Alerts', icon: Bell }
  ];

  return (
    <aside className="w-64 border-r border-slate-800/80 bg-[#0F172A]/90 p-4 flex flex-col justify-between shrink-0 select-none">
      <div className="space-y-4">
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-2 py-1">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 shadow-lg shadow-cyan-500/20">
            <Cpu className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-wider flex items-center gap-1">
              UNIFLEET
            </h1>
            <p className="text-[10px] font-mono text-cyan-400 tracking-wider">UNIFIED FLEET INTELLIGENCE</p>
          </div>
        </div>

        <div className="h-px bg-slate-800/80 my-2" />

        <div className="space-y-1">
          <div className="px-3 py-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">
            OPERATIONAL NAVIGATION
          </div>

          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 shadow-lg shadow-cyan-500/10 font-bold'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>

                {item.isHero && (
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                    HERO TWIN
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* System Architecture Status Footer */}
      <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] space-y-2 font-mono">
        <div className="flex items-center justify-between text-slate-400">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Fleet Engine:
          </span>
          <span className="text-emerald-400 font-semibold">FastAPI v1.0</span>
        </div>
        <div className="flex items-center justify-between text-slate-400">
          <span>MQTT Broker:</span>
          <span className="text-cyan-400 font-semibold">Mosquitto</span>
        </div>
        <div className="flex items-center justify-between text-slate-400">
          <span>Primary DB:</span>
          <span className="text-indigo-400 font-semibold">PostgreSQL</span>
        </div>
      </div>
    </aside>
  );
}

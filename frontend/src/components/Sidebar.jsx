import React from 'react';
import { LayoutDashboard, Map, Truck, Briefcase, Zap, BrainCircuit, Bell } from 'lucide-react';

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
    <aside className="w-64 border-r border-[var(--border-glass)] bg-[var(--bg-card)] p-4 flex flex-col justify-between shrink-0">
      <div className="space-y-1">
        <div className="px-3 py-2 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
          Platform Navigation
        </div>

        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/40 shadow-lg shadow-blue-500/10 font-semibold'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-gray-400'}`} />
                <span>{item.label}</span>
              </div>

              {item.isHero && (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-gradient-to-r from-blue-500 to-indigo-500 text-white uppercase shadow-sm">
                  HERO
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* System Status Footer Card */}
      <div className="p-3 rounded-xl bg-gray-900/60 border border-gray-800 text-xs space-y-2">
        <div className="flex items-center justify-between text-gray-400">
          <span>Backend Brain:</span>
          <span className="text-emerald-400 font-medium">FastAPI v1.0</span>
        </div>
        <div className="flex items-center justify-between text-gray-400">
          <span>Broker:</span>
          <span className="text-blue-400 font-medium">Mosquitto MQTT</span>
        </div>
        <div className="flex items-center justify-between text-gray-400">
          <span>Database:</span>
          <span className="text-indigo-400 font-medium">PostgreSQL 15</span>
        </div>
      </div>
    </aside>
  );
}

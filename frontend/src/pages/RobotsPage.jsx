import React, { useState } from 'react';
import { Pause, Play, Square, Truck, Cpu, Battery, MapPin } from 'lucide-react';
import { api } from '../services/api';

export function RobotsPage({ fleetState }) {
  const [vendorFilter, setVendorFilter] = useState('ALL');
  const robots = fleetState?.robots || [];

  const filteredRobots = vendorFilter === 'ALL' 
    ? robots 
    : robots.filter(r => r.vendor === vendorFilter);

  const handleCommand = async (id, cmd) => {
    try {
      await api.sendRobotCommand(id, cmd);
    } catch (e) {
      console.error(e);
    }
  };

  const getVendorBadgeClass = (vendor) => {
    if (vendor === 'Vendor Alpha') return 'badge-vendor-alpha';
    if (vendor === 'Vendor Beta') return 'badge-vendor-beta';
    if (vendor === 'Vendor Delta') return 'badge-vendor-delta';
    return 'badge-vendor-gamma';
  };

  return (
    <div className="p-6 space-y-6 bg-[#090D16] min-h-screen text-slate-100 font-sans select-none">
      {/* Header & Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-wider font-mono flex items-center gap-2">
            HETEROGENEOUS AGV/AMR FLEET REGISTRY
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              {robots.length} AGVS ACTIVE
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Multi-Vendor Telemetry Inventory & Command Abstraction Layer
          </p>
        </div>

        {/* Vendor Filter Buttons */}
        <div className="flex items-center gap-2 bg-slate-900/90 p-1.5 rounded-xl border border-slate-800 text-xs font-mono">
          {['ALL', 'Vendor Alpha', 'Vendor Beta', 'Vendor Gamma', 'Vendor Delta'].map((v) => (
            <button
              key={v}
              onClick={() => setVendorFilter(v)}
              className={`px-3 py-1.5 rounded-lg transition-all font-semibold ${
                vendorFilter === v
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* Robot Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 font-mono">
        {filteredRobots.map((robot) => {
          const r_id = robot.robot_id || robot.id;
          return (
            <div key={r_id} className="glass-panel p-5 space-y-4 bg-slate-900/80 hover:border-cyan-500/40 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Truck className="w-5 h-5 text-cyan-400" />
                  <h3 className="text-base font-bold text-white">{r_id}</h3>
                </div>
                <span className={`badge ${getVendorBadgeClass(robot.vendor)}`}>
                  {robot.vendor}
                </span>
              </div>

              <div className="text-xs text-slate-400">{robot.model_type || 'Intelligent AGV'}</div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">STATUS</span>
                  <span className="font-bold text-cyan-300 uppercase">{robot.status}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">BATTERY</span>
                  <span className={`font-bold ${robot.battery < 20 ? 'text-rose-400 animate-pulse' : 'text-emerald-400'}`}>
                    {Math.round(robot.battery)}%
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">WAYPOINT</span>
                  <span className="font-bold text-emerald-300">{robot.current_node}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">COORDINATES</span>
                  <span className="text-slate-300">({robot.x.toFixed(1)}, {robot.y.toFixed(1)})</span>
                </div>
              </div>

              {/* Command Controls */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800">
                <button
                  onClick={() => handleCommand(r_id, 'PAUSE')}
                  className="py-1.5 rounded-lg bg-amber-500/15 text-amber-300 border border-amber-500/30 text-xs font-semibold hover:bg-amber-500/25 transition-all flex items-center justify-center gap-1"
                >
                  <Pause className="w-3 h-3" />
                  <span>Pause</span>
                </button>

                <button
                  onClick={() => handleCommand(r_id, 'RESUME')}
                  className="py-1.5 rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-xs font-semibold hover:bg-emerald-500/25 transition-all flex items-center justify-center gap-1"
                >
                  <Play className="w-3 h-3" />
                  <span>Resume</span>
                </button>

                <button
                  onClick={() => handleCommand(r_id, 'STOP')}
                  className="py-1.5 rounded-lg bg-rose-500/15 text-rose-300 border border-rose-500/30 text-xs font-semibold hover:bg-rose-500/25 transition-all flex items-center justify-center gap-1"
                >
                  <Square className="w-3 h-3" />
                  <span>Stop</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

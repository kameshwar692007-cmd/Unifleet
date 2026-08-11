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
    return 'badge-vendor-gamma';
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header & Filter */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Heterogeneous AGV/AMR Fleet Registry</h1>
          <p className="text-sm text-gray-400 mt-1">Multi-Vendor Robot Inventory & Normalized Command Center</p>
        </div>

        {/* Vendor Filter Buttons */}
        <div className="flex items-center gap-2 bg-gray-900/60 p-1.5 rounded-xl border border-gray-800 text-xs font-semibold">
          {['ALL', 'Vendor Alpha', 'Vendor Beta', 'Vendor Gamma'].map((v) => (
            <button
              key={v}
              onClick={() => setVendorFilter(v)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                vendorFilter === v
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* Robot Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRobots.map((robot) => (
          <div key={robot.id} className="glass-panel p-5 space-y-4 hover:border-blue-500/40 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-blue-400" />
                <h3 className="text-lg font-bold text-white">{robot.id}</h3>
              </div>
              <span className={`badge ${getVendorBadgeClass(robot.vendor)}`}>
                {robot.vendor}
              </span>
            </div>

            <div className="text-xs text-gray-400 font-mono">{robot.model_type}</div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-gray-900/60 border border-gray-800">
                <span className="text-gray-400 block text-[10px]">Status</span>
                <span className="font-bold text-white uppercase">{robot.status}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-gray-900/60 border border-gray-800">
                <span className="text-gray-400 block text-[10px]">Battery</span>
                <span className="font-bold text-amber-400">{Math.round(robot.battery)}%</span>
              </div>
              <div className="p-2.5 rounded-lg bg-gray-900/60 border border-gray-800">
                <span className="text-gray-400 block text-[10px]">Current Node</span>
                <span className="font-mono font-bold text-emerald-300">{robot.current_node}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-gray-900/60 border border-gray-800">
                <span className="text-gray-400 block text-[10px]">Coordinates</span>
                <span className="font-mono text-gray-300">({robot.x.toFixed(1)}, {robot.y.toFixed(1)})</span>
              </div>
            </div>

            {/* Command Controls */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-800">
              <button
                onClick={() => handleCommand(robot.id, 'PAUSE')}
                className="py-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-semibold hover:bg-amber-500/30 transition-all flex items-center justify-center gap-1"
              >
                <Pause className="w-3 h-3" />
                <span>Pause</span>
              </button>

              <button
                onClick={() => handleCommand(robot.id, 'RESUME')}
                className="py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-semibold hover:bg-emerald-500/30 transition-all flex items-center justify-center gap-1"
              >
                <Play className="w-3 h-3" />
                <span>Resume</span>
              </button>

              <button
                onClick={() => handleCommand(robot.id, 'STOP')}
                className="py-1.5 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-semibold hover:bg-rose-500/30 transition-all flex items-center justify-center gap-1"
              >
                <Square className="w-3 h-3" />
                <span>Stop</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

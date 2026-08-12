import React, { useState } from 'react';
import { Pause, Play, Square, Cpu, Battery, MapPin, Activity, Code2, Shield, Radio, CheckCircle, ArrowDown } from 'lucide-react';
import { api } from '../../services/api';

export function RobotInspector({ robot, onClose }) {
  const [loadingCmd, setLoadingCmd] = useState(false);
  const [cmdSuccess, setCmdSuccess] = useState(null);
  const [activeView, setActiveView] = useState('NORMALIZED'); // 'NORMALIZED' | 'RAW' | 'TRACE'

  if (!robot) return null;
  const robotId = robot.robot_id || robot.id;

  const handleCommand = async (cmd) => {
    setLoadingCmd(true);
    setCmdSuccess(null);
    try {
      await api.sendRobotCommand(robotId, cmd);
      setCmdSuccess(`Command '${cmd}' dispatched to ${robotId}`);
      setTimeout(() => setCmdSuccess(null), 3500);
    } catch (e) {
      console.error(e);
      setCmdSuccess(`Command failed`);
    } finally {
      setLoadingCmd(false);
    }
  };

  const getVendorBadgeClass = (vendor) => {
    if (vendor === 'Vendor Alpha') return 'badge-vendor-alpha';
    if (vendor === 'Vendor Beta') return 'badge-vendor-beta';
    if (vendor === 'Vendor Delta') return 'badge-vendor-delta';
    return 'badge-vendor-gamma';
  };

  // Real raw vendor payload schema simulation based on vendor profile
  const getRawVendorPayload = () => {
    if (robot.vendor === 'Vendor Beta') {
      return {
        robotId: robotId,
        soc: round(robot.battery / 100, 2),
        coordinates: { x: robot.x, y: robot.y },
        state: robot.status
      };
    } else if (robot.vendor === 'Vendor Gamma') {
      return {
        dev_id: robotId,
        b_lvl: Math.round(robot.battery),
        location: { node_id: robot.current_node, px: robot.x, py: robot.y },
        op_state: robot.status
      };
    } else if (robot.vendor === 'Vendor Delta') {
      return {
        device_guid: robotId,
        charge_percent: Math.round(robot.battery),
        geo_point: [robot.x, robot.y],
        system_mode: robot.status
      };
    }
    // Default Vendor Alpha
    return {
      id: robotId,
      battery_level: Math.round(robot.battery),
      x_pos: robot.x,
      y_pos: robot.y,
      state: robot.status
    };
  };

  function round(val, dec) {
    return Math.round(val * Math.pow(10, dec)) / Math.pow(10, dec);
  }

  const rawPayload = getRawVendorPayload();

  return (
    <div className="w-[26rem] border-l border-slate-800/80 bg-[#0F172A]/95 p-5 flex flex-col justify-between overflow-y-auto shrink-0 shadow-2xl backdrop-blur-xl select-none font-mono">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-white font-mono">{robotId}</h3>
              <span className={`badge ${getVendorBadgeClass(robot.vendor)}`}>
                {robot.vendor}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 font-sans">{robot.model_type || 'Intelligent Fleet AGV'}</p>
          </div>
          <button 
            onClick={onClose} 
            className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center text-sm font-bold transition-colors"
          >
            ×
          </button>
        </div>

        {/* Battery Bar Meter */}
        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 text-slate-400">
              <Battery className="w-4 h-4 text-emerald-400" /> Battery Level
            </span>
            <span className={`font-bold ${robot.battery < 20 ? 'text-rose-400 animate-pulse' : 'text-emerald-400'}`}>
              {Math.round(robot.battery)}%
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-300 ${robot.battery < 20 ? 'bg-rose-500' : robot.battery < 50 ? 'bg-amber-500' : 'bg-emerald-400'}`}
              style={{ width: `${Math.max(5, Math.min(100, robot.battery))}%` }}
            />
          </div>
        </div>

        {/* Real Status Metrics Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-0.5">
            <div className="flex items-center gap-1 text-[10px] text-slate-400">
              <Activity className="w-3 h-3 text-cyan-400" />
              <span>STATUS</span>
            </div>
            <div className="font-bold text-cyan-300 uppercase">{robot.status}</div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-0.5">
            <div className="flex items-center gap-1 text-[10px] text-slate-400">
              <MapPin className="w-3 h-3 text-emerald-400" />
              <span>WAYPOINT</span>
            </div>
            <div className="font-bold text-emerald-300 truncate">
              {robot.current_node} ({robot.x.toFixed(1)}, {robot.y.toFixed(1)})
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-0.5">
            <div className="flex items-center gap-1 text-[10px] text-slate-400">
              <Cpu className="w-3 h-3 text-indigo-400" />
              <span>ACTIVE JOB</span>
            </div>
            <div className="font-bold text-indigo-300 truncate">
              {robot.current_job_id || 'NONE'}
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-0.5">
            <div className="flex items-center gap-1 text-[10px] text-slate-400">
              <Radio className="w-3 h-3 text-purple-400" />
              <span>PROTOCOL</span>
            </div>
            <div className="font-bold text-purple-300">MQTT JSON</div>
          </div>
        </div>

        {/* Operator Controls */}
        <div className="space-y-1.5">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Operator Overrides
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleCommand('PAUSE')}
              disabled={loadingCmd}
              className="py-2 rounded-xl bg-amber-500/15 text-amber-300 border border-amber-500/30 font-semibold text-xs flex items-center justify-center gap-1 hover:bg-amber-500/25 transition-all"
            >
              <Pause className="w-3 h-3" />
              <span>PAUSE</span>
            </button>

            <button
              onClick={() => handleCommand('RESUME')}
              disabled={loadingCmd}
              className="py-2 rounded-xl bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-semibold text-xs flex items-center justify-center gap-1 hover:bg-emerald-500/25 transition-all"
            >
              <Play className="w-3 h-3" />
              <span>RESUME</span>
            </button>

            <button
              onClick={() => handleCommand('STOP')}
              disabled={loadingCmd}
              className="py-2 rounded-xl bg-rose-500/15 text-rose-300 border border-rose-500/30 font-semibold text-xs flex items-center justify-center gap-1 hover:bg-rose-500/25 transition-all"
            >
              <Square className="w-3 h-3" />
              <span>STOP</span>
            </button>
          </div>
          {cmdSuccess && <div className="text-[11px] text-emerald-400 text-center font-bold">{cmdSuccess}</div>}
        </div>

        {/* View Switcher Tabs: RAW vs NORMALIZED vs TRACE */}
        <div className="space-y-2 pt-2 border-t border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Code2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>DATA PROVENANCE</span>
            </span>

            <div className="flex bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-[10px]">
              <button
                onClick={() => setActiveView('NORMALIZED')}
                className={`px-2 py-0.5 rounded ${activeView === 'NORMALIZED' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400'}`}
              >
                UNIFLEET
              </button>
              <button
                onClick={() => setActiveView('RAW')}
                className={`px-2 py-0.5 rounded ${activeView === 'RAW' ? 'bg-purple-600 text-white font-bold' : 'text-slate-400'}`}
              >
                RAW VENDOR
              </button>
              <button
                onClick={() => setActiveView('TRACE')}
                className={`px-2 py-0.5 rounded ${activeView === 'TRACE' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400'}`}
              >
                LIVE TRACE
              </button>
            </div>
          </div>

          {activeView === 'NORMALIZED' && (
            <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800 text-[11px] text-slate-300 space-y-1">
              <div className="text-slate-500 text-[10px]">// Authoritative UniFleet Standardized State:</div>
              <pre className="text-cyan-300 overflow-x-auto text-[10px]">
                {JSON.stringify({
                  robot_id: robotId,
                  vendor: robot.vendor,
                  battery: Math.round(robot.battery),
                  status: robot.status,
                  current_node: robot.current_node,
                  position: { x: robot.x, y: robot.y }
                }, null, 2)}
              </pre>
            </div>
          )}

          {activeView === 'RAW' && (
            <div className="p-3 rounded-xl bg-slate-950/90 border border-purple-500/30 text-[11px] text-slate-300 space-y-1">
              <div className="text-purple-400 text-[10px]">// {robot.vendor} Proprietary Payload (MQTT):</div>
              <pre className="text-purple-300 overflow-x-auto text-[10px]">
                {JSON.stringify(rawPayload, null, 2)}
              </pre>
            </div>
          )}

          {activeView === 'TRACE' && (
            <div className="p-3 rounded-xl bg-slate-950/90 border border-emerald-500/30 space-y-2 text-[10px]">
              <div className="flex items-center justify-between text-emerald-400 font-bold text-[11px]">
                <span>LIVE TELEMETRY PIPELINE TRACE</span>
                <span className="animate-pulse">● ACTIVE 250ms</span>
              </div>

              <div className="space-y-1 text-slate-300 font-sans">
                <div className="p-1.5 rounded bg-slate-900 border border-slate-800 flex items-center justify-between font-mono">
                  <span className="text-purple-300 font-bold">{robot.vendor} Hardware</span>
                  <span className="text-slate-500">Proprietary Telemetry</span>
                </div>
                <div className="flex justify-center text-slate-500 my-0.5"><ArrowDown className="w-3 h-3 text-cyan-400" /></div>

                <div className="p-1.5 rounded bg-slate-900 border border-slate-800 flex items-center justify-between font-mono">
                  <span className="text-cyan-300 font-bold">{robot.vendor.replace(' ', '')}Adapter</span>
                  <span className="text-slate-500">Normalizes to UniFleet Model</span>
                </div>
                <div className="flex justify-center text-slate-500 my-0.5"><ArrowDown className="w-3 h-3 text-cyan-400" /></div>

                <div className="p-1.5 rounded bg-slate-900 border border-slate-800 flex items-center justify-between font-mono">
                  <span className="text-indigo-300 font-bold">MQTT Broker & Fleet Brain</span>
                  <span className="text-slate-500">State Engine & Router</span>
                </div>
                <div className="flex justify-center text-slate-500 my-0.5"><ArrowDown className="w-3 h-3 text-cyan-400" /></div>

                <div className="p-1.5 rounded bg-slate-900 border border-slate-800 flex items-center justify-between font-mono">
                  <span className="text-emerald-300 font-bold">WebSocket Broadcast (250ms)</span>
                  <span className="text-slate-500">Digital Twin Synchronized</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

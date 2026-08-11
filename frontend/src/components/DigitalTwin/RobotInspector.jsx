import React, { useState } from 'react';
import { Pause, Play, Square, Cpu, Battery, MapPin, Activity, Code2, AlertTriangle } from 'lucide-react';
import { api } from '../../services/api';

export function RobotInspector({ robot, onClose }) {
  const [loadingCmd, setLoadingCmd] = useState(false);
  const [cmdSuccess, setCmdSuccess] = useState(null);

  if (!robot) return null;

  const handleCommand = async (cmd) => {
    setLoadingCmd(true);
    setCmdSuccess(null);
    try {
      await api.sendRobotCommand(robot.id, cmd);
      setCmdSuccess(`Issued ${cmd} to ${robot.id}`);
      setTimeout(() => setCmdSuccess(null), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingCmd(false);
    }
  };

  const getVendorBadgeClass = (vendor) => {
    if (vendor === 'Vendor Alpha') return 'badge-vendor-alpha';
    if (vendor === 'Vendor Beta') return 'badge-vendor-beta';
    return 'badge-vendor-gamma';
  };

  return (
    <div className="w-96 border-l border-[var(--border-glass)] bg-[var(--bg-card)] p-5 flex flex-col justify-between overflow-y-auto shrink-0 shadow-2xl backdrop-blur-md">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-white">{robot.id}</h3>
              <span className={`badge ${getVendorBadgeClass(robot.vendor)}`}>
                {robot.vendor}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1">{robot.model_type}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-lg">×</button>
        </div>

        {/* Status Metrics Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-xl bg-gray-900/60 border border-gray-800 space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <Activity className="w-3.5 h-3.5 text-blue-400" />
              <span>Status</span>
            </div>
            <div className="text-sm font-bold text-white uppercase">{robot.status}</div>
          </div>

          <div className="p-3 rounded-xl bg-gray-900/60 border border-gray-800 space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <Battery className="w-3.5 h-3.5 text-amber-400" />
              <span>Battery</span>
            </div>
            <div className="text-sm font-bold text-amber-400">{Math.round(robot.battery)}%</div>
          </div>

          <div className="p-3 rounded-xl bg-gray-900/60 border border-gray-800 space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span>Location</span>
            </div>
            <div className="text-xs font-mono font-bold text-emerald-300">
              ({robot.x.toFixed(1)}, {robot.y.toFixed(1)}) • {robot.current_node}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-gray-900/60 border border-gray-800 space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <Cpu className="w-3.5 h-3.5 text-purple-400" />
              <span>Active Job</span>
            </div>
            <div className="text-xs font-mono font-bold text-purple-300">
              {robot.current_job_id || 'NONE'}
            </div>
          </div>
        </div>

        {/* Manual Command Controls */}
        <div className="space-y-2">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Manual Operator Overrides</div>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleCommand('PAUSE')}
              disabled={loadingCmd}
              className="py-2.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-amber-500/30 transition-all"
            >
              <Pause className="w-3.5 h-3.5" />
              <span>PAUSE</span>
            </button>

            <button
              onClick={() => handleCommand('RESUME')}
              disabled={loadingCmd}
              className="py-2.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-emerald-500/30 transition-all"
            >
              <Play className="w-3.5 h-3.5" />
              <span>RESUME</span>
            </button>

            <button
              onClick={() => handleCommand('STOP')}
              disabled={loadingCmd}
              className="py-2.5 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/40 font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-rose-500/30 transition-all"
            >
              <Square className="w-3.5 h-3.5" />
              <span>STOP</span>
            </button>
          </div>
          {cmdSuccess && <div className="text-xs text-emerald-400 font-medium text-center">{cmdSuccess}</div>}
        </div>

        {/* Adapter Normalization View */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
            <Code2 className="w-3.5 h-3.5 text-blue-400" />
            <span>Adapter Telemetry Inspection</span>
          </div>
          <div className="p-3 rounded-xl bg-black/70 border border-gray-800 text-[11px] font-mono text-gray-300 space-y-1">
            <div className="text-gray-500">// Raw MQTT Payload Format ({robot.vendor}):</div>
            <pre className="text-blue-300 overflow-x-auto">
              {JSON.stringify({
                robot_id: robot.id,
                vendor: robot.vendor,
                battery: robot.battery,
                status: robot.status,
                coordinates: { x: robot.x, y: robot.y }
              }, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}

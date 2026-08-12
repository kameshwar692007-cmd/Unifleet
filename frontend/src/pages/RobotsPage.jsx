import React, { useState, useEffect } from 'react';
import { Pause, Play, Square, Truck, Cpu, Battery, Layers, X, Code2, Check, ExternalLink, ShieldCheck, Server, ArrowRight } from 'lucide-react';
import { api } from '../services/api';

export function RobotsPage({ fleetState, showAdaptersModal, onCloseAdaptersModal }) {
  const [vendorFilter, setVendorFilter] = useState('ALL');
  const [localAdaptersModal, setLocalAdaptersModal] = useState(false);
  const robots = fleetState?.robots || [];

  useEffect(() => {
    if (showAdaptersModal) {
      setLocalAdaptersModal(true);
    }
  }, [showAdaptersModal]);

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

  const adaptersData = [
    { vendor: "Vendor Alpha", protocol: "JSON over MQTT", topic: "fleet/alpha/telemetry", robot: "R01 / R02", schema: '{ "id": "R01", "battery_level": 95, "x_pos": 2.0, "y_pos": 3.0, "state": "READY" }' },
    { vendor: "Vendor Beta", protocol: "JSON over MQTT", topic: "fleet/beta/telemetry", robot: "R03", schema: '{ "robotId": "R03", "soc": 0.95, "coordinates": {"x": 10, "y": 4}, "state": "AVAILABLE" }' },
    { vendor: "Vendor Gamma", protocol: "JSON over MQTT", topic: "fleet/gamma/telemetry", robot: "R04 / R05", schema: '{ "dev_id": "R04", "b_lvl": 88, "location": {"px": 14, "py": 8}, "op_state": "MOVING" }' },
    { vendor: "Vendor Delta", protocol: "Plug & Play Extension", topic: "fleet/delta/telemetry", robot: "Dynamic Extension", schema: '{ "device_guid": "R06", "charge_percent": 99, "geo_point": [18, 12], "system_mode": "ACTIVE" }' }
  ];

  const systemProofFeatures = [
    { name: "MULTI-VENDOR NORMALIZATION", status: "LIVE", color: "text-cyan-400" },
    { name: "MQTT BROKER TELEMETRY", status: "LIVE", color: "text-purple-400" },
    { name: "FLEET BRAIN ENGINE", status: "LIVE", color: "text-emerald-400" },
    { name: "A* ROUTING & PREDICTION", status: "LIVE", color: "text-indigo-400" },
    { name: "HARMONY ENGINE (CONFLICTS)", status: "LIVE", color: "text-amber-400" },
    { name: "ZERO-CODE WORKFLOWS", status: "LIVE", color: "text-emerald-400" },
    { name: "DIGITAL TWIN (250ms)", status: "LIVE", color: "text-cyan-400" },
    { name: "POSTGRESQL PERSISTENCE", status: "LIVE", color: "text-indigo-400" }
  ];

  const apiEndpoints = [
    { method: "GET", path: "/api/v1/robots", desc: "List all normalized fleet AGVs across vendors" },
    { method: "GET", path: "/api/v1/robots/{id}", desc: "Get single robot telemetry & route" },
    { method: "POST", path: "/api/v1/jobs", desc: "Dispatch new transport job with explainable scheduler" },
    { method: "POST", path: "/api/v1/robots/{id}/command", desc: "Issue PAUSE / RESUME / STOP operator command" },
    { method: "GET", path: "/api/v1/warehouse/topology", desc: "Export warehouse node graph & edge constraints" },
    { method: "GET", path: "/api/v1/workflows", desc: "Retrieve active automation rules & execution logs" },
    { method: "GET", path: "/api/v1/intelligence/compare-routes", desc: "Predictive route alternatives comparison" }
  ];

  return (
    <div className="p-6 space-y-6 bg-[#090D16] min-h-screen text-slate-100 font-sans select-none relative">
      {/* Header & Controls */}
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

        {/* Right Action Bar */}
        <div className="flex items-center gap-3">
          <a
            href="http://localhost:8000/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-600 text-white font-mono font-bold text-xs hover:bg-cyan-500 transition-all shadow-md shadow-cyan-500/20"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            OPEN API EXPLORER (/docs)
          </a>

          <button
            onClick={() => setLocalAdaptersModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/40 text-xs font-mono font-semibold hover:bg-purple-500/30 transition-all shadow-md shadow-purple-500/10"
          >
            <Layers className="w-3.5 h-3.5 text-purple-400" />
            VENDOR ADAPTER SCHEMAS
          </button>

          {/* Vendor Filter Buttons */}
          <div className="flex items-center gap-1.5 bg-slate-900/90 p-1.5 rounded-xl border border-slate-800 text-xs font-mono">
            {['ALL', 'Vendor Alpha', 'Vendor Beta', 'Vendor Gamma', 'Vendor Delta'].map((v) => (
              <button
                key={v}
                onClick={() => setVendorFilter(v)}
                className={`px-2.5 py-1 rounded-lg transition-all font-semibold ${
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
      </div>

      {/* System Proof Capabilities Panel */}
      <div className="glass-panel p-4 bg-slate-900/80 font-mono space-y-2">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <span className="text-xs font-bold text-white tracking-widest uppercase flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            UNIFLEET SYSTEM PROOF — OPERATIONAL ARCHITECTURE STATUS
          </span>
          <span className="text-[10px] text-slate-400">AUTHORITATIVE HARDWARE AGNOSTIC CORE</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
          {systemProofFeatures.map((item) => (
            <div key={item.name} className="p-2 rounded-lg bg-slate-950/80 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-300 text-[11px] font-semibold">{item.name}</span>
              <span className={`text-[10px] font-bold ${item.color} flex items-center gap-1`}>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {item.status}
              </span>
            </div>
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

              <div className="text-xs text-slate-400 font-sans">{robot.model_type || 'Intelligent AGV'}</div>

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

      {/* Unified API Proof Section */}
      <div className="glass-panel p-5 bg-slate-900/80 font-mono space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Server className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm font-bold text-white tracking-wider uppercase">ACT 06 — ONE UNIFIED API FOR EVERY ROBOT MANUFACTURER</h3>
          </div>
          <a
            href="http://localhost:8000/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-cyan-400 hover:underline flex items-center gap-1 font-bold"
          >
            Launch Interactive OpenAPI Specs <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        <p className="text-xs text-slate-300 font-sans leading-relaxed">
          UniFleet decouples warehouse software from vendor-specific telemetry protocols. Regardless of underlying proprietary MQTT structures, external warehouse management systems (WMS) interact with one standardized REST/WebSocket API contract.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {apiEndpoints.map((ep) => (
            <div key={ep.path} className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${ep.method === 'GET' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'}`}>
                    {ep.method}
                  </span>
                  <code className="text-white font-bold">{ep.path}</code>
                </div>
                <p className="text-[11px] text-slate-400 font-sans">{ep.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Future Integration Boundaries Panel */}
      <div className="glass-panel p-5 bg-slate-900/80 font-mono space-y-3 border-l-4 border-l-purple-500">
        <h3 className="text-xs font-bold text-purple-300 tracking-wider uppercase">FUTURE INTEGRATION BOUNDARIES & EXTENSIONS</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
            <span className="text-[10px] text-purple-400 block font-bold">ROS2 / NAV2 BRIDGE</span>
            <span className="text-slate-400 text-[10px] font-sans">Physical AGV Node Bridge</span>
            <span className="mt-1 inline-block text-[9px] px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300">FUTURE EXTENSION</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
            <span className="text-[10px] text-purple-400 block font-bold">ENTERPRISE WMS / ERP</span>
            <span className="text-slate-400 text-[10px] font-sans">SAP / Manhattan Connector</span>
            <span className="mt-1 inline-block text-[9px] px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300">FUTURE EXTENSION</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
            <span className="text-[10px] text-purple-400 block font-bold">GAZEBO / THREE.JS</span>
            <span className="text-slate-400 text-[10px] font-sans">3D WebGL Digital Twin</span>
            <span className="mt-1 inline-block text-[9px] px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300">FUTURE EXTENSION</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
            <span className="text-[10px] text-purple-400 block font-bold">MARL OPTIMIZER</span>
            <span className="text-slate-400 text-[10px] font-sans">Multi-Agent RL Scheduler</span>
            <span className="mt-1 inline-block text-[9px] px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300">FUTURE EXTENSION</span>
          </div>
        </div>
      </div>

      {/* Act 6: Open Vendor Adapters Breakdown Modal */}
      {localAdaptersModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-6">
          <div className="bg-[#0F172A] border border-purple-500/50 rounded-2xl p-6 w-full max-w-4xl space-y-5 font-mono shadow-2xl shadow-purple-500/20">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Code2 className="w-5 h-5 text-purple-400" />
                <h3 className="text-base font-bold text-white tracking-wider">OPEN VENDOR ADAPTER SPECIFICATIONS (ACT 06)</h3>
              </div>
              <button
                onClick={() => {
                  setLocalAdaptersModal(false);
                  if (onCloseAdaptersModal) onCloseAdaptersModal();
                }}
                className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              UniFleet abstracts proprietary hardware protocols via plug-and-play python adapter classes. Adding a 4th manufacturer (such as <span className="font-mono text-purple-300 font-bold">Vendor Delta</span>) requires only inheriting from <code className="text-cyan-300">BaseVendorAdapter</code> without changing core Fleet Brain or Harmony Engine code.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {adaptersData.map((item) => (
                <div key={item.vendor} className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-purple-300 text-sm">{item.vendor}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      {item.protocol}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-400 space-y-1">
                    <div><span className="text-slate-500">Target AGVs:</span> {item.robot}</div>
                    <div><span className="text-slate-500">MQTT Topic:</span> <code className="text-cyan-300">{item.topic}</code></div>
                  </div>

                  <div className="p-2.5 rounded bg-slate-900/90 border border-slate-800 text-[10px] text-slate-300 font-mono overflow-x-auto">
                    <span className="text-slate-500 block text-[9px] mb-1">RAW PAYLOAD SCHEMA</span>
                    {item.schema}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-800">
              <button
                onClick={() => {
                  setLocalAdaptersModal(false);
                  if (onCloseAdaptersModal) onCloseAdaptersModal();
                }}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all"
              >
                Close Adapter Specifications
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

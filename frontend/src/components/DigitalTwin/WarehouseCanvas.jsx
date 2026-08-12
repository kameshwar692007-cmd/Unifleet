import React from 'react';
import { ShieldAlert, Zap, Radio, Layers, Navigation } from 'lucide-react';

export function WarehouseCanvas({ fleetState, topologyData, selectedRobotId, onSelectRobot }) {
  const nodes = topologyData?.nodes || [
    { node_id: "N01", name: "Receiving Dock", zone: "Receiving", x: 2.0, y: 3.0 },
    { node_id: "N02", name: "Storage Rack A", zone: "Storage", x: 6.0, y: 3.0 },
    { node_id: "N03", name: "Storage Rack B", zone: "Storage", x: 10.0, y: 3.0 },
    { node_id: "N04", name: "Picking Hub", zone: "Picking", x: 14.0, y: 3.0 },
    { node_id: "N05", name: "Packing Line 1", zone: "Packing", x: 6.0, y: 8.0 },
    { node_id: "N06", name: "Packing Line 2", zone: "Packing", x: 10.0, y: 8.0 },
    { node_id: "N07", name: "Dispatch Dock", zone: "Dispatch", x: 14.0, y: 8.0 },
    { node_id: "N08", name: "Fast Charger Alpha", zone: "Charging", x: 2.0, y: 12.0, is_charging: true },
    { node_id: "N09", name: "Fast Charger Beta", zone: "Charging", x: 6.0, y: 12.0, is_charging: true },
    { node_id: "N10", name: "West Transit Node", zone: "Transit", x: 2.0, y: 8.0 },
    { node_id: "N11", name: "Central Junction", zone: "Constrained", x: 10.0, y: 5.5, is_constrained: true },
    { node_id: "N12", name: "East Bypass Node", zone: "Transit", x: 14.0, y: 5.5 }
  ];

  const edges = topologyData?.edges || [
    { u: "N01", v: "N02" }, { u: "N02", v: "N03" }, { u: "N03", v: "N04" },
    { u: "N01", v: "N10" }, { u: "N02", v: "N05" }, { u: "N03", v: "N11", is_constrained: true },
    { u: "N04", v: "N12" }, { u: "N05", v: "N06" }, { u: "N06", v: "N07" },
    { u: "N05", v: "N11", is_constrained: true }, { u: "N06", v: "N11", is_constrained: true },
    { u: "N07", v: "N12" }, { u: "N10", v: "N05" }, { u: "N10", v: "N08" },
    { u: "N05", v: "N09" }, { u: "N11", v: "N12", is_constrained: true }
  ];

  const robots = fleetState?.robots || [];
  const activeConflicts = fleetState?.active_conflicts || [];
  const latestConflict = activeConflicts.length > 0 ? activeConflicts[0] : null;

  // Scale map coordinates to SVG canvas
  const mapX = (x) => 65 + x * 43.0;
  const mapY = (y) => 45 + y * 31.0;

  const getZoneColor = (zone) => {
    switch (zone) {
      case 'Receiving': return { fill: 'rgba(6, 182, 212, 0.12)', stroke: 'rgba(6, 182, 212, 0.4)', text: '#06B6D4' };
      case 'Storage': return { fill: 'rgba(59, 130, 246, 0.12)', stroke: 'rgba(59, 130, 246, 0.4)', text: '#3B82F6' };
      case 'Picking': return { fill: 'rgba(168, 85, 247, 0.12)', stroke: 'rgba(168, 85, 247, 0.4)', text: '#A855F7' };
      case 'Packing': return { fill: 'rgba(245, 158, 11, 0.12)', stroke: 'rgba(245, 158, 11, 0.4)', text: '#F59E0B' };
      case 'Dispatch': return { fill: 'rgba(16, 185, 129, 0.12)', stroke: 'rgba(16, 185, 129, 0.4)', text: '#10B981' };
      case 'Charging': return { fill: 'rgba(99, 102, 241, 0.12)', stroke: 'rgba(99, 102, 241, 0.4)', text: '#6366F1' };
      case 'Constrained': return { fill: 'rgba(244, 63, 94, 0.15)', stroke: 'rgba(244, 63, 94, 0.6)', text: '#F43F5E' };
      default: return { fill: 'rgba(100, 116, 139, 0.12)', stroke: 'rgba(100, 116, 139, 0.4)', text: '#94A3B8' };
    }
  };

  const getRobotStatusHex = (status) => {
    switch (status) {
      case 'AVAILABLE': return '#06B6D4'; // Cyan
      case 'MOVING': return '#10B981'; // Emerald
      case 'WAITING': return '#F59E0B'; // Amber
      case 'PAUSED': return '#F59E0B';
      case 'CHARGING': return '#6366F1'; // Indigo
      default: return '#F43F5E';
    }
  };

  return (
    <div className="relative w-full h-full min-h-[580px] glass-panel p-4 flex flex-col justify-between overflow-hidden border border-slate-800/80 bg-[#0B0F19]/90 select-none">
      {/* Top Digital Twin Control & Status Overlay */}
      <div className="flex items-center justify-between z-10 bg-slate-900/90 p-3 rounded-xl border border-slate-800 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Radio className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-white tracking-wider flex items-center gap-2">
              LIVE DIGITAL TWIN — WAREHOUSE OPERATIONS MAP
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                250ms SYNC
              </span>
            </h2>
            <p className="text-[11px] text-slate-400 font-mono">
              Authoritative WebSocket Telemetry Stream • Multi-Vendor AGV Coordinates
            </p>
          </div>
        </div>

        {/* Legend */}
        <div className="hidden sm:flex items-center gap-4 text-[11px] font-mono">
          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span><span className="text-slate-300">Available</span></div>
          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span><span className="text-slate-300">Moving</span></div>
          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span><span className="text-slate-300">Waiting</span></div>
          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-indigo-400"></span><span className="text-slate-300">Charging</span></div>
          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span><span className="text-slate-300">Conflict</span></div>
        </div>
      </div>

      {/* HERO MOMENT — Real Harmony Engine Route Conflict Alert Banner */}
      {latestConflict && (
        <div className="absolute top-16 left-6 right-6 z-20 bg-rose-950/95 border border-rose-500/60 p-3.5 rounded-xl backdrop-blur-xl flex items-center justify-between shadow-2xl pulse-conflict">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0">
              <ShieldAlert className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="text-xs font-bold text-rose-300 uppercase tracking-widest flex items-center gap-2">
                HERO MOMENT — PREDICTED CONFLICT RESOLUTION
                <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-rose-500/30 text-rose-100 border border-rose-400/40">
                  HARMONY ENGINE ACTIVE
                </span>
              </div>
              <div className="text-xs text-rose-100 font-mono mt-0.5">
                Junction <strong className="text-amber-300 font-bold">{latestConflict.node_id} Central Junction</strong> • Priority AGV: <strong className="text-emerald-300 font-bold">{latestConflict.primary_robot_id}</strong> • Holding AGV: <strong className="text-amber-300 font-bold">{latestConflict.secondary_robot_id}</strong>
              </div>
            </div>
          </div>
          <span className="px-3 py-1.5 rounded-lg bg-rose-900/60 text-rose-200 text-[10px] font-mono font-bold uppercase border border-rose-500/50">
            {latestConflict.resolution_type}
          </span>
        </div>
      )}

      {/* SVG Industrial Warehouse Map */}
      <svg className="w-full h-[480px] z-0 select-none my-auto" viewBox="0 0 800 480" preserveAspectRatio="xMidYMid meet">
        <defs>
          <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#06B6D4" stopOpacity="0" />
          </radialGradient>

          <radialGradient id="conflictGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#F43F5E" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#F43F5E" stopOpacity="0" />
          </radialGradient>

          {/* Grid pattern for industrial floor background */}
          <pattern id="industrialGrid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="1" />
          </pattern>
        </defs>

        {/* Industrial Floor Grid Background */}
        <rect width="800" height="480" fill="url(#industrialGrid)" />

        {/* Draw Topology Lane Edges */}
        {edges.map((edge, idx) => {
          const uNode = nodes.find(n => n.node_id === edge.u);
          const vNode = nodes.find(n => n.node_id === edge.v);
          if (!uNode || !vNode) return null;

          const x1 = mapX(uNode.x);
          const y1 = mapY(uNode.y);
          const x2 = mapX(vNode.x);
          const y2 = mapY(vNode.y);

          return (
            <g key={`edge-${idx}`}>
              {/* Outer guide track line */}
              <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={edge.is_constrained ? 'rgba(244, 63, 94, 0.5)' : 'rgba(51, 65, 85, 0.6)'}
                strokeWidth={edge.is_constrained ? '4' : '3'}
                strokeDasharray={edge.is_constrained ? '6 4' : 'none'}
              />
            </g>
          );
        })}

        {/* Draw Active AGV Route Paths */}
        {robots.map((r) => {
          if (!r.route || r.route.length < 2) return null;
          const routeNodes = r.route.map(nid => nodes.find(n => n.node_id === nid)).filter(Boolean);
          if (routeNodes.length < 2) return null;

          const pointsStr = routeNodes.map(n => `${mapX(n.x)},${mapY(n.y)}`).join(' ');
          const routeColor = r.robot_id === 'R01' ? '#10B981' : r.robot_id === 'R04' ? '#F59E0B' : '#06B6D4';

          return (
            <polyline
              key={`route-${r.robot_id || r.id}`}
              points={pointsStr}
              fill="none"
              stroke={routeColor}
              strokeWidth="3.5"
              strokeDasharray="8 4"
              opacity="0.85"
            />
          );
        })}

        {/* Draw Warehouse Node Zones */}
        {nodes.map((node) => {
          const cx = mapX(node.x);
          const cy = mapY(node.y);
          const isConflictNode = latestConflict && latestConflict.node_id === node.node_id;
          const zStyle = getZoneColor(node.zone);

          return (
            <g key={`node-${node.node_id}`} className="cursor-pointer group">
              {/* Bottleneck Conflict Pulse */}
              {isConflictNode && (
                <circle cx={cx} cy={cy} r="40" fill="url(#conflictGlow)" className="animate-ping" />
              )}

              {/* Node Zone Outer Box */}
              <rect
                x={cx - 48}
                y={cy - 24}
                width="96"
                height="48"
                rx="8"
                fill={zStyle.fill}
                stroke={zStyle.stroke}
                strokeWidth="1.5"
                className="transition-all duration-200 group-hover:stroke-cyan-400 group-hover:fill-slate-800/80"
              />

              {/* Node ID Badge */}
              <text x={cx} y={cy - 5} textAnchor="middle" fill="#F8FAFC" fontSize="12" fontWeight="bold" fontFamily="JetBrains Mono">
                {node.node_id}
              </text>

              {/* Node Name */}
              <text x={cx} y={cy + 13} textAnchor="middle" fill={zStyle.text} fontSize="9" fontWeight="600">
                {node.name}
              </text>
            </g>
          );
        })}

        {/* Draw Live Telemetry AGV Markers */}
        {robots.map((robot) => {
          const r_id = robot.robot_id || robot.id;
          const rx = mapX(robot.x);
          const ry = mapY(robot.y);
          const isSelected = selectedRobotId === r_id;
          const statusColor = getRobotStatusHex(robot.status);

          return (
            <g
              key={`robot-marker-${r_id}`}
              transform={`translate(${rx}, ${ry})`}
              onClick={() => onSelectRobot(r_id)}
              className="cursor-pointer transition-all duration-300 hover:scale-125"
            >
              {/* Selection Ring */}
              {isSelected && (
                <circle cx="0" cy="0" r="26" fill="none" stroke="#06B6D4" strokeWidth="2.5" className="animate-pulse" />
              )}

              {/* Top-Down Industrial AGV Body */}
              <rect
                x="-16"
                y="-16"
                width="32"
                height="32"
                rx="6"
                fill="#0F172A"
                stroke={statusColor}
                strokeWidth="2.5"
              />

              {/* Robot ID */}
              <text x="0" y="1" textAnchor="middle" dominantBaseline="middle" fill="#FFFFFF" fontSize="10" fontWeight="bold" fontFamily="JetBrains Mono">
                {r_id}
              </text>

              {/* Battery Indicator Bar */}
              <rect x="-14" y="20" width="28" height="11" rx="3" fill="#090D16" stroke={statusColor} strokeWidth="1" />
              <text x="0" y="27" textAnchor="middle" fill="#F8FAFC" fontSize="8" fontWeight="bold" fontFamily="JetBrains Mono">
                {Math.round(robot.battery)}%
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

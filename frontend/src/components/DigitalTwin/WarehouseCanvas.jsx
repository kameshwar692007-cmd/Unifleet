import React from 'react';
import { AlertTriangle, BatteryCharging, ShieldAlert } from 'lucide-react';

export function WarehouseCanvas({ fleetState, topologyData, selectedRobotId, onSelectRobot }) {
  const nodes = topologyData?.nodes || [
    { node_id: "N01", name: "Receiving Dock", zone: "Receiving", x: 2.0, y: 3.0 },
    { node_id: "N02", name: "Storage Rack A", zone: "Storage", x: 6.0, y: 3.0 },
    { node_id: "N03", name: "Storage Rack B", zone: "Storage", x: 10.0, y: 3.0 },
    { node_id: "N04", name: "Picking Hub", zone: "Picking", x: 14.0, y: 3.0 },
    { node_id: "N05", name: "Packing Line 1", zone: "Packing", x: 6.0, y: 8.0 },
    { node_id: "N06", name: "Packing Line 2", zone: "Packing", x: 10.0, y: 8.0 },
    { node_id: "N07", name: "Dispatch Dock", zone: "Dispatch", x: 14.0, y: 8.0 },
    { node_id: "N08", name: "Fast Charger Alpha", zone: "Charging", x: 2.0, y: 12.0 },
    { node_id: "N09", name: "Fast Charger Beta", zone: "Charging", x: 6.0, y: 12.0 },
    { node_id: "N10", name: "West Transit", zone: "Transit", x: 2.0, y: 8.0 },
    { node_id: "N11", name: "Central Junction", zone: "Constrained", x: 10.0, y: 5.5, is_constrained: true },
    { node_id: "N12", name: "East Bypass", zone: "Transit", x: 14.0, y: 5.5 }
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
  const mapX = (x) => 60 + x * 43.5;
  const mapY = (y) => 50 + y * 32.5;

  const getZoneColor = (zone) => {
    switch (zone) {
      case 'Receiving': return 'fill-cyan-950/40 stroke-cyan-500/30';
      case 'Storage': return 'fill-blue-950/40 stroke-blue-500/30';
      case 'Picking': return 'fill-purple-950/40 stroke-purple-500/30';
      case 'Packing': return 'fill-amber-950/40 stroke-amber-500/30';
      case 'Dispatch': return 'fill-emerald-950/40 stroke-emerald-500/30';
      case 'Charging': return 'fill-yellow-950/40 stroke-yellow-500/30';
      case 'Constrained': return 'fill-rose-950/40 stroke-rose-500/40';
      default: return 'fill-gray-900/40 stroke-gray-700/30';
    }
  };

  const getRobotStatusColor = (status) => {
    switch (status) {
      case 'AVAILABLE': return '#10B981';
      case 'MOVING': return '#3B82F6';
      case 'WAITING': return '#8B5CF6';
      case 'PAUSED': return '#F59E0B';
      case 'CHARGING': return '#EAB308';
      default: return '#EF4444';
    }
  };

  return (
    <div className="relative w-full h-[620px] glass-panel-glow p-4 flex flex-col justify-between overflow-hidden">
      {/* Top Controls Overlay */}
      <div className="flex items-center justify-between z-10 bg-gray-900/70 p-3 rounded-xl border border-gray-800 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
            <h2 className="text-sm font-bold text-white tracking-wide">LIVE WAREHOUSE DIGITAL TWIN</h2>
          </div>
          <p className="text-xs text-gray-400">Authoritative Synchronized State • Real-Time WebSockets Frame Stream</p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-[11px]">
          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span><span className="text-gray-300">Available</span></div>
          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span><span className="text-gray-300">Moving</span></div>
          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span><span className="text-gray-300">Waiting</span></div>
          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span><span className="text-gray-300">Paused</span></div>
          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-yellow-500"></span><span className="text-gray-300">Charging</span></div>
        </div>
      </div>

      {/* Conflict Warning Banner when Act 4 active */}
      {latestConflict && (
        <div className="absolute top-20 left-6 right-6 z-20 bg-gradient-to-r from-rose-950/90 via-amber-950/90 to-rose-950/90 border border-rose-500/50 p-3 rounded-xl backdrop-blur-md flex items-center justify-between shadow-2xl animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-rose-500/20 flex items-center justify-center text-rose-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-rose-300 uppercase tracking-wider">
                HERO MOMENT — PREDICTED ROUTE CONFLICT DETECTED & RESOLVED
              </div>
              <div className="text-xs text-rose-100 font-mono">
                Junction <span className="font-bold text-yellow-300">{latestConflict.node_id}</span> • Priority: <span className="font-bold text-emerald-300">{latestConflict.primary_robot_id}</span> • Waiting: <span className="font-bold text-purple-300">{latestConflict.secondary_robot_id}</span>
              </div>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded bg-rose-500/30 text-rose-200 text-[10px] font-bold uppercase border border-rose-400/40">
            {latestConflict.resolution_type}
          </span>
        </div>
      )}

      {/* SVG Warehouse Map Canvas */}
      <svg className="w-full h-[520px] z-0 select-none" viewBox="0 0 800 500" preserveAspectRatio="xMidYMid meet">
        <defs>
          <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
          </radialGradient>

          <radialGradient id="conflictGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#EF4444" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#EF4444" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Draw Topology Edges */}
        {edges.map((edge, idx) => {
          const uNode = nodes.find(n => n.node_id === edge.u);
          const vNode = nodes.find(n => n.node_id === edge.v);
          if (!uNode || !vNode) return null;

          const x1 = mapX(uNode.x);
          const y1 = mapY(uNode.y);
          const x2 = mapX(vNode.x);
          const y2 = mapY(vNode.v ? vNode.y : vNode.y);

          return (
            <g key={`edge-${idx}`}>
              <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={edge.is_constrained ? '#F43F5E' : '#374151'}
                strokeWidth={edge.is_constrained ? '3' : '2'}
                strokeDasharray={edge.is_constrained ? '6 4' : 'none'}
              />
            </g>
          );
        })}

        {/* Draw Active AGV Route Polylines */}
        {robots.map((r) => {
          if (!r.route || r.route.length < 2) return null;
          const routeNodes = r.route.map(nid => nodes.find(n => n.node_id === nid)).filter(Boolean);
          if (routeNodes.length < 2) return null;

          const pointsStr = routeNodes.map(n => `${mapX(n.x)},${mapY(n.y)}`).join(' ');

          return (
            <polyline
              key={`route-${r.id}`}
              points={pointsStr}
              fill="none"
              stroke={r.id === 'R01' ? '#3B82F6' : r.id === 'R04' ? '#A855F7' : '#06B6D4'}
              strokeWidth="3"
              strokeDasharray="8 4"
              opacity="0.8"
            />
          );
        })}

        {/* Draw Node Waypoints */}
        {nodes.map((node) => {
          const cx = mapX(node.x);
          const cy = mapY(node.y);
          const isConflictNode = latestConflict && latestConflict.node_id === node.node_id;

          return (
            <g key={`node-${node.node_id}`} className="cursor-pointer group">
              {/* Conflict Highlight Ring */}
              {isConflictNode && (
                <circle cx={cx} cy={cy} r="35" fill="url(#conflictGlow)" className="animate-ping" />
              )}

              {/* Node Zone Outer Pill */}
              <rect
                x={cx - 45}
                y={cy - 22}
                width="90"
                height="44"
                rx="8"
                className={`${getZoneColor(node.zone)} transition-all group-hover:stroke-blue-400`}
              />

              {/* Node Code & Name */}
              <text x={cx} y={cy - 4} textAnchor="middle" fill="#FFFFFF" fontSize="11" fontWeight="bold">
                {node.node_id}
              </text>
              <text x={cx} y={cy + 12} textAnchor="middle" fill="#9CA3AF" fontSize="9">
                {node.name}
              </text>
            </g>
          );
        })}

        {/* Draw Live Simulated AGV Markers */}
        {robots.map((robot) => {
          const rx = mapX(robot.x);
          const ry = mapY(robot.y);
          const isSelected = selectedRobotId === robot.id;
          const statusColor = getRobotStatusColor(robot.status);

          return (
            <g
              key={`robot-marker-${robot.id}`}
              transform={`translate(${rx}, ${ry})`}
              onClick={() => onSelectRobot(robot.id)}
              className="cursor-pointer transition-all duration-300 hover:scale-125"
            >
              {/* Glowing aura if selected */}
              {isSelected && (
                <circle cx="0" cy="0" r="24" fill="none" stroke="#3B82F6" strokeWidth="2.5" className="animate-pulse" />
              )}

              {/* Outer AGV Body */}
              <circle cx="0" cy="0" r="16" fill="#1F2937" stroke={statusColor} strokeWidth="3" />

              {/* Vendor Initials */}
              <text x="0" y="-1" textAnchor="middle" dominantBaseline="middle" fill="#FFFFFF" fontSize="9" fontWeight="bold">
                {robot.id}
              </text>

              {/* Battery Indicator Pill */}
              <rect x="-16" y="18" width="32" height="12" rx="4" fill="#111827" stroke={statusColor} strokeWidth="1" />
              <text x="0" y="26" textAnchor="middle" fill="#D1D5DB" fontSize="8" fontWeight="600">
                {Math.round(robot.battery)}%
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

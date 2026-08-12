import React from 'react';
import { WarehouseCanvas } from '../components/DigitalTwin/WarehouseCanvas';
import { RobotInspector } from '../components/DigitalTwin/RobotInspector';
import { Activity, ShieldCheck } from 'lucide-react';

export function DigitalTwinPage({ fleetState, topologyData, selectedRobotId, setSelectedRobotId }) {
  const robots = fleetState?.robots || [];
  const events = fleetState?.events || [];

  const selectedRobot = robots.find(r => (r.robot_id || r.id) === selectedRobotId);

  return (
    <div className="p-5 h-[calc(100vh-3.5rem)] flex gap-5 overflow-hidden bg-[#090D16] select-none">
      {/* 2D SVG Digital Twin Canvas + Live Event Stream */}
      <div className="flex-1 flex flex-col justify-between space-y-4 min-w-0">
        <div className="flex-1 min-h-0">
          <WarehouseCanvas
            fleetState={fleetState}
            topologyData={topologyData}
            selectedRobotId={selectedRobotId}
            onSelectRobot={(id) => setSelectedRobotId && setSelectedRobotId(id)}
          />
        </div>

        {/* Compact Live Fleet Activity Stream Ticker */}
        <div className="h-24 p-3 rounded-xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl flex flex-col justify-between font-mono shrink-0 select-none">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-1.5 text-xs text-slate-400">
            <span className="flex items-center gap-2 font-bold text-slate-200">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              LIVE TELEMETRY & EVENT STREAM
            </span>
            <span className="text-[10px] text-slate-500">AUTHORITATIVE REAL-TIME FEED</span>
          </div>

          <div className="flex items-center gap-3 overflow-x-auto text-[11px] py-1">
            {events.length > 0 ? (
              events.slice(0, 4).map((evt, idx) => (
                <div key={evt.id || idx} className="flex items-center gap-2 px-2.5 py-1 rounded bg-slate-950/70 border border-slate-800 whitespace-nowrap">
                  <span className={`w-1.5 h-1.5 rounded-full ${evt.severity === 'WARNING' ? 'bg-amber-400' : evt.severity === 'SUCCESS' ? 'bg-emerald-400' : 'bg-cyan-400'}`} />
                  <span className="text-slate-400 text-[10px]">{evt.timestamp ? new Date(evt.timestamp).toLocaleTimeString() : '12:00:00'}</span>
                  <span className="text-slate-200 font-semibold">{evt.message}</span>
                </div>
              ))
            ) : (
              <div className="flex items-center gap-2 text-slate-400 text-xs py-1">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>UniFleet Digital Twin stream online. All 5 AGVs initialized across Vendor Alpha, Beta & Gamma profiles.</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Side Selected Robot Inspector Drawer */}
      {selectedRobot && (
        <RobotInspector
          robot={selectedRobot}
          onClose={() => setSelectedRobotId && setSelectedRobotId(null)}
        />
      )}
    </div>
  );
}

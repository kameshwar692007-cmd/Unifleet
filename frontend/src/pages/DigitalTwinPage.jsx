import React, { useState } from 'react';
import { WarehouseCanvas } from '../components/DigitalTwin/WarehouseCanvas';
import { RobotInspector } from '../components/DigitalTwin/RobotInspector';

export function DigitalTwinPage({ fleetState, topologyData }) {
  const [selectedRobotId, setSelectedRobotId] = useState(null);
  const robots = fleetState?.robots || [];

  const selectedRobot = robots.find(r => r.id === selectedRobotId);

  return (
    <div className="p-6 h-[calc(100vh-4rem)] flex gap-6 overflow-hidden">
      {/* 2D SVG Digital Twin Canvas */}
      <div className="flex-1 flex flex-col justify-between">
        <WarehouseCanvas
          fleetState={fleetState}
          topologyData={topologyData}
          selectedRobotId={selectedRobotId}
          onSelectRobot={(id) => setSelectedRobotId(id)}
        />
      </div>

      {/* Right Drawer Robot Inspector */}
      {selectedRobot && (
        <RobotInspector
          robot={selectedRobot}
          onClose={() => setSelectedRobotId(null)}
        />
      )}
    </div>
  );
}

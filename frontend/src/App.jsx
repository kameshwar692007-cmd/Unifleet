import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { DemoController } from './components/DemoController';
import { OverviewPage } from './pages/OverviewPage';
import { DigitalTwinPage } from './pages/DigitalTwinPage';
import { RobotsPage } from './pages/RobotsPage';
import { JobsPage } from './pages/JobsPage';
import { WorkflowsPage } from './pages/WorkflowsPage';
import { IntelligencePage } from './pages/IntelligencePage';
import { EventsPage } from './pages/EventsPage';
import { useFleetWebSocket } from './services/useFleetWebSocket';
import { api } from './services/api';

export function App() {
  const [activeTab, setActiveTab] = useState('digital-twin');
  const [isPresentationMode, setIsPresentationMode] = useState(false);
  const [topologyData, setTopologyData] = useState(null);
  const [selectedRobotId, setSelectedRobotId] = useState(null);
  const [showAdaptersModal, setShowAdaptersModal] = useState(false);
  const { fleetState, isConnected } = useFleetWebSocket();

  useEffect(() => {
    const fetchTopology = async () => {
      try {
        const res = await api.getTopology();
        setTopologyData(res.data);
      } catch (e) {
        console.error("Failed to load topology:", e);
      }
    };
    fetchTopology();
  }, []);

  const handleActTriggered = (actNum) => {
    if (actNum === 1) {
      setActiveTab('robots');
      setSelectedRobotId(null);
    } else if (actNum === 2) {
      setActiveTab('digital-twin');
      setSelectedRobotId('R03'); // Auto-select R03 in Digital Twin for inspection
    } else if (actNum === 3) {
      setActiveTab('jobs');
    } else if (actNum === 4) {
      setActiveTab('digital-twin');
    } else if (actNum === 5) {
      setActiveTab('workflows');
    } else if (actNum === 6) {
      setActiveTab('robots');
      setShowAdaptersModal(true); // Pop up Open Adapters Schema Modal
    } else if (actNum === 'reset') {
      setActiveTab('digital-twin');
      setSelectedRobotId(null);
      setShowAdaptersModal(false);
    }
  };

  const renderActivePage = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <OverviewPage 
            fleetState={fleetState} 
            onNavigateTwin={() => setActiveTab('digital-twin')} 
            onNavigateEvents={() => setActiveTab('events')}
          />
        );
      case 'digital-twin':
        return (
          <DigitalTwinPage 
            fleetState={fleetState} 
            topologyData={topologyData}
            selectedRobotId={selectedRobotId}
            setSelectedRobotId={setSelectedRobotId}
          />
        );
      case 'robots':
        return (
          <RobotsPage 
            fleetState={fleetState}
            showAdaptersModal={showAdaptersModal}
            onCloseAdaptersModal={() => setShowAdaptersModal(false)}
          />
        );
      case 'jobs':
        return <JobsPage fleetState={fleetState} />;
      case 'workflows':
        return <WorkflowsPage />;
      case 'intelligence':
        return <IntelligencePage />;
      case 'events':
        return <EventsPage fleetState={fleetState} />;
      default:
        return (
          <DigitalTwinPage 
            fleetState={fleetState} 
            topologyData={topologyData}
            selectedRobotId={selectedRobotId}
            setSelectedRobotId={setSelectedRobotId}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#090D16] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30">
      {/* Global Status Bar */}
      <Navbar 
        isConnected={isConnected} 
        fleetState={fleetState} 
        isPresentationMode={isPresentationMode}
        setIsPresentationMode={setIsPresentationMode}
      />

      {/* Main Layout Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Sidebar (Collapsible in Presentation Mode) */}
        {!isPresentationMode && (
          <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        )}

        {/* Dynamic Page View */}
        <main className="flex-1 overflow-y-auto relative">
          {renderActivePage()}
        </main>
      </div>

      {/* Floating Guided Demo Command Center */}
      <DemoController onActTriggered={handleActTriggered} />
    </div>
  );
}

export default App;

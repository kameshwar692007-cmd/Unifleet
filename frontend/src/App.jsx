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
  const [activeTab, setActiveTab] = useState('digital-twin'); // Hero feature default
  const [topologyData, setTopologyData] = useState(null);
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

  const renderActivePage = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewPage fleetState={fleetState} onNavigateTwin={() => setActiveTab('digital-twin')} />;
      case 'digital-twin':
        return <DigitalTwinPage fleetState={fleetState} topologyData={topologyData} />;
      case 'robots':
        return <RobotsPage fleetState={fleetState} />;
      case 'jobs':
        return <JobsPage fleetState={fleetState} />;
      case 'workflows':
        return <WorkflowsPage />;
      case 'intelligence':
        return <IntelligencePage />;
      case 'events':
        return <EventsPage fleetState={fleetState} />;
      default:
        return <DigitalTwinPage fleetState={fleetState} topologyData={topologyData} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-gray-100 flex flex-col font-sans">
      {/* Header */}
      <Navbar isConnected={isConnected} fleetState={fleetState} />

      {/* Main Layout Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Sidebar */}
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Dynamic Page View */}
        <main className="flex-1 overflow-y-auto relative">
          {renderActivePage()}
        </main>
      </div>

      {/* Floating Judge Demo Controller Panel */}
      <DemoController onActTriggered={() => setActiveTab('digital-twin')} />
    </div>
  );
}

export default App;

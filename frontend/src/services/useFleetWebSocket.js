import { useState, useEffect, useRef } from 'react';
import { api } from './api';

export function useFleetWebSocket() {
  const [fleetState, setFleetState] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef(null);

  const fetchFallbackState = async () => {
    try {
      const [robotsRes, jobsRes, eventsRes, alertsRes] = await Promise.all([
        api.getRobots(),
        api.getJobs(),
        api.getEvents(),
        api.getAlerts()
      ]);
      setFleetState(prev => ({
        ...prev,
        robots: robotsRes.data,
        jobs: jobsRes.data,
        event_logs: eventsRes.data,
        alerts: alertsRes.data,
        kpis: {
          total_robots: robotsRes.data.length,
          available: robotsRes.data.filter(r => r.status === 'AVAILABLE').length,
          moving: robotsRes.data.filter(r => r.status === 'MOVING').length,
          waiting: robotsRes.data.filter(r => r.status === 'WAITING').length,
          charging: robotsRes.data.filter(r => r.status === 'CHARGING').length,
          offline: robotsRes.data.filter(r => r.status === 'OFFLINE').length,
          predicted_conflicts_resolved: prev?.kpis?.predicted_conflicts_resolved || 0
        }
      }));
    } catch (e) {
      console.error("REST fallback error:", e);
    }
  };

  useEffect(() => {
    let reconnectTimer = null;
    let fallbackInterval = null;

    fetchFallbackState();

    const connectWS = () => {
      try {
        const ws = new WebSocket('ws://localhost:8000/ws');
        wsRef.current = ws;

        ws.onopen = () => {
          setIsConnected(true);
          if (fallbackInterval) clearInterval(fallbackInterval);
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'FLEET_STATE_UPDATE') {
              setFleetState(data);
            }
          } catch (err) {
            console.error('Failed to parse WebSocket frame:', err);
          }
        };

        ws.onclose = () => {
          setIsConnected(false);
          reconnectTimer = setTimeout(connectWS, 2000);
          if (!fallbackInterval) fallbackInterval = setInterval(fetchFallbackState, 1000);
        };

        ws.onerror = () => {
          setIsConnected(false);
          ws.close();
        };
      } catch (e) {
        setIsConnected(false);
        reconnectTimer = setTimeout(connectWS, 2000);
      }
    };

    connectWS();
    fallbackInterval = setInterval(fetchFallbackState, 1000);

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
      }
      if (fallbackInterval) {
        clearInterval(fallbackInterval);
      }
    };
  }, []);

  return { fleetState, isConnected };
}

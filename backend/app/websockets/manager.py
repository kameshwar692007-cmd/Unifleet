import asyncio
import json
import logging
from typing import List
from fastapi import WebSocket
from app.core.fleet_brain import fleet_brain
from app.core.harmony_engine import harmony_engine
from app.core.workflow_engine import workflow_engine
from app.core.intelligence import intelligence_engine
from app.core.topology import topology

logger = logging.getLogger("unifleet.websocket")

class WebSocketManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.is_broadcasting = False

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"WebSocket client connected. Total active connections: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            logger.info(f"WebSocket client disconnected. Remaining active connections: {len(self.active_connections)}")

    async def broadcast_state_loop(self):
        self.is_broadcasting = True
        while self.is_broadcasting:
            if self.active_connections:
                # Check route conflicts
                conflicts = harmony_engine.check_and_resolve_conflicts()

                # Evaluate low-battery workflow automation
                workflow_engine.evaluate_telemetry_workflows()

                # Prepare live telemetry state frame
                robots_data = [r.to_dict() for r in fleet_brain.robots.values()]
                jobs_data = list(fleet_brain.jobs.values())

                available_count = sum(1 for r in fleet_brain.robots.values() if r.status in ["AVAILABLE", "IDLE"])
                moving_count = sum(1 for r in fleet_brain.robots.values() if r.status == "MOVING")
                waiting_count = sum(1 for r in fleet_brain.robots.values() if r.status == "WAITING")
                charging_count = sum(1 for r in fleet_brain.robots.values() if r.status == "CHARGING")
                offline_count = sum(1 for r in fleet_brain.robots.values() if r.status == "OFFLINE")

                state_frame = {
                    "type": "FLEET_STATE_UPDATE",
                    "timestamp": asyncio.get_event_loop().time(),
                    "kpis": {
                        "total_robots": len(robots_data),
                        "available": available_count,
                        "moving": moving_count,
                        "waiting": waiting_count,
                        "charging": charging_count,
                        "offline": offline_count,
                        "active_jobs": sum(1 for j in jobs_data if j["status"] in ["QUEUED", "ASSIGNED", "IN_PROGRESS"]),
                        "completed_jobs": sum(1 for j in jobs_data if j["status"] == "COMPLETED"),
                        "predicted_conflicts_resolved": len(fleet_brain.conflict_records),
                        "active_alerts": len([a for a in fleet_brain.alerts if not a["acknowledged"]])
                    },
                    "robots": robots_data,
                    "jobs": jobs_data,
                    "event_logs": fleet_brain.event_logs[:15],
                    "alerts": fleet_brain.alerts[:10],
                    "active_conflicts": fleet_brain.conflict_records[:5],
                    "congestion": intelligence_engine.calculate_segment_congestion()
                }

                payload_str = json.dumps(state_frame)
                disconnected_sockets = []
                for connection in self.active_connections:
                    try:
                        await connection.send_text(payload_str)
                    except Exception:
                        disconnected_sockets.append(connection)

                for ds in disconnected_sockets:
                    self.disconnect(ds)

            await asyncio.sleep(0.25) # 250ms broadcast rate

ws_manager = WebSocketManager()

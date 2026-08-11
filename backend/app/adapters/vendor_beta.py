from typing import Dict, Any
from app.adapters.base import BaseRobotAdapter

class VendorBetaAdapter(BaseRobotAdapter):
    @property
    def vendor_name(self) -> str:
        return "Vendor Beta"

    def normalize_telemetry(self, raw_payload: Dict[str, Any]) -> Dict[str, Any]:
        if not isinstance(raw_payload, dict):
            raw_payload = {}

        robot_id = str(raw_payload.get("robotId", "R03"))
        
        try:
            soc = float(raw_payload.get("soc", 1.0))
            battery = soc * 100.0 if soc <= 1.0 else soc
        except (ValueError, TypeError):
            battery = 100.0
        battery = max(0.0, min(100.0, battery))

        coords = raw_payload.get("coordinates")
        x, y = 0.0, 0.0
        if isinstance(coords, dict):
            try:
                x = float(coords.get("x", 0.0))
                y = float(coords.get("y", 0.0))
            except (ValueError, TypeError):
                x, y = 0.0, 0.0

        raw_state = str(raw_payload.get("state", "AVAILABLE")).upper()
        state_map = {
            "AVAILABLE": "AVAILABLE",
            "IN_TRANSIT": "MOVING",
            "ASSIGNED": "ASSIGNED",
            "WAITING_SIGNAL": "WAITING",
            "HOLD": "PAUSED",
            "DOCK_CHARGING": "CHARGING",
            "CRITICAL_FAULT": "ERROR",
            "DISCONNECTED": "OFFLINE"
        }
        status = state_map.get(raw_state, "AVAILABLE")

        return {
            "robot_id": robot_id,
            "vendor": self.vendor_name,
            "battery": round(battery, 1),
            "status": status,
            "x": round(x, 2),
            "y": round(y, 2),
            "current_node": str(raw_payload.get("current_node", "N01")),
            "raw_payload": raw_payload
        }

    def format_command(self, robot_id: str, command_type: str, params: Dict[str, Any] = None) -> Dict[str, Any]:
        params = params or {}
        cmd_map = {
            "PAUSE": "SET_HOLD",
            "RESUME": "CLEAR_HOLD",
            "STOP": "EMERGENCY_STOP",
            "NAVIGATE": "DISPATCH_TASK"
        }
        return {
            "betaRobotId": robot_id,
            "actionCode": cmd_map.get(command_type, "IDLE"),
            "destinationNode": params.get("target_node"),
            "taskPriority": params.get("priority", 1)
        }

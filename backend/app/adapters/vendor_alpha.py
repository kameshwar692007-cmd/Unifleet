from typing import Dict, Any
from app.adapters.base import BaseRobotAdapter

class VendorAlphaAdapter(BaseRobotAdapter):
    @property
    def vendor_name(self) -> str:
        return "Vendor Alpha"

    def normalize_telemetry(self, raw_payload: Dict[str, Any]) -> Dict[str, Any]:
        if not isinstance(raw_payload, dict):
            raw_payload = {}

        unit_id = str(raw_payload.get("unit", "R01"))
        
        try:
            battery = float(raw_payload.get("battery_pct", 100.0))
        except (ValueError, TypeError):
            battery = 100.0
        battery = max(0.0, min(100.0, battery))

        pos = raw_payload.get("pos")
        x, y = 0.0, 0.0
        if isinstance(pos, list) and len(pos) >= 2:
            try:
                x = float(pos[0])
                y = float(pos[1])
            except (ValueError, TypeError):
                x, y = 0.0, 0.0

        raw_mode = str(raw_payload.get("mode", "ready")).lower()
        mode_map = {
            "ready": "AVAILABLE",
            "working": "MOVING",
            "paused": "PAUSED",
            "charging": "CHARGING",
            "error": "ERROR",
            "offline": "OFFLINE",
            "waiting": "WAITING"
        }
        status = mode_map.get(raw_mode, "AVAILABLE")

        return {
            "robot_id": unit_id,
            "vendor": self.vendor_name,
            "battery": round(battery, 1),
            "status": status,
            "x": round(x, 2),
            "y": round(y, 2),
            "current_node": str(raw_payload.get("waypoint", "N01")),
            "raw_payload": raw_payload
        }

    def format_command(self, robot_id: str, command_type: str, params: Dict[str, Any] = None) -> Dict[str, Any]:
        params = params or {}
        cmd_map = {
            "PAUSE": "pause_unit",
            "RESUME": "resume_unit",
            "STOP": "halt_unit",
            "NAVIGATE": "goto_waypoint"
        }
        return {
            "target_unit": robot_id,
            "alpha_cmd": cmd_map.get(command_type, "noop"),
            "target_waypoint": params.get("target_node"),
            "speed_override": params.get("speed", 1.0)
        }

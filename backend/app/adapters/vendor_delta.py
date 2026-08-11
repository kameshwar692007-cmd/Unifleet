from typing import Dict, Any
from app.adapters.base import BaseRobotAdapter

class VendorDeltaAdapter(BaseRobotAdapter):
    """
    Vendor Delta profile representation:
    Raw payload format:
    {
        "device_guid": "R06",
        "charge_percent": 88.5,
        "geo_point": [10.0, 5.5],
        "system_mode": "ACTIVE",
        "node_ref": "N11"
    }
    """
    @property
    def vendor_name(self) -> str:
        return "Vendor Delta"

    def normalize_telemetry(self, raw_payload: Dict[str, Any]) -> Dict[str, Any]:
        if not isinstance(raw_payload, dict):
            raw_payload = {}

        robot_id = str(raw_payload.get("device_guid") or raw_payload.get("robot_id", "R06"))
        
        try:
            battery = float(raw_payload.get("charge_percent", 100.0))
        except (ValueError, TypeError):
            battery = 100.0
        battery = max(0.0, min(100.0, battery))

        geo = raw_payload.get("geo_point")
        x, y = 0.0, 0.0
        if isinstance(geo, list) and len(geo) >= 2:
            try:
                x = float(geo[0])
                y = float(geo[1])
            except (ValueError, TypeError):
                x, y = 0.0, 0.0

        raw_mode = str(raw_payload.get("system_mode", "ACTIVE")).upper()
        mode_map = {
            "ACTIVE": "MOVING",
            "STANDBY": "AVAILABLE",
            "HOLD": "PAUSED",
            "WAITING_JUNCTION": "WAITING",
            "RECHARGING": "CHARGING",
            "FAULT": "ERROR",
            "DISCONNECTED": "OFFLINE"
        }
        status = mode_map.get(raw_mode, "AVAILABLE")

        return {
            "robot_id": robot_id,
            "vendor": self.vendor_name,
            "battery": round(battery, 1),
            "status": status,
            "x": round(x, 2),
            "y": round(y, 2),
            "current_node": str(raw_payload.get("node_ref", "N01")),
            "raw_payload": raw_payload
        }

    def format_command(self, robot_id: str, command_type: str, params: Dict[str, Any] = None) -> Dict[str, Any]:
        params = params or {}
        cmd_map = {
            "PAUSE": "HOLD_POSITION",
            "RESUME": "RESUME_MISSION",
            "STOP": "HALT_NOW",
            "NAVIGATE": "GOTO_WAYPOINT"
        }
        return {
            "guid": robot_id,
            "delta_action": cmd_map.get(command_type, "NOOP"),
            "target_node": params.get("target_node"),
            "priority": params.get("priority", 1)
        }

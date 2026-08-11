from typing import Dict, Any
from app.adapters.base import BaseRobotAdapter

class VendorGammaAdapter(BaseRobotAdapter):
    @property
    def vendor_name(self) -> str:
        return "Vendor Gamma"

    def normalize_telemetry(self, raw_payload: Dict[str, Any]) -> Dict[str, Any]:
        dev_id = str(raw_payload.get("dev_id", "R04"))
        battery = float(raw_payload.get("b_lvl", 100.0))

        loc = raw_payload.get("location", {})
        x = float(loc.get("px", 0.0))
        y = float(loc.get("py", 0.0))
        node_id = loc.get("node_id", "N01")

        op_state = str(raw_payload.get("op_state", "IDLE")).upper()
        state_map = {
            "IDLE": "AVAILABLE",
            "MOVING": "MOVING",
            "WAITING": "WAITING",
            "PAUSED": "PAUSED",
            "CHARGING": "CHARGING",
            "FAULT": "ERROR",
            "OFFLINE": "OFFLINE"
        }
        status = state_map.get(op_state, "AVAILABLE")

        return {
            "robot_id": dev_id,
            "vendor": self.vendor_name,
            "battery": round(battery, 1),
            "status": status,
            "x": round(x, 2),
            "y": round(y, 2),
            "current_node": node_id,
            "raw_payload": raw_payload
        }

    def format_command(self, robot_id: str, command_type: str, params: Dict[str, Any] = None) -> Dict[str, Any]:
        params = params or {}
        cmd_map = {
            "PAUSE": 0x10,
            "RESUME": 0x11,
            "STOP": 0xFF,
            "NAVIGATE": 0x20
        }
        return {
            "gamma_device_id": robot_id,
            "opcode": cmd_map.get(command_type, 0x00),
            "payload": {
                "dest": params.get("target_node"),
                "speed_mps": params.get("speed", 1.2)
            }
        }

import math
from typing import Dict, Any, List, Optional
from app.core.topology import topology

class SimulatedRobot:
    def __init__(self, robot_id: str, vendor: str, model_type: str, start_node: str = "N01"):
        self.robot_id = robot_id
        self.vendor = vendor
        self.model_type = model_type
        self.current_node = start_node
        self.target_node: Optional[str] = None
        self.route: List[str] = []

        node_obj = topology.get_node(start_node)
        self.x = node_obj.x if node_obj else 0.0
        self.y = node_obj.y if node_obj else 0.0

        self.battery = 100.0
        self.status = "AVAILABLE" # AVAILABLE, ASSIGNED, MOVING, WAITING, PAUSED, CHARGING, ERROR, OFFLINE
        self.speed = 1.0 # m/s
        self.current_job_id: Optional[str] = None
        self.is_manual_paused = False
        self.marked_unavailable = False

    def set_route(self, route_nodes: List[str], job_id: Optional[str] = None):
        self.route = list(route_nodes)
        self.current_job_id = job_id
        if self.route:
            if self.route[0] == self.current_node and len(self.route) > 1:
                self.route.pop(0)
            if self.route:
                self.target_node = self.route[0]
                if not self.is_manual_paused and self.status != "CHARGING":
                    self.status = "MOVING"

    def tick(self, dt_seconds: float):
        if self.status == "OFFLINE":
            return

        if self.status == "CHARGING":
            self.battery = min(100.0, self.battery + 2.0 * dt_seconds)
            if self.battery >= 98.0:
                self.battery = 100.0
                self.status = "AVAILABLE"
                self.marked_unavailable = False
            return

        if self.is_manual_paused or self.status in ["PAUSED", "WAITING"]:
            return

        if self.status == "MOVING" and self.target_node:
            target_obj = topology.get_node(self.target_node)
            if not target_obj:
                return

            dx = target_obj.x - self.x
            dy = target_obj.y - self.y
            dist = math.hypot(dx, dy)

            move_dist = self.speed * dt_seconds
            if dist <= move_dist or dist < 0.1:
                # Arrived at waypoint
                self.x = target_obj.x
                self.y = target_obj.y
                self.current_node = self.target_node

                if self.route and self.route[0] == self.target_node:
                    self.route.pop(0)

                if self.route:
                    self.target_node = self.route[0]
                else:
                    self.target_node = None
                    self.status = "AVAILABLE" if not self.marked_unavailable else "UNAVAILABLE"
            else:
                # Move towards target
                self.x += (dx / dist) * move_dist
                self.y += (dy / dist) * move_dist

            # Drain battery slightly
            self.battery = max(0.0, self.battery - 0.05 * dt_seconds)

    def to_vendor_payload(self) -> Dict[str, Any]:
        """
        Generates raw vendor payload matching each vendor's specs.
        """
        if self.vendor == "Vendor Alpha":
            mode_map = {
                "AVAILABLE": "ready",
                "MOVING": "working",
                "PAUSED": "paused",
                "WAITING": "waiting",
                "CHARGING": "charging",
                "ERROR": "error",
                "OFFLINE": "offline"
            }
            return {
                "unit": self.robot_id,
                "battery_pct": round(self.battery, 1),
                "pos": [round(self.x, 2), round(self.y, 2)],
                "mode": mode_map.get(self.status, "ready"),
                "waypoint": self.current_node,
                "current_job": self.current_job_id
            }
        elif self.vendor == "Vendor Beta":
            state_map = {
                "AVAILABLE": "AVAILABLE",
                "MOVING": "IN_TRANSIT",
                "PAUSED": "HOLD",
                "WAITING": "WAITING_SIGNAL",
                "CHARGING": "DOCK_CHARGING",
                "ERROR": "CRITICAL_FAULT",
                "OFFLINE": "DISCONNECTED"
            }
            return {
                "robotId": self.robot_id,
                "soc": round(self.battery / 100.0, 2),
                "coordinates": {"x": round(self.x, 2), "y": round(self.y, 2)},
                "state": state_map.get(self.status, "AVAILABLE"),
                "current_node": self.current_node,
                "active_job": self.current_job_id
            }
        else: # Vendor Gamma
            op_map = {
                "AVAILABLE": "IDLE",
                "MOVING": "MOVING",
                "PAUSED": "PAUSED",
                "WAITING": "WAITING",
                "CHARGING": "CHARGING",
                "ERROR": "FAULT",
                "OFFLINE": "OFFLINE"
            }
            return {
                "dev_id": self.robot_id,
                "b_lvl": round(self.battery, 1),
                "location": {
                    "node_id": self.current_node,
                    "px": round(self.x, 2),
                    "py": round(self.y, 2)
                },
                "status_code": 200,
                "op_state": op_map.get(self.status, "IDLE"),
                "job_ref": self.current_job_id
            }

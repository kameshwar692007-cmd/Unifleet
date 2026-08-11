import asyncio
import logging
import math
from typing import Dict, List, Any, Optional
from datetime import datetime, timezone
from app.core.topology import topology
from app.core.router import router
from app.mqtt.client import mqtt_manager

logger = logging.getLogger("unifleet.fleet_brain")

class RobotState:
    def __init__(self, robot_id: str, vendor: str, model_type: str, start_node: str = "N01"):
        self.robot_id = robot_id
        self.vendor = vendor
        self.model_type = model_type
        self.start_node = start_node
        self.battery = 100.0
        self.status = "AVAILABLE"
        node_obj = topology.get_node(start_node)
        self.x = node_obj.x if node_obj else 0.0
        self.y = node_obj.y if node_obj else 0.0
        self.current_node = start_node
        self.target_node: Optional[str] = None
        self.current_job_id: Optional[str] = None
        self.route: List[str] = []
        self.marked_unavailable = False
        self.last_seen = datetime.now(timezone.utc)

    def reset(self):
        self.battery = 100.0
        self.status = "AVAILABLE"
        node_obj = topology.get_node(self.start_node)
        self.x = node_obj.x if node_obj else 0.0
        self.y = node_obj.y if node_obj else 0.0
        self.current_node = self.start_node
        self.target_node = None
        self.current_job_id = None
        self.route = []
        self.marked_unavailable = False
        self.last_seen = datetime.now(timezone.utc)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.robot_id,
            "vendor": self.vendor,
            "model_type": self.model_type,
            "battery": round(self.battery, 1),
            "status": self.status,
            "x": round(self.x, 2),
            "y": round(self.y, 2),
            "current_node": self.current_node,
            "target_node": self.target_node,
            "current_job_id": self.current_job_id,
            "route": self.route,
            "marked_unavailable": self.marked_unavailable,
            "last_seen": self.last_seen.isoformat()
        }

class FleetBrain:
    def __init__(self):
        self.robots: Dict[str, RobotState] = {
            "R01": RobotState("R01", "Vendor Alpha", "Heavy Lifter AGV", start_node="N01"),
            "R02": RobotState("R02", "Vendor Alpha", "Heavy Lifter AGV", start_node="N02"),
            "R03": RobotState("R03", "Vendor Beta", "AGV Picker Unit", start_node="N03"),
            "R04": RobotState("R04", "Vendor Gamma", "AMR Tugger", start_node="N04"),
            "R05": RobotState("R05", "Vendor Gamma", "AMR Tugger", start_node="N05")
        }
        self.jobs: Dict[str, Dict[str, Any]] = {}
        self.event_logs: List[Dict[str, Any]] = []
        self.alerts: List[Dict[str, Any]] = []
        self.conflict_records: List[Dict[str, Any]] = []

    def reset_fleet(self):
        for robot in self.robots.values():
            robot.reset()
        self.jobs.clear()
        self.event_logs.clear()
        self.alerts.clear()
        self.conflict_records.clear()
        self.log_event("system.reset", "INFO", "Fleet Brain state reset to default judge state.")

    def update_normalized_telemetry(self, data: Dict[str, Any]):
        r_id = data.get("robot_id")
        if not r_id or r_id not in self.robots:
            return

        robot = self.robots[r_id]
        robot.battery = data.get("battery", robot.battery)
        robot.status = data.get("status", robot.status)
        robot.x = data.get("x", robot.x)
        robot.y = data.get("y", robot.y)
        robot.current_node = data.get("current_node", robot.current_node)
        robot.last_seen = datetime.now(timezone.utc)

        # Check job completion
        if robot.current_job_id and robot.current_job_id in self.jobs:
            job = self.jobs[robot.current_job_id]
            if robot.current_node == job["target_node"] and (not robot.route or len(robot.route) <= 1):
                job["status"] = "COMPLETED"
                job["completed_at"] = datetime.now(timezone.utc).isoformat()
                robot.current_job_id = None
                robot.target_node = None
                robot.route = []
                self.log_event("job.completed", "SUCCESS", f"Job {job['id']} completed by robot {robot.robot_id}", {"job_id": job["id"], "robot_id": robot.robot_id})

    def log_event(self, event_type: str, severity: str, message: str, details: Optional[Dict[str, Any]] = None, robot_id: Optional[str] = None):
        event = {
            "id": len(self.event_logs) + 1,
            "event_type": event_type,
            "severity": severity,
            "robot_id": robot_id,
            "message": message,
            "details": details or {},
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        self.event_logs.insert(0, event)
        if len(self.event_logs) > 200:
            self.event_logs.pop()

    def add_alert(self, title: str, severity: str, message: str, robot_id: Optional[str] = None) -> Dict[str, Any]:
        alert = {
            "id": f"ALT-{len(self.alerts)+1:04d}",
            "title": title,
            "severity": severity,
            "robot_id": robot_id,
            "message": message,
            "acknowledged": False,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        self.alerts.insert(0, alert)
        return alert

    def evaluate_explainable_scheduling(self, source_node: str, target_node: str) -> Dict[str, Any]:
        source_obj = topology.get_node(source_node)
        target_obj = topology.get_node(target_node)
        if not source_obj or not target_obj:
            return {"error": "Invalid source or target node"}

        candidates = []
        best_robot = None
        best_score = -float("inf")

        for r_id, robot in self.robots.items():
            if robot.status == "OFFLINE":
                candidates.append({
                    "robot_id": r_id,
                    "eligible": False,
                    "reason": "Robot is OFFLINE",
                    "score": 0
                })
                continue
            if robot.status == "CHARGING":
                candidates.append({
                    "robot_id": r_id,
                    "eligible": False,
                    "reason": "Robot is currently CHARGING",
                    "score": 0
                })
                continue
            if robot.marked_unavailable or robot.battery < 15.0:
                candidates.append({
                    "robot_id": r_id,
                    "eligible": False,
                    "reason": f"Low battery ({robot.battery:.1f}%) or marked unavailable",
                    "score": 0
                })
                continue
            if robot.current_job_id and robot.status not in ["AVAILABLE", "IDLE"]:
                candidates.append({
                    "robot_id": r_id,
                    "eligible": False,
                    "reason": f"Currently executing active job {robot.current_job_id}",
                    "score": 0
                })
                continue

            # Calculate metrics
            dist_to_source = math.hypot(robot.x - source_obj.x, robot.y - source_obj.y)
            dist_score = max(0.0, 100.0 - (dist_to_source * 5.0))
            battery_score = robot.battery
            capability_score = 100.0

            composite_score = round(dist_score * 0.4 + battery_score * 0.4 + capability_score * 0.2, 1)

            candidate_info = {
                "robot_id": r_id,
                "vendor": robot.vendor,
                "model_type": robot.model_type,
                "eligible": True,
                "distance_to_pickup_m": round(dist_to_source, 2),
                "battery_pct": round(robot.battery, 1),
                "composite_score": composite_score,
                "breakdown": {
                    "distance_score": round(dist_score, 1),
                    "battery_score": round(battery_score, 1),
                    "capability_score": capability_score
                }
            }
            candidates.append(candidate_info)

            if composite_score > best_score:
                best_score = composite_score
                best_robot = r_id

        return {
            "source_node": source_node,
            "target_node": target_node,
            "winning_robot_id": best_robot,
            "winning_score": best_score if best_robot else 0,
            "candidates": candidates,
            "decision_summary": f"Selected {best_robot} with top composite score of {best_score}" if best_robot else "No eligible robots available"
        }

    def create_job(self, source_node: str, target_node: str, priority: int = 1, requested_robot_id: Optional[str] = None) -> Dict[str, Any]:
        job_id = f"JOB-{len(self.jobs)+1:04d}"

        explainability = self.evaluate_explainable_scheduling(source_node, target_node)
        assigned_robot_id = requested_robot_id or explainability.get("winning_robot_id")

        job = {
            "id": job_id,
            "job_type": "TRANSPORT",
            "source_node": source_node,
            "target_node": target_node,
            "priority": priority,
            "status": "ASSIGNED" if assigned_robot_id else "QUEUED",
            "assigned_robot_id": assigned_robot_id,
            "scheduling_reason": explainability,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "started_at": datetime.now(timezone.utc).isoformat() if assigned_robot_id else None,
            "completed_at": None
        }

        self.jobs[job_id] = job

        if assigned_robot_id and assigned_robot_id in self.robots:
            robot = self.robots[assigned_robot_id]
            robot.current_job_id = job_id
            robot.status = "ASSIGNED"

            # Calculate route: current_node -> source_node -> target_node
            path1 = router.find_path(robot.current_node, source_node)
            path2 = router.find_path(source_node, target_node)
            full_route = path1 + (path2[1:] if path2 and path1 else path2)

            robot.route = full_route
            if len(full_route) > 1:
                robot.target_node = full_route[1]
            elif full_route:
                robot.target_node = full_route[0]
            else:
                robot.target_node = target_node

            # Send command to simulator via MQTT
            mqtt_manager.publish_command(assigned_robot_id, "ASSIGN_ROUTE", {
                "route": full_route,
                "job_id": job_id
            })

            self.log_event("job.created", "INFO", f"Job {job_id} assigned to {assigned_robot_id} ({source_node} -> {target_node})", job, robot_id=assigned_robot_id)

        return job

    def issue_manual_command(self, robot_id: str, command: str) -> Dict[str, Any]:
        if robot_id not in self.robots:
            return {"success": False, "error": "Robot not found"}

        robot = self.robots[robot_id]
        if command == "PAUSE":
            robot.status = "PAUSED"
            mqtt_manager.publish_command(robot_id, "PAUSE")
            self.log_event("robot.command", "WARNING", f"Operator issued PAUSE to robot {robot_id}", robot_id=robot_id)
        elif command == "RESUME":
            robot.status = "MOVING" if robot.route else "AVAILABLE"
            mqtt_manager.publish_command(robot_id, "RESUME")
            self.log_event("robot.command", "INFO", f"Operator issued RESUME to robot {robot_id}", robot_id=robot_id)
        elif command == "STOP":
            robot.status = "AVAILABLE"
            robot.route = []
            robot.target_node = None
            robot.current_job_id = None
            mqtt_manager.publish_command(robot_id, "STOP")
            self.log_event("robot.command", "WARNING", f"Operator issued STOP to robot {robot_id}", robot_id=robot_id)

        return {"success": True, "robot": robot.to_dict()}

fleet_brain = FleetBrain()
mqtt_manager.register_telemetry_callback(fleet_brain.update_normalized_telemetry)

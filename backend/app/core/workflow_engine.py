import logging
from typing import Dict, List, Any
from datetime import datetime, timezone
from app.core.fleet_brain import fleet_brain
from app.mqtt.client import mqtt_manager

logger = logging.getLogger("unifleet.workflow_engine")

class WorkflowEngine:
    def __init__(self):
        self.rules = [
            {
                "id": "WF-001",
                "name": "Low Battery Charging Automation",
                "trigger_event": "TELEMETRY_UPDATE",
                "condition": {"type": "BATTERY_LESS_THAN", "threshold": 20.0},
                "action": "MARK_UNAVAILABLE_AND_CHARGE",
                "is_active": True,
                "executions_count": 0
            },
            {
                "id": "WF-002",
                "name": "Route Conflict Automatic Priority Hold",
                "trigger_event": "CONFLICT_PREDICTED",
                "condition": {"type": "ALWAYS_TRUE"},
                "action": "HALT_SECONDARY_AGV",
                "is_active": True,
                "executions_count": 0
            },
            {
                "id": "WF-003",
                "name": "Robot Offline Work Re-queueing",
                "trigger_event": "TELEMETRY_UPDATE",
                "condition": {"type": "STATUS_OFFLINE"},
                "action": "REQUEUE_ACTIVE_JOB",
                "is_active": True,
                "executions_count": 0
            }
        ]
        self.execution_logs: List[Dict[str, Any]] = []

    def evaluate_telemetry_workflows(self):
        for r_id, robot in fleet_brain.robots.items():
            # WF-001 Low Battery
            if robot.battery < 20.0 and robot.status != "CHARGING" and not robot.marked_unavailable:
                robot.marked_unavailable = True
                self.rules[0]["executions_count"] += 1

                # Select closest charger node
                charging_node = "N08" if robot.x < 5.0 else "N09"
                robot.status = "CHARGING"

                # Send command to simulator
                mqtt_manager.publish_command(r_id, "START_CHARGING", {"charging_node": charging_node})

                # Create alert & log event
                alert = fleet_brain.add_alert(
                    "Low Battery Automation Triggered",
                    "WARNING",
                    f"Robot {r_id} battery fell below 20.0% ({robot.battery:.1f}%). Marked unavailable and routed to {charging_node} for fast charging.",
                    robot_id=r_id
                )

                exec_log = {
                    "rule_id": "WF-001",
                    "rule_name": "Low Battery Charging Automation",
                    "robot_id": r_id,
                    "action_taken": f"Marked unavailable & dispatched to charger {charging_node}",
                    "timestamp": datetime.now(timezone.utc).isoformat()
                }
                self.execution_logs.insert(0, exec_log)
                if len(self.execution_logs) > 50:
                    self.execution_logs.pop()

                fleet_brain.log_event("workflow.executed", "INFO", f"Zero-Code Workflow WF-001 executed for robot {r_id}", exec_log, robot_id=r_id)

    def trigger_workflow_by_event(self, trigger_name: str, payload: Dict[str, Any]):
        for rule in self.rules:
            if rule["is_active"] and rule["trigger_event"] == trigger_name:
                rule["executions_count"] += 1
                exec_log = {
                    "rule_id": rule["id"],
                    "rule_name": rule["name"],
                    "trigger": trigger_name,
                    "action_taken": f"Executed action: {rule['action']}",
                    "payload": payload,
                    "timestamp": datetime.now(timezone.utc).isoformat()
                }
                self.execution_logs.insert(0, exec_log)
                fleet_brain.log_event("workflow.executed", "INFO", f"Workflow {rule['name']} executed", exec_log)

workflow_engine = WorkflowEngine()

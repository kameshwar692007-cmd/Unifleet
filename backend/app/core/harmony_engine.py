import logging
import asyncio
from typing import Dict, List, Any, Optional
from datetime import datetime, timezone
from app.core.fleet_brain import fleet_brain
from app.mqtt.client import mqtt_manager

logger = logging.getLogger("unifleet.harmony_engine")

class HarmonyEngine:
    def __init__(self):
        self.active_conflicts: List[Dict[str, Any]] = []

    def release_cleared_conflicts(self):
        """
        Monitors active waiting holds and automatically resumes secondary AGVs once
        the primary priority AGV has cleared the conflict junction.
        """
        remaining_conflicts = []
        for conflict in list(self.active_conflicts):
            primary_id = conflict.get("primary_robot_id")
            secondary_id = conflict.get("secondary_robot_id")
            conflict_node = conflict.get("node_id")

            primary_robot = fleet_brain.robots.get(primary_id)
            secondary_robot = fleet_brain.robots.get(secondary_id)

            if not primary_robot or not secondary_robot:
                continue

            # Check if primary robot has passed the conflict node
            primary_upcoming = primary_robot.route[:2] if primary_robot.route else []
            has_passed = (primary_robot.current_node != conflict_node) and (conflict_node not in primary_upcoming)

            if has_passed:
                if secondary_robot.status == "WAITING":
                    secondary_robot.status = "MOVING" if secondary_robot.route else "AVAILABLE"
                    mqtt_manager.publish_command(secondary_id, "RESUME")
                    fleet_brain.log_event(
                        "route.conflict.cleared",
                        "INFO",
                        f"Priority AGV {primary_id} cleared junction {conflict_node}. AGV {secondary_id} RESUMED.",
                        {"conflict_id": conflict["id"], "secondary_robot_id": secondary_id}
                    )
            else:
                remaining_conflicts.append(conflict)

        self.active_conflicts = remaining_conflicts

    def check_and_resolve_conflicts(self) -> List[Dict[str, Any]]:
        self.release_cleared_conflicts()
        detected_conflicts = []
        robots_with_routes = [r for r in fleet_brain.robots.values() if r.route and len(r.route) > 1 and r.status in ["MOVING", "ASSIGNED"]]

        # Compare pairs of active robots
        for i in range(len(robots_with_routes)):
            for j in range(i + 1, len(robots_with_routes)):
                r1 = robots_with_routes[i]
                r2 = robots_with_routes[j]

                # Find node overlap in upcoming 3 steps
                r1_steps = r1.route[:4]
                r2_steps = r2.route[:4]

                common_nodes = set(r1_steps).intersection(set(r2_steps))
                if common_nodes:
                    conflict_node = list(common_nodes)[0]

                    idx1 = r1_steps.index(conflict_node)
                    idx2 = r2_steps.index(conflict_node)

                    # Check if time step proximity creates conflict
                    if abs(idx1 - idx2) <= 1:
                        conflict_id = f"CONF-{r1.robot_id}-{r2.robot_id}-{conflict_node}"

                        # Determine priority (e.g. lower robot ID or higher battery)
                        primary_robot = r1 if r1.robot_id < r2.robot_id else r2
                        secondary_robot = r2 if r1.robot_id < r2.robot_id else r1

                        resolution_type = "PRIORITY_WAIT"

                        if secondary_robot.status != "WAITING":
                            secondary_robot.status = "WAITING"
                            mqtt_manager.publish_command(secondary_robot.robot_id, "PAUSE")

                            resolution_desc = f"Robot {primary_robot.robot_id} granted priority passage. Robot {secondary_robot.robot_id} instructed to WAIT at waypoint."

                            conflict_event = {
                                "id": conflict_id,
                                "node_id": conflict_node,
                                "primary_robot_id": primary_robot.robot_id,
                                "secondary_robot_id": secondary_robot.robot_id,
                                "time_step": min(idx1, idx2),
                                "status": "RESOLVED",
                                "resolution_type": resolution_type,
                                "resolution_desc": resolution_desc,
                                "timestamp": datetime.now(timezone.utc).isoformat()
                            }

                            fleet_brain.log_event(
                                "route.conflict.predicted",
                                "WARNING",
                                f"Predicted conflict at junction {conflict_node} between {r1.robot_id} and {r2.robot_id}. Resolved via {resolution_type}.",
                                conflict_event
                            )

                            fleet_brain.conflict_records.insert(0, conflict_event)
                            if len(fleet_brain.conflict_records) > 50:
                                fleet_brain.conflict_records.pop()

                            self.active_conflicts.append(conflict_event)
                            detected_conflicts.append(conflict_event)

        return detected_conflicts

harmony_engine = HarmonyEngine()

import logging
from typing import Dict, List, Any
from app.core.topology import topology
from app.core.router import router
from app.core.fleet_brain import fleet_brain

logger = logging.getLogger("unifleet.intelligence")

class AIFleetIntelligence:
    def calculate_segment_congestion(self) -> Dict[str, Any]:
        """
        Calculates active route density per warehouse edge to produce live congestion heatmaps.
        """
        edge_counts: Dict[str, int] = {}
        total_active_routes = 0

        for edge in topology.edges:
            key = f"{min(edge.u, edge.v)}-{max(edge.u, edge.v)}"
            edge_counts[key] = 0

        for robot in fleet_brain.robots.values():
            if robot.route and len(robot.route) > 1:
                total_active_routes += 1
                for k in range(len(robot.route) - 1):
                    u, v = robot.route[k], robot.route[k+1]
                    key = f"{min(u, v)}-{max(u, v)}"
                    if key in edge_counts:
                        edge_counts[key] += 1

        congestion_details = []
        for edge in topology.edges:
            key = f"{min(edge.u, edge.v)}-{max(edge.u, edge.v)}"
            cnt = edge_counts.get(key, 0)

            # Constrained junction penalty multiplier
            multiplier = 2.0 if edge.is_constrained else 1.0
            score = round(min(1.0, (cnt * 0.4) * multiplier), 2)

            level = "LOW"
            if score >= 0.7:
                level = "HIGH"
            elif score >= 0.3:
                level = "MEDIUM"

            congestion_details.append({
                "edge": key,
                "u": edge.u,
                "v": edge.v,
                "distance": edge.distance,
                "is_constrained": edge.is_constrained,
                "active_robots_count": cnt,
                "congestion_score": score,
                "congestion_level": level
            })

        return {
            "total_active_routes": total_active_routes,
            "segments": congestion_details
        }

    def compare_predictive_routes(self, source_node: str, target_node: str) -> Dict[str, Any]:
        """
        Compares primary direct route vs alternative bypass route based on distance & congestion delay.
        """
        path1 = router.find_path(source_node, target_node)

        # Route A (Direct) metrics
        dist_a = 0.0
        for i in range(len(path1) - 1):
            n1 = topology.get_node(path1[i])
            n2 = topology.get_node(path1[i+1])
            if n1 and n2:
                dist_a += ((n1.x - n2.x)**2 + (n1.y - n2.y)**2)**0.5

        has_constrained_a = any(n in ["N11"] for n in path1)
        delay_a = 7.5 if has_constrained_a else 1.2
        cost_a = round(dist_a + delay_a * 1.5, 1)

        # Route B (Alternative bypass avoiding N11)
        penalties = {"N11": 15.0}
        path2 = router.find_path(source_node, target_node, node_penalties=penalties)

        dist_b = 0.0
        for i in range(len(path2) - 1):
            n1 = topology.get_node(path2[i])
            n2 = topology.get_node(path2[i+1])
            if n1 and n2:
                dist_b += ((n1.x - n2.x)**2 + (n1.y - n2.y)**2)**0.5

        delay_b = 0.8
        cost_b = round(dist_b + delay_b * 1.5, 1)

        recommended = "Route B (Bypass)" if cost_b < cost_a else "Route A (Direct)"

        return {
            "source_node": source_node,
            "target_node": target_node,
            "route_a": {
                "name": "Direct Primary Route",
                "path": path1,
                "distance_m": round(dist_a, 1),
                "congestion": "HIGH" if has_constrained_a else "LOW",
                "expected_delay_s": delay_a,
                "total_cost_score": cost_a
            },
            "route_b": {
                "name": "Bypass Alternate Route",
                "path": path2,
                "distance_m": round(dist_b, 1),
                "congestion": "LOW",
                "expected_delay_s": delay_b,
                "total_cost_score": cost_b
            },
            "recommended_choice": recommended,
            "ai_insight": f"Selected {recommended} as optimal choice. It reduces estimated delay by {abs(delay_a - delay_b):.1f}s despite a distance difference of {abs(dist_a - dist_b):.1f}m."
        }

intelligence_engine = AIFleetIntelligence()

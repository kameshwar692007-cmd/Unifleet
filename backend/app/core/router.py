import heapq
import math
from typing import List, Dict, Tuple, Optional
from app.core.topology import topology

class AStarRouter:
    @staticmethod
    def heuristic(a_id: str, b_id: str) -> float:
        node_a = topology.get_node(a_id)
        node_b = topology.get_node(b_id)
        if not node_a or not node_b:
            return 0.0
        return math.hypot(node_a.x - node_b.x, node_a.y - node_b.y)

    @classmethod
    def find_path(cls, start_node: str, target_node: str, node_penalties: Optional[Dict[str, float]] = None) -> List[str]:
        if start_node == target_node:
            return [start_node]

        if not topology.get_node(start_node) or not topology.get_node(target_node):
            return []

        penalties = node_penalties or {}

        # Priority queue storing (f_score, current_node)
        open_set: List[Tuple[float, str]] = []
        heapq.heappush(open_set, (0.0, start_node))

        came_from: Dict[str, str] = {}
        g_score: Dict[str, float] = {node_id: float("inf") for node_id in topology.nodes}
        g_score[start_node] = 0.0

        f_score: Dict[str, float] = {node_id: float("inf") for node_id in topology.nodes}
        f_score[start_node] = cls.heuristic(start_node, target_node)

        while open_set:
            _, current = heapq.heappop(open_set)

            if current == target_node:
                # Reconstruct path
                path = [current]
                while current in came_from:
                    current = came_from[current]
                    path.append(current)
                path.reverse()
                return path

            for neighbor_info in topology.adj.get(current, []):
                neighbor = neighbor_info["node"]
                dist = neighbor_info["distance"]
                extra_penalty = penalties.get(neighbor, 0.0)

                tentative_g = g_score[current] + dist + extra_penalty

                if tentative_g < g_score[neighbor]:
                    came_from[neighbor] = current
                    g_score[neighbor] = tentative_g
                    f_score[neighbor] = tentative_g + cls.heuristic(neighbor, target_node)
                    heapq.heappush(open_set, (f_score[neighbor], neighbor))

        return []

router = AStarRouter()

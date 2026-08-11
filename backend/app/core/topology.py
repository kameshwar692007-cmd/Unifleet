import math
from typing import Dict, List, Any, Optional

class Node:
    def __init__(self, node_id: str, name: str, zone: str, x: float, y: float, is_charging: bool = False, is_constrained: bool = False):
        self.node_id = node_id
        self.name = name
        self.zone = zone
        self.x = x
        self.y = y
        self.is_charging = is_charging
        self.is_constrained = is_constrained

    @property
    def id(self) -> str:
        return self.node_id

    def to_dict(self) -> Dict[str, Any]:
        return {
            "node_id": self.node_id,
            "id": self.node_id,
            "name": self.name,
            "zone": self.zone,
            "x": self.x,
            "y": self.y,
            "is_charging": self.is_charging,
            "is_constrained": self.is_constrained
        }

class Edge:
    def __init__(self, u: str, v: str, distance: float, is_bidirectional: bool = True, is_constrained: bool = False):
        self.u = u
        self.v = v
        self.distance = distance
        self.is_bidirectional = is_bidirectional
        self.is_constrained = is_constrained

    def to_dict(self) -> Dict[str, Any]:
        return {
            "u": self.u,
            "v": self.v,
            "distance": self.distance,
            "is_bidirectional": self.is_bidirectional,
            "is_constrained": self.is_constrained
        }

class WarehouseTopology:
    def __init__(self):
        self.nodes: Dict[str, Node] = {}
        self.edges: List[Edge] = []
        self.adj: Dict[str, List[Dict[str, Any]]] = {}
        self._build_authoritative_warehouse()

    def _build_authoritative_warehouse(self):
        node_list = [
            Node("N01", "Receiving Dock", "Receiving", 2.0, 3.0),
            Node("N02", "Storage Rack A", "Storage", 6.0, 3.0),
            Node("N03", "Storage Rack B", "Storage", 10.0, 3.0),
            Node("N04", "Picking Hub", "Picking", 14.0, 3.0),
            Node("N05", "Packing Line 1", "Packing", 6.0, 8.0),
            Node("N06", "Packing Line 2", "Packing", 10.0, 8.0),
            Node("N07", "Dispatch Dock", "Dispatch", 14.0, 8.0),
            Node("N08", "Fast Charger Alpha", "Charging", 2.0, 12.0, is_charging=True),
            Node("N09", "Fast Charger Beta", "Charging", 6.0, 12.0, is_charging=True),
            Node("N10", "West Transit Node", "Transit", 2.0, 8.0),
            Node("N11", "Central Junction", "Constrained", 10.0, 5.5, is_constrained=True),
            Node("N12", "East Bypass Node", "Transit", 14.0, 5.5)
        ]

        for n in node_list:
            self.nodes[n.node_id] = n
            self.adj[n.node_id] = []

        connections = [
            ("N01", "N02"),
            ("N02", "N03"),
            ("N03", "N04"),
            ("N01", "N10"),
            ("N02", "N05"),
            ("N03", "N11", True),
            ("N04", "N12"),
            ("N05", "N06"),
            ("N06", "N07"),
            ("N05", "N11", True),
            ("N06", "N11", True),
            ("N07", "N12"),
            ("N10", "N05"),
            ("N10", "N08"),
            ("N05", "N09"),
            ("N11", "N06", True),
            ("N11", "N12", True)
        ]

        for item in connections:
            u, v = item[0], item[1]
            is_constrained = item[2] if len(item) > 2 else False
            n_u, n_v = self.nodes[u], self.nodes[v]
            dist = math.hypot(n_u.x - n_v.x, n_u.y - n_v.y)
            edge = Edge(u, v, round(dist, 2), is_bidirectional=True, is_constrained=is_constrained)
            self.edges.append(edge)
            self.adj[u].append({"node": v, "distance": dist, "is_constrained": is_constrained})
            self.adj[v].append({"node": u, "distance": dist, "is_constrained": is_constrained})

    def get_node(self, node_id: str) -> Optional[Node]:
        return self.nodes.get(node_id)

    def get_closest_node(self, x: float, y: float) -> str:
        best_id = "N01"
        best_dist = float("inf")
        for nid, node in self.nodes.items():
            d = math.hypot(node.x - x, node.y - y)
            if d < best_dist:
                best_dist = d
                best_id = nid
        return best_id

    def export_topology(self) -> Dict[str, Any]:
        return {
            "nodes": [n.to_dict() for n in self.nodes.values()],
            "edges": [e.to_dict() for e in self.edges]
        }

topology = WarehouseTopology()

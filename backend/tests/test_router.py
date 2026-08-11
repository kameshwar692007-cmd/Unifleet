import pytest
from app.core.router import router
from app.core.topology import topology

def test_topology_loaded():
    topo_data = topology.export_topology()
    assert len(topo_data["nodes"]) == 12
    assert len(topo_data["edges"]) > 0

def test_astar_route_finding():
    path = router.find_path("N01", "N06")
    assert len(path) > 1
    assert path[0] == "N01"
    assert path[-1] == "N06"

def test_astar_same_start_and_target():
    path = router.find_path("N01", "N01")
    assert path == ["N01"]

import pytest
from app.core.fleet_brain import fleet_brain
from app.core.harmony_engine import harmony_engine

def test_harmony_engine_auto_release():
    fleet_brain.reset_fleet()
    
    r1 = fleet_brain.robots["R01"]
    r4 = fleet_brain.robots["R04"]
    
    r1.route = ["N01", "N11", "N06"]
    r1.status = "MOVING"
    r1.current_node = "N01"
    
    r4.route = ["N05", "N11", "N03"]
    r4.status = "MOVING"
    r4.current_node = "N05"
    
    conflicts = harmony_engine.check_and_resolve_conflicts()
    assert len(conflicts) > 0
    assert r4.status == "WAITING"
    
    # Simulate R01 moving past N11
    r1.current_node = "N06"
    r1.route = ["N06"]
    
    harmony_engine.release_cleared_conflicts()
    assert r4.status == "MOVING"

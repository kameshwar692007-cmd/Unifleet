import pytest
from app.adapters.vendor_alpha import VendorAlphaAdapter
from app.adapters.vendor_beta import VendorBetaAdapter
from app.adapters.vendor_gamma import VendorGammaAdapter
from app.adapters.factory import adapter_factory

def test_vendor_alpha_adapter():
    adapter = VendorAlphaAdapter()
    raw = {"unit": "R01", "battery_pct": 82.5, "pos": [4.0, 8.0], "mode": "ready", "waypoint": "N01"}
    normalized = adapter.normalize_telemetry(raw)

    assert normalized["robot_id"] == "R01"
    assert normalized["vendor"] == "Vendor Alpha"
    assert normalized["battery"] == 82.5
    assert normalized["status"] == "AVAILABLE"
    assert normalized["x"] == 4.0
    assert normalized["y"] == 8.0
    assert normalized["current_node"] == "N01"

def test_vendor_beta_adapter():
    adapter = VendorBetaAdapter()
    raw = {"robotId": "R03", "soc": 0.74, "coordinates": {"x": 10.0, "y": 5.5}, "state": "IN_TRANSIT", "current_node": "N11"}
    normalized = adapter.normalize_telemetry(raw)

    assert normalized["robot_id"] == "R03"
    assert normalized["vendor"] == "Vendor Beta"
    assert normalized["battery"] == 74.0
    assert normalized["status"] == "MOVING"
    assert normalized["x"] == 10.0
    assert normalized["y"] == 5.5
    assert normalized["current_node"] == "N11"

def test_vendor_gamma_adapter():
    adapter = VendorGammaAdapter()
    raw = {"dev_id": "R04", "b_lvl": 91.0, "location": {"node_id": "N04", "px": 14.0, "py": 3.0}, "op_state": "IDLE"}
    normalized = adapter.normalize_telemetry(raw)

    assert normalized["robot_id"] == "R04"
    assert normalized["vendor"] == "Vendor Gamma"
    assert normalized["battery"] == 91.0
    assert normalized["status"] == "AVAILABLE"
    assert normalized["x"] == 14.0
    assert normalized["y"] == 3.0
    assert normalized["current_node"] == "N04"

def test_adapter_factory_auto_detect():
    payload_alpha = {"unit": "R02", "battery_pct": 60, "pos": [6.0, 3.0]}
    norm = adapter_factory.detect_and_normalize("unifleet/telemetry/alpha/R02", payload_alpha)
    assert norm["vendor"] == "Vendor Alpha"
    assert norm["robot_id"] == "R02"

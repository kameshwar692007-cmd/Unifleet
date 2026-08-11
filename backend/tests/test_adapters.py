import pytest
from app.adapters.vendor_alpha import VendorAlphaAdapter
from app.adapters.vendor_beta import VendorBetaAdapter
from app.adapters.vendor_gamma import VendorGammaAdapter
from app.adapters.vendor_delta import VendorDeltaAdapter
from app.adapters.factory import adapter_factory

def test_vendor_alpha_adapter():
    adapter = VendorAlphaAdapter()
    raw = {
        "unit": "R01",
        "battery_pct": 85.5,
        "pos": [12.4, 45.2],
        "mode": "working",
        "waypoint": "N03"
    }
    norm = adapter.normalize_telemetry(raw)
    assert norm["robot_id"] == "R01"
    assert norm["vendor"] == "Vendor Alpha"
    assert norm["battery"] == 85.5
    assert norm["status"] == "MOVING"
    assert norm["x"] == 12.4
    assert norm["y"] == 45.2

def test_vendor_beta_adapter():
    adapter = VendorBetaAdapter()
    raw = {
        "robotId": "R03",
        "soc": 0.74,
        "coordinates": {"x": 8.0, "y": 14.2},
        "state": "IN_TRANSIT",
        "current_node": "N07"
    }
    norm = adapter.normalize_telemetry(raw)
    assert norm["robot_id"] == "R03"
    assert norm["vendor"] == "Vendor Beta"
    assert norm["battery"] == 74.0
    assert norm["status"] == "MOVING"
    assert norm["x"] == 8.0
    assert norm["y"] == 14.2

def test_vendor_gamma_adapter():
    adapter = VendorGammaAdapter()
    raw = {
        "dev_id": "R04",
        "b_lvl": 92.0,
        "location": {"px": 30.0, "py": 5.0, "node_id": "N11"},
        "op_state": "WAITING"
    }
    norm = adapter.normalize_telemetry(raw)
    assert norm["robot_id"] == "R04"
    assert norm["vendor"] == "Vendor Gamma"
    assert norm["battery"] == 92.0
    assert norm["status"] == "WAITING"
    assert norm["current_node"] == "N11"

def test_vendor_delta_adapter_plug_and_play():
    adapter = VendorDeltaAdapter()
    raw = {
        "device_guid": "R06",
        "charge_percent": 88.5,
        "geo_point": [10.0, 5.5],
        "system_mode": "ACTIVE",
        "node_ref": "N11"
    }
    norm = adapter.normalize_telemetry(raw)
    assert norm["robot_id"] == "R06"
    assert norm["vendor"] == "Vendor Delta"
    assert norm["battery"] == 88.5
    assert norm["status"] == "MOVING"
    assert norm["x"] == 10.0
    assert norm["y"] == 5.5

def test_malformed_adapter_inputs():
    adapter = VendorAlphaAdapter()
    # Null / string battery and non-list pos
    raw = {"unit": "R01", "battery_pct": "invalid", "pos": None}
    norm = adapter.normalize_telemetry(raw)
    assert norm["robot_id"] == "R01"
    assert norm["battery"] == 100.0
    assert norm["x"] == 0.0
    assert norm["y"] == 0.0

def test_factory_detection():
    norm_delta = adapter_factory.detect_and_normalize("unifleet/telemetry/delta/R06", {"device_guid": "R06", "charge_percent": 50.0})
    assert norm_delta["vendor"] == "Vendor Delta"
    assert norm_delta["battery"] == 50.0

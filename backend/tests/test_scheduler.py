import pytest
from app.core.fleet_brain import fleet_brain

def test_explainable_scheduling():
    res = fleet_brain.evaluate_explainable_scheduling("N01", "N05")
    assert "winning_robot_id" in res
    assert "candidates" in res
    assert len(res["candidates"]) == 5

def test_job_creation_and_assignment():
    job = fleet_brain.create_job("N02", "N06")
    assert job["id"].startswith("JOB-")
    assert job["status"] == "ASSIGNED"
    assert job["assigned_robot_id"] is not None

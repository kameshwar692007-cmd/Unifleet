import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_demo_act1_endpoint():
    response = client.post("/api/v1/demo/act1")
    assert response.status_code == 200
    assert response.json()["status"] == "SUCCESS"

def test_demo_act4_hero_endpoint():
    response = client.post("/api/v1/demo/act4")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "SUCCESS"
    assert data["conflict_junction"] == "N11"

def test_demo_reset_endpoint():
    response = client.post("/api/v1/demo/reset")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "SUCCESS"
    assert "reset" in data["message"].lower()

from fastapi import APIRouter
from app.core.topology import topology
from app.core.fleet_brain import fleet_brain

router = APIRouter(prefix="/warehouse", tags=["Warehouse State"])

@router.get("/topology")
def get_warehouse_topology():
    return topology.export_topology()

@router.get("/events")
def get_event_logs():
    return fleet_brain.event_logs

@router.get("/alerts")
def get_alerts():
    return fleet_brain.alerts

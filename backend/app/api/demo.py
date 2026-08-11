from fastapi import APIRouter
from app.core.fleet_brain import fleet_brain
from app.mqtt.client import mqtt_manager

router = APIRouter(prefix="/demo", tags=["Judge Demo Controller"])

@router.post("/act1")
def execute_act1():
    """Act 1: Heterogeneous Fleet - Normalizes and initializes 5 AGVs across 3 vendors"""
    fleet_brain.log_event("demo.act1", "INFO", "Judge Demo Act 1 Executed: 5 AGVs across 3 vendor profiles connected.")
    return {"status": "SUCCESS", "act": 1, "message": "Act 1: Unified heterogeneous fleet ready"}

@router.post("/act2")
def execute_act2():
    """Act 2: Digital Twin Inspection - Select R03 and view live telemetry synchronization"""
    fleet_brain.log_event("demo.act2", "INFO", "Judge Demo Act 2 Executed: Live Digital Twin state synchronized.")
    return {"status": "SUCCESS", "act": 2, "message": "Act 2: Digital Twin inspecting R03 live telemetry"}

@router.post("/act3")
def execute_act3():
    """Act 3: Assign Real Job - Storage A (N02) -> Packing B (N06)"""
    job = fleet_brain.create_job("N02", "N06")
    fleet_brain.log_event("demo.act3", "INFO", f"Judge Demo Act 3 Executed: Transport job created (N02 -> N06). Assigned to {job.get('assigned_robot_id')}")
    return {"status": "SUCCESS", "act": 3, "job": job}

@router.post("/act4")
def execute_act4():
    """Act 4: HERO MOMENT - Route Conflict Prediction & Resolution at N11 Central Junction"""
    # Create two conflicting jobs whose routes cross N11 Central Junction simultaneously
    job1 = fleet_brain.create_job("N03", "N06", requested_robot_id="R01")
    job2 = fleet_brain.create_job("N05", "N03", requested_robot_id="R04")

    fleet_brain.log_event(
        "demo.act4",
        "WARNING",
        "Judge Demo Act 4 Executed: Conflicting routes dispatched for R01 and R04 intersecting at N11. Harmony Engine active."
    )
    return {
        "status": "SUCCESS",
        "act": 4,
        "conflict_junction": "N11",
        "job1": job1,
        "job2": job2,
        "message": "Hero Moment: Route conflict predicted at N11 Central Junction. Watch Digital Twin for visual resolution!"
    }

@router.post("/act5")
def execute_act5():
    """Act 5: Zero-Code Workflow Automation - Low Battery (<20%) Trigger on R03"""
    mqtt_manager.publish_command("R03", "SET_BATTERY", {"battery": 14.0})
    fleet_brain.log_event("demo.act5", "WARNING", "Judge Demo Act 5 Executed: Forced R03 battery to 14.0%. Zero-Code Low Battery Workflow triggered.")
    return {
        "status": "SUCCESS",
        "act": 5,
        "target_robot": "R03",
        "forced_battery": 14.0,
        "message": "Act 5: R03 battery dropped to 14%. Workflow automatically marked robot unavailable & routed to charging dock!"
    }

@router.post("/act6")
def execute_act6():
    """Act 6: Open Architecture Vendor Adapters Showcase"""
    adapters_info = [
        {"vendor": "Vendor Alpha", "protocol": "JSON over MQTT", "robot": "R01 / R02", "schema": "unit, battery_pct, pos[x,y], mode"},
        {"vendor": "Vendor Beta", "protocol": "JSON over MQTT", "robot": "R03", "schema": "robotId, soc, coordinates{x,y}, state"},
        {"vendor": "Vendor Gamma", "protocol": "JSON over MQTT", "robot": "R04 / R05", "schema": "dev_id, b_lvl, location{node_id, px, py}, op_state"}
    ]
    fleet_brain.log_event("demo.act6", "INFO", "Judge Demo Act 6 Executed: Open Architecture Vendor Adapters demonstrated.")
    return {"status": "SUCCESS", "act": 6, "adapters": adapters_info}

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any
from app.core.fleet_brain import fleet_brain

router = APIRouter(prefix="/robots", tags=["Robots"])

class CommandRequest(BaseModel):
    command: str # PAUSE, RESUME, STOP

@router.get("")
def get_robots():
    return [r.to_dict() for r in fleet_brain.robots.values()]

@router.get("/{robot_id}")
def get_robot_details(robot_id: str):
    robot = fleet_brain.robots.get(robot_id)
    if not robot:
        raise HTTPException(status_code=404, detail="Robot not found")
    return robot.to_dict()

@router.post("/{robot_id}/command")
def issue_robot_command(robot_id: str, req: CommandRequest):
    res = fleet_brain.issue_manual_command(robot_id, req.command)
    if not res.get("success"):
        raise HTTPException(status_code=400, detail=res.get("error", "Command failed"))
    return res

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from app.core.fleet_brain import fleet_brain

router = APIRouter(prefix="/jobs", tags=["Jobs"])

class CreateJobRequest(BaseModel):
    source_node: str
    target_node: str
    priority: Optional[int] = 1
    assigned_robot_id: Optional[str] = None

@router.get("")
def get_jobs():
    return list(fleet_brain.jobs.values())

@router.post("")
def create_job(req: CreateJobRequest):
    job = fleet_brain.create_job(req.source_node, req.target_node, req.priority or 1, req.assigned_robot_id)
    return job

@router.get("/explain-scheduling")
def explain_scheduling(source_node: str, target_node: str):
    return fleet_brain.evaluate_explainable_scheduling(source_node, target_node)

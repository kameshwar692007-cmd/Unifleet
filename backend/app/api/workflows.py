from fastapi import APIRouter
from app.core.workflow_engine import workflow_engine

router = APIRouter(prefix="/workflows", tags=["Workflows"])

@router.get("")
def get_workflows():
    return {
        "rules": workflow_engine.rules,
        "logs": workflow_engine.execution_logs
    }

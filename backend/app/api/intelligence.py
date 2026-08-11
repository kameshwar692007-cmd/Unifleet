from fastapi import APIRouter
from app.core.intelligence import intelligence_engine

router = APIRouter(prefix="/intelligence", tags=["AI Fleet Intelligence"])

@router.get("/congestion")
def get_segment_congestion():
    return intelligence_engine.calculate_segment_congestion()

@router.get("/compare-routes")
def compare_routes(source_node: str = "N01", target_node: str = "N06"):
    return intelligence_engine.compare_predictive_routes(source_node, target_node)

import asyncio
import logging
import sys
import os
from contextlib import asynccontextmanager

# Ensure project root is in sys.path
root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if root_dir not in sys.path:
    sys.path.insert(0, root_dir)

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import init_db
from app.mqtt.client import mqtt_manager
from app.websockets.manager import ws_manager
from simulator.engine import simulator_engine

from app.api.robots import router as robots_router
from app.api.jobs import router as jobs_router
from app.api.state import router as state_router
from app.api.workflows import router as workflows_router
from app.api.intelligence import router as intelligence_router
from app.api.demo import router as demo_router

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("unifleet.main")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing UniFleet Backend Services...")
    await init_db()
    await mqtt_manager.start()

    # Start background simulator loop
    simulator_task = asyncio.create_task(simulator_engine.start())

    # Start WebSocket broadcaster loop
    ws_task = asyncio.create_task(ws_manager.broadcast_state_loop())

    logger.info("UniFleet Core Fleet Brain Operational!")
    yield

    logger.info("Shutting down UniFleet Backend Services...")
    ws_manager.is_broadcasting = False
    simulator_engine.stop()
    mqtt_manager.stop()

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API routes under /api/v1
app.include_router(robots_router, prefix=settings.API_V1_STR)
app.include_router(jobs_router, prefix=settings.API_V1_STR)
app.include_router(state_router, prefix=settings.API_V1_STR)
app.include_router(workflows_router, prefix=settings.API_V1_STR)
app.include_router(intelligence_router, prefix=settings.API_V1_STR)
app.include_router(demo_router, prefix=settings.API_V1_STR)

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await ws_manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)
    except Exception:
        ws_manager.disconnect(websocket)

@app.get("/")
def root():
    return {
        "platform": settings.PROJECT_NAME,
        "status": "ONLINE",
        "version": "1.0.0-MVP",
        "docs_url": "/docs"
    }

from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, Integer, Boolean, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.database import Base

def utc_now():
    return datetime.now(timezone.utc)

class RobotModel(Base):
    __tablename__ = "robots"

    id = Column(String(50), primary_key=True)  # e.g., R01, R02...
    vendor = Column(String(50), nullable=False) # Vendor Alpha, Vendor Beta, Vendor Gamma
    model_type = Column(String(50), nullable=False) # Heavy Lifter, AGV Picker, AMR Tugger
    battery = Column(Float, default=100.0)
    status = Column(String(50), default="AVAILABLE") # IDLE, AVAILABLE, ASSIGNED, MOVING, WAITING, PAUSED, CHARGING, ERROR, OFFLINE
    x = Column(Float, default=0.0)
    y = Column(Float, default=0.0)
    current_node = Column(String(50), default="N01")
    target_node = Column(String(50), nullable=True)
    current_job_id = Column(String(50), nullable=True)
    route_json = Column(JSON, default=list) # List of node_ids in current plan
    is_charging = Column(Boolean, default=False)
    last_telemetry_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

class TelemetryHistoryModel(Base):
    __tablename__ = "telemetry_history"

    id = Column(Integer, primary_key=True, autoincrement=True)
    robot_id = Column(String(50), ForeignKey("robots.id"), nullable=False)
    vendor = Column(String(50), nullable=False)
    raw_payload = Column(JSON, nullable=False)
    normalized_status = Column(String(50), nullable=False)
    battery = Column(Float, nullable=False)
    x = Column(Float, nullable=False)
    y = Column(Float, nullable=False)
    timestamp = Column(DateTime(timezone=True), default=utc_now)

class JobModel(Base):
    __tablename__ = "jobs"

    id = Column(String(50), primary_key=True)
    job_type = Column(String(50), default="TRANSPORT")
    source_node = Column(String(50), nullable=False)
    target_node = Column(String(50), nullable=False)
    priority = Column(Integer, default=1)
    status = Column(String(50), default="QUEUED") # QUEUED, ASSIGNED, IN_PROGRESS, COMPLETED, PAUSED, CANCELLED, FAILED
    assigned_robot_id = Column(String(50), ForeignKey("robots.id"), nullable=True)
    scheduling_reason = Column(JSON, nullable=True) # Explains why robot was chosen
    created_at = Column(DateTime(timezone=True), default=utc_now)
    started_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)

class EventLogModel(Base):
    __tablename__ = "event_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    event_type = Column(String(100), nullable=False) # route.conflict.predicted, robot.rerouted, job.completed, etc.
    severity = Column(String(20), default="INFO") # INFO, WARNING, ERROR, SUCCESS
    robot_id = Column(String(50), nullable=True)
    message = Column(Text, nullable=False)
    details = Column(JSON, nullable=True)
    timestamp = Column(DateTime(timezone=True), default=utc_now)

class AlertModel(Base):
    __tablename__ = "alerts"

    id = Column(String(50), primary_key=True)
    title = Column(String(100), nullable=False)
    severity = Column(String(20), default="WARNING")
    robot_id = Column(String(50), nullable=True)
    message = Column(Text, nullable=False)
    acknowledged = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), default=utc_now)

class WorkflowRuleModel(Base):
    __tablename__ = "workflow_rules"

    id = Column(String(50), primary_key=True)
    name = Column(String(100), nullable=False)
    trigger_event = Column(String(100), nullable=False) # e.g., LOW_BATTERY, CONFLICT_PREDICTED
    condition_json = Column(JSON, nullable=False) # e.g., {"battery_less_than": 20}
    action_json = Column(JSON, nullable=False) # e.g., {"action": "MARK_UNAVAILABLE_AND_CHARGE"}
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=utc_now)

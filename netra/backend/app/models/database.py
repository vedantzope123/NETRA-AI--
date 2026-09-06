from datetime import datetime
import json
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), default="investigator", nullable=False)  # investigator, analyst, admin
    badge_number = Column(String(50), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class Case(Base):
    __tablename__ = "cases"

    id = Column(String(100), primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    fir_number = Column(String(100), nullable=True)
    description = Column(Text, nullable=True)
    status = Column(String(50), default="ACTIVE")
    created_by = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class GraphNode(Base):
    __tablename__ = "graph_nodes"

    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(String(100), ForeignKey("cases.id"), index=True, nullable=False)
    node_id = Column(String(100), index=True, nullable=False)
    label = Column(String(255), nullable=False)
    entity_type = Column(String(50), nullable=False)  # PERSON, PHONE, VEHICLE, LOCATION, ORGANIZATION
    aliases = Column(Text, default="[]")  # JSON list
    phone = Column(String(50), nullable=True)
    vehicle_plate = Column(String(50), nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    properties = Column(Text, default="{}")  # JSON metadata
    is_synthetic = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class GraphEdge(Base):
    __tablename__ = "graph_edges"

    id = Column(String(100), primary_key=True, index=True)
    case_id = Column(String(100), ForeignKey("cases.id"), index=True, nullable=False)
    source_id = Column(String(100), nullable=False)
    target_id = Column(String(100), nullable=False)
    relationship_type = Column(String(100), nullable=False)
    evidence_type = Column(String(100), default="CDR")
    justification = Column(Text, nullable=True)
    confidence = Column(Float, default=0.75)
    verdict = Column(String(50), default="pending")  # pending, confirm, reject, needs_more_evidence
    properties = Column(Text, default="{}")
    created_at = Column(DateTime, default=datetime.utcnow)

class LinkFeedback(Base):
    __tablename__ = "link_feedback"

    id = Column(Integer, primary_key=True, index=True)
    edge_id = Column(String(100), index=True, nullable=False)
    case_id = Column(String(100), nullable=False)
    user_id = Column(Integer, nullable=True)
    verdict = Column(String(50), nullable=False)  # confirm, reject, needs_more_evidence
    notes = Column(Text, nullable=True)
    previous_confidence = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(String(100), ForeignKey("cases.id"), index=True, nullable=False)
    alert_type = Column(String(100), nullable=False)  # ANOMALY_CALL_BURST, HIGH_BETWEENNESS, SUSPICIOUS_FINANCIAL, NEW_CLUSTER
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    severity = Column(String(50), default="MEDIUM")  # CRITICAL, HIGH, MEDIUM, LOW
    node_ids = Column(Text, default="[]")  # JSON list
    anomaly_score = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=True)
    user_email = Column(String(255), nullable=True)
    role = Column(String(50), nullable=True)
    action = Column(String(100), nullable=False)
    resource = Column(String(255), nullable=False)
    ip_address = Column(String(50), nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    details = Column(Text, default="{}")

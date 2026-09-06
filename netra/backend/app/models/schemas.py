from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, EmailStr, Field

# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: str = "investigator"
    badge_number: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    role: str
    email: str
    full_name: str

class TokenRefresh(BaseModel):
    refresh_token: str

# Case Schemas
class CaseBase(BaseModel):
    title: str
    fir_number: Optional[str] = None
    description: Optional[str] = None

class CaseCreate(CaseBase):
    id: Optional[str] = None

class CaseResponse(CaseBase):
    id: str
    status: str
    created_by: Optional[str]
    created_at: datetime
    updated_at: datetime
    node_count: Optional[int] = 0
    edge_count: Optional[int] = 0

    class Config:
        from_attributes = True

# Graph Schemas
class NodePayload(BaseModel):
    id: str
    label: str
    type: str
    aliases: List[str] = []
    phone: Optional[str] = None
    vehicle_plate: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    properties: Dict[str, Any] = {}
    is_synthetic: bool = True

class EdgePayload(BaseModel):
    id: str
    source: str
    target: str
    relationship: str
    evidence_type: str = "CDR"
    justification: Optional[str] = None
    confidence: float = 0.75
    verdict: str = "pending"  # pending, confirm, reject, needs_more_evidence
    properties: Dict[str, Any] = {}

class GraphResponse(BaseModel):
    case_id: str
    nodes: List[NodePayload]
    edges: List[EdgePayload]

class CentralityItem(BaseModel):
    node_id: str
    label: str
    entity_type: str
    betweenness: float
    degree: int
    is_bridge: bool

class CommunityItem(BaseModel):
    community_id: int
    name: str
    nodes: List[Dict[str, Any]]
    size: int

class PredictedLink(BaseModel):
    source_id: str
    source_label: str
    target_id: str
    target_label: str
    jaccard_score: float
    common_neighbors: List[str]
    justification: str
    confidence: float

class LinkFeedbackRequest(BaseModel):
    verdict: str = Field(..., description="confirm | reject | needs_more_evidence")
    notes: Optional[str] = None

class LinkExplainResponse(BaseModel):
    edge_id: str
    source_label: str
    target_label: str
    justification: str
    confidence: float
    evidence_type: str
    verdict: str

# Upload Schemas
class IngestUploadRequest(BaseModel):
    case_id: str
    document_text: str
    source_title: Optional[str] = "Forensic Ingestion"

class IngestUploadResponse(BaseModel):
    status: str
    entities_extracted: int
    edges_created: int
    extracted_entities: Dict[str, List[Any]]
    message: str

# Alert Schemas
class AlertResponse(BaseModel):
    id: int
    case_id: str
    alert_type: str
    title: str
    description: str
    severity: str
    node_ids: List[str]
    anomaly_score: Optional[float]
    created_at: datetime

    class Config:
        from_attributes = True

# Assistant Schemas
class AssistantChatRequest(BaseModel):
    case_id: Optional[str] = "CASE-26189"
    query: str

class AssistantChatResponse(BaseModel):
    query: str
    response: str
    citations: List[str] = []
    graph_entities_mentioned: List[str] = []

class AssistantVoiceRequest(BaseModel):
    case_id: Optional[str] = "CASE-26189"
    transcript: str

# Admin Schemas
class AuditLogResponse(BaseModel):
    id: int
    user_id: Optional[int]
    user_email: Optional[str]
    role: Optional[str]
    action: str
    resource: str
    ip_address: Optional[str]
    timestamp: datetime
    details: Dict[str, Any] = {}

class RedactRequest(BaseModel):
    text_or_data: Any
    mask_pii: bool = True

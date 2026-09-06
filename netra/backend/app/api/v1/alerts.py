import json
from typing import List, Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.security import get_current_user
from app.models.database import User, Alert
from app.models.schemas import AlertResponse
from app.services.anomaly.isolation_forest import detect_anomalies

router = APIRouter(prefix="/alerts", tags=["alerts"])

@router.get("", response_model=List[AlertResponse])
def get_alerts(case_id: Optional[str] = None, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    query = db.query(Alert)
    if case_id and case_id.upper() != "ALL":
        query = query.filter(Alert.case_id == case_id)
    db_alerts = query.order_by(Alert.created_at.desc()).all()
    
    results = []
    for a in db_alerts:
        node_ids = json.loads(a.node_ids) if a.node_ids else []
        results.append(AlertResponse(
            id=a.id,
            case_id=a.case_id,
            alert_type=a.alert_type,
            title=a.title,
            description=a.description,
            severity=a.severity,
            node_ids=node_ids,
            anomaly_score=a.anomaly_score,
            created_at=a.created_at
        ))
        
    # Also add dynamically detected live anomalies from Isolation Forest if specific case requested
    if case_id and case_id.upper() != "ALL":
        try:
            live_anomalies = detect_anomalies(case_id, db)
            for i, anom in enumerate(live_anomalies):
                if not any(anom["node_id"] in a.node_ids for a in results):
                    results.append(AlertResponse(
                        id=9000 + i,
                        case_id=case_id,
                        alert_type="ISOLATION_FOREST_ANOMALY",
                        title=f"Behavioral Anomaly: {anom['label']}",
                        description=anom["reason"],
                        severity="CRITICAL" if anom["anomaly_score"] > 0.3 else "HIGH",
                        node_ids=[anom["node_id"]],
                        anomaly_score=anom["anomaly_score"],
                        created_at=db_alerts[0].created_at if db_alerts else None
                    ))
        except Exception:
            pass
        
    return results

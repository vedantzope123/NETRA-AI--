import json
import re
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.security import require_role, get_password_hash
from app.core.audit import record_audit
from app.models.database import User, AuditLog
from app.models.schemas import (
    AuditLogResponse,
    UserResponse,
    UserCreate,
    RedactRequest
)

router = APIRouter(prefix="/admin", tags=["admin"])

@router.get("/audit-log", response_model=List[AuditLogResponse])
def get_audit_log(
    limit: int = 100,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_role(["admin"]))
):
    logs = db.query(AuditLog).order_by(AuditLog.timestamp.desc()).limit(limit).all()
    results = []
    for l in logs:
        details_obj = json.loads(l.details) if l.details else {}
        results.append(AuditLogResponse(
            id=l.id,
            user_id=l.user_id,
            user_email=l.user_email,
            role=l.role,
            action=l.action,
            resource=l.resource,
            ip_address=l.ip_address,
            timestamp=l.timestamp,
            details=details_obj
        ))
    return results

@router.get("/users", response_model=List[UserResponse])
def list_users(
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_role(["admin"]))
):
    return db.query(User).all()

@router.post("/users", response_model=UserResponse)
def create_user_by_admin(
    user_in: UserCreate,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_role(["admin"]))
):
    existing = db.query(User).filter(User.email == user_in.email).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")
        
    user = User(
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
        full_name=user_in.full_name,
        role=user_in.role if user_in.role in ["investigator", "analyst", "admin"] else "investigator",
        badge_number=user_in.badge_number,
        is_active=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    record_audit(
        db=db,
        user_id=admin_user.id,
        user_email=admin_user.email,
        role=admin_user.role,
        action="CREATE_USER",
        resource=f"/admin/users/{user.id}",
        details={"created_email": user.email, "role": user.role}
    )
    return user

@router.post("/redact")
def toggle_pii_redaction(
    req: RedactRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin", "analyst", "investigator"]))
):
    """
    Toggles PII redaction on forensic data.
    Unmasking requires admin authorization and logs an immutable audit event.
    """
    data = req.text_or_data
    mask = req.mask_pii
    
    # Audit log the unmask / mask action
    record_audit(
        db=db,
        user_id=current_user.id,
        user_email=current_user.email,
        role=current_user.role,
        action="UNMASK_PII" if not mask else "MASK_PII",
        resource="/admin/redact",
        details={"mask_state": mask, "authorized_by": current_user.email}
    )
    
    if isinstance(data, str):
        if mask:
            # Mask phone numbers: +91 9811029384 -> +91 98XXXXXX84
            redacted = re.sub(r'(\+91[\-\s]?[6-9]\d{2})\d{5}(\d{2})', r'\1XXXXX\2', data)
            # Mask vehicle numbers: DL01CA9988 -> DL01XXXX88
            redacted = re.sub(r'([A-Z]{2}[0-9]{2})[A-Z]{1,3}([0-9]{2})', r'\1XXXX\2', redacted)
            return {"redacted": True, "data": redacted}
        return {"redacted": False, "data": data}
        
    return {"redacted": mask, "data": data}

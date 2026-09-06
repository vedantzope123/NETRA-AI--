from datetime import datetime
import json
from typing import Optional, Dict, Any
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response
from app.db.session import SessionLocal
from app.models.database import AuditLog

class AuditLogMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response: Response = await call_next(request)
        
        # Log modifying actions or sensitive views
        path = request.url.path
        method = request.method
        
        if path.startswith("/api/v1") and method in ["POST", "PUT", "DELETE", "PATCH"]:
            try:
                # Capture in audit log asynchronously/safely
                client_ip = request.client.host if request.client else "unknown"
                db = SessionLocal()
                try:
                    # User will be identified from token in specific service calls, or header
                    auth_header = request.headers.get("authorization", "")
                    user_email = "authenticated_agent" if auth_header.startswith("Bearer ") else "anonymous"
                    
                    audit_entry = AuditLog(
                        user_email=user_email,
                        role="investigator",
                        action=f"{method} {path}",
                        resource=path,
                        ip_address=client_ip,
                        timestamp=datetime.utcnow(),
                        details=json.dumps({"status_code": response.status_code})
                    )
                    db.add(audit_entry)
                    db.commit()
                finally:
                    db.close()
            except Exception:
                pass
                
        return response

def record_audit(
    db,
    user_id: Optional[int],
    user_email: Optional[str],
    role: Optional[str],
    action: str,
    resource: str,
    ip_address: Optional[str] = "127.0.0.1",
    details: Optional[Dict[str, Any]] = None
):
    try:
        audit_entry = AuditLog(
            user_id=user_id,
            user_email=user_email,
            role=role,
            action=action,
            resource=resource,
            ip_address=ip_address,
            timestamp=datetime.utcnow(),
            details=json.dumps(details or {})
        )
        db.add(audit_entry)
        db.commit()
    except Exception as e:
        db.rollback()
        print(f"Error logging audit: {e}")

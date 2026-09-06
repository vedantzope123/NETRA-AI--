import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.security import get_current_user
from app.models.database import User, Case, GraphNode, GraphEdge
from app.models.schemas import CaseResponse, CaseCreate

router = APIRouter(prefix="/cases", tags=["cases"])

@router.get("", response_model=List[CaseResponse])
def list_cases(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    cases = db.query(Case).all()
    results = []
    for c in cases:
        n_count = db.query(GraphNode).filter(GraphNode.case_id == c.id).count()
        e_count = db.query(GraphEdge).filter(GraphEdge.case_id == c.id).count()
        results.append(CaseResponse(
            id=c.id,
            title=c.title,
            fir_number=c.fir_number,
            description=c.description,
            status=c.status,
            created_by=c.created_by,
            created_at=c.created_at,
            updated_at=c.updated_at,
            node_count=n_count,
            edge_count=e_count
        ))
    return results

@router.post("", response_model=CaseResponse)
def create_case(case_in: CaseCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    cid = case_in.id or f"CASE-{uuid.uuid4().hex[:6].upper()}"
    new_case = Case(
        id=cid,
        title=case_in.title,
        fir_number=case_in.fir_number,
        description=case_in.description,
        status="ACTIVE",
        created_by=current_user.full_name
    )
    db.add(new_case)
    db.commit()
    db.refresh(new_case)
    return CaseResponse(
        id=new_case.id,
        title=new_case.title,
        fir_number=new_case.fir_number,
        description=new_case.description,
        status=new_case.status,
        created_by=new_case.created_by,
        created_at=new_case.created_at,
        updated_at=new_case.updated_at,
        node_count=0,
        edge_count=0
    )

@router.get("/{id}", response_model=CaseResponse)
def get_case_detail(id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    c = db.query(Case).filter(Case.id == id).first()
    if not c:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found")
    n_count = db.query(GraphNode).filter(GraphNode.case_id == c.id).count()
    e_count = db.query(GraphEdge).filter(GraphEdge.case_id == c.id).count()
    return CaseResponse(
        id=c.id,
        title=c.title,
        fir_number=c.fir_number,
        description=c.description,
        status=c.status,
        created_by=c.created_by,
        created_at=c.created_at,
        updated_at=c.updated_at,
        node_count=n_count,
        edge_count=e_count
    )

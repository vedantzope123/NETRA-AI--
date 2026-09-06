import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.security import get_current_user
from app.models.database import User, Case
from app.models.schemas import IngestUploadRequest, IngestUploadResponse
from app.services.nlp.spacy_ner import extract_entities_from_text
from app.services.graph.graph_store import GraphStore
from app.services.explainability.justification import generate_link_justification

router = APIRouter(prefix="/upload", tags=["upload"])

@router.post("", response_model=IngestUploadResponse)
def upload_document(
    upload_in: IngestUploadRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    case = db.query(Case).filter(Case.id == upload_in.case_id).first()
    if not case:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Case {upload_in.case_id} not found")
        
    extracted = extract_entities_from_text(upload_in.document_text)
    
    nodes_created = []
    
    # 1. Add people nodes
    for p in extracted.get("people", []):
        node_id = f"person_{re_slug(p['name'])}"
        node = GraphStore.add_node(
            db=db,
            case_id=upload_in.case_id,
            node_id=node_id,
            label=p["name"],
            entity_type="PERSON",
            properties={"context": p.get("context", ""), "source": upload_in.source_title}
        )
        nodes_created.append(node_id)
        
    # 2. Add phone nodes
    for ph in extracted.get("phones", []):
        node_id = f"phone_{re_slug(ph['identifier'])}"
        node = GraphStore.add_node(
            db=db,
            case_id=upload_in.case_id,
            node_id=node_id,
            label=ph["identifier"],
            entity_type="PHONE",
            phone=ph["identifier"],
            properties={"context": ph.get("context", ""), "source": upload_in.source_title}
        )
        nodes_created.append(node_id)

    # 3. Add vehicle nodes
    for v in extracted.get("vehicles", []):
        node_id = f"vehicle_{re_slug(v['identifier'])}"
        node = GraphStore.add_node(
            db=db,
            case_id=upload_in.case_id,
            node_id=node_id,
            label=v["identifier"],
            entity_type="VEHICLE",
            vehicle_plate=v["identifier"],
            properties={"context": v.get("context", ""), "source": upload_in.source_title}
        )
        nodes_created.append(node_id)

    # 4. Add location nodes
    for loc in extracted.get("locations", []):
        node_id = f"loc_{re_slug(loc['name'])}"
        node = GraphStore.add_node(
            db=db,
            case_id=upload_in.case_id,
            node_id=node_id,
            label=loc["name"],
            entity_type="LOCATION",
            properties={"context": loc.get("context", ""), "source": upload_in.source_title}
        )
        nodes_created.append(node_id)

    # 5. Add organization nodes
    for org in extracted.get("organizations", []):
        node_id = f"org_{re_slug(org['name'])}"
        node = GraphStore.add_node(
            db=db,
            case_id=upload_in.case_id,
            node_id=node_id,
            label=org["name"],
            entity_type="ORGANIZATION",
            properties={"context": org.get("context", ""), "source": upload_in.source_title}
        )
        nodes_created.append(node_id)

    # 6. Synthesize co-occurrence edges between entities in the same document
    edges_created_count = 0
    if len(nodes_created) >= 2:
        for i in range(len(nodes_created) - 1):
            src = nodes_created[i]
            tgt = nodes_created[i + 1]
            edge_id = f"edge_{src}_{tgt}_{uuid.uuid4().hex[:4]}"
            
            # Generate courtroom-grade justification
            just = generate_link_justification(
                entity_a=src,
                entity_b=tgt,
                evidence_list=[f"Co-occurring in document '{upload_in.source_title}'"],
                evidence_type="FIR Narrative"
            )
            
            GraphStore.add_edge(
                db=db,
                case_id=upload_in.case_id,
                edge_id=edge_id,
                source_id=src,
                target_id=tgt,
                relationship_type="MENTIONED_TOGETHER",
                evidence_type="FIR Document",
                justification=just["justification"],
                confidence=just["confidence"],
                verdict="pending"
            )
            edges_created_count += 1
            
    total_extracted = sum(len(v) for v in extracted.values())
    
    return IngestUploadResponse(
        status="success",
        entities_extracted=total_extracted,
        edges_created=edges_created_count,
        extracted_entities=extracted,
        message=f"Successfully extracted {total_extracted} forensic entities and created {edges_created_count} graph connections."
    )

def re_slug(text: str) -> str:
    import re
    return re.sub(r'[^a-zA-Z0-9]', '_', text.lower())[:30]

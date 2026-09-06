import json
import networkx as nx
from typing import Dict, List, Any, Optional
from sqlalchemy.orm import Session
from app.models.database import GraphNode, GraphEdge, Case

class GraphStore:
    _graphs: Dict[str, nx.Graph] = {}

    @classmethod
    def get_graph(cls, case_id: str, db: Session) -> nx.Graph:
        if case_id in cls._graphs:
            return cls._graphs[case_id]
        
        G = nx.Graph()
        nodes = db.query(GraphNode).filter(GraphNode.case_id == case_id).all()
        for node in nodes:
            props = json.loads(node.properties) if node.properties else {}
            aliases = json.loads(node.aliases) if node.aliases else []
            G.add_node(
                node.node_id,
                label=node.label,
                entity_type=node.entity_type,
                aliases=aliases,
                phone=node.phone,
                vehicle_plate=node.vehicle_plate,
                latitude=node.latitude,
                longitude=node.longitude,
                properties=props,
                is_synthetic=node.is_synthetic
            )
            
        edges = db.query(GraphEdge).filter(GraphEdge.case_id == case_id).all()
        for edge in edges:
            props = json.loads(edge.properties) if edge.properties else {}
            G.add_edge(
                edge.source_id,
                edge.target_id,
                edge_id=edge.id,
                relationship=edge.relationship_type,
                evidence_type=edge.evidence_type,
                justification=edge.justification,
                confidence=edge.confidence,
                verdict=edge.verdict,
                properties=props
            )
            
        cls._graphs[case_id] = G
        return G

    @classmethod
    def invalidate(cls, case_id: str):
        if case_id in cls._graphs:
            del cls._graphs[case_id]

    @classmethod
    def get_cytoscape_elements(cls, case_id: str, db: Session) -> Dict[str, Any]:
        G = cls.get_graph(case_id, db)
        
        nodes_out = []
        for n, data in G.nodes(data=True):
            nodes_out.append({
                "id": n,
                "label": data.get("label", n),
                "type": data.get("entity_type", "UNKNOWN"),
                "aliases": data.get("aliases", []),
                "phone": data.get("phone"),
                "vehicle_plate": data.get("vehicle_plate"),
                "latitude": data.get("latitude"),
                "longitude": data.get("longitude"),
                "properties": data.get("properties", {}),
                "is_synthetic": data.get("is_synthetic", True)
            })
            
        edges_out = []
        for u, v, data in G.edges(data=True):
            edges_out.append({
                "id": data.get("edge_id", f"edge_{u}_{v}"),
                "source": u,
                "target": v,
                "relationship": data.get("relationship", "ASSOCIATED_WITH"),
                "evidence_type": data.get("evidence_type", "CDR"),
                "justification": data.get("justification", f"Direct investigative connection between {u} and {v}."),
                "confidence": data.get("confidence", 0.75),
                "verdict": data.get("verdict", "pending"),
                "properties": data.get("properties", {})
            })
            
        return {
            "case_id": case_id,
            "nodes": nodes_out,
            "edges": edges_out
        }

    @classmethod
    def add_node(
        cls,
        db: Session,
        case_id: str,
        node_id: str,
        label: str,
        entity_type: str,
        aliases: List[str] = None,
        phone: Optional[str] = None,
        vehicle_plate: Optional[str] = None,
        latitude: Optional[float] = None,
        longitude: Optional[float] = None,
        properties: Dict[str, Any] = None,
        is_synthetic: bool = True
    ) -> GraphNode:
        existing = db.query(GraphNode).filter(GraphNode.case_id == case_id, GraphNode.node_id == node_id).first()
        if existing:
            existing.label = label
            existing.entity_type = entity_type
            existing.aliases = json.dumps(aliases or [])
            if phone: existing.phone = phone
            if vehicle_plate: existing.vehicle_plate = vehicle_plate
            if latitude: existing.latitude = latitude
            if longitude: existing.longitude = longitude
            existing.properties = json.dumps(properties or {})
            db.commit()
            db.refresh(existing)
            cls.invalidate(case_id)
            return existing

        new_node = GraphNode(
            case_id=case_id,
            node_id=node_id,
            label=label,
            entity_type=entity_type,
            aliases=json.dumps(aliases or []),
            phone=phone,
            vehicle_plate=vehicle_plate,
            latitude=latitude,
            longitude=longitude,
            properties=json.dumps(properties or {}),
            is_synthetic=is_synthetic
        )
        db.add(new_node)
        db.commit()
        db.refresh(new_node)
        cls.invalidate(case_id)
        return new_node

    @classmethod
    def add_edge(
        cls,
        db: Session,
        case_id: str,
        edge_id: str,
        source_id: str,
        target_id: str,
        relationship_type: str,
        evidence_type: str = "CDR",
        justification: Optional[str] = None,
        confidence: float = 0.75,
        verdict: str = "pending",
        properties: Dict[str, Any] = None
    ) -> GraphEdge:
        existing = db.query(GraphEdge).filter(GraphEdge.id == edge_id).first()
        if existing:
            existing.relationship_type = relationship_type
            existing.evidence_type = evidence_type
            if justification: existing.justification = justification
            existing.confidence = confidence
            existing.verdict = verdict
            existing.properties = json.dumps(properties or {})
            db.commit()
            db.refresh(existing)
            cls.invalidate(case_id)
            return existing

        new_edge = GraphEdge(
            id=edge_id,
            case_id=case_id,
            source_id=source_id,
            target_id=target_id,
            relationship_type=relationship_type,
            evidence_type=evidence_type,
            justification=justification,
            confidence=confidence,
            verdict=verdict,
            properties=json.dumps(properties or {})
        )
        db.add(new_edge)
        db.commit()
        db.refresh(new_edge)
        cls.invalidate(case_id)
        return new_edge

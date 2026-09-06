import networkx as nx
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.services.graph.graph_store import GraphStore

def calculate_centrality(case_id: str, db: Session) -> List[Dict[str, Any]]:
    G = GraphStore.get_graph(case_id, db)
    if len(G) == 0:
        return []
        
    betweenness = nx.betweenness_centrality(G)
    degrees = dict(G.degree())
    
    # Identify bridge nodes: top 15% betweenness or score > 0.15
    threshold = sorted(betweenness.values(), reverse=True)[min(2, len(betweenness)-1)] if len(betweenness) > 3 else 0.1
    
    results = []
    for node_id, b_score in betweenness.items():
        node_data = G.nodes[node_id]
        results.append({
            "node_id": node_id,
            "label": node_data.get("label", node_id),
            "entity_type": node_data.get("entity_type", "UNKNOWN"),
            "betweenness": round(float(b_score), 4),
            "degree": degrees.get(node_id, 0),
            "is_bridge": bool(b_score >= threshold and b_score > 0.05)
        })
        
    results.sort(key=lambda x: x["betweenness"], reverse=True)
    return results

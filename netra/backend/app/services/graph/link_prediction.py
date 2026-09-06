import networkx as nx
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.services.graph.graph_store import GraphStore

def predict_hidden_links(case_id: str, db: Session, top_k: int = 5) -> List[Dict[str, Any]]:
    G = GraphStore.get_graph(case_id, db)
    if len(G) < 3:
        return []
        
    non_edges = list(nx.non_edges(G))
    if not non_edges:
        return []
        
    # Jaccard coefficient scoring
    preds = list(nx.jaccard_coefficient(G, non_edges))
    preds.sort(key=lambda x: x[2], reverse=True)
    
    results = []
    for u, v, score in preds[:top_k]:
        if score <= 0.0:
            continue
            
        u_label = G.nodes[u].get("label", u)
        v_label = G.nodes[v].get("label", v)
        
        # Common neighbors
        common = list(nx.common_neighbors(G, u, v))
        common_labels = [G.nodes[n].get("label", n) for n in common]
        
        confidence = min(0.95, round(0.45 + (score * 0.5), 2))
        justification = (
            f"Strong probability of unrecorded link: {u_label} and {v_label} share "
            f"{len(common)} mutual contact(s) ({', '.join(common_labels[:3])}) with a Jaccard index of {score:.2f}."
        )
        
        results.append({
            "source_id": u,
            "source_label": u_label,
            "target_id": v,
            "target_label": v_label,
            "jaccard_score": round(float(score), 4),
            "common_neighbors": common_labels,
            "justification": justification,
            "confidence": confidence
        })
        
    return results

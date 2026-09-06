import networkx as nx
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.services.graph.graph_store import GraphStore

def detect_communities(case_id: str, db: Session) -> List[Dict[str, Any]]:
    G = GraphStore.get_graph(case_id, db)
    if len(G) == 0:
        return []
        
    try:
        communities = nx.community.louvain_communities(G, seed=42)
    except Exception:
        # Fallback to connected components if disconnected or small
        communities = list(nx.connected_components(G))
        
    results = []
    cluster_names = [
        "Hawala & Financial Facilitation Hub",
        "Interstate Cyber-Scam & Call Center Cell",
        "Logistics & Safehouse Transport Network",
        "Peripheral Smuggling Ring",
        "Support & Procuring Syndicate"
    ]
    
    for i, comm in enumerate(communities):
        nodes_info = []
        for node_id in comm:
            node_data = G.nodes[node_id]
            nodes_info.append({
                "id": node_id,
                "label": node_data.get("label", node_id),
                "type": node_data.get("entity_type", "UNKNOWN")
            })
            
        name = cluster_names[i] if i < len(cluster_names) else f"Syndicate Cell {i + 1}"
        results.append({
            "community_id": i + 1,
            "name": name,
            "nodes": nodes_info,
            "size": len(nodes_info)
        })
        
    results.sort(key=lambda x: x["size"], reverse=True)
    return results

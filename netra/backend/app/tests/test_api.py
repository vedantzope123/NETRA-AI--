import pytest
from fastapi.testclient import TestClient
from app.main import app

def test_root_and_health():
    with TestClient(app) as client:
        res = client.get("/")
        assert res.status_code == 200
        assert res.json()["status"] == "OPERATIONAL"
        assert res.json()["synthetic_data"] is True

def test_auth_login_investigator():
    with TestClient(app) as client:
        res = client.post("/api/v1/auth/login", json={
            "email": "investigator@netra.gov.in",
            "password": "Netra@2026"
        })
        assert res.status_code == 200
        data = res.json()
        assert "access_token" in data
        assert data["role"] == "investigator"

def test_rbac_investigator_cannot_access_audit_log():
    with TestClient(app) as client:
        # Login as investigator
        res = client.post("/api/v1/auth/login", json={
            "email": "investigator@netra.gov.in",
            "password": "Netra@2026"
        })
        token = res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # Attempt to access admin audit log -> must be 403 Forbidden
        audit_res = client.get("/api/v1/admin/audit-log", headers=headers)
        assert audit_res.status_code == 403

def test_graph_endpoints():
    with TestClient(app) as client:
        res = client.post("/api/v1/auth/login", json={
            "email": "investigator@netra.gov.in",
            "password": "Netra@2026"
        })
        token = res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # Get Case Graph
        graph_res = client.get("/api/v1/graph/CASE-26189", headers=headers)
        assert graph_res.status_code == 200
        graph_data = graph_res.json()
        assert len(graph_data["nodes"]) >= 15
        assert len(graph_data["edges"]) >= 10
        
        # Get Centrality
        centrality_res = client.get("/api/v1/graph/CASE-26189/centrality", headers=headers)
        assert centrality_res.status_code == 200
        centrality_data = centrality_res.json()
        assert len(centrality_data) > 0
        
        # Get Communities
        comm_res = client.get("/api/v1/graph/CASE-26189/communities", headers=headers)
        assert comm_res.status_code == 200
        comm_data = comm_res.json()
        assert len(comm_data) >= 2

def test_feedback_loop():
    with TestClient(app) as client:
        res = client.post("/api/v1/auth/login", json={
            "email": "investigator@netra.gov.in",
            "password": "Netra@2026"
        })
        token = res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # Confirm an edge
        fb_res = client.post("/api/v1/graph/link/edge_1/feedback", json={
            "verdict": "confirm",
            "notes": "Verified via Registrar of Companies official filing"
        }, headers=headers)
        assert fb_res.status_code == 200
        assert fb_res.json()["verdict"] == "confirm"
        assert fb_res.json()["new_confidence"] >= 0.90

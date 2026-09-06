# NETRA — Explainable Criminal Network Analysis System
### *"See the Invisible. Stop the Crime."*
**Problem Statement 26189 | Ministry of Home Affairs — NCRB, Women Safety Division**

---

## 1. Overview & Key Innovations

NETRA is an explainable intelligence application designed to ingest unstructured case files (FIRs, CDR records, bank statements), build interactive criminal network graphs, identify syndicate structures, and explain **why** connections exist using plain-language, courtroom-ready evidentiary citations.

### Winning Differentiators
1. **Explainability First:** Every edge on the graph has a one-sentence legal justification and confidence score.
2. **Active Learning Feedback Loop:** Investigators confirm or reject connections with one click, visibly retraining the logistic regression confidence scorer live in real-time.
3. **100% Free-Tier Architecture:** Zero cloud dependencies required for core offline extraction (spaCy NER). Cloud reasoning runs on Google Gemini's free tier.
4. **Governance & PII Redaction:** Immutable append-only audit trail and role-based PII masking built directly into the core data layer.

---

## 2. Tech Stack (100% Free / Open Source)

| Component | Technology | Cost / Tier |
|---|---|---|
| **Frontend UI** | React 18, Vite, TypeScript, Tailwind CSS | Free Open-Source |
| **State & Routing** | Zustand, React Router v6 | Free Open-Source |
| **Graph Visualization** | Cytoscape.js (cose/concentric layouts) | Free Open-Source |
| **Geospatial Mapping** | Leaflet, React-Leaflet, OpenStreetMap | Free Open-Source |
| **Charts** | Recharts | Free Open-Source |
| **Voice Interface** | Browser Web Speech API (`SpeechRecognition` & `SpeechSynthesis`) | Free (Browser Built-in) |
| **Backend API** | Python 3.11, FastAPI, Pydantic v2 | Free Open-Source |
| **Offline NER** | spaCy (`en_core_web_sm`) + Regex | Free (100% Offline) |
| **Graph Algorithms** | NetworkX (Betweenness Centrality, Louvain Communities, Jaccard Link Prediction) | Free Open-Source |
| **Anomaly Detection** | Scikit-learn (`IsolationForest`) | Free Open-Source |
| **AI Reasoning** | Google Gemini 2.5 Flash Free Tier (`google-genai` SDK) | Free Tier (Daily Quota) |
| **Database** | SQLite (Dev / Demo) / Supabase Postgres (Deploy) | Free Tier |
| **Security & Auth** | JWT (`python-jose`), Bcrypt (`passlib`), RBAC | Free Open-Source |
    
---

## 3. Quick Start (Run Locally)

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### 1. Start the Backend API
```bash
cd netra/backend
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
python -m spacy download en_core_web_sm

# Start FastAPI server (auto-seeds synthetic benchmark dataset)
uvicorn app.main:app --reload --port 8000
```

### 2. Start the Frontend Application
```bash
cd netra/frontend
npm install
npm run dev
```
Open **http://localhost:5173** in your browser.

---

## 4. Default Demo Accounts

All credentials pre-seeded into the SQLite database:

| Role | Email | Password | Permissions |
|---|---|---|---|
| **Investigator** | `investigator@netra.gov.in` | `Netra@2026` | Case graph view, FIR ingestion, Confirm/Reject feedback, Voice assistant |
| **Analyst** | `analyst@netra.gov.in` | `Netra@2026` | Cross-case graph analytics, Anomaly monitoring, Centrality exploration |
| **Admin (SP)** | `admin@netra.gov.in` | `Netra@2026` | Full access, Audit trail inspection, User provisioning, PII unmasking |

---

## 5. API Endpoints (`/api/v1`)

```
POST   /api/v1/auth/register       - Account creation
POST   /api/v1/auth/login          - JWT token issuance
POST   /api/v1/auth/refresh        - JWT token refresh
GET    /api/v1/auth/me             - Current user profile

GET    /api/v1/cases               - List cases
POST   /api/v1/cases               - Create new case
GET    /api/v1/cases/{id}          - Case detail

POST   /api/v1/upload              - Ingest raw police report / FIR narrative

GET    /api/v1/graph/{case_id}             - Case Cytoscape graph nodes & edges
GET    /api/v1/graph/{case_id}/centrality  - Betweenness centrality & bridge nodes
GET    /api/v1/graph/{case_id}/communities - Louvain syndicate clusters
GET    /api/v1/graph/{case_id}/predicted-links - Jaccard link predictions
GET    /api/v1/graph/link/{id}/explain     - Single edge justification & confidence
POST   /api/v1/graph/link/{id}/feedback    - Confirm/Reject verdict feedback loop
POST   /api/v1/graph/retrain-model         - Retrain logistic regression confidence model
GET    /api/v1/graph/model-history         - Accuracy progress over time

GET    /api/v1/alerts              - Behavioral anomaly feed

POST   /api/v1/assistant/chat      - Natural language forensic query
POST   /api/v1/assistant/voice     - Speech-to-text transcript processing

GET    /api/v1/admin/audit-log     - Append-only audit logs (Admin only)
GET    /api/v1/admin/users         - Officer account list (Admin only)
POST   /api/v1/admin/users         - Provision new officer (Admin only)
POST   /api/v1/admin/redact        - Toggle PII redaction and audit-log unmasking
```

---

## 6. Docker Deployment

```bash
cd netra
docker-compose up --build
```
- Frontend: `http://localhost:5173`
- Backend API Docs: `http://localhost:8000/docs`

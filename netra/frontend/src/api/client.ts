const getApiBase = () => {
  let base = (import.meta.env.VITE_API_BASE_URL || '').trim().replace(/\/$/, '');
  if (!base) {
    return '/api/v1';
  }
  // If the user specified a root URL (e.g. https://netra-ai-7hdu.onrender.com), ensure /api/v1 is appended
  if (!base.endsWith('/api/v1') && !base.includes('/api/v1')) {
    base = `${base}/api/v1`;
  }
  return base;
};

const API_BASE = getApiBase();

export interface UserProfile {
  id: number;
  email: string;
  full_name: string;
  role: string;
  badge_number?: string;
  is_active: boolean;
}

export interface CaseItem {
  id: string;
  title: string;
  fir_number?: string;
  description?: string;
  status: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  node_count: number;
  edge_count: number;
}

export interface GraphNodeData {
  id: string;
  label: string;
  type: string;
  aliases: string[];
  phone?: string;
  vehicle_plate?: string;
  latitude?: number;
  longitude?: number;
  properties: Record<string, any>;
  is_synthetic: boolean;
}

export interface GraphEdgeData {
  id: string;
  source: string;
  target: string;
  relationship: string;
  evidence_type: string;
  justification: string;
  confidence: number;
  verdict: 'pending' | 'confirm' | 'reject' | 'needs_more_evidence';
  properties: Record<string, any>;
}

export interface CaseGraph {
  case_id: string;
  nodes: GraphNodeData[];
  edges: GraphEdgeData[];
}

export interface CentralityNode {
  node_id: string;
  label: string;
  entity_type: string;
  betweenness: number;
  degree: number;
  is_bridge: boolean;
}

export interface CommunityCluster {
  community_id: number;
  name: string;
  nodes: Array<{ id: string; label: string; type: string }>;
  size: number;
}

export interface PredictedLinkItem {
  source_id: string;
  source_label: string;
  target_id: string;
  target_label: string;
  jaccard_score: number;
  common_neighbors: string[];
  justification: string;
  confidence: number;
}

export interface AlertItem {
  id: number;
  case_id: string;
  alert_type: string;
  title: string;
  description: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  node_ids: string[];
  anomaly_score?: number;
  created_at: string;
}

export interface EntityAssociate {
  edge_id: string;
  entity_id: string;
  label: string;
  type: string;
  phone?: string;
  vehicle_plate?: string;
  relationship: string;
  evidence_type: string;
  justification: string;
  confidence: number;
  verdict: string;
  report_id: string;
  db_location: { table: string; record_id: string; partition: string };
  sec_65b_hash: string;
}

export interface TransactionRecord {
  utr: string;
  sender: string;
  sender_acc: string;
  receiver: string;
  receiver_acc: string;
  amount_inr: number;
  formatted_amount: string;
  timestamp: string;
  bank: string;
  type: string;
  suspicious_flags: string[];
  db_ref: string;
}

export interface CDRRecord {
  call_id: string;
  caller: string;
  receiver: string;
  timestamp: string;
  duration_sec: number;
  call_type: string;
  tower_id: string;
  tower_location: string;
  azimuth: number;
  imei: string;
  db_ref: string;
}

export interface FIRRecord {
  fir_no: string;
  title?: string;
  police_station: string;
  sections: string;
  date: string;
  status: string;
  db_ref: string;
  investigating_officer?: string;
}

export interface EntityDossier {
  entity_id: string;
  case_id: string;
  case_title: string;
  fir_number: string;
  label: string;
  entity_type: string;
  aliases: string[];
  phone?: string;
  vehicle_plate?: string;
  latitude?: number;
  longitude?: number;
  role: string;
  risk_score: number;
  db_location: { table: string; record_id: string; partition: string };
  report_id: string;
  connected_associates: EntityAssociate[];
  transactions_ledger: TransactionRecord[];
  cdr_logs: CDRRecord[];
  fir_records: FIRRecord[];
  sec_65b_hash: string;
  total_associates: number;
  total_txns: number;
  total_cdrs: number;
}

export interface CrossCaseBridge {
  nexus_type: string;
  indicator: string;
  description: string;
  linked_cases: Array<{ id: string; title: string }>;
  entities: string[];
  risk_score: number;
  report_id: string;
  db_location: { table: string; record_id: string; partition: string };
  evidence_count: number;
}

export interface AuditLogItem {
  id: number;
  user_id?: number;
  user_email?: string;
  role?: string;
  action: string;
  resource: string;
  ip_address?: string;
  timestamp: string;
  details: Record<string, any>;
}

class ApiClient {
  private getToken(): string | null {
    return localStorage.getItem('netra_token');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const targetUrl = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;
    const response = await fetch(targetUrl, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      localStorage.removeItem('netra_token');
      localStorage.removeItem('netra_user');
      if (!window.location.pathname.includes('/login') && window.location.pathname !== '/') {
        window.location.href = '/login';
      }
      throw new Error('Session expired or unauthorized. Please log in.');
    }

    if (!response.ok) {
      const err = await response.json().catch(() => ({ detail: 'Network error occurred' }));
      throw new Error(err.detail || `Request failed with status ${response.status}`);
    }

    return response.json();
  }

  // Auth
  async login(email: string, password: string) {
    return this.request<{ access_token: string; refresh_token: string; role: string; email: string; full_name: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(data: { email: string; password: string; full_name: string; role: string; badge_number?: string }) {
    return this.request<UserProfile>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getMe() {
    return this.request<UserProfile>('/auth/me');
  }

  // Cases
  async getCases() {
    return this.request<CaseItem[]>('/cases');
  }

  async createCase(data: { title: string; fir_number?: string; description?: string }) {
    return this.request<CaseItem>('/cases', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getCaseDetail(id: string) {
    return this.request<CaseItem>(`/cases/${id}`);
  }

  // Graph
  async getGraph(caseId: string) {
    return this.request<CaseGraph>(`/graph/${caseId}`);
  }

  async getCentrality(caseId: string) {
    return this.request<CentralityNode[]>(`/graph/${caseId}/centrality`);
  }

  async getCommunities(caseId: string) {
    return this.request<CommunityCluster[]>(`/graph/${caseId}/communities`);
  }

  async getPredictedLinks(caseId: string) {
    return this.request<PredictedLinkItem[]>(`/graph/${caseId}/predicted-links`);
  }

  async getLinkExplanation(edgeId: string) {
    return this.request<{
      edge_id: string;
      source_label: string;
      target_label: string;
      justification: string;
      confidence: number;
      evidence_type: string;
      verdict: string;
    }>(`/graph/link/${edgeId}/explain`);
  }

  async submitEdgeFeedback(edgeId: string, verdict: 'confirm' | 'reject' | 'needs_more_evidence', notes?: string) {
    return this.request<{
      status: string;
      edge_id: string;
      verdict: string;
      new_confidence: number;
      message: string;
    }>(`/graph/link/${edgeId}/feedback`, {
      method: 'POST',
      body: JSON.stringify({ verdict, notes }),
    });
  }

  async retrainConfidenceModel() {
    return this.request<{
      status: string;
      accuracy: number;
      total_samples: number;
      iteration: number;
      history: Array<{ iteration: number; accuracy: number; samples: number; timestamp: string }>;
    }>('/graph/retrain-model', { method: 'POST' });
  }

  async getModelHistory() {
    return this.request<Array<{ iteration: number; accuracy: number; samples: number; timestamp: string }>>('/graph/model-history');
  }

  // Ingestion / Upload
  async uploadForensicDocument(caseId: string, documentText: string, sourceTitle: string = 'Forensic FIR Ingest') {
    return this.request<{
      status: string;
      entities_extracted: number;
      edges_created: number;
      extracted_entities: Record<string, any[]>;
      message: string;
    }>('/upload', {
      method: 'POST',
      body: JSON.stringify({ case_id: caseId, document_text: documentText, source_title: sourceTitle }),
    });
  }

  // Alerts
  async getAlerts(caseId?: string) {
    const url = caseId && caseId !== 'ALL' ? `/alerts?case_id=${encodeURIComponent(caseId)}` : '/alerts';
    return this.request<AlertItem[]>(url);
  }

  // Dossier & Cross-Case Nexus
  async getEntityDossier(nodeId: string, caseId?: string) {
    const url = caseId ? `/graph/entity/${encodeURIComponent(nodeId)}/dossier?case_id=${encodeURIComponent(caseId)}` : `/graph/entity/${encodeURIComponent(nodeId)}/dossier`;
    return this.request<EntityDossier>(url);
  }

  async getCrossCaseNexus() {
    return this.request<{ total_cross_case_bridges: number; bridges: CrossCaseBridge[] }>('/graph/cross-case/nexus');
  }

  // Assistant
  async sendAssistantChat(query: string, caseId: string = 'CASE-26189') {
    return this.request<{
      query: string;
      response: string;
      citations: string[];
      graph_entities_mentioned: string[];
    }>('/assistant/chat', {
      method: 'POST',
      body: JSON.stringify({ case_id: caseId, query }),
    });
  }

  async sendAssistantVoice(transcript: string, caseId: string = 'CASE-26189') {
    return this.request<{
      query: string;
      response: string;
      citations: string[];
      graph_entities_mentioned: string[];
    }>('/assistant/voice', {
      method: 'POST',
      body: JSON.stringify({ case_id: caseId, transcript }),
    });
  }

  // Admin
  async getAuditLog() {
    return this.request<AuditLogItem[]>('/admin/audit-log');
  }

  async getUsers() {
    return this.request<UserProfile[]>('/admin/users');
  }

  async createUser(data: { email: string; password: string; full_name: string; role: string; badge_number?: string }) {
    return this.request<UserProfile>('/admin/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async toggleRedaction(textOrData: any, maskPii: boolean) {
    return this.request<{ redacted: boolean; data: any }>('/admin/redact', {
      method: 'POST',
      body: JSON.stringify({ text_or_data: textOrData, mask_pii: maskPii }),
    });
  }
}

export const api = new ApiClient();

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, AlertItem, CaseItem } from '../api/client';
import { AlertTriangle, ShieldAlert, Sparkles, BrainCircuit, Activity, Network, ArrowRight, Filter, Clock, Target, Zap } from 'lucide-react';
import { EntityDossierModal } from '../components/evidence/EntityDossierModal';

const SYNTHETIC_FALLBACK_ALERTS: AlertItem[] = [
  {
    id: 101,
    case_id: 'CASE-26189',
    alert_type: 'BURST_CALLING_ANOMALY',
    title: 'Extreme Late-Night Burst Communication Flagged',
    description: 'Devender @ Lala placed 412 calls between 01:00 AM and 04:30 AM across 9 border BTS towers (TWR-DEL-CP-04), matching organized cyber syndicate burner SIM activation patterns.',
    severity: 'CRITICAL',
    node_ids: ['ENT-26189-003'],
    anomaly_score: 0.94,
    created_at: '2026-03-01T04:30:00Z'
  },
  {
    id: 102,
    case_id: 'CASE-26189',
    alert_type: 'HAWALA_LAYERING_SPIKE',
    title: 'Rapid ₹1.8 Crore RTGS Layering to Mule Network',
    description: '45 structured transactions originating from Sanjay Singhal (Apex Bullion) split across 12 newly opened accounts within 30 minutes. Flagged under PMLA compliance rules.',
    severity: 'CRITICAL',
    node_ids: ['ENT-26189-002', 'ENT-26189-004'],
    anomaly_score: 0.91,
    created_at: '2026-03-01T06:15:00Z'
  },
  {
    id: 103,
    case_id: 'CASE-26189',
    alert_type: 'CENTRALITY_BRIDGE_SURGE',
    title: 'High-Betweenness Syndicate Broker Active',
    description: 'Vikram Malhotra identified as single point of failure linking Hawala financial nodes to Mewat extortion executioners (Betweenness: 0.482). Removal isolates 60% of syndicate.',
    severity: 'HIGH',
    node_ids: ['ENT-26189-001'],
    anomaly_score: 0.82,
    created_at: '2026-03-02T10:00:00Z'
  },
  {
    id: 104,
    case_id: 'CASE-26190',
    alert_type: 'IMEI_CLONING_GRID',
    title: 'Multi-Device IMEI Hopping Detected',
    description: 'Suspect handset cycled through 14 different SIM cards across Mewat cell towers in 72 hours. High correlation with cyber arrest impersonation calls.',
    severity: 'CRITICAL',
    node_ids: ['ENT-26190-001'],
    anomaly_score: 0.89,
    created_at: '2026-03-02T14:45:00Z'
  },
  {
    id: 105,
    case_id: 'CASE-26191',
    alert_type: 'DARKNET_CRYPTO_BRIDGE',
    title: 'USDT Tether Conversion via P2P Escrow',
    description: 'Dark web marketplace wallet transferred $85,000 USDT into unverified Indian bank accounts with forged KYC credentials.',
    severity: 'HIGH',
    node_ids: ['ENT-26191-002'],
    anomaly_score: 0.78,
    created_at: '2026-03-03T09:20:00Z'
  },
  {
    id: 106,
    case_id: 'CASE-26192',
    alert_type: 'SYNTHETIC_ARREST_CAMPAIGN',
    title: 'Coordinated Video Call Extortion Active',
    description: 'Fake police station background studio detected in 18 reported WhatsApp video calls targeting senior citizens in South Delhi.',
    severity: 'CRITICAL',
    node_ids: ['ENT-26192-001'],
    anomaly_score: 0.96,
    created_at: '2026-03-03T16:10:00Z'
  },
  {
    id: 107,
    case_id: 'CASE-26189',
    alert_type: 'LOAN_APK_C2_BEACON',
    title: 'Malicious Loan App Contact Exfiltration',
    description: 'Command and control server (IP 185.220.101.44) synchronized 12,400 contact lists and private photo galleries from compromised victim devices.',
    severity: 'HIGH',
    node_ids: ['ENT-26189-005'],
    anomaly_score: 0.85,
    created_at: '2026-03-04T11:00:00Z'
  },
  {
    id: 108,
    case_id: 'CASE-26193',
    alert_type: 'COMMUNITY_CORE_CONVERGENCE',
    title: 'Interstate Syndicate Rendezvous Detected',
    description: 'Simultaneous cell tower pings for 4 prime suspects at Aerocity Hotel corridor ahead of planned hawala cash handover.',
    severity: 'MEDIUM',
    node_ids: ['ENT-26193-001'],
    anomaly_score: 0.65,
    created_at: '2026-03-04T18:30:00Z'
  }
];

export const Alerts: React.FC = () => {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  const [filterCaseId, setFilterCaseId] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);
  const [selectedDossierEntity, setSelectedDossierEntity] = useState<{ id: string; caseId: string } | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [caseList, alertList] = await Promise.all([
          api.getCases().catch(() => []),
          api.getAlerts().catch(() => [])
        ]);

        if (caseList && caseList.length > 0) {
          setCases(caseList);
        } else {
          setCases([
            { id: 'CASE-26189', title: 'Operation Maya — Interstate Cyber Syndicate', status: 'ACTIVE', node_count: 15, edge_count: 22, created_at: '2026-02-01', updated_at: '2026-03-01' },
            { id: 'CASE-26190', title: 'Project Chakravyuh — Mewat Cyber Fraud', status: 'UNDER_INVESTIGATION', node_count: 10, edge_count: 14, created_at: '2026-02-05', updated_at: '2026-03-01' },
            { id: 'CASE-26191', title: 'Operation Saffron — Cryptocurrency Laundering', status: 'ACTIVE', node_count: 8, edge_count: 11, created_at: '2026-02-10', updated_at: '2026-03-02' },
          ]);
        }

        if (alertList && alertList.length > 0) {
          setAlerts(alertList);
        } else {
          setAlerts(SYNTHETIC_FALLBACK_ALERTS);
        }
      } catch (err) {
        console.error('Failed to load alerts, loading synthetic threat feed:', err);
        setAlerts(SYNTHETIC_FALLBACK_ALERTS);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const filteredAlerts = alerts.filter((a) => {
    const matchesSeverity = filterSeverity === 'ALL' || a.severity === filterSeverity;
    const matchesCase = filterCaseId === 'ALL' || a.case_id === filterCaseId;
    return matchesSeverity && matchesCase;
  });

  const criticalCount = alerts.filter(a => a.severity === 'CRITICAL').length;
  const highCount = alerts.filter(a => a.severity === 'HIGH').length;

  return (
    <div className="space-y-6 max-w-6xl mx-auto px-4 sm:px-6 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in-down">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-wide flex items-center gap-2.5">
            <AlertTriangle className="w-6 h-6 text-rose-400" />
            Forensic Anomaly & Threat Intelligence Feed
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {alerts.length} alerts across {cases.length} cases — Real-time algorithmic risk detection
          </p>
        </div>

        {/* Summary Badges */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-xs font-semibold text-rose-400">
            <Zap className="w-3.5 h-3.5" />
            {criticalCount} Critical
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs font-semibold text-amber-400">
            <Target className="w-3.5 h-3.5" />
            {highCount} High
          </div>
        </div>
      </div>

      {/* Filters Row */}
      <div className="flex flex-col sm:flex-row gap-3 animate-fade-in-up">
        {/* Case Filter Dropdown */}
        <select
          value={filterCaseId}
          onChange={(e) => setFilterCaseId(e.target.value)}
          className="bg-[#121A2B] border border-slate-800 text-slate-200 text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-indigo-500 font-mono"
        >
          <option value="ALL">All Cases ({alerts.length})</option>
          {cases.map(c => {
            const count = alerts.filter(a => a.case_id === c.id).length;
            return (
              <option key={c.id} value={c.id}>{c.id} ({count})</option>
            );
          })}
        </select>

        {/* Severity Filter Pills */}
        <div className="flex items-center gap-1.5 bg-[#121A2B] p-1 rounded-xl border border-slate-800 text-xs flex-1 sm:flex-initial">
          {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM'].map((sev) => (
            <button
              key={sev}
              onClick={() => setFilterSeverity(sev)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                filterSeverity === sev
                  ? sev === 'CRITICAL' ? 'bg-rose-600 text-white shadow' : 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Alert Feed Cards */}
      {loading ? (
        <div className="text-center py-16">
          <AlertTriangle className="w-8 h-8 mx-auto text-slate-600 animate-pulse" />
          <p className="text-sm text-slate-400 mt-3">Loading intelligence feeds...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAlerts.map((alt, idx) => {
            const isCritical = alt.severity === 'CRITICAL';
            const isHigh = alt.severity === 'HIGH';

            return (
              <div
                key={alt.id}
                className={`bg-[#121A2B] rounded-2xl border p-5 shadow-xl transition-all space-y-3 feature-card animate-fade-in-up ${
                  isCritical
                    ? 'border-rose-500/40 bg-rose-950/10'
                    : isHigh
                    ? 'border-amber-500/30'
                    : 'border-slate-800'
                }`}
                style={{ animationDelay: `${idx * 0.05}s` }}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    {isCritical && (
                      <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse shrink-0" />
                    )}
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        isCritical
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : isHigh
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                      }`}
                    >
                      {alt.severity} RISK
                    </span>
                    <span className="text-xs font-mono text-slate-400">{alt.alert_type}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-indigo-300 border border-slate-700">
                      {alt.case_id}
                    </span>
                  </div>

                  {alt.anomaly_score && (
                    <span className="text-xs font-mono font-semibold text-rose-400">
                      Anomaly Score: {(alt.anomaly_score * 100).toFixed(0)}%
                    </span>
                  )}
                </div>

                <h2 className="text-base font-bold text-white">{alt.title}</h2>

                <p className="text-xs text-slate-300 leading-relaxed">{alt.description}</p>

                <div className="pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 text-slate-400 flex-wrap">
                    <span>Linked Nodes:</span>
                    {alt.node_ids.map((nid, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedDossierEntity({ id: nid, caseId: alt.case_id })}
                        className="px-2 py-0.5 rounded bg-indigo-500/20 hover:bg-indigo-500/40 text-indigo-300 hover:text-white border border-indigo-500/30 font-mono text-[11px] transition-colors"
                        title="Inspect forensic evidence dossier"
                      >
                        {nid} ↗
                      </button>
                    ))}
                  </div>

                  <Link
                    to={`/cases/${alt.case_id}/graph`}
                    className="flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 self-end sm:self-auto"
                  >
                    <span>Locate on Graph Explorer</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredAlerts.length === 0 && (
        <div className="text-center py-16 space-y-3">
          <ShieldAlert className="w-8 h-8 mx-auto text-slate-600" />
          <p className="text-sm text-slate-400">No alerts match your filter criteria.</p>
          <button onClick={() => { setFilterSeverity('ALL'); setFilterCaseId('ALL'); }}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-medium">
            Clear Filters
          </button>
        </div>
      )}

      {/* Interactive Entity Dossier Modal */}
      {selectedDossierEntity && (
        <EntityDossierModal
          entityId={selectedDossierEntity.id}
          caseId={selectedDossierEntity.caseId}
          onClose={() => setSelectedDossierEntity(null)}
          onSelectEntity={(newId) => setSelectedDossierEntity({ id: newId, caseId: selectedDossierEntity.caseId })}
        />
      )}
    </div>
  );
};

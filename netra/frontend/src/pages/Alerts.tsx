import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, AlertItem, CaseItem } from '../api/client';
import { AlertTriangle, ShieldAlert, Sparkles, BrainCircuit, Activity, Network, ArrowRight, Filter, Clock, Target, Zap } from 'lucide-react';
import { EntityDossierModal } from '../components/evidence/EntityDossierModal';

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
        const caseList = await api.getCases();
        setCases(caseList);

        // Load alerts for all cases
        const allAlerts: AlertItem[] = [];
        for (const c of caseList) {
          try {
            const caseAlerts = await api.getAlerts(c.id);
            allAlerts.push(...caseAlerts);
          } catch {}
        }
        setAlerts(allAlerts);
      } catch (err) {
        console.error('Failed to load alerts', err);
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

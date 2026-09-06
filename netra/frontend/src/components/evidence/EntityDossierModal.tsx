import React, { useEffect, useState } from 'react';
import { api, EntityDossier } from '../../api/client';
import {
  X,
  User,
  Phone,
  Car,
  MapPin,
  Building,
  CreditCard,
  Radio,
  FileText,
  ShieldCheck,
  ArrowRight,
  ExternalLink,
  Copy,
  Check,
  Sparkles,
  AlertTriangle,
  History,
  CornerDownRight,
  Printer
} from 'lucide-react';

interface EntityDossierModalProps {
  entityId: string | null;
  caseId?: string;
  onClose: () => void;
  onSelectEntity?: (entityId: string) => void;
}

export const EntityDossierModal: React.FC<EntityDossierModalProps> = ({
  entityId,
  caseId = 'CASE-26189',
  onClose,
  onSelectEntity,
}) => {
  const [currentId, setCurrentId] = useState<string | null>(entityId);
  const [dossier, setDossier] = useState<EntityDossier | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'associates' | 'transactions' | 'cdr' | 'firs' | 'sec65b'>('associates');
  const [copiedHash, setCopiedHash] = useState(false);
  const [history, setHistory] = useState<Array<{ id: string; label: string }>>([]);

  useEffect(() => {
    setCurrentId(entityId);
    setHistory([]);
  }, [entityId]);

  useEffect(() => {
    if (!currentId) return;
    setLoading(true);
    api.getEntityDossier(currentId, caseId)
      .then((data) => {
        setDossier(data);
        setHistory((prev) => {
          if (prev.some((h) => h.id === data.entity_id)) return prev;
          return [...prev, { id: data.entity_id, label: data.label }];
        });
      })
      .catch((err) => {
        console.error('Failed to load entity dossier:', err);
      })
      .finally(() => setLoading(false));
  }, [currentId, caseId]);

  if (!entityId) return null;

  const navigateToEntity = (newId: string) => {
    setCurrentId(newId);
    if (onSelectEntity) onSelectEntity(newId);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl h-[90vh] bg-[#0E1524] border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Modal Header */}
        <div className="shrink-0 px-6 py-4 bg-[#121A2B] border-b border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <User className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-wide">
                  {dossier?.label || currentId}
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase">
                  {dossier?.entity_type || 'ENTITY'}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30">
                  Risk: {dossier?.risk_score || 80}/100
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5 flex items-center gap-2">
                <span>Case: {dossier?.case_id || caseId}</span>
                <span>•</span>
                <span className="text-cyan-400">Report: {dossier?.report_id || 'NCRB-CFSL-2026'}</span>
                <span>•</span>
                <span className="text-emerald-400 font-semibold">{dossier?.role || 'Investigative Target'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700 text-xs flex items-center gap-1.5"
              title="Print / Export Courtroom Dossier"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export Dossier</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Close dossier"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Investigative Trail Breadcrumb */}
        {history.length > 1 && (
          <div className="px-6 py-2 bg-[#0B101D] border-b border-slate-800/80 flex items-center gap-2 overflow-x-auto text-xs">
            <History className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span className="text-slate-500 font-mono text-[11px] shrink-0">Investigative Trail:</span>
            {history.map((h, i) => (
              <React.Fragment key={h.id}>
                {i > 0 && <span className="text-slate-600">→</span>}
                <button
                  onClick={() => navigateToEntity(h.id)}
                  className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
                    h.id === currentId
                      ? 'bg-indigo-600/30 text-indigo-300 font-semibold border border-indigo-500/40'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {h.label}
                </button>
              </React.Fragment>
            ))}
          </div>
        )}

        {/* Sub-Header Metadata Chips */}
        {dossier && (
          <div className="px-6 py-3 bg-[#101726] border-b border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-2 bg-slate-900/60 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Primary Phone / Line</span>
              <span className="font-mono text-cyan-300 font-medium">{dossier.phone || 'No MSISDN linked'}</span>
            </div>
            <div className="p-2 bg-slate-900/60 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Registered Vehicle</span>
              <span className="font-mono text-amber-300 font-medium">{dossier.vehicle_plate || 'None registered'}</span>
            </div>
            <div className="p-2 bg-slate-900/60 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Database Storage Location</span>
              <span className="font-mono text-emerald-300 text-[11px] truncate block" title={dossier.db_location?.record_id}>
                {dossier.db_location?.table}:{dossier.db_location?.record_id}
              </span>
            </div>
            <div className="p-2 bg-slate-900/60 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Section 65B Hash</span>
              <button
                onClick={() => copyToClipboard(dossier.sec_65b_hash)}
                className="font-mono text-indigo-300 text-[11px] flex items-center gap-1 hover:text-white truncate"
                title="Click to copy SHA-256 legal checksum"
              >
                {copiedHash ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span className="truncate">{dossier.sec_65b_hash.slice(0, 16)}...</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="px-6 bg-[#0E1524] border-b border-slate-800 flex gap-2 overflow-x-auto shrink-0">
          <button
            onClick={() => setActiveTab('associates')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'associates'
                ? 'border-indigo-500 text-indigo-300 bg-indigo-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            Connected Associates ({dossier?.total_associates || 0})
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'transactions'
                ? 'border-emerald-500 text-emerald-300 bg-emerald-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            Financial Transactions ({dossier?.total_txns || 0})
          </button>
          <button
            onClick={() => setActiveTab('cdr')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'cdr'
                ? 'border-cyan-500 text-cyan-300 bg-cyan-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            CDR Call Logs ({dossier?.total_cdrs || 0})
          </button>
          <button
            onClick={() => setActiveTab('firs')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'firs'
                ? 'border-amber-500 text-amber-300 bg-amber-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            FIR & Court Documents ({dossier?.fir_records?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('sec65b')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'sec65b'
                ? 'border-pink-500 text-pink-300 bg-pink-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Section 65B Certificate
          </button>
        </div>

        {/* Tab Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {loading ? (
            <div className="h-64 flex flex-col items-center justify-center gap-3 text-slate-400">
              <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
              <p className="text-xs">Querying Netra+ SQLite Vault & Generating Section 65B Trace...</p>
            </div>
          ) : !dossier ? (
            <div className="text-center py-12 text-slate-400 text-xs">No forensic dossier available for this entity.</div>
          ) : (
            <>
              {/* TAB 1: CONNECTED ASSOCIATES (ONE-CLICK PIVOTING) */}
              {activeTab === 'associates' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-400 pb-1">
                    <span>
                      Click on <strong>any associated person or entity</strong> below to immediately pivot to their dossier and track their financial and call records.
                    </span>
                    <span className="font-mono text-indigo-400">{dossier.connected_associates.length} Direct Links</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {dossier.connected_associates.map((assoc, idx) => (
                      <div
                        key={idx}
                        className="p-4 bg-slate-900/80 hover:bg-[#151D2E] rounded-xl border border-slate-800 hover:border-indigo-500/50 transition-all space-y-2.5 group"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="p-1 rounded bg-indigo-500/20 text-indigo-300 text-[10px] font-mono uppercase">
                              {assoc.type}
                            </span>
                            <span className="font-bold text-sm text-white group-hover:text-indigo-300 transition-colors">
                              {assoc.label}
                            </span>
                          </div>
                          <span
                            className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                              assoc.verdict === 'confirm'
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : 'bg-amber-500/20 text-amber-300'
                            }`}
                          >
                            {(assoc.confidence * 100).toFixed(0)}% Conf.
                          </span>
                        </div>

                        <div className="text-xs text-slate-300 italic bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/80">
                          "{assoc.justification}"
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400 pt-1 border-t border-slate-800">
                          <div className="space-x-2">
                            <span>Relationship: <strong className="text-slate-200">{assoc.relationship}</strong></span>
                            <span>•</span>
                            <span>Evidence: <strong className="text-cyan-400">{assoc.evidence_type}</strong></span>
                          </div>

                          <button
                            onClick={() => navigateToEntity(assoc.entity_id)}
                            className="flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 px-2.5 py-1 rounded-md transition-colors"
                          >
                            <span>Inspect Dossier</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 2: FINANCIAL TRANSACTIONS LEDGER */}
              {activeTab === 'transactions' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <p>Subpoenaed bank transactions and Hawala settlement logs involving this suspect:</p>
                    <span className="font-mono text-emerald-400">{dossier.transactions_ledger.length} Recorded Transactions</span>
                  </div>

                  {dossier.transactions_ledger.length === 0 ? (
                    <div className="text-center py-10 text-slate-500 text-xs">No direct financial transactions logged for this entity.</div>
                  ) : (
                    <div className="overflow-x-auto rounded-xl border border-slate-800">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-[#121A2B] text-slate-400 border-b border-slate-800 font-mono text-[11px]">
                          <tr>
                            <th className="p-3">UTR / Txn ID</th>
                            <th className="p-3">Sender & Account</th>
                            <th className="p-3">Beneficiary & Account</th>
                            <th className="p-3">Amount (INR)</th>
                            <th className="p-3">Bank Route</th>
                            <th className="p-3">Pattern / Flags</th>
                            <th className="p-3">DB Record Location</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
                          {dossier.transactions_ledger.map((txn, idx) => (
                            <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                              <td className="p-3 font-mono text-cyan-300 font-medium whitespace-nowrap">{txn.utr}</td>
                              <td className="p-3 text-slate-200">
                                <div>{txn.sender}</div>
                                <span className="text-[10px] text-slate-500 font-mono">{txn.sender_acc}</span>
                              </td>
                              <td className="p-3 text-slate-200">
                                <div>{txn.receiver}</div>
                                <span className="text-[10px] text-slate-500 font-mono">{txn.receiver_acc}</span>
                              </td>
                              <td className="p-3 font-mono font-bold text-emerald-400 whitespace-nowrap">
                                {txn.formatted_amount || `₹${txn.amount_inr?.toLocaleString()}`}
                              </td>
                              <td className="p-3 text-slate-300 text-[11px]">{txn.bank}</td>
                              <td className="p-3">
                                <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20 text-[10px]">
                                  {txn.type}
                                </span>
                              </td>
                              <td className="p-3 font-mono text-slate-400 text-[10px]">{txn.db_ref}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: CDR INTERCEPTS & CELL TOWER LOGS */}
              {activeTab === 'cdr' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <p>Subpoenaed telecom operator dumps (Call Detail Records) and cell tower azimuths:</p>
                    <span className="font-mono text-cyan-400">{dossier.cdr_logs.length} Intercepted Calls</span>
                  </div>

                  {dossier.cdr_logs.length === 0 ? (
                    <div className="text-center py-10 text-slate-500 text-xs">No direct CDR call records logged for this entity.</div>
                  ) : (
                    <div className="overflow-x-auto rounded-xl border border-slate-800">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-[#121A2B] text-slate-400 border-b border-slate-800 font-mono text-[11px]">
                          <tr>
                            <th className="p-3">Call Record ID</th>
                            <th className="p-3">Originating Line</th>
                            <th className="p-3">Terminating Line</th>
                            <th className="p-3">Timestamp</th>
                            <th className="p-3">Duration</th>
                            <th className="p-3">Cell Tower & Coordinates</th>
                            <th className="p-3">Type & Azimuth</th>
                            <th className="p-3">DB Location</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
                          {dossier.cdr_logs.map((cdr, idx) => (
                            <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                              <td className="p-3 font-mono text-cyan-300 font-medium whitespace-nowrap">{cdr.call_id}</td>
                              <td className="p-3 font-mono text-slate-200">{cdr.caller}</td>
                              <td className="p-3 font-mono text-slate-200">{cdr.receiver}</td>
                              <td className="p-3 text-slate-300 text-[11px] whitespace-nowrap">{cdr.timestamp}</td>
                              <td className="p-3 font-mono text-amber-300">{cdr.duration_sec}s</td>
                              <td className="p-3 text-slate-200 text-[11px]">
                                <div className="font-semibold">{cdr.tower_id}</div>
                                <span className="text-[10px] text-slate-400">{cdr.tower_location}</span>
                              </td>
                              <td className="p-3">
                                <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-[10px]">
                                  {cdr.call_type} ({cdr.azimuth}°)
                                </span>
                              </td>
                              <td className="p-3 font-mono text-slate-400 text-[10px]">{cdr.db_ref}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: FIR & COURT CHARGE SHEET RECORDS */}
              {activeTab === 'firs' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <p>Police FIR registrations, charge sheets, and statutory court filing references:</p>
                    <span className="font-mono text-amber-400">{dossier.fir_records.length} Court Records</span>
                  </div>

                  <div className="space-y-3">
                    {dossier.fir_records.map((fir, idx) => (
                      <div key={idx} className="p-4 bg-slate-900/80 rounded-xl border border-slate-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-amber-400" />
                            <h3 className="font-bold text-white text-sm">{fir.fir_no}</h3>
                          </div>
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[11px] font-mono">
                            {fir.status}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
                          <div>
                            <span className="text-slate-400 text-[10px] block">Police Station Jurisdiction</span>
                            <span className="text-slate-200 font-medium">{fir.police_station}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 text-[10px] block">Applicable Sections</span>
                            <span className="text-rose-300 font-mono font-medium">{fir.sections}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 text-[10px] block">Database Storage Reference</span>
                            <span className="text-cyan-300 font-mono font-medium">{fir.db_ref}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 5: SECTION 65B EVIDENCE CERTIFICATE */}
              {activeTab === 'sec65b' && (
                <div className="p-6 bg-slate-900/70 border border-slate-800 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2 text-white font-bold text-sm">
                      <ShieldCheck className="w-5 h-5 text-pink-400" />
                      Certificate of Electronic Evidence (Section 65B BSA / Indian Evidence Act)
                    </div>
                    <span className="px-2.5 py-0.5 rounded bg-pink-500/20 text-pink-300 border border-pink-500/30 text-[11px] font-mono">
                      Legally Admissible
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    This cryptographic certificate confirms that all CDR telecommunications records, RTGS bank transactions,
                    and graph relations associated with <strong>{dossier.label}</strong> ({dossier.entity_id}) in Case{' '}
                    <strong>{dossier.case_id}</strong> were extracted from the Netra+ SQLite Vault without digital tampering.
                  </p>

                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 font-mono text-xs">
                    <div className="flex justify-between text-slate-400">
                      <span>Forensic Entity ID:</span>
                      <span className="text-white">{dossier.entity_id}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Primary CFSL Report ID:</span>
                      <span className="text-cyan-400">{dossier.report_id}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Database Row Storage:</span>
                      <span className="text-emerald-400">{dossier.db_location?.table}:{dossier.db_location?.record_id}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Section 65B SHA-256 Hash:</span>
                      <span className="text-pink-400 break-all">{dossier.sec_65b_hash}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <button
                      onClick={() => copyToClipboard(dossier.sec_65b_hash)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-colors"
                    >
                      {copiedHash ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>Copy SHA-256 Checksum</span>
                    </button>
                    <button
                      onClick={handlePrint}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg text-xs font-medium transition-colors border border-slate-700"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print Legal Certificate</span>
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

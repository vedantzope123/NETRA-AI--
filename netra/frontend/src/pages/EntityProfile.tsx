import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api, EntityDossier } from '../api/client';
import {
  User,
  Phone,
  Car,
  MapPin,
  Building,
  CreditCard,
  Radio,
  FileText,
  ShieldCheck,
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  Copy,
  Check,
  Printer,
  History,
  Activity,
  Network
} from 'lucide-react';

export const EntityProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [dossier, setDossier] = useState<EntityDossier | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'associates' | 'transactions' | 'cdr' | 'firs' | 'sec65b'>('associates');
  const [copiedHash, setCopiedHash] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api.getEntityDossier(id)
      .then((data) => setDossier(data))
      .catch((err) => console.error('Failed to load dossier:', err))
      .finally(() => setLoading(false));
  }, [id]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  if (loading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center gap-3 text-slate-400">
        <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
        <p className="text-xs">Accessing Netra+ Forensic Archive...</p>
      </div>
    );
  }

  if (!dossier) {
    return (
      <div className="p-8 text-center text-slate-400 space-y-3">
        <p>Forensic Entity '{id}' not found in Netra+ database vault.</p>
        <Link to="/dashboard" className="text-xs text-indigo-400 hover:underline">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto px-4 sm:px-6 py-6 text-slate-100">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <Link
          to={`/cases/${dossier.case_id}/graph`}
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to {dossier.case_id} Graph Explorer
        </Link>

        <button
          onClick={() => window.print()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-colors"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Export Section 65B Dossier</span>
        </button>
      </div>

      {/* Main Profile Header */}
      <div className="bg-[#121A2B] rounded-2xl border border-slate-800 p-6 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <User className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-white">{dossier.label}</h1>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase">
                  {dossier.entity_type}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30">
                  Risk: {dossier.risk_score}/100
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 font-mono mt-1">
                <span>Case: <strong className="text-slate-200">{dossier.case_id}</strong></span>
                <span>•</span>
                <span>FIR: <strong className="text-amber-300">{dossier.fir_number}</strong></span>
                <span>•</span>
                <span>Role: <strong className="text-emerald-400">{dossier.role}</strong></span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="px-3 py-1 rounded-full bg-slate-900 border border-slate-700 text-cyan-300">
              Report: {dossier.report_id}
            </span>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-800 text-xs">
          <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 space-y-1">
            <span className="text-slate-400 text-[11px]">Primary Phone / MSISDN</span>
            <p className="font-mono text-cyan-300 font-semibold">{dossier.phone || 'No direct SIM registered'}</p>
          </div>
          <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 space-y-1">
            <span className="text-slate-400 text-[11px]">Vehicle Registration</span>
            <p className="font-mono text-amber-300 font-semibold">{dossier.vehicle_plate || 'None registered'}</p>
          </div>
          <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 space-y-1">
            <span className="text-slate-400 text-[11px]">Database Vault Record</span>
            <p className="font-mono text-emerald-300 font-semibold text-[11px] truncate">
              {dossier.db_location?.table}:{dossier.db_location?.record_id}
            </p>
          </div>
          <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 space-y-1">
            <span className="text-slate-400 text-[11px]">Section 65B Hash</span>
            <button
              onClick={() => copyToClipboard(dossier.sec_65b_hash)}
              className="font-mono text-pink-300 text-[11px] flex items-center gap-1 hover:text-white truncate"
              title="Copy SHA-256 hash"
            >
              {copiedHash ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span className="truncate">{dossier.sec_65b_hash.slice(0, 16)}...</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-[#121A2B] rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="px-6 bg-[#0E1524] border-b border-slate-800 flex gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('associates')}
            className={`py-3.5 px-4 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'associates'
                ? 'border-indigo-500 text-indigo-300 bg-indigo-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            Connected Associates ({dossier.total_associates})
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`py-3.5 px-4 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'transactions'
                ? 'border-emerald-500 text-emerald-300 bg-emerald-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            Financial Transactions ({dossier.total_txns})
          </button>
          <button
            onClick={() => setActiveTab('cdr')}
            className={`py-3.5 px-4 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'cdr'
                ? 'border-cyan-500 text-cyan-300 bg-cyan-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            CDR Call Logs ({dossier.total_cdrs})
          </button>
          <button
            onClick={() => setActiveTab('firs')}
            className={`py-3.5 px-4 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'firs'
                ? 'border-amber-500 text-amber-300 bg-amber-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            FIR Documents ({dossier.fir_records?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('sec65b')}
            className={`py-3.5 px-4 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'sec65b'
                ? 'border-pink-500 text-pink-300 bg-pink-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Section 65B Certificate
          </button>
        </div>

        <div className="p-6">
          {/* TAB 1: CONNECTED ASSOCIATES (ONE-CLICK PIVOTING) */}
          {activeTab === 'associates' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Click on any associated entity to inspect their transaction ledger, calls, and court dossier:</span>
                <span className="font-mono text-indigo-400">{dossier.connected_associates.length} Linked Entities</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
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
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
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
                        onClick={() => navigate(`/entity/${assoc.entity_id}`)}
                        className="flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 px-2.5 py-1 rounded-md transition-colors"
                      >
                        <span>Pivot to Dossier</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: FINANCIAL TRANSACTIONS */}
          {activeTab === 'transactions' && (
            <div className="space-y-4">
              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#121A2B] text-slate-400 border-b border-slate-800 font-mono text-[11px]">
                    <tr>
                      <th className="p-3">UTR Number</th>
                      <th className="p-3">Sender</th>
                      <th className="p-3">Beneficiary</th>
                      <th className="p-3">Amount</th>
                      <th className="p-3">Bank Route</th>
                      <th className="p-3">Transaction Type</th>
                      <th className="p-3">DB Record Location</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
                    {dossier.transactions_ledger.map((txn, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                        <td className="p-3 font-mono text-cyan-300 font-medium whitespace-nowrap">{txn.utr}</td>
                        <td className="p-3 text-slate-200">{txn.sender}</td>
                        <td className="p-3 text-slate-200">{txn.receiver}</td>
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
            </div>
          )}

          {/* TAB 3: CDR LOGS */}
          {activeTab === 'cdr' && (
            <div className="space-y-4">
              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#121A2B] text-slate-400 border-b border-slate-800 font-mono text-[11px]">
                    <tr>
                      <th className="p-3">Call Record ID</th>
                      <th className="p-3">Caller</th>
                      <th className="p-3">Receiver</th>
                      <th className="p-3">Timestamp</th>
                      <th className="p-3">Duration</th>
                      <th className="p-3">Cell Tower Address</th>
                      <th className="p-3">Azimuth</th>
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
                        <td className="p-3 text-slate-200 text-[11px]">{cdr.tower_location}</td>
                        <td className="p-3 text-slate-300">{cdr.azimuth}°</td>
                        <td className="p-3 font-mono text-slate-400 text-[10px]">{cdr.db_ref}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: FIR RECORDS */}
          {activeTab === 'firs' && (
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
                      <span className="text-slate-400 text-[10px] block">Police Station</span>
                      <span className="text-slate-200 font-medium">{fir.police_station}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Penal Sections</span>
                      <span className="text-rose-300 font-mono font-medium">{fir.sections}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Database Vault Reference</span>
                      <span className="text-cyan-300 font-mono font-medium">{fir.db_ref}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 5: SECTION 65B CERTIFICATE */}
          {activeTab === 'sec65b' && (
            <div className="p-6 bg-slate-900/70 border border-slate-800 rounded-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2 text-white font-bold text-sm">
                  <ShieldCheck className="w-5 h-5 text-pink-400" />
                  Certificate of Electronic Evidence (Section 65B Bharatiya Sakshya Adhiniyam)
                </div>
                <span className="px-2.5 py-0.5 rounded bg-pink-500/20 text-pink-300 border border-pink-500/30 text-[11px] font-mono">
                  Admissible in Court of Law
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                This certificate attests that all extracted telecommunication call detail records (CDR), bank wire transfers (RTGS/NEFT),
                and relational graph ties for <strong>{dossier.label}</strong> ({dossier.entity_id}) in Case{' '}
                <strong>{dossier.case_id}</strong> were extracted pursuant to authorized investigative powers.
              </p>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 font-mono text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Entity Identifier:</span>
                  <span className="text-white">{dossier.entity_id}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>CFSL Annexure Report ID:</span>
                  <span className="text-cyan-400">{dossier.report_id}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Database Row Storage URI:</span>
                  <span className="text-emerald-400">{dossier.db_location?.table}:{dossier.db_location?.record_id}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Section 65B SHA-256 Hash:</span>
                  <span className="text-pink-400 break-all">{dossier.sec_65b_hash}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

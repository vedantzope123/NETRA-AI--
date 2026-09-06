import React, { useState } from 'react';
import { useCaseStore } from '../../store/caseStore';
import { X, CheckCircle2, XCircle, HelpCircle, ShieldAlert, Phone, Car, MapPin, Building, User, Sparkles, Activity, FileText, ArrowUpRight, Database } from 'lucide-react';

interface EntityPanelProps {
  onOpenDossier?: (nodeId: string) => void;
}

export const EntityPanel: React.FC<EntityPanelProps> = ({ onOpenDossier }) => {
  const { selectedNode, selectedEdge, selectNode, selectEdge, updateEdgeVerdict } = useCaseStore();
  const [feedbackNote, setFeedbackNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!selectedNode && !selectedEdge) return null;

  const handleClose = () => {
    selectNode(null);
    selectEdge(null);
  };

  const handleFeedback = async (verdict: 'confirm' | 'reject' | 'needs_more_evidence') => {
    if (!selectedEdge) return;
    setSubmitting(true);
    try {
      await updateEdgeVerdict(selectedEdge.id, verdict, feedbackNote || undefined);
      setToastMessage(`Verdict '${verdict.toUpperCase()}' applied live.`);
      setTimeout(() => setToastMessage(null), 3500);
      setFeedbackNote('');
    } catch (err) {
      alert('Failed to update edge verdict');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <aside
      className="fixed inset-x-0 bottom-0 max-h-[85vh] md:static md:w-96 md:max-h-full md:inset-auto bg-[#111827]/95 md:bg-[#121A2B]/90 backdrop-blur-xl border-t md:border-t-0 md:border-l border-slate-700/80 p-5 overflow-y-auto z-40 md:z-20 shadow-2xl rounded-t-2xl md:rounded-none animate-in slide-in-from-bottom md:slide-in-from-right duration-200"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3.5 border-b border-slate-700/60">
        <div className="flex items-center gap-2">
          {selectedNode ? (
            <span className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
              <User className="w-4 h-4" />
            </span>
          ) : (
            <span className="p-1.5 rounded-lg bg-pink-500/20 text-pink-400">
              <Sparkles className="w-4 h-4" />
            </span>
          )}
          <h3 className="font-semibold text-sm text-white">
            {selectedNode ? 'Forensic Entity Profile' : 'Explainable Link Intelligence'}
          </h3>
        </div>
        <button
          onClick={handleClose}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          aria-label="Close panel"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {toastMessage && (
        <div className="mt-3 p-2.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-medium flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          {toastMessage}
        </div>
      )}

      {/* NODE PROFILE VIEW */}
      {selectedNode && (
        <div className="mt-4 space-y-4">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-400 font-semibold">
              {selectedNode.type} ENTITY
            </span>
            <h2 className="text-lg font-bold text-white mt-0.5">{selectedNode.label}</h2>
            {selectedNode.is_synthetic && (
              <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full">
                Synthetic Benchmark Data
              </span>
            )}
          </div>

          {/* Properties Grid */}
          <div className="bg-slate-900/60 rounded-xl p-3.5 border border-slate-800 space-y-2.5 text-xs">
            {selectedNode.phone && (
              <div className="flex items-center gap-2 text-slate-300">
                <Phone className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span className="font-mono text-cyan-300">{selectedNode.phone}</span>
              </div>
            )}
            {selectedNode.vehicle_plate && (
              <div className="flex items-center gap-2 text-slate-300">
                <Car className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="font-mono font-bold text-amber-300">{selectedNode.vehicle_plate}</span>
              </div>
            )}
            {selectedNode.latitude && (
              <div className="flex items-center gap-2 text-slate-300">
                <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="font-mono text-slate-300">
                  {selectedNode.latitude.toFixed(4)}, {selectedNode.longitude?.toFixed(4)}
                </span>
              </div>
            )}
            {selectedNode.aliases && selectedNode.aliases.length > 0 && (
              <div className="pt-2 border-t border-slate-800">
                <span className="text-slate-400 block text-[11px] mb-1">Known Aliases:</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedNode.aliases.map((al, idx) => (
                    <span key={idx} className="px-2 py-0.5 bg-slate-800 text-slate-200 rounded text-[11px]">
                      {al}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Additional metadata */}
          {selectedNode.properties && Object.keys(selectedNode.properties).length > 0 && (
            <div className="bg-slate-900/40 rounded-xl p-3 border border-slate-800/80">
              <h4 className="text-[11px] font-semibold text-slate-300 mb-2 uppercase tracking-wide">Investigative Context</h4>
              <div className="space-y-1.5 text-xs text-slate-300">
                {Object.entries(selectedNode.properties).map(([k, v]) => (
                  <div key={k} className="flex justify-between items-start gap-2">
                    <span className="text-slate-400 capitalize">{k.replace(/_/g, ' ')}:</span>
                    <span className="font-medium text-right text-slate-200">{String(v)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action to open full forensic dossier */}
          <button
            onClick={() => onOpenDossier && onOpenDossier(selectedNode.id)}
            className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all"
          >
            <FileText className="w-4 h-4" />
            <span>Open Evidence Dossier (FIR/CDR/Txn)</span>
          </button>
        </div>
      )}

      {/* EDGE EXPLAINABILITY & FEEDBACK VIEW */}
      {selectedEdge && (
        <div className="mt-4 space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-pink-400 font-semibold">
                Relationship: {selectedEdge.relationship}
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  selectedEdge.verdict === 'confirm'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : selectedEdge.verdict === 'reject'
                    ? 'bg-slate-700 text-slate-400'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}
              >
                {selectedEdge.verdict.toUpperCase()}
              </span>
            </div>
            
            {/* Interactive Connected Nodes Buttons */}
            <div className="flex items-center gap-2 mt-2">
              <button
                onClick={() => onOpenDossier && onOpenDossier(selectedEdge.source)}
                className="flex-1 p-2 bg-slate-900 border border-slate-700 hover:border-indigo-500 rounded-lg text-left text-xs transition-colors group"
                title="Inspect source entity dossier"
              >
                <span className="text-[10px] text-slate-500 block font-mono">SOURCE</span>
                <span className="font-semibold text-white group-hover:text-indigo-300 flex items-center justify-between">
                  <span className="truncate">{selectedEdge.source}</span>
                  <ArrowUpRight className="w-3 h-3 text-slate-400 group-hover:text-indigo-400 shrink-0" />
                </span>
              </button>
              <span className="text-slate-600 font-bold">→</span>
              <button
                onClick={() => onOpenDossier && onOpenDossier(selectedEdge.target)}
                className="flex-1 p-2 bg-slate-900 border border-slate-700 hover:border-indigo-500 rounded-lg text-left text-xs transition-colors group"
                title="Inspect target entity dossier"
              >
                <span className="text-[10px] text-slate-500 block font-mono">TARGET</span>
                <span className="font-semibold text-white group-hover:text-indigo-300 flex items-center justify-between">
                  <span className="truncate">{selectedEdge.target}</span>
                  <ArrowUpRight className="w-3 h-3 text-slate-400 group-hover:text-indigo-400 shrink-0" />
                </span>
              </button>
            </div>
          </div>

          {/* Confidence Score Meter */}
          <div className="bg-slate-900/60 rounded-xl p-3.5 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Confidence Score:</span>
              <span
                className={`font-mono font-bold ${
                  selectedEdge.confidence >= 0.8
                    ? 'text-emerald-400'
                    : selectedEdge.confidence >= 0.5
                    ? 'text-amber-400'
                    : 'text-rose-400'
                }`}
              >
                {(selectedEdge.confidence * 100).toFixed(0)}%
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  selectedEdge.confidence >= 0.8
                    ? 'bg-emerald-500'
                    : selectedEdge.confidence >= 0.5
                    ? 'bg-amber-500'
                    : 'bg-rose-500'
                }`}
                style={{ width: `${selectedEdge.confidence * 100}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 pt-1">
              <span>Evidence: <strong className="text-slate-200">{selectedEdge.evidence_type}</strong></span>
              <span>Report: <strong className="text-cyan-300 font-mono">{selectedEdge.properties?.report_id || 'NCRB-CFSL-2026'}</strong></span>
            </div>
            <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-800/80 flex items-center justify-between">
              <span className="flex items-center gap-1 text-slate-500">
                <Database className="w-3 h-3 text-emerald-400" />
                Vault Ref:
              </span>
              <span className="font-mono text-emerald-300">
                {selectedEdge.properties?.db_location?.table || 'graph_edges'}:{selectedEdge.properties?.db_location?.record_id || selectedEdge.id}
              </span>
            </div>
          </div>

          {/* Courtroom Justification Quote */}
          <div className="p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-500/20 relative">
            <div className="flex items-center gap-1.5 text-indigo-300 text-xs font-semibold mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              Courtroom Justification
            </div>
            <p className="text-xs text-slate-200 italic leading-relaxed">
              "{selectedEdge.justification || 'Direct investigative link established between subjects.'}"
            </p>
          </div>

          {/* Investigator Feedback Action Loop (CRITICAL HIGHEST-VALUE FEATURE) */}
          <div className="pt-3 border-t border-slate-700/80 space-y-2.5">
            <h4 className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-cyan-400" />
              Investigator Verification (Human-in-the-Loop)
            </h4>
            <p className="text-[11px] text-slate-400">
              Submit your verdict to retrain the confidence scoring model live.
            </p>

            <textarea
              value={feedbackNote}
              onChange={(e) => setFeedbackNote(e.target.value)}
              placeholder="Case note / Subpoena reference (optional)..."
              rows={2}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />

            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleFeedback('confirm')}
                disabled={submitting}
                className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors disabled:opacity-50"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Confirm
              </button>
              <button
                onClick={() => handleFeedback('needs_more_evidence')}
                disabled={submitting}
                className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg bg-amber-600/30 hover:bg-amber-600/40 text-amber-300 border border-amber-500/30 text-xs font-medium transition-colors disabled:opacity-50"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                Review
              </button>
              <button
                onClick={() => handleFeedback('reject')}
                disabled={submitting}
                className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 text-xs font-medium transition-colors disabled:opacity-50"
              >
                <XCircle className="w-3.5 h-3.5" />
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

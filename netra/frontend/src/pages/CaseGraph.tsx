import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCaseStore } from '../store/caseStore';
import { api, PredictedLinkItem, CentralityNode } from '../api/client';
import { GraphCanvas } from '../components/graph/GraphCanvas';
import { EntityPanel } from '../components/graph/EntityPanel';
import { EntityDossierModal } from '../components/evidence/EntityDossierModal';
import {
  Network,
  Sparkles,
  BrainCircuit,
  MapPin,
  HelpCircle,
  CheckCircle2,
  ArrowRight,
  Filter,
  Layers,
  ChevronRight
} from 'lucide-react';

export const CaseGraph: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const caseId = id || 'CASE-26189';
  const { loadGraph, graph, isLoading, error } = useCaseStore();
  const [predictedLinks, setPredictedLinks] = useState<PredictedLinkItem[]>([]);
  const [centralityList, setCentralityList] = useState<CentralityNode[]>([]);
  const [showPredictions, setShowPredictions] = useState(false);
  const [dossierEntityId, setDossierEntityId] = useState<string | null>(null);

  useEffect(() => {
    loadGraph(caseId);
    api.getPredictedLinks(caseId).then(setPredictedLinks).catch(() => {});
    api.getCentrality(caseId).then(setCentralityList).catch(() => {});
  }, [caseId]);

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-full overflow-hidden bg-[#0B0F17]">
      {/* Sub Header */}
      <div className="flex items-center justify-between px-6 py-3 bg-[#101726] border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-3">
          <Link to="/cases" className="text-xs text-slate-400 hover:text-white transition-colors">
            Cases
          </Link>
          <span className="text-slate-600">/</span>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-bold text-white tracking-wide">{caseId} Explorer</h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              {graph?.nodes.length || 0} Entities · {graph?.edges.length || 0} Links
            </span>
          </div>
        </div>

        {/* View Switcher & Predicted Links Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPredictions(!showPredictions)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              showPredictions
                ? 'bg-pink-600/30 text-pink-300 border-pink-500/40'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-pink-400" />
            <span>Predicted Links ({predictedLinks.length})</span>
          </button>

          <Link
            to={`/cases/${caseId}/map`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-medium transition-colors"
          >
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Geospatial Map</span>
          </Link>
        </div>
      </div>

      {/* Main Workspace (Graph Canvas + Entity Panel) */}
      <div className="flex-1 relative flex overflow-hidden">
        {/* Cytoscape Canvas */}
        <div className="flex-1 h-full p-3 sm:p-4">
          {isLoading ? (
            <div className="w-full h-full flex items-center justify-center bg-[#0A0E17] rounded-2xl border border-slate-800">
              <div className="flex flex-col items-center gap-2">
                <Network className="w-8 h-8 text-indigo-400 animate-spin" />
                <span className="text-xs text-slate-400">Loading NetworkX Forensic Graph...</span>
              </div>
            </div>
          ) : error ? (
            <div className="w-full h-full flex items-center justify-center bg-[#0A0E17] rounded-2xl border border-rose-900/30 text-rose-400 text-xs">
              Error loading graph: {error}
            </div>
          ) : (
            <GraphCanvas />
          )}
        </div>

        {/* Predicted Hidden Links Drawer Modal */}
        {showPredictions && (
          <div className="absolute top-4 left-4 z-30 w-80 max-h-[80vh] overflow-y-auto bg-[#121A2B]/95 backdrop-blur-xl border border-pink-500/30 rounded-2xl p-4 shadow-2xl space-y-3 animate-in fade-in slide-in-from-left">
            <div className="flex items-center justify-between pb-2 border-b border-slate-700/60">
              <div className="flex items-center gap-1.5 text-xs font-bold text-pink-300">
                <Sparkles className="w-4 h-4 text-pink-400" />
                Jaccard Link Suggestions
              </div>
              <button onClick={() => setShowPredictions(false)} className="text-xs text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <p className="text-[11px] text-slate-300 leading-relaxed">
              Pairs of suspects with zero direct recorded contact but high shared mutual associates:
            </p>

            <div className="space-y-2.5">
              {predictedLinks.map((pl, idx) => (
                <div key={idx} className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold text-white">
                    <span>{pl.source_label}</span>
                    <span className="text-pink-400">↔</span>
                    <span>{pl.target_label}</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-slate-400">Jaccard Score: <strong className="text-indigo-300">{pl.jaccard_score}</strong></span>
                    <span className="text-emerald-400 font-semibold font-mono">{(pl.confidence * 100).toFixed(0)}% Conf.</span>
                  </div>
                  <p className="text-[10px] text-slate-300 italic pt-1 border-t border-slate-800">
                    "{pl.justification}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Entity / Edge Explainability & Feedback Panel */}
        <EntityPanel onOpenDossier={(nodeId) => setDossierEntityId(nodeId)} />
      </div>

      {/* Interactive Forensic Dossier Modal */}
      {dossierEntityId && (
        <EntityDossierModal
          entityId={dossierEntityId}
          caseId={caseId}
          onClose={() => setDossierEntityId(null)}
          onSelectEntity={(newId) => setDossierEntityId(newId)}
        />
      )}
    </div>
  );
};

import { create } from 'zustand';
import { api, CaseItem, CaseGraph, GraphNodeData, GraphEdgeData } from '../api/client';

interface CaseState {
  currentCaseId: string;
  cases: CaseItem[];
  graph: CaseGraph | null;
  selectedNode: GraphNodeData | null;
  selectedEdge: GraphEdgeData | null;
  isLoading: boolean;
  error: string | null;
  setCaseId: (id: string) => void;
  selectNode: (node: GraphNodeData | null) => void;
  selectEdge: (edge: GraphEdgeData | null) => void;
  loadCases: () => Promise<void>;
  loadGraph: (caseId: string) => Promise<void>;
  updateEdgeVerdict: (edgeId: string, verdict: 'confirm' | 'reject' | 'needs_more_evidence', notes?: string) => Promise<void>;
}

export const useCaseStore = create<CaseState>((set, get) => ({
  currentCaseId: 'CASE-26189',
  cases: [],
  graph: null,
  selectedNode: null,
  selectedEdge: null,
  isLoading: false,
  error: null,

  setCaseId: (id: string) => set({ currentCaseId: id }),
  selectNode: (node: GraphNodeData | null) => set({ selectedNode: node, selectedEdge: null }),
  selectEdge: (edge: GraphEdgeData | null) => set({ selectedEdge: edge, selectedNode: null }),

  loadCases: async () => {
    try {
      const cases = await api.getCases();
      set({ cases });
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  loadGraph: async (caseId: string) => {
    set({ isLoading: true, error: null });
    try {
      const graph = await api.getGraph(caseId);
      set({ graph, isLoading: false, currentCaseId: caseId });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  updateEdgeVerdict: async (edgeId: string, verdict: 'confirm' | 'reject' | 'needs_more_evidence', notes?: string) => {
    try {
      const res = await api.submitEdgeFeedback(edgeId, verdict, notes);
      const currentGraph = get().graph;
      if (currentGraph) {
        const updatedEdges = currentGraph.edges.map((e) => {
          if (e.id === edgeId) {
            return {
              ...e,
              verdict,
              confidence: res.new_confidence,
            };
          }
          return e;
        });
        set({ graph: { ...currentGraph, edges: updatedEdges } });
        
        // Also update selectedEdge if it is the one being modified
        if (get().selectedEdge?.id === edgeId) {
          set({
            selectedEdge: {
              ...get().selectedEdge!,
              verdict,
              confidence: res.new_confidence,
            }
          });
        }
      }
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    }
  },
}));

import React, { useEffect, useRef, useState } from 'react';
import cytoscape, { Core, EventObject } from 'cytoscape';
import { useCaseStore } from '../../store/caseStore';
import { GraphNodeData, GraphEdgeData } from '../../api/client';
import { Maximize2, ZoomIn, ZoomOut, RefreshCw, Layers } from 'lucide-react';

interface GraphCanvasProps {
  onNodeSelect?: (node: GraphNodeData) => void;
  onEdgeSelect?: (edge: GraphEdgeData) => void;
}

export const GraphCanvas: React.FC<GraphCanvasProps> = ({ onNodeSelect, onEdgeSelect }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<Core | null>(null);
  const { graph, selectNode, selectEdge } = useCaseStore();
  const [layoutName, setLayoutName] = useState<'cose' | 'concentric' | 'circle'>('cose');

  useEffect(() => {
    if (!containerRef.current || !graph) return;

    // Convert nodes & edges to Cytoscape elements
    const elements: any[] = [];

    graph.nodes.forEach((node) => {
      let bg = '#6366F1'; // Default Indigo
      let shape = 'ellipse';
      const isBridge = node.label.includes('(Key Broker)') || (node.properties && node.properties.role?.includes('Bridge'));
      const isAnomaly = node.properties && node.properties.anomalous;

      if (node.type === 'PERSON') {
        bg = isBridge ? '#EC4899' : (isAnomaly ? '#F43F5E' : '#6366F1');
        shape = 'ellipse';
      } else if (node.type === 'PHONE') {
        bg = '#06B6D4'; // Cyan
        shape = 'diamond';
      } else if (node.type === 'VEHICLE') {
        bg = '#F59E0B'; // Amber
        shape = 'round-rectangle';
      } else if (node.type === 'LOCATION') {
        bg = '#10B981'; // Emerald
        shape = 'hexagon';
      } else if (node.type === 'ORGANIZATION') {
        bg = '#8B5CF6'; // Purple
        shape = 'octagon';
      } else if (node.type === 'ACCOUNT') {
        bg = '#14B8A6'; // Teal
        shape = 'round-triangle';
      } else if (node.type === 'DEVICE') {
        bg = '#F97316'; // Orange
        shape = 'round-diamond';
      }

      elements.push({
        group: 'nodes',
        data: {
          id: node.id,
          label: node.label.length > 22 ? `${node.label.slice(0, 20)}...` : node.label,
          fullData: node,
          type: node.type,
          bgColor: bg,
          shape: shape,
          borderWidth: isBridge ? 3 : 1,
          borderColor: isBridge ? '#F43F5E' : '#1E293B',
          size: isBridge ? 48 : 38,
        },
      });
    });

    graph.edges.forEach((edge) => {
      // Color-coding rule (§5 & §0.6 of strict build):
      // Green >0.8 or confirmed, Amber 0.5-0.8, Red <0.5, Grey rejected
      let edgeColor = '#F59E0B'; // Amber default
      let lineStyle = 'solid';
      let opacity = 0.85;

      if (edge.verdict === 'confirm' || edge.confidence >= 0.8) {
        edgeColor = '#10B981'; // Green
      } else if (edge.verdict === 'reject' || edge.confidence < 0.4) {
        edgeColor = '#64748B'; // Greyed out
        lineStyle = 'dashed';
        opacity = 0.35;
      } else if (edge.confidence < 0.6) {
        edgeColor = '#EF4444'; // Red low confidence
      }

      elements.push({
        group: 'edges',
        data: {
          id: edge.id,
          source: edge.source,
          target: edge.target,
          label: edge.relationship || '',
          fullData: edge,
          lineColor: edgeColor,
          lineStyle: lineStyle,
          opacity: opacity,
          width: edge.verdict === 'confirm' ? 2.5 : 1.8,
        },
      });
    });

    const cy = cytoscape({
      container: containerRef.current,
      elements: elements,
      style: [
        {
          selector: 'node',
          style: {
            'label': 'data(label)',
            'background-color': 'data(bgColor)',
            'shape': 'data(shape)' as any,
            'color': '#F1F5F9',
            'font-size': '10px',
            'font-family': 'Inter, sans-serif',
            'font-weight': 600,
            'text-valign': 'bottom',
            'text-margin-y': 6,
            'text-wrap': 'ellipsis',
            'text-max-width': '120px',
            'width': 'data(size)',
            'height': 'data(size)',
            'border-width': 'data(borderWidth)',
            'border-color': 'data(borderColor)',
            'overlay-opacity': 0,
            'transition-property': 'background-color, line-color, target-arrow-color',
            'transition-duration': '0.25s' as any,
          },
        },
        {
          selector: 'node:selected',
          style: {
            'border-width': 4,
            'border-color': '#38BDF8',
            'shadow-blur': 15,
            'shadow-color': '#38BDF8',
            'shadow-opacity': 0.8,
          },
        },
        {
          selector: 'edge',
          style: {
            'width': 'data(width)',
            'line-color': 'data(lineColor)',
            'target-arrow-color': 'data(lineColor)',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
            'line-style': 'data(lineStyle)' as any,
            'opacity': 'data(opacity)',
            'label': 'data(label)',
            'font-size': '8px',
            'font-family': 'JetBrains Mono, monospace',
            'color': '#94A3B8',
            'text-rotation': 'autorotate',
            'text-background-opacity': 0.8,
            'text-background-color': '#0E1524',
            'text-background-padding': '2px',
            'text-background-shape': 'roundrectangle',
          },
        },
        {
          selector: 'edge:selected',
          style: {
            'width': 4,
            'line-color': '#38BDF8',
            'target-arrow-color': '#38BDF8',
            'opacity': 1,
          },
        },
      ],
      layout: {
        name: layoutName,
        animate: true,
        animationDuration: 500,
        padding: 50,
      } as any,
      minZoom: 0.3,
      maxZoom: 3,
      wheelSensitivity: 0.25,
    });

    // Event listeners
    cy.on('tap', 'node', (evt: EventObject) => {
      const node = evt.target.data('fullData') as GraphNodeData;
      selectNode(node);
      if (onNodeSelect) onNodeSelect(node);
    });

    cy.on('tap', 'edge', (evt: EventObject) => {
      const edge = evt.target.data('fullData') as GraphEdgeData;
      selectEdge(edge);
      if (onEdgeSelect) onEdgeSelect(edge);
    });

    cy.on('tap', (evt: EventObject) => {
      if (evt.target === cy) {
        selectNode(null);
        selectEdge(null);
      }
    });

    cyRef.current = cy;

    return () => {
      cy.destroy();
    };
  }, [graph, layoutName]);

  const handleZoomIn = () => cyRef.current?.zoom(cyRef.current.zoom() * 1.25);
  const handleZoomOut = () => cyRef.current?.zoom(cyRef.current.zoom() * 0.8);
  const handleFit = () => cyRef.current?.fit(undefined, 50);

  return (
    <div className="relative w-full h-full min-h-[500px] bg-[#0A0E17] rounded-xl overflow-hidden border border-slate-800">
      {/* Canvas */}
      <div ref={containerRef} className="w-full h-full absolute inset-0" />

      {/* Floating Canvas Controls */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-1.5 bg-[#121A2B]/90 backdrop-blur-md p-1.5 rounded-xl border border-slate-700/70 shadow-xl">
        <button
          onClick={handleZoomIn}
          className="p-2 text-slate-300 hover:text-white hover:bg-slate-700/60 rounded-lg transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-2 text-slate-300 hover:text-white hover:bg-slate-700/60 rounded-lg transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={handleFit}
          className="p-2 text-slate-300 hover:text-white hover:bg-slate-700/60 rounded-lg transition-colors"
          title="Fit to Screen"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
        <div className="h-px bg-slate-700 my-0.5" />
        <button
          onClick={() => setLayoutName(layoutName === 'cose' ? 'concentric' : layoutName === 'concentric' ? 'circle' : 'cose')}
          className="p-2 text-indigo-400 hover:text-indigo-300 hover:bg-slate-700/60 rounded-lg transition-colors flex items-center justify-center"
          title={`Layout: ${layoutName} (click to cycle)`}
        >
          <Layers className="w-4 h-4" />
        </button>
      </div>

      {/* Graph Legend */}
      <div className="absolute bottom-4 left-4 z-20 hidden sm:flex items-center gap-4 bg-[#121A2B]/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-700/70 text-[11px] shadow-xl flex-wrap">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
          <span className="text-slate-300">Person</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-pink-500 ring-2 ring-pink-500/30"></span>
          <span className="text-pink-300 font-medium">Bridge Broker</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rotate-45 bg-cyan-400"></span>
          <span className="text-slate-300">Phone</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-amber-500"></span>
          <span className="text-slate-300">Vehicle</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500"></span>
          <span className="text-slate-300">Location</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-teal-500"></span>
          <span className="text-slate-300">Account</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-orange-500"></span>
          <span className="text-slate-300">Device</span>
        </div>
        <div className="h-3 w-px bg-slate-700" />
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 bg-emerald-400"></span>
          <span className="text-emerald-400">Confirmed Link</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 bg-slate-500 border-b border-dashed border-slate-500"></span>
          <span className="text-slate-400">Rejected</span>
        </div>
      </div>
    </div>
  );
};

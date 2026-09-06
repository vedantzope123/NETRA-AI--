import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api, CaseGraph, GraphNodeData } from '../api/client';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Network, Phone, Car, Building, User, ShieldAlert } from 'lucide-react';

// Custom Leaflet Icons using SVG pins
const createCustomIcon = (color: string) => {
  return L.divIcon({
    className: 'custom-pin',
    html: `<div style="background-color: ${color}; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px ${color};"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
};

export const CaseMap: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const caseId = id || 'CASE-26189';
  const [graph, setGraph] = useState<CaseGraph | null>(null);
  const [selectedGeoNode, setSelectedGeoNode] = useState<GraphNodeData | null>(null);

  useEffect(() => {
    api.getGraph(caseId).then(setGraph).catch(console.error);
  }, [caseId]);

  const geoNodes = graph?.nodes.filter((n) => n.latitude && n.longitude) || [];
  const centerLat = 28.5355;
  const centerLng = 77.2410;

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-full bg-[#0B0F17]">
      {/* Header Bar */}
      <div className="flex items-center justify-between px-6 py-3 bg-[#101726] border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-3">
          <Link to="/cases" className="text-xs text-slate-400 hover:text-white transition-colors">
            Cases
          </Link>
          <span className="text-slate-600">/</span>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-bold text-white tracking-wide">{caseId} Geospatial Grid</h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              {geoNodes.length} Geo-tagged Hotspots
            </span>
          </div>
        </div>

        <Link
          to={`/cases/${caseId}/graph`}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/40 text-xs font-semibold transition-colors"
        >
          <Network className="w-3.5 h-3.5" />
          Switch to Graph Explorer
        </Link>
      </div>

      {/* Main Map + Sidebar */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Leaflet Map */}
        <div className="flex-1 h-full relative">
          <MapContainer
            center={[centerLat, centerLng]}
            zoom={10}
            className="w-full h-full"
            style={{ background: '#0B0F17' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {geoNodes.map((node) => {
              const isBridge = node.label.includes('(Key Broker)') || (node.properties && node.properties.role?.includes('Bridge'));
              const isAnomaly = node.properties && node.properties.anomalous;
              const color = isBridge ? '#EC4899' : isAnomaly ? '#F43F5E' : node.type === 'LOCATION' ? '#10B981' : node.type === 'VEHICLE' ? '#F59E0B' : '#6366F1';

              return (
                <Marker
                  key={node.id}
                  position={[node.latitude!, node.longitude!]}
                  icon={createCustomIcon(color)}
                  eventHandlers={{
                    click: () => setSelectedGeoNode(node),
                  }}
                >
                  <Popup className="custom-popup">
                    <div className="p-1 space-y-1 text-xs">
                      <strong className="block font-bold text-slate-900">{node.label}</strong>
                      <span className="text-[10px] text-indigo-600 font-semibold">{node.type}</span>
                      <p className="text-[11px] text-slate-700">{node.properties?.role || 'Geo-coordinate match'}</p>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </div>

        {/* Geo List / Inspection Sheet */}
        <div className="w-full md:w-80 bg-[#121A2B] border-t md:border-t-0 md:border-l border-slate-800 p-4 overflow-y-auto space-y-3 shrink-0">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              Geo-Location Manifest
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">{geoNodes.length} Coordinates</span>
          </div>

          <div className="space-y-2">
            {geoNodes.map((n) => (
              <div
                key={n.id}
                onClick={() => setSelectedGeoNode(n)}
                className={`p-3 rounded-xl border transition-all cursor-pointer text-xs space-y-1 ${
                  selectedGeoNode?.id === n.id
                    ? 'bg-indigo-600/20 border-indigo-500 text-white'
                    : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white truncate max-w-[170px]">{n.label}</span>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-indigo-300">
                    {n.type}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 font-mono">
                  {n.latitude?.toFixed(4)}, {n.longitude?.toFixed(4)}
                </div>
                {n.properties?.role && (
                  <p className="text-[10px] text-emerald-400">{n.properties.role}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

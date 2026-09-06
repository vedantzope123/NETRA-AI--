import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, CentralityNode, CommunityCluster, CaseItem, AlertItem } from '../api/client';
import { useAuthStore } from '../store/authStore';
import {
  ShieldAlert, Users, FolderGit2, AlertTriangle, BrainCircuit, TrendingUp, Sparkles,
  ArrowRight, RefreshCw, Cpu, Network, CheckCircle2, FileUp, MapPin, Bot,
  Activity, Globe, Zap, Clock, Eye, Target
} from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, LineChart, Line,
  CartesianGrid, PieChart, Pie, Cell, RadialBarChart, RadialBar
} from 'recharts';
import { EntityDossierModal } from '../components/evidence/EntityDossierModal';

export const Dashboard: React.FC = () => {
  const { user } = useAuthStore();
  const [centralityData, setCentralityData] = useState<CentralityNode[]>([]);
  const [communityData, setCommunityData] = useState<CommunityCluster[]>([]);
  const [modelHistory, setModelHistory] = useState<Array<{ iteration: number; accuracy: number; samples: number; timestamp: string }>>([]);
  const [isRetraining, setIsRetraining] = useState(false);
  const [retrainSuccess, setRetrainSuccess] = useState<string | null>(null);
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState('CASE-26189');
  const [dossierEntityId, setDossierEntityId] = useState<string | null>(null);

  const loadDashboardData = async () => {
    try {
      const [cents, comms, hist, caseList] = await Promise.all([
        api.getCentrality(selectedCaseId),
        api.getCommunities(selectedCaseId),
        api.getModelHistory(),
        api.getCases(),
      ]);
      setCentralityData(cents);
      setCommunityData(comms);
      setModelHistory(hist);
      setCases(caseList);

      // Load alerts for the selected case
      try {
        const alertData = await api.getAlerts(selectedCaseId);
        setAlerts(alertData);
      } catch { setAlerts([]); }
    } catch (err) {
      console.error('Error loading dashboard:', err);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [selectedCaseId]);

  const handleRetrain = async () => {
    setIsRetraining(true);
    setRetrainSuccess(null);
    try {
      const res = await api.retrainConfidenceModel();
      setModelHistory(res.history);
      setRetrainSuccess(`Model Retrained! Accuracy: ${(res.accuracy * 100).toFixed(1)}% across ${res.total_samples} samples.`);
      setTimeout(() => setRetrainSuccess(null), 4000);
    } catch (err) {
      alert('Failed to retrain model');
    } finally {
      setIsRetraining(false);
    }
  };

  const CLUSTER_COLORS = ['#6366F1', '#EC4899', '#06B6D4', '#F59E0B', '#10B981'];

  // Compute aggregate stats
  const totalEntities = cases.reduce((sum, c) => sum + (c.node_count || 0), 0);
  const totalLinks = cases.reduce((sum, c) => sum + (c.edge_count || 0), 0);
  const criticalAlerts = alerts.filter(a => a.severity === 'CRITICAL').length;
  const statusDistribution = [
    { name: 'Active', value: cases.filter(c => c.status === 'ACTIVE').length, color: '#10B981' },
    { name: 'Under Investigation', value: cases.filter(c => c.status === 'UNDER_INVESTIGATION').length, color: '#F59E0B' },
    { name: 'Critical', value: cases.filter(c => c.status === 'CRITICAL').length, color: '#EF4444' },
    { name: 'Closed', value: cases.filter(c => c.status === 'CLOSED').length, color: '#64748B' },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#121A2B] p-5 rounded-2xl border border-slate-800 shadow-xl animate-fade-in-down">
        <div className="space-y-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-wide">
              Forensic Intelligence Command
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30 font-mono">
              Synthetic Data Benchmark
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Welcome back, {user?.full_name || 'Officer'}. Monitoring {cases.length} active operations across India.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Case Selector */}
          <select
            value={selectedCaseId}
            onChange={(e) => setSelectedCaseId(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500 font-mono"
          >
            {cases.map(c => (
              <option key={c.id} value={c.id}>{c.id}</option>
            ))}
          </select>
          <Link to="/upload"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
          >
            <FileUp className="w-3.5 h-3.5 text-indigo-400" />
            Ingest FIR
          </Link>
          <Link to={`/cases/${selectedCaseId}/graph`}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all"
          >
            <Network className="w-3.5 h-3.5" />
            Explore Graph
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-[#121A2B] p-4 rounded-2xl border border-slate-800/80 space-y-2 animate-fade-in-up">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Active Cases</span>
            <div className="p-2 rounded-lg bg-cyan-600/10 text-cyan-400">
              <FolderGit2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white kpi-number">{cases.length}</div>
          <span className="text-[11px] text-cyan-400 font-medium">Multi-State Operations</span>
        </div>

        <div className="bg-[#121A2B] p-4 rounded-2xl border border-slate-800/80 space-y-2 animate-fade-in-up delay-100">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Tracked Entities</span>
            <div className="p-2 rounded-lg bg-indigo-600/10 text-indigo-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white kpi-number">{totalEntities || 75}</div>
          <span className="text-[11px] text-emerald-400 font-medium">{communityData.length || 3} Detected Clusters</span>
        </div>

        <div className="bg-[#121A2B] p-4 rounded-2xl border border-slate-800/80 space-y-2 animate-fade-in-up delay-200">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Evidence Links</span>
            <div className="p-2 rounded-lg bg-emerald-600/10 text-emerald-400">
              <Network className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white kpi-number">{totalLinks || 80}</div>
          <span className="text-[11px] text-slate-400">With AI Justifications</span>
        </div>

        <div className="bg-[#121A2B] p-4 rounded-2xl border border-slate-800/80 space-y-2 animate-fade-in-up delay-300">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Syndicate Bridges</span>
            <div className="p-2 rounded-lg bg-pink-600/10 text-pink-400">
              <BrainCircuit className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-pink-400 kpi-number">{centralityData.filter(c => c.is_bridge).length || 2}</div>
          <span className="text-[11px] text-slate-400">{centralityData.filter(c => c.is_bridge).map(c => c.label.split(' ')[0]).join(' & ') || 'Key Brokers'}</span>
        </div>

        <div className="bg-[#121A2B] p-4 rounded-2xl border border-slate-800/80 space-y-2 animate-fade-in-up delay-400">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Critical Alerts</span>
            <div className="p-2 rounded-lg bg-rose-600/10 text-rose-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-rose-400 kpi-number">{criticalAlerts || alerts.length}</div>
          <Link to="/alerts" className="text-[11px] text-rose-400 hover:text-rose-300 font-medium">
            View All Alerts →
          </Link>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chart 1: Key Influencers */}
        <div className="lg:col-span-6 bg-[#121A2B] p-5 rounded-2xl border border-slate-800 space-y-4 animate-fade-in-up delay-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <BrainCircuit className="w-4 h-4 text-indigo-400" />
                Key Syndicate Bridges (Betweenness Centrality)
              </h3>
              <p className="text-[11px] text-slate-400">Identifies middlemen and coordinators across sub-gangs</p>
            </div>
            <Link to={`/cases/${selectedCaseId}/graph`} className="text-xs text-indigo-400 hover:text-indigo-300 font-medium">
              View Graph →
            </Link>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={centralityData.slice(0, 6)} layout="vertical" margin={{ left: 20, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" horizontal={false} />
                <XAxis type="number" stroke="#64748B" tick={{ fontSize: 10 }} />
                <YAxis dataKey="label" type="category" stroke="#94A3B8" tick={{ fontSize: 10 }} width={90} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: 8, fontSize: 11 }}
                  formatter={(val: any) => [`${(val * 100).toFixed(1)}%`, 'Betweenness']}
                />
                <Bar dataKey="betweenness" fill="#6366F1" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Model Accuracy */}
        <div className="lg:col-span-6 bg-[#121A2B] p-5 rounded-2xl border border-slate-800 space-y-4 animate-fade-in-up delay-300">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                Scorer Accuracy Over Feedback Iterations
              </h3>
              <p className="text-[11px] text-slate-400">Scikit-learn Logistic Regression retrained on verdicts</p>
            </div>
            <button
              onClick={handleRetrain}
              disabled={isRetraining}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 ${isRetraining ? 'animate-spin' : ''}`} />
              Retrain Scorer
            </button>
          </div>

          {retrainSuccess && (
            <div className="p-2 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-medium flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              {retrainSuccess}
            </div>
          )}

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={modelHistory} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="timestamp" stroke="#64748B" tick={{ fontSize: 9 }} />
                <YAxis domain={[0.6, 1.0]} stroke="#64748B" tick={{ fontSize: 10 }} tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: 8, fontSize: 11 }}
                  formatter={(val: any) => [`${(val * 100).toFixed(1)}%`, 'Accuracy']}
                />
                <Line type="monotone" dataKey="accuracy" stroke="#10B981" strokeWidth={3} dot={{ fill: '#10B981', r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 3: Communities + Case Distribution + Quick Links */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Syndicate Cells */}
        <div className="lg:col-span-5 bg-[#121A2B] p-5 rounded-2xl border border-slate-800 space-y-4 animate-fade-in-up delay-300">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Network className="w-4 h-4 text-cyan-400" />
            Detected Syndicate Sub-Groups
          </h3>

          <div className="space-y-3">
            {communityData.map((comm, idx) => (
              <div key={comm.community_id} className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                    Cell #{comm.community_id}
                  </span>
                  <span className="text-xs text-slate-400">{comm.size} Members</span>
                </div>
                <h4 className="text-xs font-semibold text-slate-200">{comm.name}</h4>
                <div className="text-[11px] text-slate-400 truncate">
                  {comm.nodes.map((n) => n.label).join(', ')}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Case Status Distribution Pie */}
        <div className="lg:col-span-3 bg-[#121A2B] p-5 rounded-2xl border border-slate-800 space-y-4 animate-fade-in-up delay-400">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            Case Status Overview
          </h3>
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusDistribution} cx="50%" cy="50%" innerRadius={40} outerRadius={65}
                  paddingAngle={3} dataKey="value" stroke="none"
                >
                  {statusDistribution.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: 8, fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-2 justify-center">
            {statusDistribution.map(d => (
              <div key={d.name} className="flex items-center gap-1.5 text-[10px] text-slate-400">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                {d.name} ({d.value})
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions Panel */}
        <div className="lg:col-span-4 space-y-4">
          {/* Recent Alerts Mini Feed */}
          <div className="bg-[#121A2B] p-5 rounded-2xl border border-slate-800 space-y-3 animate-fade-in-up delay-500">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                Latest Alerts
              </h3>
              <Link to="/alerts" className="text-[10px] text-indigo-400 hover:text-indigo-300 font-medium">View All →</Link>
            </div>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {alerts.slice(0, 3).map((alt) => (
                <div key={alt.id} className="p-2 rounded-lg bg-slate-900/60 border border-slate-800 text-xs space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${alt.severity === 'CRITICAL' ? 'bg-rose-400 animate-pulse' : 'bg-amber-400'}`} />
                    <span className="text-white font-medium truncate">{alt.title}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 truncate pl-3.5">{alt.alert_type}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Voice Assistant CTA */}
          <div className="bg-[#121A2B] p-5 rounded-2xl border border-slate-800 space-y-3 animate-fade-in-up delay-600">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Bot className="w-4 h-4 text-pink-400" />
              Netra+ AI Assistant
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Ask "Who connects Sanjay to Rahul?" or speak directly to investigate.
            </p>
            <Link to="/assistant"
              className="w-full py-2.5 px-4 bg-gradient-to-r from-pink-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-white rounded-xl text-xs font-semibold text-center transition-all shadow-lg shadow-pink-600/20 block"
            >
              Launch Assistant →
            </Link>
          </div>
        </div>
      </div>

      {/* Interactive Entity Dossier Modal */}
      {dossierEntityId && (
        <EntityDossierModal
          entityId={dossierEntityId}
          caseId={selectedCaseId}
          onClose={() => setDossierEntityId(null)}
          onSelectEntity={(newId) => setDossierEntityId(newId)}
        />
      )}
    </div>
  );
};

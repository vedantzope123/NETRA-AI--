import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, CaseItem } from '../api/client';
import { FolderGit2, Plus, Network, MapPin, Users, Calendar, ShieldCheck, X, Search, Filter, AlertTriangle, Shield, Eye } from 'lucide-react';

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  'ACTIVE': { label: 'Active', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
  'UNDER_INVESTIGATION': { label: 'Investigating', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
  'CRITICAL': { label: 'Critical', color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/30' },
  'CLOSED': { label: 'Closed', color: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/30' },
};

export const Cases: React.FC = () => {
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [firNumber, setFirNumber] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const fetchCases = async () => {
    try {
      const data = await api.getCases();
      setCases(data);
    } catch (err) {
      console.error('Failed to load cases', err);
    }
  };

  useEffect(() => {
    fetchCases();
  }, []);

  const handleCreateCase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    setLoading(true);
    try {
      await api.createCase({ title, fir_number: firNumber, description });
      setIsModalOpen(false);
      setTitle('');
      setFirNumber('');
      setDescription('');
      fetchCases();
    } catch (err) {
      alert('Failed to create case');
    } finally {
      setLoading(false);
    }
  };

  const filteredCases = cases.filter((c) => {
    const matchesSearch = searchQuery === '' ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.fir_number && c.fir_number.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.description && c.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusCounts = {
    ALL: cases.length,
    ACTIVE: cases.filter(c => c.status === 'ACTIVE').length,
    UNDER_INVESTIGATION: cases.filter(c => c.status === 'UNDER_INVESTIGATION').length,
    CRITICAL: cases.filter(c => c.status === 'CRITICAL').length,
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in-down">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-wide flex items-center gap-2.5">
            <FolderGit2 className="w-6 h-6 text-indigo-400" />
            Investigative Case Repository
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {cases.length} criminal syndicate operations and forensic graph registries
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all self-start sm:self-auto btn-primary-glow"
          >
            <Plus className="w-4 h-4" />
            Create New Case
          </button>
        </div>
      </div>

      {/* Search + Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 animate-fade-in-up">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by case ID, title, FIR number, or description..."
            className="w-full bg-[#121A2B] border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        {/* Status Filter Pills */}
        <div className="flex items-center gap-1.5 bg-[#121A2B] p-1 rounded-xl border border-slate-800 text-xs shrink-0">
          {[
            { key: 'ALL', label: 'All' },
            { key: 'ACTIVE', label: 'Active' },
            { key: 'CRITICAL', label: 'Critical' },
            { key: 'UNDER_INVESTIGATION', label: 'Investigating' },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setStatusFilter(f.key)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors whitespace-nowrap ${
                statusFilter === f.key
                  ? f.key === 'CRITICAL'
                    ? 'bg-rose-600 text-white shadow'
                    : 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {f.label}
              <span className="ml-1.5 text-[10px] opacity-70">
                ({statusCounts[f.key as keyof typeof statusCounts] || 0})
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Case Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredCases.map((c, idx) => {
          const statusConf = STATUS_CONFIG[c.status] || STATUS_CONFIG['ACTIVE'];
          const isCritical = c.status === 'CRITICAL';

          return (
            <div
              key={c.id}
              className={`bg-[#121A2B] rounded-2xl border p-5 shadow-xl hover:border-indigo-500/40 transition-all flex flex-col justify-between space-y-4 group feature-card animate-fade-in-up ${
                isCritical ? 'border-rose-500/30' : 'border-slate-800'
              }`}
              style={{ animationDelay: `${idx * 0.05}s` }}
            >
              <div className="space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-bold">
                      {c.id}
                    </span>
                    {c.fir_number && (
                      <span className="text-[10px] text-slate-400 font-mono">
                        {c.fir_number}
                      </span>
                    )}
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusConf.bg} ${statusConf.color} border ${statusConf.border} ${isCritical ? 'badge-critical' : ''}`}>
                    {isCritical && <AlertTriangle className="w-3 h-3 inline mr-1" />}
                    {statusConf.label}
                  </span>
                </div>

                <h2 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors leading-snug">
                  {c.title}
                </h2>

                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {c.description || 'Forensic investigation underway.'}
                </p>
              </div>

              {/* Case Metrics & Actions */}
              <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-4 text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{c.node_count || 0} Entities</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Network className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{c.edge_count || 0} Links</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    to={`/cases/${c.id}/map`}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors flex items-center gap-1.5"
                  >
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                    Map
                  </Link>
                  <Link
                    to={`/cases/${c.id}/graph`}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/40 text-xs font-semibold transition-colors flex items-center gap-1.5"
                  >
                    <Network className="w-3.5 h-3.5 text-indigo-400" />
                    Explorer
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredCases.length === 0 && (
        <div className="text-center py-16 space-y-3">
          <Search className="w-8 h-8 mx-auto text-slate-600" />
          <p className="text-sm text-slate-400">No cases match your search criteria.</p>
          <button onClick={() => { setSearchQuery(''); setStatusFilter('ALL'); }}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-medium">
            Clear Filters
          </button>
        </div>
      )}

      {/* Create Case Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121A2B] rounded-2xl border border-slate-800 p-6 max-w-md w-full shadow-2xl space-y-4 animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Create Forensic Case</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCase} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Operation / Case Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Operation Hawk - Digital Extortion Ring"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">FIR / Subpoena Number</label>
                <input
                  type="text"
                  value={firNumber}
                  onChange={(e) => setFirNumber(e.target.value)}
                  placeholder="e.g. FIR-112/2026-CRIME"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Description & Incident Summary</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief synopsis of criminal network and jurisdictional scope..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-medium hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-lg shadow-indigo-600/30 disabled:opacity-50"
                >
                  {loading ? 'Registering...' : 'Register Case'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

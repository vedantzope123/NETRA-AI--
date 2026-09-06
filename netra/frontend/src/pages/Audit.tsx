import React, { useEffect, useState } from 'react';
import { api, AuditLogItem } from '../api/client';
import { useAuthStore } from '../store/authStore';
import { FileText, Shield, Eye, EyeOff, Lock, Clock, User, Filter, RefreshCw, AlertCircle } from 'lucide-react';

export const Audit: React.FC = () => {
  const { user } = useAuthStore();
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [maskPii, setMaskPii] = useState(true);
  const [loading, setLoading] = useState(false);
  const [unmaskWarning, setUnmaskWarning] = useState<string | null>(null);

  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      const data = await api.getAuditLog();
      setLogs(data);
    } catch (err: any) {
      console.error('Failed to load audit logs', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const handleToggleRedaction = async () => {
    const nextState = !maskPii;
    try {
      await api.toggleRedaction('Forensic Export Data', nextState);
      setMaskPii(nextState);
      if (!nextState) {
        setUnmaskWarning('Notice: PII unmasking event has been recorded in the immutable audit log.');
        setTimeout(() => setUnmaskWarning(null), 5000);
      }
      fetchAuditLogs();
    } catch (err) {
      alert('Failed to toggle PII redaction');
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="p-12 text-center text-slate-400 space-y-3">
        <Lock className="w-8 h-8 mx-auto text-rose-500" />
        <h2 className="text-base font-bold text-white">Access Restricted — Admin Only</h2>
        <p className="text-xs">Your current role '{user?.role}' does not have permission to view the audit trail.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Header with PII Redaction Switch */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-wide flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-indigo-400" />
            Immutable Audit Trail & Governance
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Section 7 Compliance — Full forensic activity logging, IP addresses, and authorization timestamps
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* PII Redaction Toggle */}
          <button
            onClick={handleToggleRedaction}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
              maskPii
                ? 'bg-emerald-600/20 text-emerald-300 border-emerald-500/40'
                : 'bg-rose-600/20 text-rose-300 border-rose-500/40'
            }`}
          >
            {maskPii ? <EyeOff className="w-4 h-4 text-emerald-400" /> : <Eye className="w-4 h-4 text-rose-400" />}
            <span>PII Redaction: {maskPii ? 'MASKED' : 'UNMASKED'}</span>
          </button>

          <button
            onClick={fetchAuditLogs}
            disabled={loading}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-colors"
            title="Refresh logs"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {unmaskWarning && (
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {unmaskWarning}
        </div>
      )}

      {/* Desktop Table (≥768px) */}
      <div className="hidden md:block bg-[#121A2B] rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-[#0E1524] text-slate-400 font-mono text-[11px] uppercase border-b border-slate-800">
            <tr>
              <th className="px-5 py-3.5">Timestamp</th>
              <th className="px-5 py-3.5">Officer / Email</th>
              <th className="px-5 py-3.5">Role</th>
              <th className="px-5 py-3.5">Action</th>
              <th className="px-5 py-3.5">Resource</th>
              <th className="px-5 py-3.5">Client IP</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                <td className="px-5 py-3 font-mono text-slate-400">
                  {new Date(log.timestamp).toLocaleString()}
                </td>
                <td className="px-5 py-3 font-medium text-white">
                  {maskPii && log.user_email ? log.user_email.replace(/^(.{3}).*@/, '$1***@') : log.user_email || 'System'}
                </td>
                <td className="px-5 py-3">
                  <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-mono text-[10px] uppercase">
                    {log.role || 'Officer'}
                  </span>
                </td>
                <td className="px-5 py-3 font-mono font-semibold text-slate-200">
                  {log.action}
                </td>
                <td className="px-5 py-3 font-mono text-cyan-400 truncate max-w-xs">
                  {log.resource}
                </td>
                <td className="px-5 py-3 font-mono text-slate-400">
                  {log.ip_address || '127.0.0.1'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Stacked Cards (<768px) (§0.5 of strict build) */}
      <div className="md:hidden space-y-3">
        {logs.map((log) => (
          <div key={log.id} className="bg-[#121A2B] p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="font-mono">{new Date(log.timestamp).toLocaleTimeString()}</span>
              <span className="font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300">{log.role || 'Officer'}</span>
            </div>
            <div className="font-bold text-white">{log.action}</div>
            <div className="text-[11px] text-cyan-400 font-mono truncate">{log.resource}</div>
            <div className="flex justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800">
              <span>{maskPii && log.user_email ? log.user_email.replace(/^(.{3}).*@/, '$1***@') : log.user_email}</span>
              <span>IP: {log.ip_address || '127.0.0.1'}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

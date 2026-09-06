import React, { useEffect, useState } from 'react';
import { api, UserProfile } from '../api/client';
import { useAuthStore } from '../store/authStore';
import { Settings as SettingsIcon, Users, UserPlus, Shield, Lock, CheckCircle2, AlertCircle } from 'lucide-react';

export const Settings: React.FC = () => {
  const { user } = useAuthStore();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newFullName, setNewFullName] = useState('');
  const [newRole, setNewRole] = useState('investigator');
  const [newBadge, setNewBadge] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      const data = await api.getUsers();
      setUsers(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !newPassword || !newFullName) return;
    setLoading(true);
    setError(null);
    try {
      await api.createUser({
        email: newEmail,
        password: newPassword,
        full_name: newFullName,
        role: newRole,
        badge_number: newBadge,
      });
      setSuccess(`Officer account created for ${newFullName} (${newRole.toUpperCase()})`);
      setTimeout(() => setSuccess(null), 4000);
      setNewEmail('');
      setNewPassword('');
      setNewFullName('');
      setNewBadge('');
      fetchUsers();
    } catch (err: any) {
      setError(err.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="p-12 text-center text-slate-400 space-y-3">
        <Lock className="w-8 h-8 mx-auto text-rose-500" />
        <h2 className="text-base font-bold text-white">Access Restricted — Admin Only</h2>
        <p className="text-xs">Only administrators can manage users and role access controls.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto px-4 sm:px-6 py-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-wide flex items-center gap-2.5">
          <SettingsIcon className="w-6 h-6 text-cyan-400" />
          Access Governance & User Roles
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Role-Based Access Control (RBAC) & Law Enforcement Account Provisioning
        </p>
      </div>

      {success && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-medium flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          {success}
        </div>
      )}

      {error && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Create User Form */}
        <div className="lg:col-span-5 bg-[#121A2B] rounded-2xl border border-slate-800 p-6 shadow-xl space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-indigo-400" />
            Provision New Officer Account
          </h2>

          <form onSubmit={handleCreateUser} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Full Name & Rank</label>
              <input
                type="text"
                required
                value={newFullName}
                onChange={(e) => setNewFullName(e.target.value)}
                placeholder="e.g. Inspector Meera Rawat"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Official Email ID</label>
              <input
                type="email"
                required
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="officer@netra.gov.in"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Password</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Role Authorization</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="investigator">Investigator</option>
                  <option value="analyst">Analyst</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Badge Number</label>
                <input
                  type="text"
                  value={newBadge}
                  onChange={(e) => setNewBadge(e.target.value)}
                  placeholder="NCRB-DL-412"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50 mt-2"
            >
              {loading ? 'Creating Account...' : 'Register Authorized Officer'}
            </button>
          </form>
        </div>

        {/* Existing Users List */}
        <div className="lg:col-span-7 bg-[#121A2B] rounded-2xl border border-slate-800 p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-400" />
              Active System Users ({users.length})
            </h2>
            <span className="text-[10px] font-mono text-slate-400">RBAC Enforced</span>
          </div>

          <div className="space-y-3">
            {users.map((u) => (
              <div key={u.id} className="p-3.5 bg-slate-900/60 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                <div className="space-y-0.5">
                  <div className="font-bold text-white">{u.full_name}</div>
                  <div className="text-slate-400 font-mono text-[11px]">{u.email}</div>
                  {u.badge_number && (
                    <span className="text-[10px] text-slate-500 font-mono">Badge: {u.badge_number}</span>
                  )}
                </div>

                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    u.role === 'admin'
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                      : u.role === 'analyst'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                  }`}
                >
                  {u.role}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

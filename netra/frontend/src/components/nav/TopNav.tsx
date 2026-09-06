import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Shield, User as UserIcon, LogOut, FileText, Settings as SettingsIcon } from 'lucide-react';

export const TopNav: React.FC = () => {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Cases', path: '/cases' },
    { name: 'Upload', path: '/upload' },
    { name: 'Alerts', path: '/alerts' },
    { name: 'Assistant', path: '/assistant' },
  ];

  return (
    <header className="hidden md:flex items-center justify-between h-16 px-6 bg-[#0E1524]/90 backdrop-blur-md border-b border-slate-800/80 sticky top-0 z-50">
      {/* Brand / Logo */}
      <div className="flex items-center gap-8">
        <Link to="/dashboard" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-all">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <span className="font-extrabold text-lg tracking-wider text-white flex items-center gap-1">
            NETRA
            <span className="text-pink-400 font-black text-xl leading-none animate-pulse">+</span>
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path || (link.path !== '/dashboard' && location.pathname.startsWith(link.path));
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3.5 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <span>{link.name}</span>
                {link.badge && (
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-pink-500/20 text-pink-300 border border-pink-500/40 animate-pulse">
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Avatar / Profile Dropdown Menu */}
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex items-center gap-2.5 p-1.5 rounded-full hover:bg-slate-800/80 transition-colors border border-transparent hover:border-slate-700 focus:outline-none"
          aria-label="User menu"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-semibold text-white uppercase shadow">
            {user?.full_name ? user.full_name.charAt(0) : 'U'}
          </div>
          <span className="text-xs text-slate-400">▾</span>
        </button>

        {menuOpen && (
          <div className="absolute right-0 mt-2 w-56 bg-[#161F30] rounded-xl shadow-2xl border border-slate-700/80 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
            <div className="px-4 py-2.5 border-b border-slate-700/60">
              <p className="text-xs font-semibold text-white truncate">{user?.full_name || 'Investigator'}</p>
              <p className="text-[11px] text-indigo-400 uppercase tracking-wider font-mono mt-0.5">{user?.role || 'Officer'}</p>
            </div>

            {user?.role === 'admin' && (
              <>
                <Link
                  to="/audit"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors"
                >
                  <FileText className="w-3.5 h-3.5 text-indigo-400" />
                  Audit
                </Link>
                <Link
                  to="/settings"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors"
                >
                  <SettingsIcon className="w-3.5 h-3.5 text-cyan-400" />
                  Settings
                </Link>
              </>
            )}

            <button
              onClick={() => {
                setMenuOpen(false);
                logout();
              }}
              className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors border-t border-slate-700/50 mt-1"
            >
              <LogOut className="w-3.5 h-3.5" />
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

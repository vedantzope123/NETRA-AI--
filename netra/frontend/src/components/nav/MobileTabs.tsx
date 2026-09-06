import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Home, FolderGit2, AlertTriangle, MessageSquareCode, Menu as MenuIcon, X, FileText, Settings as SettingsIcon, LogOut } from 'lucide-react';

export const MobileTabs: React.FC = () => {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const tabs = [
    { name: 'Home', path: '/dashboard', icon: Home },
    { name: 'Cases', path: '/cases', icon: FolderGit2 },
    { name: 'Alerts', path: '/alerts', icon: AlertTriangle },
    { name: 'Assistant', path: '/assistant', icon: MessageSquareCode },
  ];

  return (
    <>
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#0E1524]/95 backdrop-blur-lg border-t border-slate-800 z-50 flex items-center justify-around px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = location.pathname === tab.path || (tab.path !== '/dashboard' && location.pathname.startsWith(tab.path));
          return (
            <Link
              key={tab.name}
              to={tab.path}
              className={`flex flex-col items-center justify-center w-14 py-1 gap-1 text-[11px] font-medium transition-colors ${
                isActive ? 'text-indigo-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
              <span>{tab.name}</span>
            </Link>
          );
        })}

        <button
          onClick={() => setDrawerOpen(true)}
          className="flex flex-col items-center justify-center w-14 py-1 gap-1 text-[11px] font-medium text-slate-400 hover:text-slate-200"
        >
          <MenuIcon className="w-5 h-5" />
          <span>Menu</span>
        </button>
      </nav>

      {/* Mobile Menu Drawer / Sheet */}
      {drawerOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex justify-end animate-in fade-in">
          <div className="w-4/5 max-w-xs bg-[#121A2B] h-full p-6 flex flex-col justify-between border-l border-slate-800 shadow-2xl">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-xs text-white">N+</div>
                  <span className="font-extrabold text-white tracking-wider">NETRA+</span>
                </div>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="p-1 rounded-md text-slate-400 hover:text-white"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-4 p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
                <p className="text-xs font-semibold text-white">{user?.full_name || 'Investigator'}</p>
                <p className="text-[11px] text-indigo-400 font-mono mt-0.5 uppercase">{user?.role || 'Officer'}</p>
                <p className="text-[11px] text-slate-400 truncate mt-0.5">{user?.email}</p>
              </div>

              <div className="mt-6 space-y-1">

                <Link
                  to="/upload"
                  onClick={() => setDrawerOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-300 hover:bg-slate-800/80 hover:text-white"
                >
                  Document Ingestion
                </Link>

                {user?.role === 'admin' && (
                  <>
                    <Link
                      to="/audit"
                      onClick={() => setDrawerOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-300 hover:bg-slate-800/80 hover:text-white"
                    >
                      <FileText className="w-4 h-4 text-indigo-400" />
                      Audit Trail
                    </Link>
                    <Link
                      to="/settings"
                      onClick={() => setDrawerOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-300 hover:bg-slate-800/80 hover:text-white"
                    >
                      <SettingsIcon className="w-4 h-4 text-cyan-400" />
                      Settings & Roles
                    </Link>
                  </>
                )}
              </div>
            </div>

            <button
              onClick={() => {
                setDrawerOpen(false);
                logout();
              }}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-rose-500/10 text-rose-400 font-medium text-sm border border-rose-500/20 hover:bg-rose-500/20"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      )}
    </>
  );
};

import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from './store/authStore';

// Components
import { TopNav } from './components/nav/TopNav';
import { MobileTabs } from './components/nav/MobileTabs';

// Pages (All 12 exact pages from §0.2)
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Cases } from './pages/Cases';
import { CaseGraph } from './pages/CaseGraph';
import { CaseMap } from './pages/CaseMap';
import { EntityProfile } from './pages/EntityProfile';
import { Upload } from './pages/Upload';
import { Alerts } from './pages/Alerts';
import { Assistant } from './pages/Assistant';
import { Audit } from './pages/Audit';
import { Settings } from './pages/Settings';

// Route Protection Component
const ProtectedRoute: React.FC<{ children: React.ReactNode; requiredRole?: string }> = ({
  children,
  requiredRole,
}) => {
  const { isAuthenticated, user } = useAuthStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user?.role !== requiredRole && user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  const location = useLocation();
  const { fetchProfile, isAuthenticated } = useAuthStore();
  const isPublicPage = location.pathname === '/' || location.pathname === '/login';

  useEffect(() => {
    if (isAuthenticated) {
      fetchProfile();
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#0B0F17] text-slate-100 flex flex-col font-sans">
      {/* Shell Nav Bars (only visible when authenticated or on app pages) */}
      {!isPublicPage && <TopNav />}

      <main className={`flex-1 ${!isPublicPage ? 'pb-20 md:pb-6' : ''}`}>
        <Routes>
          {/* Public Pages */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/hackathon" element={<Navigate to="/dashboard" replace />} />

          {/* App Shell Pages (Authenticated) */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cases"
            element={
              <ProtectedRoute>
                <Cases />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cases/:id/graph"
            element={
              <ProtectedRoute>
                <CaseGraph />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cases/:id/map"
            element={
              <ProtectedRoute>
                <CaseMap />
              </ProtectedRoute>
            }
          />
          <Route
            path="/entity/:id"
            element={
              <ProtectedRoute>
                <EntityProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/upload"
            element={
              <ProtectedRoute>
                <Upload />
              </ProtectedRoute>
            }
          />
          <Route
            path="/alerts"
            element={
              <ProtectedRoute>
                <Alerts />
              </ProtectedRoute>
            }
          />
          <Route
            path="/assistant"
            element={
              <ProtectedRoute>
                <Assistant />
              </ProtectedRoute>
            }
          />
          <Route
            path="/audit"
            element={
              <ProtectedRoute requiredRole="admin">
                <Audit />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute requiredRole="admin">
                <Settings />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Mobile Bottom Tab Bar */}
      {!isPublicPage && <MobileTabs />}
    </div>
  );
};

export default App;

import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ClerkProvider, useAuth } from '@clerk/clerk-react';
import LandingPage from './pages/LandingPage';
import LuminalLanding from './pages/LuminalLanding';
import LuminalMatchSearch from './pages/LuminalMatchSearch';
import LuminalExpertPortal from './pages/LuminalExpertPortal';
import ExpertListing from './pages/ExpertListing';
import ExpertDetail from './pages/ExpertDetail';
import PublicBookingPage from './pages/PublicBookingPage';
import ExpertDashboard from './pages/ExpertDashboard';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import AIMatchPage from './pages/AIMatchPage';
import AdminPanel from './pages/AdminPanel';
import Login from './pages/Login';
import Register from './pages/Register';
import './index.css';

// ── Simple Error Boundary ──
class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', textAlign: 'center', background: 'var(--bg)', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <h2 style={{ color: 'var(--on-surface)', marginBottom: '1rem' }}>ExpertBook Initialization Error</h2>
          <div style={{ background: 'var(--surface-low)', border: '1px solid var(--surface-ch)', padding: '1.5rem', borderRadius: '1.5rem', maxWidth: '420px', boxShadow: 'var(--shadow-card)' }}>
            <p style={{ color: 'var(--on-surface-var)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>The platform could not initialize authentication. This usually happens if the Clerk key in your .env file is unauthorized or has expired.</p>
            <pre style={{ background: 'var(--surface-lowest)', padding: '12px', borderRadius: '8px', fontSize: '0.75rem', overflow: 'auto', marginBottom: '1.5rem', textAlign: 'left', border: '1px solid var(--surface-ch)' }}>{this.state.error?.message || 'Unauthorized Key'}</pre>
            <button onClick={() => window.location.reload()} className="btn-primary" style={{ width: '100%' }}>Reload Platform</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const CLERK_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const clerkEnabled = CLERK_KEY && !CLERK_KEY.includes('your_clerk');

// ── Protected route when Clerk is active ──
function ClerkProtected({ children }) {
  const { isSignedIn, isLoaded } = useAuth();
  if (!isLoaded) return null;
  return isSignedIn ? children : <Navigate to="/login" replace />;
}

// ── Protected route fallback (no Clerk) ──
function TokenProtected({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" replace />;
}

function PublicOnlyRoute({ children }) {
  if (clerkEnabled) {
    const { isSignedIn, isLoaded } = useAuth();
    if (!isLoaded) return null;
    return isSignedIn ? <Navigate to="/workspace" replace /> : children;
  }
  const token = localStorage.getItem('token');
  return token ? <Navigate to="/workspace" replace /> : children;
}

function ProtectedRoute({ children }) {
  return clerkEnabled
    ? <ClerkProtected>{children}</ClerkProtected>
    : <TokenProtected>{children}</TokenProtected>;
}

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/luminal" element={<LuminalLanding />} />
        <Route path="/search" element={<LuminalMatchSearch />} />
        <Route path="/explore" element={<ExpertListing />} />
        <Route path="/experts/:id" element={<ExpertDetail />} />
        <Route path="/book/:expertId" element={<PublicBookingPage />} />
        <Route path="/login" element={<PublicOnlyRoute><Login clerkEnabled={clerkEnabled} /></PublicOnlyRoute>} />
        <Route path="/register" element={<PublicOnlyRoute><Register clerkEnabled={clerkEnabled} /></PublicOnlyRoute>} />
        <Route path="/workspace" element={<ProtectedRoute><ExpertDashboard /></ProtectedRoute>} />
        <Route path="/portal" element={<ProtectedRoute><LuminalExpertPortal /></ProtectedRoute>} />
        <Route path="/collaborations" element={<ProtectedRoute><ExpertDashboard /></ProtectedRoute>} />
        <Route path="/curator" element={<ProtectedRoute><ExpertDashboard /></ProtectedRoute>} />
        <Route path="/bookings" element={<ProtectedRoute><ExpertDashboard /></ProtectedRoute>} />
        <Route path="/analytics" element={<ProtectedRoute><AnalyticsDashboard /></ProtectedRoute>} />
        <Route path="/ai-match" element={<AIMatchPage />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      {clerkEnabled ? (
        <ClerkProvider publishableKey={CLERK_KEY} afterSignOutUrl="/">
          <AppRoutes />
        </ClerkProvider>
      ) : (
        <AppRoutes />
      )}
    </ErrorBoundary>
  );
}

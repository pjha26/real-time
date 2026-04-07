import React from 'react';
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
        <div style={{ padding: '2rem', textAlign: 'center', background: '#f5f6f7', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <h2 style={{ color: '#006a2e', marginBottom: '1rem' }}>Something went wrong</h2>
          <pre style={{ background: '#eee', padding: '1rem', borderRadius: '8px', fontSize: '0.8rem', maxWidth: '80%' }}>{this.state.error?.message}</pre>
          <button onClick={() => window.location.reload()} className="btn-primary" style={{ marginTop: '1rem' }}>Reload Platform</button>
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
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default function App() {
  const [clerkError, setClerkError] = React.useState(false);

  if (clerkEnabled && !clerkError) {
    return (
      <ErrorBoundary>
        <ClerkProvider
          publishableKey={CLERK_KEY}
          afterSignOutUrl="/"
          onError={() => setClerkError(true)}
        >
          <AppRoutes />
        </ClerkProvider>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      {clerkEnabled && clerkError && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999, background: '#ff6b6b', color: 'white', padding: '8px', textAlign: 'center', fontSize: '0.8rem' }}>
          Clerk Authentication Error: Please check your Publishable Key in .env
        </div>
      )}
      <AppRoutes />
    </ErrorBoundary>
  );
}

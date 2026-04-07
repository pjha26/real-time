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
  if (clerkEnabled) {
    return (
      <ClerkProvider publishableKey={CLERK_KEY} afterSignOutUrl="/">
        <AppRoutes />
      </ClerkProvider>
    );
  }
  return <AppRoutes />;
}

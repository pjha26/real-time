import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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

// ProtectedRoute: uses Clerk if available, falls back to Zustand token
function ProtectedRoute({ children, clerkEnabled }) {
  if (clerkEnabled) {
    const { useAuth } = require('@clerk/clerk-react');
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { isSignedIn, isLoaded } = useAuth();
    if (!isLoaded) return null;
    return isSignedIn ? children : <Navigate to="/login" replace />;
  }
  // fallback: check localStorage token
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" replace />;
}

export default function App({ clerkEnabled = false }) {
  const PR = ({ children }) => <ProtectedRoute clerkEnabled={clerkEnabled}>{children}</ProtectedRoute>;
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/luminal" element={<LuminalLanding />} />
        <Route path="/search" element={<LuminalMatchSearch />} />
        <Route path="/explore" element={<ExpertListing />} />
        <Route path="/experts/:id" element={<ExpertDetail />} />
        <Route path="/book/:expertId" element={<PublicBookingPage />} />
        <Route path="/login" element={<Login clerkEnabled={clerkEnabled} />} />
        <Route path="/register" element={<Register clerkEnabled={clerkEnabled} />} />
        <Route path="/workspace" element={<PR><ExpertDashboard /></PR>} />
        <Route path="/portal" element={<PR><LuminalExpertPortal /></PR>} />
        <Route path="/collaborations" element={<PR><ExpertDashboard /></PR>} />
        <Route path="/curator" element={<PR><ExpertDashboard /></PR>} />
        <Route path="/bookings" element={<PR><ExpertDashboard /></PR>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}


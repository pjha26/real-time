import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
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

function ProtectedRoute({ children }) {
  const { isSignedIn, isLoaded } = useAuth();
  if (!isLoaded) return null; // Wait for Clerk to initialize
  return isSignedIn ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/luminal" element={<LuminalLanding />} />
        <Route path="/search" element={<LuminalMatchSearch />} />
        <Route path="/explore" element={<ExpertListing />} />
        <Route path="/experts/:id" element={<ExpertDetail />} />
        <Route path="/book/:expertId" element={<PublicBookingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
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

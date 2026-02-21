import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ExpertListing from './pages/ExpertListing';
import ExpertDetail from './pages/ExpertDetail';
import MyBookings from './pages/MyBookings';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import ExpertDashboard from './pages/ExpertDashboard';
import PublicBookingPage from './pages/PublicBookingPage';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/experts" element={<ExpertListing />} />
          <Route path="/expert/:id" element={<ExpertDetail />} />
          <Route path="/expert-dashboard" element={<ExpertDashboard />} />
          <Route path="/my-bookings" element={<MyBookings />} />
          <Route path="/:username/:urlSlug" element={<PublicBookingPage />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;

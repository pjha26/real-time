import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ExpertListing from './pages/ExpertListing';
import ExpertDetail from './pages/ExpertDetail';
import MyBookings from './pages/MyBookings';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<ExpertListing />} />
          <Route path="/expert/:id" element={<ExpertDetail />} />
          <Route path="/my-bookings" element={<MyBookings />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;

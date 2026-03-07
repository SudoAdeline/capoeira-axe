import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import EventDetail from './pages/EventDetail';
import SubmitEvent from './pages/SubmitEvent';
import MyEvents from './pages/MyEvents';
import AdminDashboard from './pages/AdminDashboard';
import Privacy from './pages/Privacy';
import InstallPrompt from './components/InstallPrompt';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/event/:id" element={<EventDetail />} />
        <Route path="/submit" element={<SubmitEvent />} />
        <Route path="/my-events" element={<MyEvents />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/privacy" element={<Privacy />} />
      </Routes>
      <InstallPrompt />
    </Layout>
  );
}

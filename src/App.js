import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import './App.css';
import Navbar from './components/Navbar';
import MobileMenuBar from './components/MobileMenuBar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Events from './pages/Events';
import Dashboard from './pages/Dashboard';
import AdminPortal from './pages/AdminPortal';
import EventDetails from './pages/EventDetails';
import Checkout from './pages/Checkout';
import PaymentSuccess from './pages/PaymentSuccess';
import About from './pages/About';
import AttendeeDashboard from './dashboards/AttendeeDashboard';
import OrganizerDashboard from './dashboards/OrganizerDashboard';
import VendorDashboard from './dashboards/VendorDashboard';
import SalesAgentDashboard from './dashboards/SalesAgentDashboard';
import AdminDashboard from './dashboards/AdminDashboard';
import TicketView from './pages/TicketView';
import OrganizerSignup from './pages/OrganizerSignup';
import Terms from './pages/Terms';

function AppContent() {
  const [user, setUser] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const saved = localStorage.getItem('reek_user');
    if (saved) setUser(JSON.parse(saved));
  }, []);

  const logout = () => {
    localStorage.removeItem('reek_token');
    localStorage.removeItem('reek_user');
    setUser(null);
  };

  const PrivateRoute = ({ children }) => (user ? children : <Navigate to="/login" />);

  return (
    <div className="App">
      {location.pathname === '/' && <Navbar user={user} onLogout={logout} />}
      {location.pathname !== '/' && <MobileMenuBar user={user} onLogout={logout} />}
      <main className="app-content">
        <Routes>
          <Route path="/" element={<Home events={[]} />} />
          <Route path="/login" element={<Login onLogin={setUser} />} />
          <Route path="/signup" element={<Signup onLogin={setUser} />} />
          <Route path="/signup/organizer" element={<OrganizerSignup onLogin={setUser} />} />
          <Route path="/events" element={<Events user={user} />} />
          <Route path="/about" element={<About />} />
          <Route path="/event/:id" element={<EventDetails />} />
          <Route path="/checkout/:eventId" element={<Checkout />} />
          <Route path="/payment/success" element={<PaymentSuccess />} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard user={user} /></PrivateRoute>} />
          <Route path="/dashboard/attendee" element={<PrivateRoute><AttendeeDashboard /></PrivateRoute>} />
          <Route path="/dashboard/organizer/*" element={<PrivateRoute><OrganizerDashboard /></PrivateRoute>} />
          <Route path="/dashboard/vendor" element={<PrivateRoute><VendorDashboard /></PrivateRoute>} />
          <Route path="/dashboard/agent" element={<PrivateRoute><SalesAgentDashboard /></PrivateRoute>} />
          <Route path="/dashboard/admin" element={<PrivateRoute><AdminDashboard /></PrivateRoute>} />
          <Route path="/ticket/:id" element={<TicketView />} />
          <Route path="/admindavid" element={<AdminPortal />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;

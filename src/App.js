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
import Blog from './pages/Blog';
import BlogArticle from './pages/BlogArticle';
import CreateEvent from './pages/CreateEvent';
import MyTickets from './pages/MyTickets';
import Vendor from './pages/Vendor';
import Admin from './pages/Admin';
import VendorRegister from './pages/VendorRegister';
import SalesAgents from './pages/SalesAgents';
import AdminDashboard from './dashboards/AdminDashboard';
import OrganizerDashboard from './dashboards/OrganizerDashboard';
import VendorDashboard from './dashboards/VendorDashboard';
import SalesAgentDashboard from './dashboards/SalesAgentDashboard';
import AttendeeDashboard from './dashboards/AttendeeDashboard';
import GateEntryDashboard from './dashboards/GateEntryDashboard';
import TicketView from './pages/TicketView';
import AdminSupport from './pages/AdminSupport';
import OrganizerSignup from './pages/OrganizerSignup';
import VerifyOtp from './pages/VerifyOtp';
import ForgotPassword from './pages/ForgotPassword';
import Terms from './pages/Terms';
import SupportChat from './components/SupportChat';
import SmsTest from './pages/SmsTest';

function AppContent() {
  const [user, setUser] = useState(undefined);
  const [authChecked, setAuthChecked] = useState(false);
  const location = useLocation();

  const normalizeUserRole = (userObj) => {
    if (!userObj) return userObj;
    const email = userObj.email?.toLowerCase();
    if (!userObj.role && email === 'ceoofreektickets@gmail.com') {
      return { ...userObj, role: 'admin' };
    }
    return userObj;
  };

  useEffect(() => {
    const saved = localStorage.getItem('reek_user');
    if (saved) {
      setUser(normalizeUserRole(JSON.parse(saved)));
    } else {
      setUser(null);
    }
    setAuthChecked(true);
  }, []);

  const logout = () => {
    localStorage.removeItem('reek_token');
    localStorage.removeItem('reek_user');
    setUser(null);
  };

  const PrivateRoute = ({ children, allowedRoles }) => {
    if (!authChecked) return null;
    if (!user) return <Navigate to="/login" replace />;
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      const roleRoute = user.role === 'admin'
        ? '/dashboard/admin'
        : user.role === 'organizer'
          ? '/dashboard/organizer'
          : user.role === 'vendor'
            ? '/dashboard/vendor'
            : user.role === 'agent'
              ? '/dashboard/agent'
              : user.role === 'gate' || user.role === 'entry'
                ? '/dashboard/gate'
                : '/dashboard/attendee';
      return <Navigate to={roleRoute} replace />;
    }
    return children;
  };

  return (
    <div className="App">
      {location.pathname === '/' && <Navbar user={user} onLogout={logout} />}
      {location.pathname !== '/' && <MobileMenuBar user={user} onLogout={logout} />}
      <main className="app-content">
        <Routes>
          <Route path="/" element={<Home events={[]} />} />
          <Route path="/login" element={<Login onLogin={setUser} />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/signup" element={<Signup onLogin={setUser} />} />
          <Route path="/signup/organizer" element={<OrganizerSignup onLogin={setUser} />} />
          <Route path="/verify-email" element={<VerifyOtp onLogin={setUser} />} />
          <Route path="/events" element={<Events user={user} />} />
          <Route path="/about" element={<About />} />
          <Route path="/events/:id" element={<EventDetails />} />
          <Route path="/event/:id" element={<EventDetails />} />
          <Route path="/checkout/:eventId" element={<Checkout />} />
          <Route path="/payment/success" element={<PaymentSuccess />} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard user={user} /></PrivateRoute>} />
          <Route path="/dashboard/attendee" element={<PrivateRoute allowedRoles={['attendee']}><AttendeeDashboard /></PrivateRoute>} />
          <Route path="/dashboard/organizer/*" element={<PrivateRoute allowedRoles={['organizer']}><OrganizerDashboard /></PrivateRoute>} />
          <Route path="/dashboard/vendor" element={<PrivateRoute allowedRoles={['vendor']}><VendorDashboard /></PrivateRoute>} />
          <Route path="/dashboard/agent" element={<PrivateRoute allowedRoles={['agent']}><SalesAgentDashboard /></PrivateRoute>} />
          <Route path="/dashboard/gate" element={<PrivateRoute allowedRoles={['gate','entry']}><GateEntryDashboard /></PrivateRoute>} />
          <Route path="/dashboard/admin" element={<PrivateRoute allowedRoles={['admin']}><AdminDashboard /></PrivateRoute>} />
          <Route path="/admin/support" element={<PrivateRoute allowedRoles={['admin']}><AdminSupport /></PrivateRoute>} />
          <Route path="/ticket/:id" element={<TicketView />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogArticle />} />
          <Route path="/create-event" element={<CreateEvent />} />
          <Route path="/my-tickets" element={<MyTickets />} />
          <Route path="/vendor" element={<Vendor />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/vendor/register" element={<VendorRegister />} />
          <Route path="/agents" element={<SalesAgents />} />
          <Route path="/admindavid" element={<AdminPortal />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/sms-test" element={<SmsTest />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      <SupportChat user={user} />
      {location.pathname === '/' && <Footer />}
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

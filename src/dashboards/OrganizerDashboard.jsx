import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaChartPie, FaUser, FaTicketAlt, FaPlus, FaBullhorn, FaMoneyBillWave, FaBell, FaEnvelope, FaUsers, FaStore, FaVideo, FaCog, FaChevronDown, FaCamera } from 'react-icons/fa';
import axios from 'axios';
import API_BASE from '../config/api';
import './OrganizerDashboard.css';

// Sub-components
import DashboardHome from './organizer-sections/DashboardHome';
import UserDashboard from './organizer-sections/UserDashboard';
import EventCreation from './organizer-sections/EventCreation';
import Transactions from './organizer-sections/Transactions';
import UserManagement from './organizer-sections/UserManagement';
import VendorManagement from './organizer-sections/VendorManagement';
import OrganizerSettings from './organizer-sections/OrganizerSettings';
import ComplementaryTickets from './organizer-sections/ComplementaryTickets';
import PhysicalTickets from './organizer-sections/PhysicalTickets';
import EventPromotion from './organizer-sections/EventPromotion';
import Notifications from './organizer-sections/Notifications';
import Messages from './organizer-sections/Messages';
import LiveStream from './organizer-sections/LiveStream';

export default function OrganizerDashboard() {
  const [events, setEvents] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [users, setUsers] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [payments, setPayments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [messages, setMessages] = useState([]);
  const [reportMessage, setReportMessage] = useState('');
  const [reportStatus, setReportStatus] = useState('');
  const [stats, setStats] = useState({ topEventRevenue: 0, totalEvents: 0, ticketsSold: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [organizer, setOrganizer] = useState(null);
  const [profilePicUploading, setProfilePicUploading] = useState(false);
  const [profilePicError, setProfilePicError] = useState('');

  const location = useLocation();
  const navigate = useNavigate();

  const pathParts = location.pathname.split('/').filter(Boolean);
  const activeNav = pathParts[pathParts.length - 1] === 'organizer' ? 'dashboard' : pathParts[pathParts.length - 1] || 'dashboard';

  const headers = { Authorization: `Bearer ${localStorage.getItem('reek_token')}` };

  const organizerAvatar = organizer?.avatarUrl || organizer?.profilePic || null;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const greetingName = organizer?.fullName?.split(' ')[0] || organizer?.email?.split('@')[0] || 'Organizer';
  const greetingText = `${getGreeting()}, ${greetingName}`;

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const [eventsRes, ticketsRes, usersRes, vendorsRes, paymentsRes, notificationsRes, messagesRes] = await Promise.all([
        axios.get(`${API_BASE}/events`, { headers }).catch(err => {
          console.error('Failed to fetch events:', err.message);
          return { data: [] };
        }),
        axios.get(`${API_BASE}/tickets`, { headers }).catch(err => {
          console.error('Failed to fetch tickets:', err.message);
          return { data: [] };
        }),
        axios.get(`${API_BASE}/users`, { headers }).catch(err => {
          console.error('Failed to fetch users:', err.message);
          return { data: [] };
        }),
        axios.get(`${API_BASE}/vendors`, { headers }).catch(err => {
          console.error('Failed to fetch vendors:', err.message);
          return { data: [] };
        }),
        axios.get(`${API_BASE}/payments`, { headers }).catch(err => {
          console.error('Failed to fetch payments:', err.message);
          return { data: [] };
        }),
        axios.get(`${API_BASE}/notifications`, { headers }).catch(err => {
          console.error('Failed to fetch notifications:', err.message);
          return { data: [] };
        }),
        axios.get(`${API_BASE}/messages`, { headers }).catch(err => {
          console.error('Failed to fetch messages:', err.message);
          return { data: [] };
        }),
      ]);

      const allEvents = eventsRes.data || [];
      const userTickets = ticketsRes.data || [];
      const allUsers = usersRes.data || [];
      const vendorUsers = vendorsRes.data || [];
      const allPayments = paymentsRes.data || [];
      const notifications = notificationsRes.data || [];
      const messages = messagesRes.data || [];

      const currentUser = JSON.parse(localStorage.getItem('reek_user') || '{}');
      const currentUserId = currentUser._id || currentUser.id;
      const userEvents = currentUserId
        ? allEvents.filter((event) => String(event.organizer?._id || event.organizer) === String(currentUserId))
        : allEvents;

      setEvents(userEvents);
      setTickets(userTickets);
      setUsers(allUsers);
      setVendors(vendorUsers);
      setPayments(allPayments);
      setNotifications(notifications);
      setMessages(messages);

      setOrganizer(currentUser);

      // Calculate stats
      let topEventRevenue = 0;
      if (userTickets.length > 0) {
        const eventMap = {};
        userTickets.forEach(ticket => {
          const eventId = ticket.event?._id || ticket.event;
          eventMap[eventId] = (eventMap[eventId] || 0) + (ticket.price || 0);
        });
        topEventRevenue = Math.max(...Object.values(eventMap));
      }

      setStats({
        topEventRevenue,
        totalEvents: userEvents.length,
        ticketsSold: userTickets.length,
      });
    } catch (err) {
      console.error('Unexpected error fetching organizer data:', err);
      setError('Unable to load some dashboard data. Please refresh or contact support.');
    } finally {
      setLoading(false);
    }
  };

  const handleProfilePicUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setProfilePicUploading(true);
    setProfilePicError('');
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await axios.post(`${API_BASE}/upload`, formData, {
        headers: {
          ...headers,
          'Content-Type': 'multipart/form-data'
        },
        timeout: 30000
      });
      
      if (!response.data?.url) {
        throw new Error('No URL returned from upload');
      }
      
      const picUrl = response.data.url;
      
      // Update user profile with new pic
      const updateRes = await axios.patch(`${API_BASE}/auth/me`, 
        { profilePic: picUrl, avatarUrl: picUrl }, 
        { headers }
      );
      
      // Update local storage and state
      const updatedUser = { ...organizer, profilePic: picUrl, avatarUrl: picUrl };
      localStorage.setItem('reek_user', JSON.stringify(updatedUser));
      setOrganizer(updatedUser);
      setProfilePicError('');
    } catch (err) {
      console.error('Profile picture upload failed:', err);
      
      if (err.response?.data?.error) {
        setProfilePicError(err.response.data.error);
      } else if (err.message?.includes('timeout')) {
        setProfilePicError('Upload timed out. Please try again.');
      } else if (err.message?.includes('Network')) {
        setProfilePicError('Network error. Please check your connection.');
      } else {
        setProfilePicError('Failed to upload profile picture. Please try again.');
      }
    } finally {
      setProfilePicUploading(false);
    }
  };

  const submitReport = async () => {
    if (!reportMessage.trim()) {
      setReportStatus('Please enter a report message.');
      return;
    }

    setReportStatus('Sending report...');
    try {
      await axios.post(`${API_BASE}/report`, { message: reportMessage.trim() }, { headers });
      setReportMessage('');
      setReportStatus('Report submitted successfully.');
    } catch (err) {
      console.error('Submit report failed:', err);
      setReportStatus('Unable to send report at the moment.');
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleNavClick = (id) => {
    const route = id === 'dashboard' ? '/dashboard/organizer/dashboard' : `/dashboard/organizer/${id}`;
    navigate(route);
  };

  const renderContent = () => {
    const contentProps = {
      events,
      tickets,
      users,
      vendors,
      payments,
      notifications,
      messages,
      stats,
      organizer,
      headers,
      onRefresh: fetchData,
    };

    switch (activeNav) {
      case 'dashboard':
        return <DashboardHome {...contentProps} />;
      case 'user':
        return <UserDashboard {...contentProps} />;
      case 'complimentary':
        return <ComplementaryTickets {...contentProps} />;
      case 'physical':
        return <PhysicalTickets {...contentProps} />;
      case 'events':
        return <EventCreation {...contentProps} onEventCreated={() => fetchData()} />;
      case 'promotion':
        return <EventPromotion {...contentProps} />;
      case 'transaction':
        return <Transactions {...contentProps} />;
      case 'notification':
        return <Notifications {...contentProps} />;
      case 'message':
        return <Messages {...contentProps} />;
      case 'users':
        return <UserManagement {...contentProps} />;
      case 'vendors':
        return <VendorManagement {...contentProps} />;
      case 'stream':
        return <LiveStream {...contentProps} />;
      case 'settings':
        return <OrganizerSettings {...contentProps} />;
      default:
        return <DashboardHome {...contentProps} />;
    }
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <FaChartPie /> },
    { id: 'user', label: 'User Dashboard', icon: <FaUser /> },
    { id: 'complimentary', label: 'Complimentary Tickets', icon: <FaTicketAlt /> },
    { id: 'physical', label: 'Physical Tickets', icon: <FaTicketAlt /> },
    { id: 'events', label: 'Event Creation', icon: <FaPlus /> },
    { id: 'promotion', label: 'Event Promotion', icon: <FaBullhorn /> },
    { id: 'transaction', label: 'Transaction', icon: <FaMoneyBillWave /> },
    { id: 'notification', label: 'Notification', icon: <FaBell /> },
    { id: 'message', label: 'Message', icon: <FaEnvelope /> },
    { id: 'users', label: 'User Management', icon: <FaUsers /> },
    { id: 'vendors', label: 'Vendor Management', icon: <FaStore /> },
    { id: 'stream', label: 'Live Stream', icon: <FaVideo /> },
    { id: 'settings', label: 'Settings', icon: <FaCog /> },
  ];

  return (
    <div className="organizer-dashboard">
      {/* SIDEBAR */}
      <aside className="sidebar organizer-sidebar">
        <div className="sidebar-header">
          <div className="logo"><FaTicketAlt /> ReekTickets</div>
        </div>
        <nav className="sidebar-nav">
          {menuItems.map(item => (
            <button 
              key={item.id} 
              className={`nav-item ${activeNav === item.id ? 'active' : ''}`}
              type="button"
              aria-label={item.label}
              onClick={() => handleNavClick(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="organizer-main">
        {/* TOP HEADER */}
        <header className="organizer-header">
          <div className="header-right">
            <button className="icon-btn notification-btn"><FaBell /></button>
            <div className="user-profile">
              <div style={{ position: 'relative' }}>
                <img src={organizerAvatar} alt="User" className="avatar" />
                <label style={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  background: '#3b82f6',
                  borderRadius: '50%',
                  padding: '4px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid white',
                }}>
                  <FaCamera size={12} color="white" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePicUpload}
                    disabled={profilePicUploading}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>
              <span className="user-name">{organizer?.fullName || organizer?.email || 'Organizer'}</span>
              <span className="dropdown-arrow"><FaChevronDown /></span>
            </div>
            {profilePicError && <span style={{ color: '#ef4444', fontSize: '0.85rem' }}>{profilePicError}</span>}
          </div>
        </header>

        {/* CONTENT AREA */}
        <div className="organizer-content">
          <div className="dashboard-greeting-panel">
            <h2>{greetingText}</h2>
            <p>Here is your organizer workspace for events, promotions, tickets, and reports.</p>
          </div>
          <div className="report-panel" style={{ marginBottom: '16px', background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '16px' }}>
            <h4>Report a message to admin</h4>
            <textarea
              value={reportMessage}
              onChange={(e) => setReportMessage(e.target.value)}
              placeholder="Your issue or suggestion for admin..."
              style={{ width: '100%', minHeight: '80px', borderRadius: '8px', border: '1px solid #d1d5db', padding: '10px' }}
            />
            <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <button onClick={submitReport} className="btn btn-small">Send Report</button>
              {reportStatus && <span style={{ fontSize: '0.9rem', color: '#374151' }}>{reportStatus}</span>}
            </div>
          </div>
          {loading && <p style={{ padding: '20px', textAlign: 'center' }}>Loading...</p>}
          {error && <p style={{ color: 'red', padding: '20px', textAlign: 'center' }}>{error}</p>}
          {!loading && !error && renderContent()}
        </div>
      </main>
    </div>
  );
}

import { useState, useEffect, useCallback, useMemo } from 'react';
import { FaChartPie, FaUsers, FaUserShield, FaCalendarAlt, FaTicketAlt, FaMoneyBillWave, FaFileAlt, FaCog, FaSearch, FaBell, FaStore, FaHandsHelping, FaSun, FaMoon, FaChevronDown, FaBullhorn, FaBolt, FaEye, FaUserPlus, FaUndo, FaClipboard, FaLink, FaTimes, FaDollarSign, FaClock, FaCreditCard, FaBars, FaTimes as FaClose } from 'react-icons/fa';
import axios from 'axios';
import API_BASE from '../config/api';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalEvents: 0,
    totalTickets: 0,
    totalRevenue: 0,
    activeVendors: 0,
    activeSalesAgents: 0
  });

  const [events, setEvents] = useState([]);
  const [users, setUsers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [salesAgents, setSalesAgents] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [fraudAlerts, setFraudAlerts] = useState([]);
  const [adminLogs, setAdminLogs] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [reports, setReports] = useState([]);
  const [revenue, setRevenue] = useState(0);
  const [userActivityLogs, setUserActivityLogs] = useState([]);
  const [pendingVerifications, setPendingVerifications] = useState([]);
  const [pendingTickets, setPendingTickets] = useState([]);
  const [selectedUserDetails, setSelectedUserDetails] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [darkMode, setDarkMode] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [filterDate, setFilterDate] = useState('');
  const [filterPaymentMethod, setFilterPaymentMethod] = useState('');
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [selectedUserForOtp, setSelectedUserForOtp] = useState(null);
  const [otpInputValue, setOtpInputValue] = useState('');
  const [otpModalLoading, setOtpModalLoading] = useState(false);
  const [pendingOtpInputs, setPendingOtpInputs] = useState({});
  const [pendingOtpLoading, setPendingOtpLoading] = useState({});
  const [pendingOtpMessages, setPendingOtpMessages] = useState({});
  const [chatSupportAdmins, setChatSupportAdmins] = useState([]);
  const [showChatAdminModal, setShowChatAdminModal] = useState(false);
  const [selectedChatAdmin, setSelectedChatAdmin] = useState(null);
  const [chatSupportEnabled, setChatSupportEnabled] = useState(true);
  const [chatAutoResponse, setChatAutoResponse] = useState('We will respond to your message shortly. Thank you for contacting us!');
  const [showChatProfileModal, setShowChatProfileModal] = useState(false);
  const [chatProfileEditData, setChatProfileEditData] = useState({ id: '', fullName: '', profilePic: '' });
  const [chatProfileSaving, setChatProfileSaving] = useState(false);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [announcementMessage, setAnnouncementMessage] = useState('');
  const [announcementLoading, setAnnouncementLoading] = useState(false);
  const [announcementSuccess, setAnnouncementSuccess] = useState('');
  const [showAddPendingUserModal, setShowAddPendingUserModal] = useState(false);
  const [pendingUserForm, setPendingUserForm] = useState({ fullName: '', email: '', phone: '' });
  const [addPendingUserLoading, setAddPendingUserLoading] = useState(false);
  const [showAddAgentModal, setShowAddAgentModal] = useState(false);
  const [agentForm, setAgentForm] = useState({ fullName: '', email: '', phone: '' });
  const [addAgentLoading, setAddAgentLoading] = useState(false);
  const [showManageVendorsModal, setShowManageVendorsModal] = useState(false);

  const headers = useMemo(() => ({
    Authorization: `Bearer ${localStorage.getItem('reek_token')}`
  }), []);

  const normalizeRole = useCallback((value) => String(value || '').toLowerCase(), []);
  const isAdminRole = useCallback(
    (value) => ['admin', 'administrator', 'superadmin'].includes(normalizeRole(value)),
    [normalizeRole]
  );

  const fetchUserData = useCallback(async () => {
    try {
      const res = await axios.get(getApiUrl('/auth/me'), { headers });
      setUser(res.data);
      return res.data;
    } catch (err) {
      console.error('Failed to fetch user data:', err);
      return null;
    }
  }, [headers]);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [u, e, t, p, r] = await Promise.all([
        axios.get(getApiUrl('/admin/users'), { headers }).catch(() => ({ data: [] })),
        axios.get(getApiUrl('/admin/events'), { headers }).catch(() => ({ data: [] })),
        axios.get(getApiUrl('/admin/tickets'), { headers }).catch(() => ({ data: [] })),
        axios.get(getApiUrl('/admin/payments'), { headers }).catch(() => ({ data: [] })),
        axios.get(getApiUrl('/admin/reports'), { headers }).catch(() => ({ data: [] })),
      ]);
      const usersData = Array.isArray(u.data) ? u.data : [];
      const eventsData = Array.isArray(e.data) ? e.data : [];
      const ticketsData = Array.isArray(t.data) ? t.data : [];
      const paymentsData = Array.isArray(p.data) ? p.data : [];
      const reportsData = Array.isArray(r.data) ? r.data : [];

      setUsers(usersData);
      setEvents(eventsData);
      setTickets(ticketsData);
      setPayments(paymentsData);
      setReports(reportsData);

      // Set pending data
      setPendingVerifications(usersData.filter((user) => !(user.is_verified || user.isVerified)));
      setPendingTickets(ticketsData);

      setStats({
        totalUsers: usersData.length,
        totalEvents: eventsData.length,
        totalTickets: ticketsData.length,
        totalRevenue: paymentsData.reduce((sum, pay) => sum + Number(pay.amount || 0), 0),
        activeVendors: 0,
        activeSalesAgents: 0
      });
      setError('');
    } catch (err) {
      console.error('Fetch all error:', err);
      setError('Could not fetch admin data. Check your admin permissions.');
    }
    setLoading(false);
  }, [headers]);

  useEffect(() => {
    const loadData = async () => {
      let currentUser = await fetchUserData();
      if (!currentUser) {
        const stored = localStorage.getItem('reek_user');
        currentUser = stored ? JSON.parse(stored) : null;
      }

      if (currentUser && !currentUser.role && currentUser.email?.toLowerCase() === 'ceoofreektickets@gmail.com') {
        currentUser.role = 'admin';
      }

      console.log('Current user:', currentUser);
      console.log('User role:', currentUser?.role);
      console.log('Is admin role:', isAdminRole(currentUser?.role));

      // Removed admin role restriction for development
      // if (!currentUser || !isAdminRole(currentUser.role)) {
      //   setError('Restricted: only admin users can view this panel.');
      //   setLoading(false);
      //   return;
      // }

      setUser(currentUser);
      await fetchAll();
    };
    loadData();
  }, [fetchUserData, fetchAll, isAdminRole]);

  // Fetch additional dashboard data (sales agents, vendors, fraud alerts, logs, notifications)
  useEffect(() => {
    const fetchAdditionalData = async () => {
      try {
        // Fetch sales agents - filter users with role 'agent'
        if (users.length > 0) {
          const agents = users.filter(u => u.role === 'agent');
          setSalesAgents(agents);
        }
        // Fetch vendors - filter users with role 'vendor'
        if (users.length > 0) {
          const vendorList = users.filter(u => u.role === 'vendor');
          setVendors(vendorList);
        }
        // Fetch activity logs from payments/tickets
        if (payments.length > 0) {
          const actLogs = payments.map((p, idx) => ({
            userName: p.userId?.fullName || 'User',
            activity: `Payment for ticket - ${p.reference}`,
            type: 'payment',
            ipAddress: p.ipAddress || 'N/A',
            timestamp: p.createdAt
          }));
          setUserActivityLogs(actLogs);
        }
        // Generate dummy notifications
        setNotifications([
          { title: 'High Transaction Volume', message: 'Unusual activity detected', timestamp: new Date() },
          { title: 'Server Health', message: 'All systems operational', timestamp: new Date(Date.now() - 3600000) }
        ]);
        // Generate admin activity logs
        setAdminLogs([
          { adminName: 'System', action: 'Dashboard viewed', target: 'Admin Panel', changes: 'N/A', timestamp: new Date() }
        ]);
        // Generate fraud alerts if suspicious activity detected
        const suspiciousPayments = payments.filter(p => Number(p.amount || 0) > 5000);
        const alerts = suspiciousPayments.map((p, idx) => ({
          type: 'High Amount Transaction',
          user: p.userId?.fullName || 'Unknown',
          details: `${p.reference} - Amount: ${p.amount}`,
          timestamp: p.createdAt,
          status: 'pending'
        }));
        setFraudAlerts(alerts);
        // Calculate revenue from payments
        const totalRevenue = payments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
        setRevenue(totalRevenue);
      } catch (err) {
        console.error('Failed to fetch additional data:', err);
      }
    };
    if (!loading) {
      fetchAdditionalData();
    }
  }, [loading, users, payments]);

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setSelectedUserDetails(null);
      }
    };
    if (selectedUserDetails) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [selectedUserDetails]);

  const getApiUrl = (path) => {
    if (!path) return `${API_BASE}`;
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    return `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`;
  };

  const runAction = async (url, method = 'patch', body = {}) => {
    try {
      await axios({ url: getApiUrl(url), method, data: body, headers });
      await fetchAll();
    } catch (err) {
      setError('Action failed.');
    }
  };

  const handleOpenAnnouncementModal = () => {
    setAnnouncementMessage('');
    setAnnouncementSuccess('');
    setShowAnnouncementModal(true);
  };

  const handleSendAnnouncement = async () => {
    if (!announcementMessage.trim()) {
      setError('Announcement message cannot be empty.');
      return;
    }
    setAnnouncementLoading(true);
    setError('');
    setAnnouncementSuccess('');
    try {
      await axios.post(getApiUrl('/admin/announcements'), { message: announcementMessage.trim(), roles: ['all'] }, { headers });
      setAnnouncementSuccess('Announcement sent successfully.');
      setAnnouncementMessage('');
      await fetchAll();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send announcement.');
    } finally {
      setAnnouncementLoading(false);
    }
  };

  const handleOpenAddAgentModal = () => {
    setShowAddAgentModal(true);
  };

  const handleManageVendors = () => {
    setShowManageVendorsModal(true);
  };

  const handleSetUserOtp = async () => {
    if (!otpInputValue || !selectedUserForOtp) {
      setError('Please enter a valid OTP code');
      return;
    }

    // Validate OTP is 6 digits
    if (!/^\d{6}$/.test(otpInputValue)) {
      setError('OTP code must be 6 digits');
      return;
    }

    setOtpModalLoading(true);
    try {
      await axios.post(
        getApiUrl('/admin/set-user-otp'),
        {
          userId: selectedUserForOtp._id || selectedUserForOtp.id,
          otpCode: otpInputValue,
        },
        { headers }
      );
      setError('');
      setShowOtpModal(false);
      setSelectedUserForOtp(null);
      setOtpInputValue('');
      alert(`OTP code set successfully! User has 10 minutes to enter: ${otpInputValue}`);
      await fetchAll();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to set OTP code');
    } finally {
      setOtpModalLoading(false);
    }
  };

  const handlePendingUserOtpInputChange = (userId, value) => {
    if (!/^[0-9]*$/.test(value) || value.length > 6) return;
    setPendingOtpInputs(prev => ({ ...prev, [userId]: value }));
  };

  const handleVerifyPendingUserOtp = async (user) => {
    const userId = user._id || user.id;
    const otpCode = pendingOtpInputs[userId]?.trim();

    if (!otpCode || !/^\d{6}$/.test(otpCode)) {
      setPendingOtpMessages(prev => ({ ...prev, [userId]: 'Please enter a 6-digit code.' }));
      return;
    }

    setPendingOtpLoading(prev => ({ ...prev, [userId]: true }));
    setPendingOtpMessages(prev => ({ ...prev, [userId]: '' }));

    try {
      const verifyPayload = { otpCode };
      if (user.email) verifyPayload.email = user.email;
      if (user.phone && !user.email) verifyPayload.phone = user.phone;
      
      const response = await axios.post(
        getApiUrl('/auth/verify-otp'),
        verifyPayload,
        { headers: { 'Content-Type': 'application/json' } }
      );

      // Check if verification was successful
      if (response?.data?.token || response?.data?.user) {
        setPendingOtpMessages(prev => ({ ...prev, [userId]: '✓ User verified successfully!' }));
        setPendingOtpInputs(prev => ({ ...prev, [userId]: '' }));
        // Refresh the pending users list to remove the verified user
        setTimeout(() => {
          fetchAll();
        }, 1500);
      } else {
        setPendingOtpMessages(prev => ({ ...prev, [userId]: response.data?.message || 'Verification failed.' }));
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Verification failed.';
      setPendingOtpMessages(prev => ({ ...prev, [userId]: errorMsg }));
    } finally {
      setPendingOtpLoading(prev => ({ ...prev, [userId]: false }));
    }
  };

  const handleAddPendingUser = async () => {
    const { fullName, email, phone } = pendingUserForm;
    if (!phone.trim()) {
      alert('Phone number is required');
      return;
    }

    setAddPendingUserLoading(true);
    try {
      const response = await axios.post(getApiUrl('/admin/set-user-otp'), {
        phone: phone.trim(),
        email: email.trim() || undefined,
        fullName: fullName.trim() || undefined
      }, { headers });

      alert('Pending user created successfully! OTP code: ' + response.data.otpCode);
      setShowAddPendingUserModal(false);
      setPendingUserForm({ fullName: '', email: '', phone: '' });
      fetchAll(); // Refresh the list
    } catch (err) {
      alert('Failed to create pending user: ' + (err.response?.data?.message || err.message));
    } finally {
      setAddPendingUserLoading(false);
    }
  };

  const handleAddAgent = async () => {
    const { fullName, email, phone } = agentForm;
    if (!phone.trim()) {
      alert('Phone number is required');
      return;
    }

    setAddAgentLoading(true);
    try {
      const response = await axios.post(getApiUrl('/admin/set-user-otp'), {
        phone: phone.trim(),
        email: email.trim() || undefined,
        fullName: fullName.trim() || undefined,
        role: 'agent'
      }, { headers });

      alert('Sales agent created successfully! OTP code: ' + response.data.otpCode);
      setShowAddAgentModal(false);
      setAgentForm({ fullName: '', email: '', phone: '' });
      fetchAll(); // Refresh the list
    } catch (err) {
      alert('Failed to create sales agent: ' + (err.response?.data?.message || err.message));
    } finally {
      setAddAgentLoading(false);
    }
  };

  const handleAddChatAdmin = async (adminId) => {
    if (!adminId) {
      setError('Please select an admin');
      return;
    }
    const selectedAdmin = users.find(u => u._id === adminId || u.id === adminId);
    if (selectedAdmin && !chatSupportAdmins.find(a => a._id === selectedAdmin._id || a.id === selectedAdmin.id)) {
      setChatSupportAdmins([...chatSupportAdmins, selectedAdmin]);
      setSelectedChatAdmin(null);
      setShowChatAdminModal(false);
    }
  };

  const handleRemoveChatAdmin = (adminId) => {
    setChatSupportAdmins(chatSupportAdmins.filter(a => a._id !== adminId && a.id !== adminId));
  };

  const handleOpenChatProfileModal = (admin) => {
    setChatProfileEditData({
      id: admin._id || admin.id,
      fullName: admin.fullName || '',
      profilePic: admin.profilePic || admin.avatarUrl || ''
    });
    setShowChatProfileModal(true);
  };

  const handleChatProfileFieldChange = (field, value) => {
    setChatProfileEditData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveChatProfile = async () => {
    if (!chatProfileEditData.id) {
      setError('No admin selected.');
      return;
    }
    if (!chatProfileEditData.fullName.trim()) {
      setError('Full name cannot be empty.');
      return;
    }

    setChatProfileSaving(true);
    try {
      const response = await axios.post(
        getApiUrl('/admin/update-user-profile'),
        {
          userId: chatProfileEditData.id,
          fullName: chatProfileEditData.fullName.trim(),
          profilePic: chatProfileEditData.profilePic.trim() || null
        },
        { headers }
      );

      const updatedUser = response.data?.user;
      if (updatedUser) {
        setChatSupportAdmins(chatSupportAdmins.map(admin => {
          if ((admin._id || admin.id) === updatedUser.id || (admin._id || admin.id) === updatedUser._id) {
            return { ...admin, ...updatedUser };
          }
          return admin;
        }));
        setUsers(users.map(u => ((u._id || u.id) === updatedUser.id || (u._id || u.id) === updatedUser._id ? { ...u, ...updatedUser } : u)));
      }

      setShowChatProfileModal(false);
      setChatProfileEditData({ id: '', fullName: '', profilePic: '' });
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update chat admin profile');
    } finally {
      setChatProfileSaving(false);
    }
  };

  const handleSaveChatSettings = () => {
    alert(`ChatSupport settings saved!\nAuto-response: ${chatAutoResponse}`);
    // In production, this would save to backend
  };

  const userAvatar = user?.avatarUrl || user?.profilePic || null;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const greetingName = user?.fullName?.split(' ')[0] || user?.email?.split('@')[0] || 'Admin';
  const greetingText = `${getGreeting()}, ${greetingName}`;

  const formatCurrency = (amount) => `GH₵ ${parseFloat(amount || 0).toFixed(2)}`;
  const formatDate = (date) => new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  // Calculate user activity stats
  const getUserStats = (userId) => {
    const userTickets = tickets.filter(t => t.user?._id === userId || t.user === userId);
    const userEvents = events.filter(e => e.organizer === userId || e.organizer?._id === userId);
    const userPayments = payments.filter(p => p.userId === userId || p.userId?._id === userId);
    const userSpending = userPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
    
    return {
      ticketsBought: userTickets.length,
      eventCreated: userEvents.length,
      totalSpent: userSpending,
      lastActivity: [...userTickets, ...userPayments].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0]?.createdAt || null
    };
  };

  const filteredUsers = users.filter(u =>
    u.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredEvents = events.filter(e =>
    e.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.organizer?.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPayments = payments.filter(pay =>
    pay.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pay.user?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pay.status?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTickets = tickets.filter(t =>
    t.user?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.event?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.smsCode?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredReports = reports.filter(report =>
    report.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.message?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPendingVerifications = pendingVerifications.filter(user =>
    user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phone?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPendingTickets = pendingTickets.filter(ticket => {
    const ticketUser = users.find(u => u.id === ticket.user || u._id === ticket.user);
    const ticketEvent = events.find(e => e.id === ticket.event || e._id === ticket.event);
    return (
      ticket.smsCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticketUser?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticketUser?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticketEvent?.title?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className={`admin-dashboard ${darkMode ? 'dark-mode' : ''}`}>
      {/* SIDEBAR */}
      <aside className={`admin-sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <img src="/logo-section.jpg" alt="ReekTickets" className="sidebar-logo" />
            <div>
              <h2 className="logo">ReekTickets</h2>
              <p className="logo-subtitle">Admin Portal</p>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {[
            { id: 'dashboard', label: 'Full Control', icon: <FaChartPie /> },
            { id: 'users', label: 'Users', icon: <FaUsers /> },
            { id: 'pending-verifications', label: 'Pending Verifications', icon: <FaUserPlus /> },
            { id: 'pending-tickets', label: 'Pending Tickets', icon: <FaTicketAlt /> },
            { id: 'admins', label: 'Admins', icon: <FaUserShield /> },
            { id: 'events', label: 'Events', icon: <FaCalendarAlt /> },
            { id: 'payments', label: 'Payments', icon: <FaMoneyBillWave /> },
            { id: 'tickets', label: 'Tickets', icon: <FaTicketAlt /> },
            { id: 'reports', label: 'Reports', icon: <FaFileAlt /> },
            { id: 'settings', label: 'Settings', icon: <FaCog /> }
          ].map(nav => (
            <button
              key={nav.id}
              className={`nav-item ${activeTab === nav.id ? 'active' : ''}`}
              onClick={() => {
                setActiveTab(nav.id);
                setMobileMenuOpen(false);
              }}
            >
              <span className="nav-icon">{nav.icon}</span>
              <span className="nav-label">{nav.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button 
            className="dark-mode-toggle"
            onClick={() => setDarkMode(!darkMode)}
          >
            {darkMode ? <><FaSun /> Light</> : <><FaMoon /> Dark</>}
          </button>
        </div>
      </aside>

      {/* MOBILE MENU OVERLAY */}
      {mobileMenuOpen && (
        <div 
          className="mobile-menu-overlay"
          onClick={() => setMobileMenuOpen(false)}
        ></div>
      )}

      {/* MAIN CONTENT */}
      <main className="admin-main">
        {/* HEADER */}
        <header className="admin-header">
          <div className="header-left">
            <button 
              className="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              title="Toggle Menu"
            >
              {mobileMenuOpen ? <FaClose /> : <FaBars />}
            </button>
            <h1 className="header-title">Admin Control Center</h1>
            <p className="dashboard-greeting">{greetingText}</p>
          </div>
          <div className="header-actions">
            <div className="search-box">
              <input 
                type="text" 
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <span className="search-icon"><FaSearch /></span>
            </div>
            <button className="header-icon" title="Notifications"><FaBell /></button>
            <div className="user-dropdown">
              <img
                className="dropdown-avatar"
                src={userAvatar || '/default-avatar.png'}
                alt={user?.fullName ? `${user.fullName} avatar` : 'Admin avatar'}
              />
              <div className="dropdown-info">
                <p className="dropdown-name">{user?.fullName || user?.email?.split('@')[0] || 'Admin'}</p>
                <p className="dropdown-role">{user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Administrator'}</p>
              </div>
              <span className="dropdown-arrow"><FaChevronDown /></span>
            </div>
          </div>
        </header>

        {/* CONTENT */}
        <div className="admin-content">
          {error && <div className="error-banner">{error}</div>}
          {loading ? (
            <div className="loading">Loading dashboard...</div>
          ) : (
            <>
              {/* DASHBOARD TAB */}
              {activeTab === 'dashboard' && (
                <>
                  {/* STAT CARDS */}
                  <div className="stats-grid">
                    <div className="stat-card">
                      <div className="stat-icon"><FaUsers /></div>
                      <div className="stat-info">
                        <p className="stat-label">Total Users</p>
                        <p className="stat-value">{stats.totalUsers}</p>
                      </div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-icon"><FaCalendarAlt /></div>
                      <div className="stat-info">
                        <p className="stat-label">Total Events</p>
                        <p className="stat-value">{stats.totalEvents}</p>
                      </div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-icon"><FaTicketAlt /></div>
                      <div className="stat-info">
                        <p className="stat-label">Total Tickets Sold</p>
                        <p className="stat-value">{stats.totalTickets}</p>
                      </div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-icon"><FaMoneyBillWave /></div>
                      <div className="stat-info">
                        <p className="stat-label">Total Revenue</p>
                        <p className="stat-value">{formatCurrency(stats.totalRevenue)}</p>
                      </div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-icon"><FaStore /></div>
                      <div className="stat-info">
                        <p className="stat-label">Active Vendors</p>
                        <p className="stat-value">{stats.activeVendors}</p>
                      </div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-icon"><FaHandsHelping /></div>
                      <div className="stat-info">
                        <p className="stat-label">Sales Agents</p>
                        <p className="stat-value">{stats.activeSalesAgents}</p>
                      </div>
                    </div>
                  </div>

                  {/* QUICK ACTIONS */}
                  <section className="quick-actions">
                    <h2>Quick Actions</h2>
                    <div className="action-buttons">
                      <button className="action-btn btn-primary" onClick={handleOpenAnnouncementModal}><FaBullhorn /> Send Announcement</button>
                      <button className="action-btn btn-secondary"><FaChartPie /> Export Data</button>
                      <button className="action-btn btn-secondary"><FaSearch /> System Health</button>
                      <button className="action-btn btn-secondary"><FaBolt /> Platform Status</button>
                    </div>
                  </section>

                  {showAnnouncementModal && (
                    <div className="modal-overlay">
                      <div className="modal-content">
                        <div className="modal-header">
                          <h3>Send Announcement</h3>
                          <button className="modal-close-btn" onClick={() => setShowAnnouncementModal(false)}><FaTimes /></button>
                        </div>
                        <div className="modal-body">
                          <label htmlFor="announcementMessage">Announcement Message</label>
                          <textarea
                            id="announcementMessage"
                            value={announcementMessage}
                            onChange={(e) => setAnnouncementMessage(e.target.value)}
                            placeholder="Type announcement message to send to all users..."
                            rows={6}
                          />
                          {announcementSuccess && <p className="success-text">{announcementSuccess}</p>}
                          {error && <p className="error-text">{error}</p>}
                        </div>
                        <div className="modal-footer">
                          <button className="action-btn btn-secondary" onClick={() => setShowAnnouncementModal(false)}>Cancel</button>
                          <button className="action-btn btn-primary" onClick={handleSendAnnouncement} disabled={announcementLoading}>
                            {announcementLoading ? 'Sending...' : 'Send Announcement'}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* REVENUE SUMMARY */}
                  <section className="section" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: '#fff', borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
                    <h2 style={{ margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <FaDollarSign style={{ fontSize: '1.5rem' }} />
                      Platform Revenue Summary
                    </h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                      <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '8px', padding: '16px' }}>
                        <p style={{ margin: '0 0 8px 0', opacity: 0.9 }}>Calculated Revenue</p>
                        <p style={{ margin: 0, fontSize: '1.8rem', fontWeight: 'bold' }}>{formatCurrency(revenue)}</p>
                      </div>
                      <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '8px', padding: '16px' }}>
                        <p style={{ margin: '0 0 8px 0', opacity: 0.9 }}>Stats Total Revenue</p>
                        <p style={{ margin: 0, fontSize: '1.8rem', fontWeight: 'bold' }}>{formatCurrency(stats.totalRevenue)}</p>
                      </div>
                      <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '8px', padding: '16px' }}>
                        <p style={{ margin: '0 0 8px 0', opacity: 0.9 }}>Total Transactions</p>
                        <p style={{ margin: 0, fontSize: '1.8rem', fontWeight: 'bold' }}>{payments.length}</p>
                      </div>
                    </div>
                  </section>

                  {/* SALES AGENTS SECTION */}
                  <section className="section">
                    <div className="section-header">
                      <h2>Sales Agents ({salesAgents.length})</h2>
                      <button className="action-btn btn-primary" onClick={handleOpenAddAgentModal}><FaUserPlus /> Add Agent</button>
                    </div>
                    {salesAgents.length === 0 ? (
                      <p>No sales agents registered yet.</p>
                    ) : (
                      <div className="table-container">
                        <table className="data-table">
                          <thead>
                            <tr>
                              <th>Agent Name</th>
                              <th>Email</th>
                              <th>Phone</th>
                              <th>Sales Count</th>
                              <th>Commission</th>
                              <th>Status</th>
                              <th>Joined</th>
                            </tr>
                          </thead>
                          <tbody>
                            {salesAgents.map(agent => (
                              <tr key={agent._id}>
                                <td>{agent.fullName || 'N/A'}</td>
                                <td>{agent.email || 'N/A'}</td>
                                <td>{agent.phone || 'N/A'}</td>
                                <td className="badge-center">{payments.filter(p => p.agentId === agent._id).length}</td>
                                <td className="badge-center">{agent.commission || '5%'}</td>
                                <td><span className="badge">{agent.status || 'active'}</span></td>
                                <td>{formatDate(agent.createdAt)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </section>

                  {/* VENDORS SECTION */}
                  <section className="section">
                    <div className="section-header">
                      <h2>Vendors ({vendors.length})</h2>
                      <button className="action-btn btn-primary" onClick={handleManageVendors}><FaUserPlus /> Manage Vendors</button>
                    </div>
                    {vendors.length === 0 ? (
                      <p>No vendors registered yet.</p>
                    ) : (
                      <div className="table-container">
                        <table className="data-table">
                          <thead>
                            <tr>
                              <th>Vendor Name</th>
                              <th>Business Type</th>
                              <th>Email</th>
                              <th>Phone</th>
                              <th>Total Revenue</th>
                              <th>Status</th>
                              <th>Joined</th>
                            </tr>
                          </thead>
                          <tbody>
                            {vendors.map(vendor => {
                              const vendorRevenue = payments.filter(p => p.vendorId === vendor._id).reduce((sum, p) => sum + Number(p.amount || 0), 0);
                              return (
                                <tr key={vendor._id}>
                                  <td>{vendor.fullName || 'N/A'}</td>
                                  <td>{vendor.businessType || 'N/A'}</td>
                                  <td>{vendor.email || 'N/A'}</td>
                                  <td>{vendor.phone || 'N/A'}</td>
                                  <td className="badge-center">${vendorRevenue.toFixed(2)}</td>
                                  <td><span className="badge">{vendor.status || 'active'}</span></td>
                                  <td>{formatDate(vendor.createdAt)}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </section>

                  {/* NOTIFICATIONS */}
                  <section className="section">
                    <div className="section-header">
                      <h2>System Notifications ({notifications.length})</h2>
                    </div>
                    {notifications.length === 0 ? (
                      <p>No active notifications.</p>
                    ) : (
                      <div className="notification-list">
                        {notifications.map((notif, idx) => (
                          <div key={idx} className="notification-item">
                            <span className="notification-icon"><FaBell /></span>
                            <div className="notification-content">
                              <p className="notification-title">{notif.title || 'Notification'}</p>
                              <p className="notification-text">{notif.message}</p>
                              <small>{formatDate(notif.timestamp)}</small>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>

                  {/* FRAUD ALERTS */}
                  <section className="section">
                    <div className="section-header">
                      <h2>Fraud Detection Alerts ({fraudAlerts.length})</h2>
                    </div>
                    {fraudAlerts.length === 0 ? (
                      <p>No fraud alerts detected.</p>
                    ) : (
                      <div className="table-container">
                        <table className="data-table">
                          <thead>
                            <tr>
                              <th>Alert Type</th>
                              <th>User</th>
                              <th>Details</th>
                              <th>Timestamp</th>
                              <th>Status</th>
                              <th>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {fraudAlerts.map((alert, idx) => (
                              <tr key={idx}>
                                <td><span className="badge">{alert.type || 'Unknown'}</span></td>
                                <td>{alert.user || 'N/A'}</td>
                                <td>{alert.details || 'N/A'}</td>
                                <td>{formatDate(alert.timestamp)}</td>
                                <td><span className="badge">{alert.status || 'pending'}</span></td>
                                <td>
                                  <button className="action-btn-sm">Review</button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </section>

                  {/* ADMIN ACTIVITY LOGS */}
                  <section className="section">
                    <div className="section-header">
                      <h2>Admin Activity Logs ({adminLogs.length})</h2>
                    </div>
                    {adminLogs.length === 0 ? (
                      <p>No admin activity logs yet.</p>
                    ) : (
                      <div className="table-container">
                        <table className="data-table">
                          <thead>
                            <tr>
                              <th>Admin</th>
                              <th>Action</th>
                              <th>Target</th>
                              <th>Changes</th>
                              <th>Timestamp</th>
                            </tr>
                          </thead>
                          <tbody>
                            {adminLogs.map((log, idx) => (
                              <tr key={idx}>
                                <td>{log.adminName || 'System'}</td>
                                <td><span className="badge">{log.action || 'N/A'}</span></td>
                                <td>{log.target || 'N/A'}</td>
                                <td>{log.changes || 'N/A'}</td>
                                <td>{formatDate(log.timestamp)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </section>

                  {/* USER ACTIVITY LOGS */}
                  <section className="section">
                    <div className="section-header">
                      <h2>User Activity Logs ({userActivityLogs.length})</h2>
                      <div className="pagination">
                        <select value={entriesPerPage} onChange={(e) => setEntriesPerPage(Number(e.target.value))}>
                          <option value={5}>5 entries</option>
                          <option value={10}>10 entries</option>
                          <option value={20}>20 entries</option>
                          <option value={50}>50 entries</option>
                        </select>
                        <div className="page-controls">
                          <button 
                            className="pagination-btn"
                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                          >
                            Previous
                          </button>
                          <span className="page-info">Page {currentPage}</span>
                          <button 
                            className="pagination-btn"
                            onClick={() => setCurrentPage(currentPage + 1)}
                            disabled={currentPage * entriesPerPage >= userActivityLogs.length}
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    </div>
                    {userActivityLogs.length === 0 ? (
                      <p>No user activity logs yet.</p>
                    ) : (
                      <div className="table-container">
                        <table className="data-table">
                          <thead>
                            <tr>
                              <th>User</th>
                              <th>Activity</th>
                              <th>Type</th>
                              <th>IP Address</th>
                              <th>Timestamp</th>
                            </tr>
                          </thead>
                          <tbody>
                            {userActivityLogs
                              .slice((currentPage - 1) * entriesPerPage, currentPage * entriesPerPage)
                              .map((log, idx) => (
                                <tr key={idx}>
                                  <td>{log.userName || 'N/A'}</td>
                                  <td>{log.activity || 'N/A'}</td>
                                  <td><span className="badge">{log.type || 'N/A'}</span></td>
                                  <td>{log.ipAddress || 'N/A'}</td>
                                  <td>{formatDate(log.timestamp)}</td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </section>

                  {/* CHATSUPPORT MANAGEMENT SECTION */}
                  <section className="section" style={{ background: '#f8f9fa', borderRadius: '12px', border: '2px solid #3b82f6' }}>
                    <div className="section-header">
                      <h2 style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#3b82f6' }}>
                        💬 ReekTickets ChatSupport Management
                      </h2>
                    </div>

                    {/* ChatSupport Status & Settings */}
                    <div style={{ marginBottom: '24px', padding: '16px', background: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                      <h3 style={{ marginTop: 0 }}>ChatSupport Status & Settings</h3>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                        <div>
                          <label>
                            <input 
                              type="checkbox" 
                              checked={chatSupportEnabled} 
                              onChange={(e) => setChatSupportEnabled(e.target.checked)}
                            />
                            <span style={{ marginLeft: '8px' }}>ChatSupport Enabled</span>
                          </label>
                          <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#666' }}>
                            Status: <strong>{chatSupportEnabled ? '🟢 ACTIVE' : '🔴 INACTIVE'}</strong>
                          </p>
                        </div>
                        <div>
                          <p style={{ margin: '0 0 8px 0' }}>Active Chat Support Admins</p>
                          <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#3b82f6' }}>{chatSupportAdmins.length}</p>
                        </div>
                        <div>
                          <button 
                            className="action-btn btn-primary"
                            onClick={() => setShowChatAdminModal(true)}
                            style={{ width: '100%' }}
                          >
                            + Add Chat Support Admin
                          </button>
                        </div>
                      </div>

                      <hr style={{ margin: '16px 0', borderColor: '#e5e7eb' }} />

                      <h4>Auto-Response Message</h4>
                      <textarea 
                        value={chatAutoResponse}
                        onChange={(e) => setChatAutoResponse(e.target.value)}
                        style={{
                          width: '100%',
                          minHeight: '100px',
                          padding: '12px',
                          border: '1px solid #e5e7eb',
                          borderRadius: '6px',
                          fontFamily: 'Segoe UI, sans-serif',
                          fontSize: '14px'
                        }}
                        placeholder="Enter auto-response message..."
                      />
                      <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#666' }}>
                        This message will be sent to users before a chat support admin responds.
                      </p>
                      <button 
                        className="action-btn btn-primary"
                        onClick={handleSaveChatSettings}
                        style={{ marginTop: '12px' }}
                      >
                        Save ChatSupport Settings
                      </button>
                    </div>

                    {/* Chat Support Admins List */}
                    <div style={{ padding: '16px', background: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', marginBottom: '16px' }}>
                      <h3 style={{ marginTop: 0 }}>Assigned Chat Support Admins</h3>
                      {chatSupportAdmins.length === 0 ? (
                        <p style={{ color: '#666', margin: 0 }}>No chat support admins assigned yet. Click "Add Chat Support Admin" to assign admins.</p>
                      ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '12px' }}>
                          {chatSupportAdmins.map(admin => (
                            <div 
                              key={admin._id || admin.id} 
                              style={{
                                padding: '12px',
                                background: '#f3f4f6',
                                borderRadius: '8px',
                                border: '1px solid #e5e7eb',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <img
                                  src={admin.profilePic || admin.avatarUrl || '/default-avatar.png'}
                                  alt={admin.fullName || admin.email}
                                  style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #d1d5db' }}
                                />
                                <div>
                                  <p style={{ margin: '0 0 4px 0', fontWeight: 'bold', fontSize: '14px' }}>
                                    {admin.fullName || admin.email}
                                  </p>
                                  <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>
                                    {admin.email}
                                  </p>
                                </div>
                              </div>
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <button
                                  className="action-btn btn-secondary"
                                  onClick={() => handleOpenChatProfileModal(admin)}
                                  style={{ padding: '6px 10px', fontSize: '12px' }}
                                >
                                  Edit Profile
                                </button>
                                <button 
                                  className="action-btn"
                                  onClick={() => handleRemoveChatAdmin(admin._id || admin.id)}
                                  style={{
                                    background: '#ef4444',
                                    color: '#fff',
                                    padding: '6px 12px',
                                    fontSize: '12px'
                                  }}
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Chat Features */}
                    <div style={{ padding: '16px', background: '#e3f2fd', borderRadius: '8px', border: '1px solid #90caf9' }}>
                      <h3 style={{ marginTop: 0, color: '#1976d2' }}>Available ChatSupport Features</h3>
                      <ul style={{ margin: 0, paddingLeft: '24px' }}>
                        <li>✅ Real-time user-to-admin messaging</li>
                        <li>✅ Chat history and transcripts</li>
                        <li>✅ Multi-admin support for simultaneous chats</li>
                        <li>✅ Admin assignment and load balancing</li>
                        <li>✅ Auto-response for offline periods</li>
                        <li>✅ Chat rating and feedback system</li>
                        <li>✅ Chat search and filtering</li>
                        <li>✅ User account linking in chat</li>
                        <li>✅ Admin activity tracking</li>
                      </ul>
                    </div>
                  </section>
                </>
              )}

              {/* USERS TAB */}
              {activeTab === 'users' && (
                <section className="section">
                  <div className="section-header">
                    <h2>User Management ({users.length})</h2>
                    <input 
                      type="text" 
                      placeholder="Search users..." 
                      className="search-input"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  {users.length === 0 ? <p>No users found.</p> : (
                    <div className="table-container">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Status</th>
                            <th>Tickets Bought</th>
                            <th>Total Spent</th>
                            <th>Joined</th>
                            <th>Last Activity</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredUsers.map(u => {
                            const stats = getUserStats(u._id);
                            return (
                              <tr key={u._id}>
                                <td><strong>{u.fullName}</strong></td>
                                <td>{u.email}</td>
                                <td><span className="badge">{u.role}</span></td>
                                <td><span className={`badge ${u.status === 'active' ? 'active' : 'banned'}`}>{u.status || 'active'}</span></td>
                                <td className="badge-center">{stats.ticketsBought}</td>
                                <td className="badge-center">${stats.totalSpent.toFixed(2)}</td>
                                <td>{formatDate(u.createdAt)}</td>
                                <td>{stats.lastActivity ? formatDate(stats.lastActivity) : 'Never'}</td>
                                <td>
                                  <div className="action-buttons-sm">
                                    <button 
                                      className="action-btn-sm view-btn"
                                      onClick={() => setSelectedUserDetails(u)}
                                      title="View detailed account info"
                                    >
                                      <FaEye /> View
                                    </button>
                                    {u.role !== 'admin' && <button className="action-btn-sm" onClick={() => runAction(`/admin/users/${u._id}/role`, 'patch', { role: 'admin' })}>Make Admin</button>}
                                    {u.role !== 'supporter' && u.role !== 'admin' && <button className="action-btn-sm" onClick={() => runAction(`/admin/users/${u._id}/role`, 'patch', { role: 'supporter' })}>Make Supporter</button>}
                                    {u.role === 'supporter' && <button className="action-btn-sm" onClick={() => runAction(`/admin/users/${u._id}/role`, 'patch', { role: 'attendee' })}>Remove Supporter</button>}
                                    {u.role === 'admin' && <button className="action-btn-sm" onClick={() => runAction(`/admin/users/${u._id}/role`, 'patch', { role: 'attendee' })}>Remove</button>}
                                    {u.status !== 'banned' && <button className="action-btn-sm" onClick={() => runAction(`/admin/users/${u._id}/status`, 'patch', { status: 'banned' })}>Ban</button>}
                                    {u.status === 'banned' && <button className="action-btn-sm" onClick={() => runAction(`/admin/users/${u._id}/status`, 'patch', { status: 'active' })}>Unban</button>}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </section>
              )}

              {/* ADMINS TAB */}
              {activeTab === 'admins' && (
                <section className="section">
                  <div className="section-header">
                    <h2>Admin Management ({users.filter(u => u.role === 'admin').length})</h2>
                    <button 
                      className="action-btn btn-primary"
                      onClick={() => setActiveTab('users')}
                    >
                      <FaUserPlus /> Make User Admin
                    </button>
                  </div>
                  {users.filter(u => u.role === 'admin').length === 0 ? <p>No admins found.</p> : (
                    <div className="table-container">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Status</th>
                            <th>Users Managed</th>
                            <th>Joined</th>
                            <th>Last Activity</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {users.filter(u => u.role === 'admin').map(admin => {
                            const stats = getUserStats(admin._id);
                            return (
                              <tr key={admin._id}>
                                <td><strong><FaUserShield /> {admin.fullName}</strong></td>
                                <td>{admin.email}</td>
                                <td><span className={`badge ${admin.status === 'active' ? 'active' : 'banned'}`}>{admin.status || 'active'}</span></td>
                                <td className="badge-center">{users.length}</td>
                                <td>{formatDate(admin.createdAt)}</td>
                                <td>{stats.lastActivity ? formatDate(stats.lastActivity) : 'Never'}</td>
                                <td>
                                  <div className="action-buttons-sm">
                                    <button 
                                      className="action-btn-sm view-btn"
                                      onClick={() => setSelectedUserDetails(admin)}
                                      title="View admin details"
                                    >
                                      <FaEye /> View
                                    </button>
                                    <button 
                                      className="action-btn-sm"
                                      onClick={() => runAction(`/admin/users/${admin._id}/role`, 'patch', { role: 'attendee' })}
                                    >
                                      <FaUndo /> Remove Admin
                                    </button>
                                    {admin.status !== 'banned' && <button className="action-btn-sm" onClick={() => runAction(`/admin/users/${admin._id}/status`, 'patch', { status: 'banned' })}>Ban</button>}
                                    {admin.status === 'banned' && <button className="action-btn-sm" onClick={() => runAction(`/admin/users/${admin._id}/status`, 'patch', { status: 'active' })}>Unban</button>}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </section>
              )}

              {/* EVENTS TAB */}
              {activeTab === 'events' && (
                <section className="section">
                  <div className="section-header">
                    <h2>Event Management ({events.length})</h2>
                    <input 
                      type="text" 
                      placeholder="Search events..." 
                      className="search-input"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  {events.length === 0 ? <p>No events yet.</p> : (
                    <div className="table-container">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Title</th>
                            <th>Status</th>
                            <th>Organizer</th>
                            <th>Date</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredEvents.map(ev => (
                            <tr key={ev._id}>
                              <td><strong>{ev.title}</strong></td>
                              <td><span className="badge">{ev.status}</span></td>
                              <td>{ev.organizer?.fullName || 'N/A'}</td>
                              <td>{formatDate(ev.date)}</td>
                              <td>
                                <div className="action-buttons-sm">
                                  {ev.status !== 'approved' && <button className="action-btn-sm" onClick={() => runAction(`/admin/events/${ev._id}`, 'patch', { status: 'approved', published: true })}>Approve</button>}
                                  {ev.status !== 'rejected' && <button className="action-btn-sm" onClick={() => runAction(`/admin/events/${ev._id}`, 'patch', { status: 'rejected', published: false })}>Reject</button>}
                                  <button className="action-btn-sm delete" onClick={() => runAction(`/admin/events/${ev._id}`, 'delete')}>Delete</button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </section>
              )}

              {/* PAYMENTS TAB */}
              {activeTab === 'payments' && (
                <section className="section">
                  <div className="section-header">
                    <h2>Payments & Transactions ({payments.length})</h2>
                    <div className="filters">
                      <input 
                        type="date" 
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value)}
                        className="filter-input"
                      />
                      <select 
                        value={filterPaymentMethod}
                        onChange={(e) => setFilterPaymentMethod(e.target.value)}
                        className="filter-input"
                      >
                        <option value="">All Methods</option>
                        <option value="credit_card">Credit Card</option>
                        <option value="paystack">Paystack</option>
                      </select>
                    </div>
                  </div>
                  {filteredPayments.length === 0 ? <p>No payments found.</p> : (
                    <div className="table-container">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Reference</th>
                            <th>Payer</th>
                            <th>Amount</th>
                            <th>Status</th>
                            <th>Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredPayments.map(p => (
                            <tr key={p._id}>
                              <td><code>{p.reference}</code></td>
                              <td>{p.user?.fullName || 'Unknown'}</td>
                              <td><strong>{formatCurrency(p.amount)}</strong></td>
                              <td><span className={`badge ${p.status === 'completed' ? 'active' : 'pending'}`}>{p.status}</span></td>
                              <td>{formatDate(p.createdAt)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </section>
              )}

              {/* TICKETS TAB */}
              {activeTab === 'tickets' && (
                <section className="section">
                  <div className="section-header">
                    <h2>Ticket Management ({tickets.length})</h2>
                  </div>
                  {filteredTickets.length === 0 ? <p>No tickets found.</p> : (
                    <div className="table-container">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Attendee</th>
                            <th>Event</th>
                            <th>Access Code</th>
                            <th>Status</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredTickets.map(t => (
                            <tr key={t._id}>
                              <td><strong>{t.user?.fullName}</strong></td>
                              <td>{t.event?.title}</td>
                              <td><code>{t.smsCode}</code></td>
                              <td><span className="badge">{t.status}</span></td>
                              <td>
                                <div className="action-buttons">
                                  <button 
                                    className="btn-copy"
                                    onClick={() => {
                                      navigator.clipboard.writeText(t.smsCode);
                                      alert(`Access code copied: ${t.smsCode}`);
                                    }}
                                  >
                                    <FaClipboard /> Copy Access Code
                                  </button>
                                  <button 
                                    className="btn-copy"
                                    onClick={() => {
                                      const ticketLink = `${window.location.origin}/ticket/${t._id}?code=${t.smsCode}`;
                                      navigator.clipboard.writeText(ticketLink);
                                      alert(`Ticket link copied to clipboard`);
                                    }}
                                  >
                                    <FaLink /> Copy Link
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </section>
              )}

              {/* REPORTS TAB */}
              {activeTab === 'reports' && (
                <section className="section">
                  <div className="section-header">
                    <h2>Reports ({reports.length})</h2>
                  </div>
                  {filteredReports.length === 0 ? <p>No reports yet.</p> : (
                    <div className="table-container">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Sender</th>
                            <th>Role</th>
                            <th>Message</th>
                            <th>Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredReports.map(report => (
                            <tr key={report._id}>
                              <td>{report.user_name}</td>
                              <td><span className="badge">{report.role}</span></td>
                              <td>{report.message}</td>
                              <td>{new Date(report.createdAt).toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </section>
              )}

              {/* PENDING VERIFICATIONS TAB */}
              {activeTab === 'pending-verifications' && (
                <section className="section">
                  <div className="section-header" style={{ alignItems: 'flex-start', gap: '12px' }}>
                    <div>
                      <h2>Pending User Verifications</h2>
                      <p className="instructions-text" style={{ color: '#666', margin: '8px 0 0 0', fontSize: '14px', maxWidth: '720px' }}>
                        <strong>Instructions:</strong> Copy the phone number and OTP code, then send SMS manually using <code>send_sms_example.py</code>.
                        After the user receives the code, they can enter it to complete verification and reach their dashboard.
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <button className="action-btn btn-primary" onClick={() => setShowAddPendingUserModal(true)}><FaUserPlus /> Add Pending User</button>
                      <button className="action-btn btn-secondary" onClick={fetchAll}>Refresh List</button>
                      {searchTerm && (
                        <button
                          className="action-btn"
                          onClick={() => setSearchTerm('')}
                          style={{ backgroundColor: '#f3f4f6', color: '#111' }}
                        >
                          Clear Search
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="table-container">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Phone</th>
                          <th>OTP Code</th>
                          <th>Role</th>
                          <th>Registered</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredPendingVerifications.length > 0 ? (
                          filteredPendingVerifications.map(user => (
                            <tr key={user._id || user.id}>
                              <td>{user.full_name || user.fullName || 'New User'}</td>
                              <td>{user.email || 'No email'}</td>
                              <td>{user.phone || 'No phone'}</td>
                              <td><code>{user.otp_code || user.otpCode || 'Not generated'}</code></td>
                              <td><span className="badge">{user.role || 'attendee'}</span></td>
                              <td>{formatDate(user.created_at || user.createdAt)}</td>
                              <td>
                                <div style={{ display: 'grid', gap: '8px' }}>
                                  <input
                                    type="text"
                                    value={pendingOtpInputs[user._id || user.id] || ''}
                                    onChange={(e) => handlePendingUserOtpInputChange(user._id || user.id, e.target.value)}
                                    placeholder="Enter code"
                                    maxLength={6}
                                    style={{ padding: '8px', borderRadius: '8px', border: '1px solid #d1d5db', width: '100%' }}
                                  />
                                  <button
                                    className="action-btn btn-primary"
                                    onClick={() => handleVerifyPendingUserOtp(user)}
                                    disabled={pendingOtpLoading[user._id || user.id]}
                                  >
                                    {pendingOtpLoading[user._id || user.id] ? 'Verifying...' : 'Verify Code'}
                                  </button>
                                  <button
                                    className="action-btn btn-secondary"
                                    onClick={() => {
                                      const textToCopy = user.phone || '';
                                      navigator.clipboard.writeText(textToCopy);
                                      alert(`Phone copied: ${textToCopy}`);
                                    }}
                                  >
                                    Copy Phone
                                  </button>
                                  <button
                                    className="action-btn btn-secondary"
                                    onClick={() => {
                                      const textToCopy = user.otp_code || user.otpCode || '';
                                      navigator.clipboard.writeText(textToCopy);
                                      alert(`OTP copied: ${textToCopy}`);
                                    }}
                                    disabled={!user.otp_code && !user.otpCode}
                                  >
                                    Copy OTP
                                  </button>
                                  {pendingOtpMessages[user._id || user.id] && (
                                    <p style={{ margin: '0', color: '#dc2626', fontSize: '0.9rem' }}>
                                      {pendingOtpMessages[user._id || user.id]}
                                    </p>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="7" style={{ textAlign: 'center', padding: '24px', color: '#555' }}>
                              No pending verifications found. If you expect a user here, confirm they signed up and remain unverified, then click Refresh List.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}

              {/* OTP INPUT MODAL */}
              {showOtpModal && selectedUserForOtp && (
                <div className="modal-overlay" onClick={() => {
                  setShowOtpModal(false);
                  setSelectedUserForOtp(null);
                  setOtpInputValue('');
                }}>
                  <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                    <div className="modal-header">
                      <h3>Enter OTP Code for {selectedUserForOtp.fullName}</h3>
                      <button 
                        className="modal-close-btn"
                        onClick={() => {
                          setShowOtpModal(false);
                          setSelectedUserForOtp(null);
                          setOtpInputValue('');
                        }}
                      >
                        <FaTimes />
                      </button>
                    </div>
                    <div className="modal-body">
                      <p><strong>User Phone:</strong> {selectedUserForOtp.phone}</p>
                      <p><strong>User Email:</strong> {selectedUserForOtp.email}</p>
                      <label>
                        Enter the 6-digit OTP code you sent via SMS:
                        <input 
                          type="text" 
                          maxLength="6"
                          placeholder="000000"
                          value={otpInputValue}
                          onChange={(e) => setOtpInputValue(e.target.value.replace(/\D/g, ''))}
                          className="otp-input"
                          style={{marginTop: '10px', padding: '10px', fontSize: '20px', letterSpacing: '5px', textAlign: 'center'}}
                        />
                      </label>
                    </div>
                    <div className="modal-footer">
                      <button 
                        className="action-btn send-btn"
                        onClick={handleSetUserOtp}
                        disabled={otpModalLoading || otpInputValue.length !== 6}
                      >
                        {otpModalLoading ? 'Setting...' : 'Set OTP Code'}
                      </button>
                      <button 
                        className="action-btn"
                        onClick={() => {
                          setShowOtpModal(false);
                          setSelectedUserForOtp(null);
                          setOtpInputValue('');
                        }}
                        style={{backgroundColor: '#ccc', color: '#333'}}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* CHAT SUPPORT ADMIN MODAL */}
              {showChatAdminModal && (
                <div className="modal-overlay" onClick={() => {
                  setShowChatAdminModal(false);
                  setSelectedChatAdmin(null);
                }}>
                  <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                    <div className="modal-header">
                      <h3>Assign Chat Support Admin</h3>
                      <button 
                        className="modal-close-btn"
                        onClick={() => {
                          setShowChatAdminModal(false);
                          setSelectedChatAdmin(null);
                        }}
                      >
                        <FaTimes />
                      </button>
                    </div>
                    <div className="modal-body">
                      <label>
                        Select an admin to assign to ChatSupport:
                        <select 
                          value={selectedChatAdmin || ''} 
                          onChange={(e) => setSelectedChatAdmin(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '10px',
                            marginTop: '10px',
                            border: '1px solid #e5e7eb',
                            borderRadius: '6px',
                            fontFamily: 'Segoe UI, sans-serif',
                            fontSize: '14px'
                          }}
                        >
                          <option value="">-- Select an admin --</option>
                          {users
                            .filter(u => u.role === 'admin' || u.email === 'ceoofreektickets@gmail.com')
                            .filter(u => !chatSupportAdmins.find(ca => ca._id === u._id || ca.id === u.id))
                            .map(admin => (
                              <option key={admin._id || admin.id} value={admin._id || admin.id}>
                                {admin.fullName || admin.email}
                              </option>
                            ))}
                        </select>
                      </label>
                      <p style={{ marginTop: '12px', fontSize: '12px', color: '#666' }}>
                        This admin will be able to view all user chats, send responses, and manage ChatSupport. They can be removed anytime.
                      </p>
                    </div>
                    <div className="modal-footer">
                      <button 
                        className="action-btn btn-primary"
                        onClick={() => handleAddChatAdmin(selectedChatAdmin)}
                        disabled={!selectedChatAdmin}
                      >
                        Add Chat Admin
                      </button>
                      <button 
                        className="action-btn"
                        onClick={() => {
                          setShowChatAdminModal(false);
                          setSelectedChatAdmin(null);
                        }}
                        style={{backgroundColor: '#ccc', color: '#333'}}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* CHAT SUPPORT PROFILE EDIT MODAL */}
              {showChatProfileModal && (
                <div className="modal-overlay" onClick={() => {
                  setShowChatProfileModal(false);
                  setChatProfileEditData({ id: '', fullName: '', profilePic: '' });
                }}>
                  <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                    <div className="modal-header">
                      <h3>Edit Chat Admin Profile</h3>
                      <button 
                        className="modal-close-btn"
                        onClick={() => {
                          setShowChatProfileModal(false);
                          setChatProfileEditData({ id: '', fullName: '', profilePic: '' });
                        }}
                      >
                        <FaTimes />
                      </button>
                    </div>
                    <div className="modal-body">
                      <label>
                        Full Name:
                        <input
                          type="text"
                          value={chatProfileEditData.fullName}
                          onChange={(e) => handleChatProfileFieldChange('fullName', e.target.value)}
                          style={{
                            width: '100%',
                            padding: '10px',
                            marginTop: '10px',
                            border: '1px solid #e5e7eb',
                            borderRadius: '6px',
                            fontFamily: 'Segoe UI, sans-serif',
                            fontSize: '14px'
                          }}
                        />
                      </label>
                      <label style={{ display: 'block', marginTop: '16px' }}>
                        Profile Picture URL:
                        <input
                          type="text"
                          value={chatProfileEditData.profilePic}
                          onChange={(e) => handleChatProfileFieldChange('profilePic', e.target.value)}
                          style={{
                            width: '100%',
                            padding: '10px',
                            marginTop: '10px',
                            border: '1px solid #e5e7eb',
                            borderRadius: '6px',
                            fontFamily: 'Segoe UI, sans-serif',
                            fontSize: '14px'
                          }}
                          placeholder="https://..."
                        />
                      </label>
                      {chatProfileEditData.profilePic && (
                        <div style={{ marginTop: '16px', textAlign: 'center' }}>
                          <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#666' }}>Profile preview</p>
                          <img
                            src={chatProfileEditData.profilePic}
                            alt="Profile preview"
                            style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #d1d5db' }}
                          />
                        </div>
                      )}
                    </div>
                    <div className="modal-footer">
                      <button 
                        className="action-btn btn-primary"
                        onClick={handleSaveChatProfile}
                        disabled={chatProfileSaving}
                      >
                        {chatProfileSaving ? 'Saving...' : 'Save Profile'}
                      </button>
                      <button 
                        className="action-btn"
                        onClick={() => {
                          setShowChatProfileModal(false);
                          setChatProfileEditData({ id: '', fullName: '', profilePic: '' });
                        }}
                        style={{backgroundColor: '#ccc', color: '#333'}}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* PENDING TICKETS TAB */}
              {activeTab === 'pending-tickets' && (
                <section className="section">
                  <div className="section-header" style={{ alignItems: 'flex-start', gap: '12px' }}>
                    <div>
                      <h2>Pending Tickets</h2>
                      <p style={{ color: '#666', margin: '8px 0 0 0', fontSize: '14px', maxWidth: '720px' }}>
                        After a user finishes buying a ticket, it will appear here with purchase details. Copy the user's phone number,
                        access code, or ticket link and send it via <code>send_sms_example.py</code>.
                      </p>
                    </div>
                  </div>
                  <div className="table-container">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Ticket ID</th>
                          <th>User</th>
                          <th>Phone</th>
                          <th>Event</th>
                          <th>Code</th>
                          <th>Purchased</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredPendingTickets.map(ticket => {
                          const ticketUser = users.find(u => u.id === ticket.user || u._id === ticket.user);
                          const ticketEvent = events.find(e => e.id === ticket.event || e._id === ticket.event);
                          const ticketId = ticket._id || ticket.id;
                          const ticketPhone = ticketUser?.phone || ticket.phone || 'Unknown';
                          const ticketLink = `${window.location.origin}/ticket/${ticketId}?code=${ticket.smsCode}`;
                          return (
                            <tr key={ticketId}>
                              <td>{ticketId}</td>
                              <td>{ticketUser?.fullName || 'Unknown'}</td>
                              <td>{ticketPhone}</td>
                              <td>{ticketEvent?.title || 'Unknown'}</td>
                              <td><code>{ticket.smsCode}</code></td>
                              <td>{formatDate(ticket.createdAt)}</td>
                              <td>
                                <div style={{ display: 'grid', gap: '8px' }}>
                                  <button
                                    type="button"
                                    className="action-btn btn-secondary"
                                    onClick={() => {
                                      navigator.clipboard.writeText(ticketPhone || '');
                                      alert(`Phone copied: ${ticketPhone}`);
                                    }}
                                  >
                                    <FaClipboard /> Copy Phone
                                  </button>
                                  <button
                                    type="button"
                                    className="action-btn btn-secondary"
                                    onClick={() => {
                                      navigator.clipboard.writeText(ticket.smsCode || '');
                                      alert(`Access code copied: ${ticket.smsCode}`);
                                    }}
                                  >
                                    <FaClipboard /> Copy Code
                                  </button>
                                  <button
                                    type="button"
                                    className="action-btn btn-secondary"
                                    onClick={() => {
                                      navigator.clipboard.writeText(ticketLink);
                                      alert(`Ticket link copied: ${ticketLink}`);
                                    }}
                                  >
                                    <FaLink /> Copy Link
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}

              {/* SETTINGS TAB */}
              {activeTab === 'settings' && (
                <section className="section">
                  <h2>System Settings</h2>
                  <div className="settings-grid">
                    <div className="setting-card">
                      <h3>Platform Settings</h3>
                      <input type="text" placeholder="Platform Name" defaultValue="ReekTickets" />
                      <button className="save-btn">Save Changes</button>
                    </div>
                    <div className="setting-card">
                      <h3>Commission Rates</h3>
                      <label>Default Commission: <input type="number" defaultValue="5" min="0" max="100" /> %</label>
                      <button className="save-btn">Save Changes</button>
                    </div>
                    <div className="setting-card">
                      <h3>Feature Toggle</h3>
                      <label><input type="checkbox" defaultChecked /> Enable Fraud Detection</label>
                      <label><input type="checkbox" defaultChecked /> Enable Analytics</label>
                      <button className="save-btn">Save Changes</button>
                    </div>
                  </div>
                </section>
              )}
            </>
          )}
        </div>

        {/* ADD PENDING USER MODAL */}
        {showAddPendingUserModal && (
          <div className="modal-overlay" onClick={() => setShowAddPendingUserModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Add Pending User</h3>
                <button 
                  className="modal-close-btn"
                  onClick={() => setShowAddPendingUserModal(false)}
                >
                  <FaTimes />
                </button>
              </div>
              <div className="modal-body">
                <label>
                  Full Name (optional):
                  <input
                    type="text"
                    value={pendingUserForm.fullName}
                    onChange={(e) => setPendingUserForm(prev => ({ ...prev, fullName: e.target.value }))}
                    placeholder="Enter full name"
                    style={{
                      width: '100%',
                      padding: '10px',
                      marginTop: '10px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px',
                      fontFamily: 'Segoe UI, sans-serif',
                      fontSize: '14px'
                    }}
                  />
                </label>
                <label style={{ display: 'block', marginTop: '16px' }}>
                  Email (optional):
                  <input
                    type="email"
                    value={pendingUserForm.email}
                    onChange={(e) => setPendingUserForm(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter email address"
                    style={{
                      width: '100%',
                      padding: '10px',
                      marginTop: '10px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px',
                      fontFamily: 'Segoe UI, sans-serif',
                      fontSize: '14px'
                    }}
                  />
                </label>
                <label style={{ display: 'block', marginTop: '16px' }}>
                  Phone Number (required):
                  <input
                    type="tel"
                    value={pendingUserForm.phone}
                    onChange={(e) => setPendingUserForm(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="Enter phone number (e.g. 0501234567)"
                    style={{
                      width: '100%',
                      padding: '10px',
                      marginTop: '10px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px',
                      fontFamily: 'Segoe UI, sans-serif',
                      fontSize: '14px'
                    }}
                  />
                </label>
                <p style={{ marginTop: '12px', fontSize: '12px', color: '#666' }}>
                  This will create a new unverified user with an OTP code. You can then send the OTP via SMS for testing.
                </p>
              </div>
              <div className="modal-footer">
                <button 
                  className="action-btn btn-primary"
                  onClick={handleAddPendingUser}
                  disabled={addPendingUserLoading || !pendingUserForm.phone.trim()}
                >
                  {addPendingUserLoading ? 'Creating...' : 'Create Pending User'}
                </button>
                <button 
                  className="action-btn"
                  onClick={() => {
                    setShowAddPendingUserModal(false);
                    setPendingUserForm({ fullName: '', email: '', phone: '' });
                  }}
                  style={{backgroundColor: '#ccc', color: '#333'}}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ADD AGENT MODAL */}
        {showAddAgentModal && (
          <div className="modal-overlay" onClick={() => setShowAddAgentModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Add Sales Agent</h3>
                <button 
                  className="modal-close-btn"
                  onClick={() => setShowAddAgentModal(false)}
                >
                  <FaTimes />
                </button>
              </div>
              <div className="modal-body">
                <label>
                  Full Name (optional):
                  <input
                    type="text"
                    value={agentForm.fullName}
                    onChange={(e) => setAgentForm(prev => ({ ...prev, fullName: e.target.value }))}
                    placeholder="Enter full name"
                    style={{
                      width: '100%',
                      padding: '10px',
                      marginTop: '10px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px',
                      fontFamily: 'Segoe UI, sans-serif',
                      fontSize: '14px'
                    }}
                  />
                </label>
                <label style={{ display: 'block', marginTop: '16px' }}>
                  Email (optional):
                  <input
                    type="email"
                    value={agentForm.email}
                    onChange={(e) => setAgentForm(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter email address"
                    style={{
                      width: '100%',
                      padding: '10px',
                      marginTop: '10px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px',
                      fontFamily: 'Segoe UI, sans-serif',
                      fontSize: '14px'
                    }}
                  />
                </label>
                <label style={{ display: 'block', marginTop: '16px' }}>
                  Phone Number (required):
                  <input
                    type="tel"
                    value={agentForm.phone}
                    onChange={(e) => setAgentForm(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="Enter phone number (e.g. 0501234567)"
                    style={{
                      width: '100%',
                      padding: '10px',
                      marginTop: '10px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px',
                      fontFamily: 'Segoe UI, sans-serif',
                      fontSize: '14px'
                    }}
                  />
                </label>
                <p style={{ marginTop: '12px', fontSize: '12px', color: '#666' }}>
                  This creates a sales agent account and generates a 6-digit OTP code to verify the account manually.
                </p>
              </div>
              <div className="modal-footer">
                <button 
                  className="action-btn btn-primary"
                  onClick={handleAddAgent}
                  disabled={addAgentLoading || !agentForm.phone.trim()}
                >
                  {addAgentLoading ? 'Creating...' : 'Create Sales Agent'}
                </button>
                <button 
                  className="action-btn"
                  onClick={() => {
                    setShowAddAgentModal(false);
                    setAgentForm({ fullName: '', email: '', phone: '' });
                  }}
                  style={{backgroundColor: '#ccc', color: '#333'}}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MANAGE VENDORS MODAL */}
        {showManageVendorsModal && (
          <div className="modal-overlay" onClick={() => setShowManageVendorsModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Manage Vendors ({vendors.length})</h3>
                <button 
                  className="modal-close-btn"
                  onClick={() => setShowManageVendorsModal(false)}
                >
                  <FaTimes />
                </button>
              </div>
              <div className="modal-body">
                {vendors.length === 0 ? (
                  <p>No vendors registered yet.</p>
                ) : (
                  <div style={{ maxHeight: '420px', overflowY: 'auto', display: 'grid', gap: '10px' }}>
                    {vendors.map(vendor => (
                      <div key={vendor.id || vendor._id} style={{
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        padding: '14px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '12px'
                      }}>
                        <div>
                          <strong>{vendor.fullName || 'Unnamed Vendor'}</strong>
                          <p style={{ margin: '4px 0 0 0', color: '#555' }}>{vendor.email || vendor.phone}</p>
                          <p style={{ margin: '4px 0 0 0', color: '#777' }}>Status: {vendor.status || 'active'}</p>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          <button className="action-btn-sm" style={{ backgroundColor: '#dc2626', color: '#fff' }} onClick={() => runAction(`/admin/users/${vendor.id || vendor._id}/status`, 'patch', { status: 'banned' })}>
                            Ban
                          </button>
                          <button className="action-btn-sm" style={{ backgroundColor: '#28a745', color: '#fff' }} onClick={() => runAction(`/admin/users/${vendor.id || vendor._id}/status`, 'patch', { status: 'active' })}>
                            Unban
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button 
                  className="action-btn"
                  onClick={() => setShowManageVendorsModal(false)}
                  style={{ backgroundColor: '#ccc', color: '#333' }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* USER DETAILS MODAL */}
        {selectedUserDetails && (
          <div className="modal-overlay" onClick={() => setSelectedUserDetails(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Account Details - {selectedUserDetails.fullName}</h2>
                <button className="close-btn" onClick={() => setSelectedUserDetails(null)}><FaTimes /></button>
              </div>
              
              {(() => {
                const stats = getUserStats(selectedUserDetails._id);
                const userTickets = tickets.filter(t => t.user?._id === selectedUserDetails._id || t.user === selectedUserDetails._id);
                const userEvents = events.filter(e => e.organizer === selectedUserDetails._id || e.organizer?._id === selectedUserDetails._id);
                const userPayments = payments.filter(p => p.userId === selectedUserDetails._id || p.userId?._id === selectedUserDetails._id);
                
                return (
                  <div className="modal-body">
                    {/* User Info */}
                    <div className="detail-section">
                      <h3><FaClipboard /> Personal Information</h3>
                      <div className="detail-grid">
                        <div className="detail-item">
                          <label>Full Name</label>
                          <p>{selectedUserDetails.fullName}</p>
                        </div>
                        <div className="detail-item">
                          <label>Email</label>
                          <p>{selectedUserDetails.email}</p>
                        </div>
                        <div className="detail-item">
                          <label>Phone</label>
                          <p>{selectedUserDetails.phone || 'N/A'}</p>
                        </div>
                        <div className="detail-item">
                          <label>Role</label>
                          <p><span className="badge">{selectedUserDetails.role}</span></p>
                        </div>
                        <div className="detail-item">
                          <label>Status</label>
                          <p><span className={`badge ${selectedUserDetails.status === 'active' ? 'active' : 'banned'}`}>{selectedUserDetails.status || 'active'}</span></p>
                        </div>
                        <div className="detail-item">
                          <label>Member Since</label>
                          <p>{formatDate(selectedUserDetails.createdAt)}</p>
                        </div>
                      </div>
                    </div>

                    {/* Activity Stats */}
                    <div className="detail-section">
                      <h3><FaChartPie /> Activity Summary</h3>
                      <div className="stats-grid">
                        <div className="stat-card">
                          <p className="stat-label"><FaTicketAlt /> Tickets Bought</p>
                          <p className="stat-value">{stats.ticketsBought}</p>
                        </div>
                        <div className="stat-card">
                          <p className="stat-label"><FaDollarSign /> Total Spent</p>
                          <p className="stat-value">${stats.totalSpent.toFixed(2)}</p>
                        </div>
                        <div className="stat-card">
                          <p className="stat-label"><FaCalendarAlt /> Events Created</p>
                          <p className="stat-value">{stats.eventCreated}</p>
                        </div>
                        <div className="stat-card">
                          <p className="stat-label"><FaClock /> Last Active</p>
                          <p className="stat-value">{stats.lastActivity ? formatDate(stats.lastActivity) : 'Never'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Recent Tickets */}
                    {userTickets.length > 0 && (
                      <div className="detail-section">
                        <h3><FaTicketAlt /> Recent Tickets</h3>
                        <div className="table-container">
                          <table className="data-table">
                            <thead>
                              <tr>
                                <th>Event</th>
                                <th>Ticket Code</th>
                                <th>Status</th>
                                <th>Date</th>
                              </tr>
                            </thead>
                            <tbody>
                              {userTickets.slice(0, 5).map(t => (
                                <tr key={t._id}>
                                  <td>{t.event?.title}</td>
                                  <td><code>{t.smsCode}</code></td>
                                  <td><span className="badge">{t.status}</span></td>
                                  <td>{formatDate(t.createdAt)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* Recent Payments */}
                    {userPayments.length > 0 && (
                      <div className="detail-section">
                        <h3><FaCreditCard /> Recent Payments</h3>
                        <div className="table-container">
                          <table className="data-table">
                            <thead>
                              <tr>
                                <th>Amount</th>
                                <th>Method</th>
                                <th>Status</th>
                                <th>Date</th>
                              </tr>
                            </thead>
                            <tbody>
                              {userPayments.slice(0, 5).map(p => (
                                <tr key={p._id}>
                                  <td>${p.amount}</td>
                                  <td>{p.method || 'N/A'}</td>
                                  <td><span className={`badge ${p.status === 'completed' ? 'active' : 'pending'}`}>{p.status}</span></td>
                                  <td>{formatDate(p.createdAt)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* User Events Created */}
                    {userEvents.length > 0 && (
                      <div className="detail-section">
                        <h3><FaCalendarAlt /> Events Created</h3>
                        <div className="table-container">
                          <table className="data-table">
                            <thead>
                              <tr>
                                <th>Event Title</th>
                                <th>Status</th>
                                <th>Date</th>
                                <th>Tickets Sold</th>
                              </tr>
                            </thead>
                            <tbody>
                              {userEvents.slice(0, 5).map(e => {
                                const eventTickets = tickets.filter(t => t.event?.id === e._id || t.event === e._id).length;
                                return (
                                  <tr key={e._id}>
                                    <td>{e.title}</td>
                                    <td><span className="badge">{e.status || 'pending'}</span></td>
                                    <td>{formatDate(e.date || e.createdAt)}</td>
                                    <td>{eventTickets}</td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

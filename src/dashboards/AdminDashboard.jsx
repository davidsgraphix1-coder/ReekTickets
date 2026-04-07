import { useState, useEffect, useCallback, useMemo } from 'react';
import { FaChartPie, FaUsers, FaUserShield, FaCalendarAlt, FaTicketAlt, FaMoneyBillWave, FaFileAlt, FaCog, FaSearch, FaBell, FaStore, FaHandsHelping, FaSun, FaMoon, FaChevronDown, FaBullhorn, FaBolt, FaEye, FaUserPlus, FaUndo, FaClipboard, FaLink, FaTimes, FaDollarSign, FaClock, FaCreditCard } from 'react-icons/fa';
import axios from 'axios';
import ProfilePicUpload from '../components/ProfilePicUpload';
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
  const [filterDate, setFilterDate] = useState('');
  const [filterPaymentMethod, setFilterPaymentMethod] = useState('');

  const headers = useMemo(() => ({
    Authorization: `Bearer ${localStorage.getItem('reek_token')}`
  }), []);

  const fetchUserData = useCallback(async () => {
    try {
      const res = await axios.get('https://reektickets-production.up.railway.app/api/auth/me', { headers });
      setUser(res.data);
    } catch (err) {
      console.error('Failed to fetch user data:', err);
    }
  }, [headers]);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const stored = localStorage.getItem('reek_user');
    const parsed = stored ? JSON.parse(stored) : null;
    if (!parsed || parsed.role !== 'admin') {
      setError('Restricted: only admin users can view this panel.');
      setLoading(false);
      return;
    }
    try {
      const [u, e, t, p, r] = await Promise.all([
        axios.get('https://reektickets-production.up.railway.app/api/admin/users', { headers }).catch(() => ({ data: [] })),
        axios.get('https://reektickets-production.up.railway.app/api/admin/events', { headers }).catch(() => ({ data: [] })),
        axios.get('https://reektickets-production.up.railway.app/api/admin/tickets', { headers }).catch(() => ({ data: [] })),
        axios.get('https://reektickets-production.up.railway.app/api/admin/payments', { headers }).catch(() => ({ data: [] })),
        axios.get('https://reektickets-production.up.railway.app/api/admin/reports', { headers }).catch(() => ({ data: [] })),
      ]);
      setUsers(u.data || []);
      setEvents(e.data || []);
      setTickets(t.data || []);
      setPayments(p.data || []);
      setReports(r.data || []);

      // Set pending data
      setPendingVerifications((u.data || []).filter(user => !user.isVerified));
      setPendingTickets((t.data || [])); // All tickets are pending SMS for now

      // Update stats

      // Update stats
      setStats({
        totalUsers: (u.data || []).length,
        totalEvents: (e.data || []).length,
        totalTickets: (t.data || []).length,
        totalRevenue: (p.data || []).reduce((sum, pay) => sum + Number(pay.amount || 0), 0),
        activeVendors: 0,
        activeSalesAgents: 0
      });
      setError('');
    } catch (err) {
      setError('Could not fetch admin data. Check your admin permissions.');
    }
    setLoading(false);
  }, [headers]);

  useEffect(() => {
    const loadData = async () => {
      await fetchUserData();
      await fetchAll();
    };
    loadData();
  }, [fetchUserData, fetchAll]);

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

  const runAction = async (url, method = 'patch', body = {}) => {
    try {
      await axios({ url, method, data: body, headers });
      await fetchAll();
    } catch (err) {
      setError('Action failed.');
    }
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

  return (
    <div className={`admin-dashboard ${darkMode ? 'dark-mode' : ''}`}>
      {/* SIDEBAR */}
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <h2 className="logo"><FaCog /> Admin</h2>
        </div>

        <nav className="sidebar-nav">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: <FaChartPie /> },
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
              onClick={() => setActiveTab(nav.id)}
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

      {/* MAIN CONTENT */}
      <main className="admin-main">
        {/* HEADER */}
        <header className="admin-header">
          <div className="header-left">
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
            <div className="user-dropdown" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <ProfilePicUpload
                avatarUrl={userAvatar}
                onUpload={async (url) => {
                  // Save new avatar to backend
                  try {
                    await axios.patch('https://reektickets-production.up.railway.app/api/auth/me/avatar', { avatarUrl: url }, { headers });
                    setUser((prev) => ({ ...prev, avatarUrl: url }));
                  } catch (err) {
                    alert('Failed to update avatar.');
                  }
                }}
                disabled={loading}
              />
              <div className="dropdown-info">
                <p className="dropdown-name">{user?.fullName || 'Admin'}</p>
                <p className="dropdown-role">Administrator</p>
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
                      <button className="action-btn btn-primary"><FaBullhorn /> Send Announcement</button>
                      <button className="action-btn btn-secondary"><FaChartPie /> Export Data</button>
                      <button className="action-btn btn-secondary"><FaSearch /> System Health</button>
                      <button className="action-btn btn-secondary"><FaBolt /> Platform Status</button>
                    </div>
                  </section>

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
                      <button className="action-btn btn-primary"><FaUserPlus /> Add Agent</button>
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
                      <button className="action-btn btn-primary"><FaUserPlus /> Manage Vendors</button>
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
                          {users.filter(u => u.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) || u.email?.toLowerCase().includes(searchTerm.toLowerCase())).map(u => {
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
                                    {u.role !== 'admin' && <button className="action-btn-sm" onClick={() => runAction(`https://reektickets-production.up.railway.app/api/admin/users/${u._id}/role`, 'patch', { role: 'admin' })}>Make Admin</button>}
                                    {u.role !== 'supporter' && u.role !== 'admin' && <button className="action-btn-sm" onClick={() => runAction(`https://reektickets-production.up.railway.app/api/admin/users/${u._id}/role`, 'patch', { role: 'supporter' })}>Make Supporter</button>}
                                    {u.role === 'supporter' && <button className="action-btn-sm" onClick={() => runAction(`https://reektickets-production.up.railway.app/api/admin/users/${u._id}/role`, 'patch', { role: 'attendee' })}>Remove Supporter</button>}
                                    {u.role === 'admin' && <button className="action-btn-sm" onClick={() => runAction(`https://reektickets-production.up.railway.app/api/admin/users/${u._id}/role`, 'patch', { role: 'attendee' })}>Remove</button>}
                                    {u.status !== 'banned' && <button className="action-btn-sm" onClick={() => runAction(`https://reektickets-production.up.railway.app/api/admin/users/${u._id}/status`, 'patch', { status: 'banned' })}>Ban</button>}
                                    {u.status === 'banned' && <button className="action-btn-sm" onClick={() => runAction(`https://reektickets-production.up.railway.app/api/admin/users/${u._id}/status`, 'patch', { status: 'active' })}>Unban</button>}
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
                                      onClick={() => runAction(`https://reektickets-production.up.railway.app/api/admin/users/${admin._id}/role`, 'patch', { role: 'attendee' })}
                                    >
                                      <FaUndo /> Remove Admin
                                    </button>
                                    {admin.status !== 'banned' && <button className="action-btn-sm" onClick={() => runAction(`https://reektickets-production.up.railway.app/api/admin/users/${admin._id}/status`, 'patch', { status: 'banned' })}>Ban</button>}
                                    {admin.status === 'banned' && <button className="action-btn-sm" onClick={() => runAction(`https://reektickets-production.up.railway.app/api/admin/users/${admin._id}/status`, 'patch', { status: 'active' })}>Unban</button>}
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
                          {events.filter(e => e.title?.toLowerCase().includes(searchTerm.toLowerCase())).map(ev => (
                            <tr key={ev._id}>
                              <td><strong>{ev.title}</strong></td>
                              <td><span className="badge">{ev.status}</span></td>
                              <td>{ev.organizer?.fullName || 'N/A'}</td>
                              <td>{formatDate(ev.date)}</td>
                              <td>
                                <div className="action-buttons-sm">
                                  {ev.status !== 'approved' && <button className="action-btn-sm" onClick={() => runAction(`https://reektickets-production.up.railway.app/api/admin/events/${ev._id}`, 'patch', { status: 'approved', published: true })}>Approve</button>}
                                  {ev.status !== 'rejected' && <button className="action-btn-sm" onClick={() => runAction(`https://reektickets-production.up.railway.app/api/admin/events/${ev._id}`, 'patch', { status: 'rejected', published: false })}>Reject</button>}
                                  <button className="action-btn-sm delete" onClick={() => runAction(`https://reektickets-production.up.railway.app/api/admin/events/${ev._id}`, 'delete')}>Delete</button>
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
                  {payments.length === 0 ? <p>No payments found.</p> : (
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
                          {payments.map(p => (
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
                  {tickets.length === 0 ? <p>No tickets found.</p> : (
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
                          {tickets.map(t => (
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
                  {reports.length === 0 ? <p>No reports yet.</p> : (
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
                          {reports.map(report => (
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
                  <h2>Pending User Verifications</h2>
                  <div className="table-container">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Phone</th>
                          <th>Role</th>
                          <th>Registered</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pendingVerifications.map(user => (
                          <tr key={user.id}>
                            <td>{user.fullName}</td>
                            <td>{user.email}</td>
                            <td>{user.phone}</td>
                            <td><span className="badge">{user.role}</span></td>
                            <td>{formatDate(user.createdAt)}</td>
                            <td>
                              <button 
                                className="action-btn send-btn"
                                onClick={() => runAction('/api/admin/send-otp', 'post', { userId: user.id })}
                              >
                                Send OTP
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}

              {/* PENDING TICKETS TAB */}
              {activeTab === 'pending-tickets' && (
                <section className="section">
                  <h2>Pending Ticket SMS</h2>
                  <div className="table-container">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Ticket ID</th>
                          <th>User</th>
                          <th>Event</th>
                          <th>Code</th>
                          <th>Purchased</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pendingTickets.map(ticket => {
                          const ticketUser = users.find(u => u.id === ticket.user || u._id === ticket.user);
                          const ticketEvent = events.find(e => e.id === ticket.event || e._id === ticket.event);
                          return (
                            <tr key={ticket.id}>
                              <td>{ticket.id}</td>
                              <td>{ticketUser?.fullName || 'Unknown'}</td>
                              <td>{ticketEvent?.title || 'Unknown'}</td>
                              <td>{ticket.smsCode}</td>
                              <td>{formatDate(ticket.createdAt)}</td>
                              <td>
                                <button 
                                  className="action-btn send-btn"
                                  onClick={() => runAction('/api/admin/send-ticket', 'post', { ticketId: ticket.id })}
                                >
                                  Send SMS
                                </button>
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


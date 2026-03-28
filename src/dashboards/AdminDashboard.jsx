import { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
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
      setRevenue((p.data || []).reduce((sum, pay) => sum + Number(pay.amount || 0), 0));

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

  const userAvatar = user?.avatarUrl || user?.profilePic ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || 'Admin')}&background=667eea&color=ffffff`;

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
          <h2 className="logo">⚙️ Admin</h2>
        </div>

        <nav className="sidebar-nav">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: '📊' },
            { id: 'users', label: 'Users', icon: '👥' },
            { id: 'admins', label: 'Admins', icon: '👨‍💼' },
            { id: 'events', label: 'Events', icon: '🎉' },
            { id: 'payments', label: 'Payments', icon: '💳' },
            { id: 'tickets', label: 'Tickets', icon: '🎫' },
            { id: 'reports', label: 'Reports', icon: '📋' },
            { id: 'settings', label: 'Settings', icon: '⚙️' }
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
            {darkMode ? '☀️ Light' : '🌙 Dark'}
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="admin-main">
        {/* HEADER */}
        <header className="admin-header">
          <div className="header-left">
            <h1 className="header-title">Admin Control Center</h1>
          </div>
          <div className="header-actions">
            <div className="search-box">
              <input 
                type="text" 
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <span className="search-icon">🔍</span>
            </div>
            <button className="header-icon" title="Notifications">🔔</button>
            <div className="user-dropdown">
              <img src={userAvatar} alt="Admin" className="dropdown-avatar" />
              <div className="dropdown-info">
                <p className="dropdown-name">{user?.fullName || 'Admin'}</p>
                <p className="dropdown-role">Administrator</p>
              </div>
              <span className="dropdown-arrow">▼</span>
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
                      <div className="stat-icon">👥</div>
                      <div className="stat-info">
                        <p className="stat-label">Total Users</p>
                        <p className="stat-value">{stats.totalUsers}</p>
                      </div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-icon">🎉</div>
                      <div className="stat-info">
                        <p className="stat-label">Total Events</p>
                        <p className="stat-value">{stats.totalEvents}</p>
                      </div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-icon">🎫</div>
                      <div className="stat-info">
                        <p className="stat-label">Total Tickets Sold</p>
                        <p className="stat-value">{stats.totalTickets}</p>
                      </div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-icon">💰</div>
                      <div className="stat-info">
                        <p className="stat-label">Total Revenue</p>
                        <p className="stat-value">{formatCurrency(stats.totalRevenue)}</p>
                      </div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-icon">🏪</div>
                      <div className="stat-info">
                        <p className="stat-label">Active Vendors</p>
                        <p className="stat-value">{stats.activeVendors}</p>
                      </div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-icon">🤝</div>
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
                      <button className="action-btn btn-primary">📢 Send Announcement</button>
                      <button className="action-btn btn-secondary">📊 Export Data</button>
                      <button className="action-btn btn-secondary">🔍 System Health</button>
                      <button className="action-btn btn-secondary">⚡ Platform Status</button>
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
                                      👁 View
                                    </button>
                                    {u.role !== 'admin' && <button className="action-btn-sm" onClick={() => runAction(`https://reektickets-production.up.railway.app/api/admin/users/${u._id}/role`, 'patch', { role: 'admin' })}>Make Admin</button>}
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
                      ➕ Make User Admin
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
                                <td><strong>👨‍💼 {admin.fullName}</strong></td>
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
                                      👁 View
                                    </button>
                                    <button 
                                      className="action-btn-sm"
                                      onClick={() => runAction(`https://reektickets-production.up.railway.app/api/admin/users/${admin._id}/role`, 'patch', { role: 'attendee' })}
                                    >
                                      ↩️ Remove Admin
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
                            <th>Ticket Code</th>
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
                                      alert(`Ticket code copied: ${t.smsCode}`);
                                    }}
                                  >
                                    📋 Copy Code
                                  </button>
                                  <button 
                                    className="btn-copy"
                                    onClick={() => {
                                      const ticketLink = `${window.location.origin}/ticket/${t._id}?code=${t.smsCode}`;
                                      navigator.clipboard.writeText(ticketLink);
                                      alert(`Ticket link copied to clipboard`);
                                    }}
                                  >
                                    🔗 Copy Link
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
                <button className="close-btn" onClick={() => setSelectedUserDetails(null)}>✕</button>
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
                      <h3>📋 Personal Information</h3>
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
                      <h3>📊 Activity Summary</h3>
                      <div className="stats-grid">
                        <div className="stat-card">
                          <p className="stat-label">🎫 Tickets Bought</p>
                          <p className="stat-value">{stats.ticketsBought}</p>
                        </div>
                        <div className="stat-card">
                          <p className="stat-label">💰 Total Spent</p>
                          <p className="stat-value">${stats.totalSpent.toFixed(2)}</p>
                        </div>
                        <div className="stat-card">
                          <p className="stat-label">🎪 Events Created</p>
                          <p className="stat-value">{stats.eventCreated}</p>
                        </div>
                        <div className="stat-card">
                          <p className="stat-label">⏰ Last Active</p>
                          <p className="stat-value">{stats.lastActivity ? formatDate(stats.lastActivity) : 'Never'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Recent Tickets */}
                    {userTickets.length > 0 && (
                      <div className="detail-section">
                        <h3>🎫 Recent Tickets</h3>
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
                        <h3>💳 Recent Payments</h3>
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


import { useEffect, useState, useCallback, useMemo } from 'react';
import { FaChartPie, FaMoneyBillWave, FaLink, FaDollarSign, FaMedal, FaBell, FaCog, FaChevronDown, FaUserCircle, FaTicketAlt, FaCalendarAlt, FaClock, FaChartLine, FaMousePointer, FaShareAlt, FaFilePdf, FaClipboard, FaSort, FaSortUp, FaSortDown, FaBars, FaTimes as FaClose } from 'react-icons/fa';
import axios from 'axios';
import API_BASE from '../config/api';
import { withdrawFunds } from '../services/api';
import './SalesAgentDashboard.css';

export default function SalesAgentDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [user, setUser] = useState(null);
  const [agentProfile, setAgentProfile] = useState(null);
  const [sales, setSales] = useState([]);
  const [stats, setStats] = useState({
    totalTicketsSold: 0,
    totalEarnings: 0,
    activeEvents: 0,
    totalClicks: 0,
    totalCommission: 0,
    availableBalance: 0,
    pendingEarnings: 0,
    withdrawnAmount: 0,
  });
  const [referralLinks, setReferralLinks] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [reportMessage, setReportMessage] = useState('');
  const [reportStatus, setReportStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsError, setSettingsError] = useState('');
  const [settingsMessage, setSettingsMessage] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const headers = useMemo(() => ({
    Authorization: `Bearer ${localStorage.getItem('reek_token')}`
  }), []);

  const fetchUserData = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE}/auth/me`, { headers });
      setUser(res.data);
    } catch (err) {
      console.error('Failed to fetch user data:', err);
      setError('Unable to load user profile.');
    }
  }, [headers]);

  const fetchAgentProfile = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE}/agent/profile`, { headers });
      setAgentProfile(res.data);
    } catch (err) {
      console.error('Failed to fetch agent profile:', err);
      setError('Unable to load agent profile.');
    }
  }, [headers]);

  const fetchSales = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE}/agent/sales-detailed`, { headers });
      setSales(res.data || []);
    } catch (err) {
      console.error('Failed to fetch sales:', err);
      setSales([]);
    }
  }, [headers]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE}/agent/stats`, { headers });
      setStats(res.data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  }, [headers]);

  const fetchLeaderboard = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE}/agent/leaderboard`, { headers });
      setLeaderboard(res.data || []);
    } catch (err) {
      console.error('Failed to fetch leaderboard:', err);
    }
  }, [headers]);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE}/agent/notifications`, { headers });
      setNotifications(res.data || []);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  }, [headers]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchUserData(),
        fetchAgentProfile(),
        fetchSales(),
        fetchStats(),
        fetchLeaderboard(),
        fetchNotifications(),
      ]);
      setLoading(false);
    };
    loadData();
  }, [fetchUserData, fetchAgentProfile, fetchSales, fetchStats, fetchLeaderboard, fetchNotifications]);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleSettingsChange = (e) => {
    const { name, value } = e.target;
    setAgentProfile(prev => ({ ...prev, [name]: value }));
  };

  const saveSettings = async () => {
    setSettingsLoading(true);
    setSettingsError('');
    setSettingsMessage('');
    try {
      const res = await axios.patch(`${API_BASE}/agent/profile`, agentProfile, { headers });
      setSettingsMessage('Profile settings updated successfully.');
      setAgentProfile(res.data);
    } catch (err) {
      console.error('Failed to save agent settings:', err);
      setSettingsError(err.response?.data?.message || 'Failed to save settings.');
    } finally {
      setSettingsLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // Could add a toast notification here
  };

  const shareOnWhatsApp = (link) => {
    const message = `Check out this amazing event! ${link}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  const shareOnFacebook = (link) => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}`, '_blank');
  };

  const shareOnTwitter = (link) => {
    const text = 'Check out this amazing event!';
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(link)}`, '_blank');
  };

  const generateReferralLink = async (eventId) => {
    try {
      const res = await axios.post(`${API_BASE}/agent/referral-link`, { eventId }, { headers });
      const newLink = {
        eventId,
        eventName: 'Event Name', // This would come from the event data
        referralLink: res.data.referralLink,
        clicks: 0,
        ticketsSold: 0,
        earnings: 0,
      };
      setReferralLinks(prev => [...prev, newLink]);
    } catch (err) {
      console.error('Failed to generate referral link:', err);
    }
  };

  const withdrawEarnings = async () => {
    if (!stats.availableBalance || stats.availableBalance <= 0) {
      alert('No available balance to withdraw.');
      return;
    }

    const amount = stats.availableBalance;
    if (amount < 50) { // Minimum withdrawal amount
      alert('Minimum withdrawal amount is GH₵50.');
      return;
    }

    if (window.confirm(`Withdraw GH₵${amount.toFixed(2)} to your account?`)) {
      try {
        const result = await withdrawFunds(amount);
        if (result.message && !result.message.includes('error')) {
          alert('Withdrawal request submitted successfully! Funds will be processed within 24 hours.');
          // Refresh stats
          fetchStats();
        } else {
          alert(result.message || 'Withdrawal failed. Please try again.');
        }
      } catch (error) {
        console.error('Withdrawal error:', error);
        alert('Network error. Please check your connection and try again.');
      }
    }
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <FaSort />;
    return sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />;
  };

  const filteredSales = sales.filter(sale =>
    sale.event_id?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.buyer_id?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.buyer_id?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedSales = [...filteredSales].sort((a, b) => {
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];

    if (sortConfig.key === 'date') {
      const aDate = new Date(aValue);
      const bDate = new Date(bValue);
      return sortConfig.direction === 'asc' ? aDate - bDate : bDate - aDate;
    }

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortConfig.direction === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const totalEntries = sortedSales.length;
  const totalPages = Math.ceil(totalEntries / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const endIndex = startIndex + entriesPerPage;
  const currentSales = sortedSales.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const userAvatar = user?.avatarUrl || user?.profilePic || null;

  const formatCurrency = (amount) => {
    return `GH₵${amount?.toFixed(2) || '0.00'}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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
      setReportStatus('Report sent successfully.');
    } catch (err) {
      console.error('Report send failed:', err);
      setReportStatus('Unable to send report right now.');
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };
  const greetingName = user?.fullName?.split(' ')[0] || user?.email?.split('@')[0] || 'Agent';
  const greetingText = `${getGreeting()}, ${greetingName}`;

  if (loading) {
    return (
      <div className="sales-agent-dashboard">
        <div className="loading">Loading sales agent dashboard...</div>
      </div>
    );
  }

  return (
    <div className="sales-agent-dashboard">
      {/* Sidebar */}
      <div className={`agent-sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <div className="user-avatar">
            <img src={userAvatar} alt={user?.fullName || 'Agent'} />
          </div>
          <div className="user-info">
            <div className="user-email">{user?.email || 'agent@reektickets.com'}</div>
            <div className="user-subtitle">Sales Agent</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => { setActiveTab('dashboard'); setMobileMenuOpen(false); }}>
            <span className="nav-icon"><FaChartPie /></span>
            <span className="nav-label">Dashboard</span>
          </div>
          <div className={`nav-item ${activeTab === 'sales' ? 'active' : ''}`} onClick={() => { setActiveTab('sales'); setMobileMenuOpen(false); }}>
            <span className="nav-icon"><FaMoneyBillWave /></span>
            <span className="nav-label">My Sales</span>
          </div>
          <div className={`nav-item ${activeTab === 'referrals' ? 'active' : ''}`} onClick={() => { setActiveTab('referrals'); setMobileMenuOpen(false); }}>
            <span className="nav-icon"><FaLink /></span>
            <span className="nav-label">Referral Links</span>
          </div>
          <div className={`nav-item ${activeTab === 'earnings' ? 'active' : ''}`} onClick={() => { setActiveTab('earnings'); setMobileMenuOpen(false); }}>
            <span className="nav-icon"><FaDollarSign /></span>
            <span className="nav-label">Earnings</span>
          </div>
          <div className={`nav-item ${activeTab === 'leaderboard' ? 'active' : ''}`} onClick={() => { setActiveTab('leaderboard'); setMobileMenuOpen(false); }}>
            <span className="nav-icon"><FaMedal /></span>
            <span className="nav-label">Leaderboard</span>
          </div>
          <div className={`nav-item ${activeTab === 'notifications' ? 'active' : ''}`} onClick={() => { setActiveTab('notifications'); setMobileMenuOpen(false); }}>
            <span className="nav-icon"><FaBell /></span>
            <span className="nav-label">Notifications</span>
          </div>
          <div className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => { setActiveTab('settings'); setMobileMenuOpen(false); }}>
            <span className="nav-icon"><FaCog /></span>
            <span className="nav-label">Settings</span>
          </div>
        </nav>
      </div>

      {/* MOBILE MENU OVERLAY */}
      {mobileMenuOpen && (
        <div
          className="mobile-menu-overlay"
          onClick={() => setMobileMenuOpen(false)}
        ></div>
      )}

      {/* Main Content */}
      <div className="agent-main">
        {/* Header */}
        <div className="agent-header">
          <div className="header-left">
            <button
              className="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              title="Toggle Menu"
            >
              {mobileMenuOpen ? <FaClose /> : <FaBars />}
            </button>
            <h1 className="header-title">SALES AGENT DASHBOARD</h1>
          </div>
          <div className="header-left">
            <h2>{greetingText}</h2>
            <p>Here is your agent workspace for commissions, referrals, and sales.</p>
          </div>
          <div className="header-actions">
            <div className="header-icon" onClick={() => setActiveTab('notifications')}><FaBell /></div>
            <div className="user-dropdown" onClick={() => setActiveTab('settings')}>
              <img src={userAvatar} alt={user?.fullName || 'Agent'} className="dropdown-avatar" />
              <span className="dropdown-email">{user?.email || 'agent@reektickets.com'}</span>
              <span className="dropdown-arrow"><FaChevronDown /></span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="agent-content">
          {error && <div className="error-message">{error}</div>}

          {activeTab === 'settings' ? (
            <div className="settings-panel">
              <h2>Agent Settings</h2>
              <p>Update your sales agent profile settings here.</p>

              <div className="settings-fields">
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    value={agentProfile?.user_id?.fullName || ''}
                    onChange={handleSettingsChange}
                    disabled
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={agentProfile?.user_id?.email || ''}
                    onChange={handleSettingsChange}
                    disabled
                  />
                </div>
                <div className="form-group">
                  <label>Referral Code</label>
                  <input
                    type="text"
                    value={agentProfile?.referral_code || ''}
                    readOnly
                  />
                </div>
                <div className="form-group">
                  <label>Commission Rate</label>
                  <input
                    type="number"
                    name="commission_rate"
                    value={agentProfile?.commission_rate || 0.05}
                    onChange={handleSettingsChange}
                    step="0.01"
                    min="0"
                    max="1"
                  />
                </div>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={saveSettings}
                  disabled={settingsLoading}
                >
                  {settingsLoading ? 'Saving...' : 'Save Settings'}
                </button>
                {settingsError && <p className="error-message" style={{ marginTop: '12px' }}>{settingsError}</p>}
                {settingsMessage && <p style={{ marginTop: '12px', color: '#0d652d' }}>{settingsMessage}</p>}
              </div>
            </div>
          ) : activeTab === 'sales' ? (
            <>
              {/* Page Title */}
              <div className="page-title">
                <div className="title-icon">
                  <FaMoneyBillWave />
                </div>
                <h1>My Sales</h1>
              </div>

              {/* Sales Records/Report Summary */}
              <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '16px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ fontSize: '1.5rem', color: '#7c3aed' }}><FaClipboard /></div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: '0 0 4px 0' }}>Sales Report</h3>
                  <p style={{ margin: 0, color: '#6b7280', fontSize: '0.9rem' }}>Total Sales: {sales.length} | Total Earnings: {formatCurrency(stats.totalEarnings)}</p>
                </div>
                <button style={{ background: '#7c3aed', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}>Download Report</button>
              </div>

              {/* Table Container */}
              <div className="table-container">
                {/* Table Header Controls */}
                <div className="table-controls">
                  <div className="entries-dropdown">
                    <label>Show</label>
                    <select
                      value={entriesPerPage}
                      onChange={(e) => {
                        setEntriesPerPage(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                    >
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                    <label>entries</label>
                  </div>

                  <div className="search-box">
                    <input
                      type="text"
                      placeholder="Search sales..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                {/* Table */}
                <div className="table-wrapper">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th onClick={() => handleSort('sno')} className="sortable">
                          S/N {getSortIcon('sno')}
                        </th>
                        <th onClick={() => handleSort('event_id')} className="sortable">
                          Event Name {getSortIcon('event_id')}
                        </th>
                        <th onClick={() => handleSort('ticket_id')} className="sortable">
                          Ticket Type {getSortIcon('ticket_id')}
                        </th>
                        <th onClick={() => handleSort('buyer_id')} className="sortable">
                          Buyer Name {getSortIcon('buyer_id')}
                        </th>
                        <th>Buyer Email</th>
                        <th>Quantity</th>
                        <th>Amount (GH₵)</th>
                        <th>Commission Earned</th>
                        <th onClick={() => handleSort('date')} className="sortable">
                          Date Sold {getSortIcon('date')}
                        </th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentSales.length === 0 ? (
                        <tr>
                          <td colSpan="10" style={{ textAlign: 'center', padding: '40px' }}>
                            No sales yet
                          </td>
                        </tr>
                      ) : (
                        currentSales.map((sale, index) => (
                          <tr key={sale._id || index}>
                            <td>{startIndex + index + 1}</td>
                            <td>{sale.event_id?.title || 'N/A'}</td>
                            <td>{sale.ticket_id?.type || 'N/A'}</td>
                            <td>{sale.buyer_id?.fullName || 'N/A'}</td>
                            <td>{sale.buyer_id?.email || 'N/A'}</td>
                            <td>{sale.quantity}</td>
                            <td>{formatCurrency(sale.amount)}</td>
                            <td>{formatCurrency(sale.commission)}</td>
                            <td>{formatDate(sale.date)}</td>
                            <td>
                              <span className={`status-badge ${sale.status === 'completed' ? 'status-approved' : 'status-pending'}`}>
                                {sale.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="pagination">
                    <div className="pagination-info">
                      Showing {startIndex + 1} to {Math.min(endIndex, totalEntries)} of {totalEntries} entries
                    </div>
                    <div className="pagination-controls">
                      <button
                        className="page-btn"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <button
                          key={page}
                          className={`page-btn ${page === currentPage ? 'active' : ''}`}
                          onClick={() => handlePageChange(page)}
                        >
                          {page}
                        </button>
                      ))}
                      <button
                        className="page-btn"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : activeTab === 'referrals' ? (
            <div className="referral-section">
              <h3>Referral Links</h3>
              <div className="referral-grid">
                {referralLinks.map((link, index) => (
                  <div key={index} className="referral-card">
                    <div className="referral-link">
                      <input type="text" value={link.referralLink} readOnly />
                      <button className="copy-btn" onClick={() => copyToClipboard(link.referralLink)}>
                        Copy
                      </button>
                    </div>
                    <div className="share-buttons">
                      <button className="share-btn" onClick={() => shareOnWhatsApp(link.referralLink)}>
                        WhatsApp
                      </button>
                      <button className="share-btn" onClick={() => shareOnFacebook(link.referralLink)}>
                        Facebook
                      </button>
                      <button className="share-btn" onClick={() => shareOnTwitter(link.referralLink)}>
                        Twitter
                      </button>
                    </div>
                    <div style={{ marginTop: '12px', fontSize: '14px', color: '#6b7280' }}>
                      Clicks: {link.clicks} | Tickets Sold: {link.ticketsSold} | Earnings: {formatCurrency(link.earnings)}
                    </div>
                  </div>
                ))}
                {referralLinks.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                    No referral links generated yet. Generate your first link to start earning!
                  </div>
                )}
              </div>
            </div>
          ) : activeTab === 'earnings' ? (
            <div className="earnings-section">
              <h3>Earnings & Withdrawals</h3>
              <div className="earnings-grid">
                <div className="earnings-card">
                  <div className="earnings-value">{formatCurrency(stats.totalCommission)}</div>
                  <div className="earnings-label">Total Earnings</div>
                </div>
                <div className="earnings-card">
                  <div className="earnings-value">{formatCurrency(stats.availableBalance)}</div>
                  <div className="earnings-label">Available Balance</div>
                </div>
                <div className="earnings-card">
                  <div className="earnings-value">{formatCurrency(stats.pendingEarnings)}</div>
                  <div className="earnings-label">Pending Earnings</div>
                </div>
                <div className="earnings-card">
                  <div className="earnings-value">{formatCurrency(stats.withdrawnAmount)}</div>
                  <div className="earnings-label">Withdrawn Amount</div>
                </div>
              </div>
              <button className="withdraw-btn" onClick={withdrawEarnings}>
                Withdraw Earnings (Paystack)
              </button>
            </div>
          ) : activeTab === 'leaderboard' ? (
            <div className="table-container">
              <div className="page-title">
                <div className="title-icon">
                  <FaMedal />
                </div>
                <h1>Agent Leaderboard</h1>
              </div>
              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>Agent Name</th>
                      <th>Total Commission</th>
                      <th>Level</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.map((agent) => (
                      <tr key={agent.rank}>
                        <td>#{agent.rank}</td>
                        <td>{agent.name}</td>
                        <td>{formatCurrency(agent.totalCommission)}</td>
                        <td>
                          <span className={`level-badge level-${agent.level.toLowerCase()}`}>
                            {agent.level}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : activeTab === 'notifications' ? (
            <div className="notifications-section">
              <h3>Notifications</h3>
              {notifications.map((notification, index) => (
                <div key={index} className="notification-item">
                  <div className="notification-icon"><FaBell /></div>
                  <div className="notification-content">
                    <div className="notification-title">{notification.title}</div>
                    <div className="notification-message">{notification.message}</div>
                    <div className="notification-time">{formatDate(notification.time)}</div>
                  </div>
                </div>
              ))}
              {notifications.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                  No notifications yet
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Report Panel */}
              <div className="report-panel" style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
                <h3>Report a message to admin</h3>
                <textarea
                  value={reportMessage}
                  onChange={(e) => setReportMessage(e.target.value)}
                  placeholder="Report an issue or feedback..."
                  style={{ width: '100%', minHeight: '80px', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db' }}
                />
                <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <button className="btn btn-small" onClick={submitReport}>Send Report</button>
                  {reportStatus && <span style={{ color: '#374151', fontSize: '0.9rem' }}>{reportStatus}</span>}
                </div>
              </div>

              {/* Stat Cards */}
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-card-icon"><FaTicketAlt /></div>
                  <div className="stat-card-title">Total Tickets Sold</div>
                  <div className="stat-card-value">{stats.totalTicketsSold}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-card-icon"><FaDollarSign /></div>
                  <div className="stat-card-title">Total Earnings</div>
                  <div className="stat-card-value">{formatCurrency(stats.totalEarnings)}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-card-icon"><FaCalendarAlt /></div>
                  <div className="stat-card-title">Active Events Promoting</div>
                  <div className="stat-card-value">{stats.activeEvents}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-card-icon"><FaMousePointer /></div>
                  <div className="stat-card-title">Total Clicks</div>
                  <div className="stat-card-value">{stats.totalClicks}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-card-icon"><FaClock /></div>
                  <div className="stat-card-title">Pending Earnings</div>
                  <div className="stat-card-value">{formatCurrency(stats.pendingEarnings)}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-card-icon"><FaChartLine /></div>
                  <div className="stat-card-title">Commission Rate</div>
                  <div className="stat-card-value">{agentProfile?.commission_rate ? (agentProfile.commission_rate * 100).toFixed(1) : '5'}%</div>
                </div>
              </div>

              {/* Agent Profile Card */}
              <div className="agent-profile-card" style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '20px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div className="profile-avatar" style={{ fontSize: '3rem' }}><FaUserCircle /></div>
                <div className="profile-info" style={{ flex: 1 }}>
                  <h3 style={{ marginBottom: '8px' }}>{user?.fullName || 'Sales Agent'}</h3>
                  <p style={{ color: '#6b7280', marginBottom: '4px' }}>{user?.email || 'agent@reektickets.com'}</p>
                  <p style={{ color: '#6b7280' }}>Available Balance: {formatCurrency(stats.availableBalance)} | Withdrawn: {formatCurrency(stats.withdrawnAmount)}</p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="action-btn" title="Share Link"><FaShareAlt /> Share</button>
                  <button className="action-btn" title="Download Report"><FaFilePdf /> Report</button>
                </div>
              </div>

              {/* Referral Links Section */}
              <div className="referral-section">
                <h3>Generate Referral Links</h3>
                <p>Create unique referral links for events to start earning commissions.</p>
                <button
                  className="btn-primary"
                  onClick={() => generateReferralLink('sample-event-id')}
                  style={{ marginTop: '16px' }}
                >
                  Generate New Referral Link
                </button>
              </div>

              {/* Recent Sales Preview */}
              <div className="table-container">
                <div className="page-title">
                  <div className="title-icon">
                    <FaMoneyBillWave />
                  </div>
                  <h1>Recent Sales</h1>
                </div>
                <div className="table-wrapper">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Event Name</th>
                        <th>Buyer</th>
                        <th>Amount</th>
                        <th>Commission</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sales.slice(0, 5).map((sale, index) => (
                        <tr key={sale._id || index}>
                          <td>{sale.event_id?.title || 'N/A'}</td>
                          <td>{sale.buyer_id?.fullName || 'N/A'}</td>
                          <td>{formatCurrency(sale.amount)}</td>
                          <td>{formatCurrency(sale.commission)}</td>
                          <td>{formatDate(sale.date)}</td>
                        </tr>
                      ))}
                      {sales.length === 0 && (
                        <tr>
                          <td colSpan="5" style={{ textAlign: 'center', padding: '40px' }}>
                            No sales yet
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

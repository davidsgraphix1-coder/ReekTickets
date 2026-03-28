import { useEffect, useState, useCallback, useMemo } from 'react';
import axios from 'axios';
import './AttendeeDashboard.css';

export default function AttendeeDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [user, setUser] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [pastEvents, setPastEvents] = useState([]);
  const [savedEvents, setSavedEvents] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [reportMessage, setReportMessage] = useState('');
  const [reportStatus, setReportStatus] = useState('');

  const headers = useMemo(() => ({
    Authorization: `Bearer ${localStorage.getItem('reek_token')}`
  }), []);

  const fetchUserData = useCallback(async () => {
    try {
      const res = await axios.get('https://reektickets-production.up.railway.app/api/auth/me', { headers });
      setUser(res.data);
    } catch (err) {
      console.error('Failed to fetch user data:', err);
      setError('Unable to load user profile.');
    }
  }, [headers]);

  const fetchTickets = useCallback(async () => {
    try {
      const res = await axios.get('https://reektickets-production.up.railway.app/api/tickets', { headers });
      setTickets(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to fetch tickets:', err);
      setTickets([]);
    }
  }, [headers]);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await axios.get('https://reektickets-production.up.railway.app/api/notifications', { headers });
      setNotifications(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  }, [headers]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchUserData(), fetchTickets(), fetchNotifications()]);
      setLoading(false);
    };
    loadData();
  }, [fetchUserData, fetchTickets, fetchNotifications]);

  // Categorize tickets
  useEffect(() => {
    const now = new Date();
    const upcoming = tickets.filter(t => new Date(t.event?.date) > now);
    const past = tickets.filter(t => new Date(t.event?.date) <= now);
    setUpcomingEvents(upcoming);
    setPastEvents(past);
  }, [tickets]);

  const filteredTickets = tickets.filter(t =>
    t.event?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.smsCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.event?.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedTickets = [...filteredTickets].sort((a, b) => {
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];
    if (sortConfig.key === 'date') {
      const aDate = new Date(a.event?.date);
      const bDate = new Date(b.event?.date);
      return sortConfig.direction === 'asc' ? aDate - bDate : bDate - aDate;
    }
    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const totalEntries = sortedTickets.length;
  const totalPages = Math.ceil(totalEntries / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const currentTickets = sortedTickets.slice(startIndex, startIndex + entriesPerPage);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return '↕️';
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };

  const userAvatar = user?.avatarUrl || user?.profilePic ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || 'Attendee')}&background=667eea&color=ffffff`;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCountdownTime = (eventDate) => {
    const now = new Date();
    const diff = new Date(eventDate) - now;
    if (diff <= 0) return 'Started';
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / 1000 / 60) % 60);
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const toggleSaveEvent = (eventId) => {
    if (savedEvents.includes(eventId)) {
      setSavedEvents(savedEvents.filter(id => id !== eventId));
    } else {
      setSavedEvents([...savedEvents, eventId]);
    }
  };

  const downloadTicketPDF = (ticket) => {
    alert(`Downloading ticket ${ticket.smsCode}...`);
    // In real implementation, generate and download PDF
  };

  const submitReport = async () => {
    if (!reportMessage.trim()) {
      setReportStatus('Please type a report message before submitting.');
      return;
    }
    setReportStatus('Sending report...');
    try {
      await axios.post('https://reektickets-production.up.railway.app/api/report', { message: reportMessage.trim() }, { headers });
      setReportMessage('');
      setReportStatus('Report submitted successfully.');
    } catch (err) {
      console.error('Report submit failed:', err);
      setReportStatus('Could not submit report. Try again later.');
    }
  };

  if (loading) {
    return (
      <div className={`attendee-dashboard ${darkMode ? 'dark-mode' : ''}`}>
        <div className="loading">Loading attendee dashboard...</div>
      </div>
    );
  }

  return (
    <div className={`attendee-dashboard ${darkMode ? 'dark-mode' : ''}`}>
      {/* Sidebar */}
      <div className="attendee-sidebar">
        <div className="sidebar-header">
          <div className="user-avatar">
            <img src={userAvatar} alt={user?.fullName} />
          </div>
          <div className="user-info">
            <div className="user-name">{user?.fullName || 'Attendee'}</div>
            <div className="user-subtitle">Event Attendee</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
            <span className="nav-icon">📊</span>
            <span className="nav-label">Dashboard</span>
          </div>
          <div className={`nav-item ${activeTab === 'tickets' ? 'active' : ''}`} onClick={() => setActiveTab('tickets')}>
            <span className="nav-icon">🎫</span>
            <span className="nav-label">My Tickets</span>
          </div>
          <div className={`nav-item ${activeTab === 'upcoming' ? 'active' : ''}`} onClick={() => setActiveTab('upcoming')}>
            <span className="nav-icon">⏰</span>
            <span className="nav-label">Upcoming Events</span>
          </div>
          <div className={`nav-item ${activeTab === 'past' ? 'active' : ''}`} onClick={() => setActiveTab('past')}>
            <span className="nav-icon">📜</span>
            <span className="nav-label">Past Events</span>
          </div>
          <div className={`nav-item ${activeTab === 'saved' ? 'active' : ''}`} onClick={() => setActiveTab('saved')}>
            <span className="nav-icon">❤️</span>
            <span className="nav-label">Saved Events</span>
          </div>
          <div className={`nav-item ${activeTab === 'notifications' ? 'active' : ''}`} onClick={() => setActiveTab('notifications')}>
            <span className="nav-icon">🔔</span>
            <span className="nav-label">Notifications</span>
          </div>
          <div className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>
            <span className="nav-icon">⚙️</span>
            <span className="nav-label">Settings</span>
          </div>
          <div className={`nav-item ${activeTab === 'report' ? 'active' : ''}`} onClick={() => setActiveTab('report')}>
            <span className="nav-icon">📝</span>
            <span className="nav-label">Report</span>
          </div>
        </nav>

        <div className="sidebar-footer">
          <button className="dark-mode-toggle" onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? '☀️ Light' : '🌙 Dark'}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="attendee-main">
        {/* Header */}
        <div className="attendee-header">
          <div className="header-left">
            <h1 className="header-title">EVENT ATTENDEE PORTAL</h1>
          </div>
          <div className="header-actions">
            <div className="header-icon notification-bell" onClick={() => setActiveTab('notifications')}>🔔</div>
            <div className="user-dropdown">
              <img src={userAvatar} alt={user?.fullName} className="dropdown-avatar" />
              <span className="dropdown-email">{user?.email || 'attendee@reektickets.com'}</span>
              <span className="dropdown-arrow">▼</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="attendee-content">
          {error && <div className="error-message">{error}</div>}

          {activeTab === 'dashboard' ? (
            <>
              {/* Stat Cards */}
              <div className="stats-grid">
                <div className="stat-card card-1">
                  <div className="stat-card-icon">🎫</div>
                  <div className="stat-card-title">Total Tickets</div>
                  <div className="stat-card-value">{tickets.length}</div>
                </div>
                <div className="stat-card card-2">
                  <div className="stat-card-icon">⏰</div>
                  <div className="stat-card-title">Upcoming Events</div>
                  <div className="stat-card-value">{upcomingEvents.length}</div>
                </div>
                <div className="stat-card card-3">
                  <div className="stat-card-icon">📜</div>
                  <div className="stat-card-title">Past Events</div>
                  <div className="stat-card-value">{pastEvents.length}</div>
                </div>
                <div className="stat-card card-4">
                  <div className="stat-card-icon">❤️</div>
                  <div className="stat-card-title">Saved Events</div>
                  <div className="stat-card-value">{savedEvents.length}</div>
                </div>
              </div>

              {/* Event Reminders */}
              {upcomingEvents.length > 0 && (
                <div className="reminders-section">
                  <h3>Upcoming Event Reminders</h3>
                  {upcomingEvents.slice(0, 3).map((ticket, idx) => (
                    <div key={idx} className="reminder-card">
                      <div className="reminder-icon">⏲️</div>
                      <div className="reminder-content">
                        <div className="reminder-title">{ticket.event?.title}</div>
                        <div className="reminder-subtitle">Starts in {getCountdownTime(ticket.event?.date)}</div>
                      </div>
                      <div className="reminder-time">{formatDate(ticket.event?.date)}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Upcoming Events Preview */}
              <div className="upcoming-section">
                <h3>Your Upcoming Events</h3>
                <div className="events-grid">
                  {upcomingEvents.slice(0, 4).map((ticket, idx) => {
                    const bgImg = ticket.event?.banner || '/banner.jpg';
                    return (
                    <div key={idx} className="event-card-preview">
                      <div className="event-image" style={{ backgroundImage: `url('${bgImg}')` }}>
                        <div className="countdown-badge">{getCountdownTime(ticket.event?.date)}</div>
                      </div>
                      <div className="event-details">
                        <h4>{ticket.event?.title}</h4>
                        <p className="event-date">📅 {formatDate(ticket.event?.date)}</p>
                        <p className="event-location">📍 {ticket.event?.location}</p>
                        <button className="btn-small add-calendar">📅 Add to Calendar</button>
                      </div>
                    </div>
                    );
                  })}
                </div>
              </div>
            </>
          ) : activeTab === 'tickets' ? (
            <>
              {/* My Tickets Table */}
              <div className="page-title">
                <div className="title-icon">🎫</div>
                <h1>My Tickets</h1>
              </div>

              <div className="table-container">
                <div className="table-controls">
                  <div className="entries-dropdown">
                    <label>Show</label>
                    <select value={entriesPerPage} onChange={(e) => { setEntriesPerPage(Number(e.target.value)); setCurrentPage(1); }}>
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                    </select>
                    <label>entries</label>
                  </div>
                  <div className="search-box">
                    <input type="text" placeholder="Search tickets..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                  </div>
                </div>

                <div className="table-wrapper">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th onClick={() => handleSort('sno')}>S/N {getSortIcon('sno')}</th>
                        <th onClick={() => handleSort('event')}>Event Name {getSortIcon('event')}</th>
                        <th>Ticket Type</th>
                        <th onClick={() => handleSort('date')}>Date {getSortIcon('date')}</th>
                        <th>Location</th>
                        <th>QR Code</th>
                        <th onClick={() => handleSort('status')}>Status {getSortIcon('status')}</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentTickets.length === 0 ? (
                        <tr><td colSpan="8" style={{ textAlign: 'center', padding: '40px' }}>No tickets found</td></tr>
                      ) : (
                        currentTickets.map((ticket, idx) => (
                          <tr key={ticket._id || idx}>
                            <td>{startIndex + idx + 1}</td>
                            <td><strong>{ticket.event?.title || 'N/A'}</strong></td>
                            <td>{ticket.type || 'Standard'}</td>
                            <td>{formatDate(ticket.event?.date || new Date())}</td>
                            <td>{ticket.event?.location || 'N/A'}</td>
                            <td><button className="btn-tiny" onClick={() => { setSelectedTicket(ticket); setShowQRModal(true); }}>View QR</button></td>
                            <td><span className={`status-badge status-${ticket.status}`}>{ticket.status || 'valid'}</span></td>
                            <td>
                              <div className="action-buttons">
                                <button className="btn-tiny" onClick={() => { setSelectedTicket(ticket); setShowQRModal(true); }}>📋 QR & Share</button>
                                <button 
                                  className="btn-tiny" 
                                  onClick={() => {
                                    const ticketLink = `${window.location.origin}/ticket/${ticket._id}?code=${ticket.smsCode}`;
                                    navigator.clipboard.writeText(ticketLink);
                                    alert('✅ Ticket link copied!');
                                  }}
                                >
                                  📌 Copy Link
                                </button>
                                <button className="btn-tiny" onClick={() => downloadTicketPDF(ticket)}>📥 PDF</button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {totalPages > 1 && (
                  <div className="pagination">
                    <button className="page-btn" onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1}>Previous</button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button key={page} className={`page-btn ${page === currentPage ? 'active' : ''}`} onClick={() => setCurrentPage(page)}>{page}</button>
                    ))}
                    <button className="page-btn" onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages}>Next</button>
                  </div>
                )}
              </div>
            </>
          ) : activeTab === 'upcoming' ? (
            <>
              <div className="page-title"><div className="title-icon">⏰</div><h1>Upcoming Events</h1></div>
              <div className="events-grid">
                {upcomingEvents.map((ticket, idx) => {
                  const bgImg = ticket.event?.banner || '/banner.jpg';
                  return (
                  <div key={idx} className="event-card">
                    <div className="event-image" style={{ backgroundImage: `url('${bgImg}')` }}>
                      <div className="countdown-badge">In {getCountdownTime(ticket.event?.date)}</div>
                    </div>
                    <div className="card-content">
                      <h4>{ticket.event?.title}</h4>
                      <p>📅 {formatDate(ticket.event?.date)} @ {formatTime(ticket.event?.date)}</p>
                      <p>📍 {ticket.event?.location}</p>
                      <div className="card-actions">
                        <button className="btn-small">📅 Add Calendar</button>
                        <button className="btn-small" onClick={() => toggleSaveEvent(ticket.event?._id)}>
                          {savedEvents.includes(ticket.event?._id) ? '❤️ Saved' : '🤍 Save'}
                        </button>
                      </div>
                    </div>
                  </div>
                  );
                })}
              </div>
            </>
          ) : activeTab === 'past' ? (
            <>
              <div className="page-title"><div className="title-icon">📜</div><h1>Past Events</h1></div>
              <div className="events-grid">
                {pastEvents.map((ticket, idx) => {
                  const bgImg = ticket.event?.banner || '/banner.jpg';
                  return (
                  <div key={idx} className="event-card">
                    <div className="event-image" style={{ backgroundImage: `url('${bgImg}')` }}>
                      <div className="past-badge">Completed</div>
                    </div>
                    <div className="card-content">
                      <h4>{ticket.event?.title}</h4>
                      <p>📅 {formatDate(ticket.event?.date)}</p>
                      <p>📍 {ticket.event?.location}</p>
                      <button className="btn-small">View Ticket</button>
                    </div>
                  </div>
                  );
                })}
              </div>
            </>
          ) : activeTab === 'saved' ? (
            <>
              <div className="page-title"><div className="title-icon">❤️</div><h1>Saved Events</h1></div>
              <div className="saved-list">
                {upcomingEvents.filter(t => savedEvents.includes(t.event?._id)).map((ticket, idx) => (
                  <div key={idx} className="saved-item">
                    {(() => {
                      const bgImg = ticket.event?.banner || '/banner.jpg';
                      return <div className="saved-image" style={{ backgroundImage: `url('${bgImg}')` }}></div>;
                    })()}
                    <div className="saved-info">
                      <h4>{ticket.event?.title}</h4>
                      <p>{formatDate(ticket.event?.date)} • {ticket.event?.location}</p>
                    </div>
                    <button className="btn-remove" onClick={() => toggleSaveEvent(ticket.event?._id)}>Remove</button>
                  </div>
                ))}
              </div>
            </>
          ) : activeTab === 'notifications' ? (
            <>
              <div className="page-title"><div className="title-icon">🔔</div><h1>Notifications</h1></div>
              <div className="notifications-list">
                {notifications.map((notif, idx) => (
                  <div key={idx} className="notification-item">
                    <div className="notif-icon">🎫</div>
                    <div className="notif-content">
                      <div className="notif-title">{notif.title}</div>
                      <div className="notif-message">{notif.message}</div>
                      <div className="notif-time">{formatDate(notif.time)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : activeTab === 'report' ? (
            <>
              <div className="page-title"><div className="title-icon">📝</div><h1>Report to Admin</h1></div>
              <div className="report-panel">
                <div className="report-card">
                  <h3>Send a Report Message</h3>
                  <p className="report-subtitle">Let admins know about issues, bugs, or suggestions</p>
                  <textarea
                    value={reportMessage}
                    onChange={(e) => setReportMessage(e.target.value)}
                    placeholder="Describe your issue or suggestion..."
                    className="report-textarea"
                  />
                  <div className="report-actions">
                    <button className="btn-primary" onClick={submitReport}>Send Report</button>
                    {reportStatus && <span className="report-status">{reportStatus}</span>}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="page-title"><div className="title-icon">⚙️</div><h1>Settings</h1></div>
              <div className="settings-panel">
                <div className="settings-group">
                  <h3>Email Preferences</h3>
                  <label><input type="checkbox" defaultChecked /> Event reminders</label>
                  <label><input type="checkbox" defaultChecked /> Promotions</label>
                  <label><input type="checkbox" /> Marketing emails</label>
                </div>
                <div className="settings-group">
                  <h3>Notifications</h3>
                  <label><input type="checkbox" defaultChecked /> Push notifications</label>
                  <label><input type="checkbox" defaultChecked /> Email notifications</label>
                  <label><input type="checkbox" /> SMS notifications</label>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* QR Modal */}
      {showQRModal && selectedTicket && (
        <div className="modal-overlay" onClick={() => setShowQRModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowQRModal(false)}>×</button>
            <h3>Ticket QR Code & Share</h3>
            <div className="qr-display">
              <div className="qr-code">📱 [QR Code for: {selectedTicket.smsCode}]</div>
              <p style={{ textAlign: 'center', marginTop: '12px', fontSize: '12px', color: '#6b7280' }}>
                Code: <strong>{selectedTicket.smsCode}</strong>
              </p>
            </div>
            <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button 
                className="btn-primary" 
                onClick={() => {
                  const ticketLink = `${window.location.origin}/ticket/${selectedTicket._id}?code=${selectedTicket.smsCode}`;
                  navigator.clipboard.writeText(ticketLink);
                  alert('✅ Ticket link copied to clipboard!');
                }}
              >
                📋 Copy Ticket Link
              </button>
              <button 
                className="btn-secondary" 
                onClick={() => {
                  const ticketLink = `${window.location.origin}/ticket/${selectedTicket._id}?code=${selectedTicket.smsCode}`;
                  window.open(ticketLink, '_blank');
                }}
              >
                🔗 Open Ticket in New Tab
              </button>
              <button className="btn-primary" onClick={() => downloadTicketPDF(selectedTicket)}>
                📥 Download as PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

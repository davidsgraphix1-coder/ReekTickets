import { useEffect, useState, useCallback, useMemo } from 'react';
import { FaChartPie, FaCog, FaBell, FaChevronDown, FaStore, FaSmile, FaSort, FaSortUp, FaSortDown, FaBars, FaTimes as FaClose, FaCamera } from 'react-icons/fa';
import axios from 'axios';
import API_BASE from '../config/api';
import './VendorDashboard.css';

export default function VendorDashboard() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: 'applicationDate', direction: 'desc' });
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState({ fullName: '', email: '', phone: '', businessName: '' });
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsError, setSettingsError] = useState('');
  const [settingsMessage, setSettingsMessage] = useState('');
  const [reportMessage, setReportMessage] = useState('');
  const [reportStatus, setReportStatus] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profilePicUploading, setProfilePicUploading] = useState(false);
  const [profilePicError, setProfilePicError] = useState('');

  const headers = useMemo(() => ({
    Authorization: `Bearer ${localStorage.getItem('reek_token')}`
  }), []);

  const fetchUserData = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE}/auth/me`, { headers });
      setUser(res.data);
      setUserData({
        fullName: res.data.fullName || '',
        email: res.data.email || '',
        phone: res.data.phone || '',
        businessName: res.data.businessName || '',
      });
    } catch (err) {
      console.error('Failed to fetch user data:', err);
      setError('Unable to load user profile.');
    }
  }, [headers]);

  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await axios.get(`${API_BASE}/vendor/applications`, { headers });
      const results = Array.isArray(res.data) ? res.data : [];
      setApplications(results);
      setError('');
    } catch (err) {
      console.error('Failed to fetch vendor applications:', err);
      setApplications([]);
      setError('Unable to load vendor applications. Check API/backend and try again.');
    } finally {
      setLoading(false);
    }
  }, [headers]);

  useEffect(() => {
    fetchUserData();
    fetchApplications();
  }, [fetchUserData, fetchApplications]);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleSettingsChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: value }));
  };

  const saveSettings = async () => {
    setSettingsLoading(true);
    setSettingsError('');
    setSettingsMessage('');
    try {
      const res = await axios.patch(`${API_BASE}/vendor/profile`, userData, { headers });
      setSettingsMessage('Profile settings updated successfully.');
      setUser(res.data);
    } catch (err) {
      console.error('Failed to save vendor settings:', err);
      setSettingsError(err.response?.data?.message || 'Failed to save settings.');
    } finally {
      setSettingsLoading(false);
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
      
      const updateRes = await axios.patch(`${API_BASE}/auth/me`, 
        { profilePic: picUrl, avatarUrl: picUrl }, 
        { headers }
      );
      
      const updatedUser = { ...user, profilePic: picUrl, avatarUrl: picUrl };
      localStorage.setItem('reek_user', JSON.stringify(updatedUser));
      setUser(updatedUser);
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

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <FaSort />;
    return sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />;
  };

  const filteredApplications = applications.filter(app =>
    app.event?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.vendor?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.vendorType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.status?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedApplications = [...filteredApplications].sort((a, b) => {
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];

    if (sortConfig.key === 'applicationDate') {
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

  const totalEntries = sortedApplications.length;
  const totalPages = Math.ceil(totalEntries / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const endIndex = startIndex + entriesPerPage;
  const currentApplications = sortedApplications.slice(startIndex, endIndex);

  const userAvatar = user?.avatarUrl || user?.profilePic || null;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const greetingName = user?.fullName?.split(' ')[0] || user?.email?.split('@')[0] || 'Vendor';
  const greetingText = `${getGreeting()}, ${greetingName}`;

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      pending: 'status-pending',
      approved: 'status-approved',
      rejected: 'status-rejected'
    };
    return <span className={`status-badge ${statusClasses[status] || ''}`}>{status}</span>;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
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
      setReportStatus('Please type a report message before submitting.');
      return;
    }
    setReportStatus('Sending report...');
    try {
      await axios.post(`${API_BASE}/report`, { message: reportMessage.trim() }, { headers });
      setReportMessage('');
      setReportStatus('Report submitted successfully.');
    } catch (err) {
      console.error('Report submit failed:', err);
      setReportStatus('Could not submit report. Try again later.');
    }
  };

  if (loading) {
    return (
      <div className="vendor-dashboard">
        <div className="loading">Loading vendor dashboard...</div>
      </div>
    );
  }

  return (
    <div className="vendor-dashboard">
      {/* Sidebar */}
      <div className={`vendor-sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <div className="user-avatar" style={{ position: 'relative', display: 'inline-block' }}>
            <img src={userAvatar} alt={user?.fullName || 'Vendor'} />
            <label style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              background: '#3b82f6',
              borderRadius: '50%',
              padding: '4px',
              cursor: profilePicUploading ? 'not-allowed' : 'pointer',
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
          <div className="user-info">
            <div className="user-email">{user?.email || 'vendor@reektickets.com'}</div>
            <div className="user-subtitle">Vendor Account</div>
            {profilePicError && <div style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '4px' }}>{profilePicError}</div>}
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => { setActiveTab('dashboard'); setMobileMenuOpen(false); }}>
            <span className="nav-icon"><FaChartPie /></span>
            <span className="nav-label">Dashboard</span>
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
      <div className="vendor-main">
        {/* Header */}
        <div className="vendor-header">
          <div className="header-left">
            <button
              className="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              title="Toggle Menu"
            >
              {mobileMenuOpen ? <FaClose /> : <FaBars />}
            </button>
            <h2>{greetingText}</h2>
            <p>Welcome to your vendor dashboard.</p>
          </div>
          <div className="header-actions">
            <div className="header-icon" onClick={() => setActiveTab('dashboard')}><FaBell /></div>
            <div className="header-icon" onClick={() => setActiveTab('settings')}><FaCog /></div>
            <div className="user-dropdown" onClick={() => setActiveTab('settings')}>
              <img src={userAvatar} alt={user?.fullName || 'Vendor'} className="dropdown-avatar" />
              <span className="dropdown-email">{user?.email || 'vendor@reektickets.com'}</span>
              <span className="dropdown-arrow"><FaChevronDown /></span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="vendor-content">
          {error && <div className="error-message">{error}</div>}

          {activeTab === 'settings' ? (
            <div className="settings-panel">
              <h2>Vendor Settings</h2>
              <p>Update your vendor profile settings here.</p>

              <div className="settings-fields">
                <div className="form-group">
                  <label>Vendor Name</label>
                  <input type="text" name="fullName" value={userData.fullName} onChange={handleSettingsChange} />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" name="email" value={userData.email} onChange={handleSettingsChange} />
                </div>
                <div className="form-group">
                  <label>Contact</label>
                  <input type="text" name="phone" value={userData.phone} onChange={handleSettingsChange} />
                </div>
                <div className="form-group">
                  <label>Business Name</label>
                  <input type="text" name="businessName" value={userData.businessName || ''} onChange={handleSettingsChange} />
                </div>
                <button type="button" className="btn btn-primary" onClick={saveSettings} disabled={settingsLoading}>
                  {settingsLoading ? 'Saving...' : 'Save Settings'}
                </button>
                {settingsError && <p className="error-message" style={{ marginTop: '12px' }}>{settingsError}</p>}
                {settingsMessage && <p style={{ marginTop: '12px', color: '#0d652d' }}>{settingsMessage}</p>}
              </div>
            </div>
          ) : (
            <>
              {/* Page Title */}
              <div className="page-title">
            <div className="title-icon">
              <FaStore />
            </div>
            <h1>VENDOR DASHBOARD</h1>
          </div>

          {/* Report Panel */}
          <div className="report-panel" style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
            <h3>Report an issue</h3>
            <textarea
              value={reportMessage}
              onChange={(e) => setReportMessage(e.target.value)}
              placeholder="Describe the issue or feedback..."
              style={{ width: '100%', minHeight: '80px', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db' }}
            />
            <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <button onClick={submitReport} className="btn btn-small">Send Report</button>
              {reportStatus && <span style={{ color: '#374151', fontSize: '0.9rem' }}>{reportStatus}</span>}
            </div>
          </div>

          {/* Satisfaction Card */}
          <div className="satisfaction-card" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: '#fff', borderRadius: '12px', padding: '20px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ fontSize: '2.5rem' }}><FaSmile /></div>
            <div style={{ flex: 1 }}>
              <h3 style={{ marginBottom: '4px' }}>How satisfied are you?</h3>
              <p style={{ opacity: 0.9, marginBottom: '8px' }}>Help us improve by telling us about your experience with ReekTickets.</p>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', padding: '6px 16px', borderRadius: '6px', cursor: 'pointer' }}>Very Happy</button>
                <button style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', padding: '6px 16px', borderRadius: '6px', cursor: 'pointer' }}>Happy</button>
                <button style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', padding: '6px 16px', borderRadius: '6px', cursor: 'pointer' }}>Neutral</button>
              </div>
            </div>
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
                  placeholder="Search..."
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
                      Sno {getSortIcon('sno')}
                    </th>
                    <th onClick={() => handleSort('vendor')} className="sortable">
                      Name {getSortIcon('vendor')}
                    </th>
                    <th onClick={() => handleSort('event')} className="sortable">
                      Event {getSortIcon('event')}
                    </th>
                    <th onClick={() => handleSort('vendorType')} className="sortable">
                      Vendor Type {getSortIcon('vendorType')}
                    </th>
                    <th onClick={() => handleSort('applicationDate')} className="sortable">
                      Application Date {getSortIcon('applicationDate')}
                    </th>
                    <th onClick={() => handleSort('payableAmount')} className="sortable">
                      Payable Amount {getSortIcon('payableAmount')}
                    </th>
                    <th onClick={() => handleSort('status')} className="sortable">
                      Status {getSortIcon('status')}
                    </th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {currentApplications.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="no-data">
                        <div className="no-data-content">
                          <p>No data available in table</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    currentApplications.map((app, index) => (
                      <tr key={app._id}>
                        <td>{startIndex + index + 1}</td>
                        <td>{app.vendor?.fullName || 'N/A'}</td>
                        <td>{app.event?.title || 'N/A'}</td>
                        <td className="capitalize">{app.vendorType}</td>
                        <td>{formatDate(app.applicationDate)}</td>
                        <td>{formatCurrency(app.payableAmount)}</td>
                        <td>{getStatusBadge(app.status)}</td>
                        <td>
                          <button className="action-btn">
                            {app.status === 'pending' ? 'Pay Fee' : 'View Details'}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer */}
            <div className="table-footer">
              <div className="entries-info">
                {totalEntries === 0 ? (
                  'Showing 0 to 0 of 0 entries'
                ) : (
                  `Showing ${startIndex + 1} to ${Math.min(endIndex, totalEntries)} of ${totalEntries} entries`
                )}
              </div>

              <div className="pagination">
                <button
                  className="page-btn"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                  if (pageNum > totalPages) return null;
                  return (
                    <button
                      key={pageNum}
                      className={`page-btn ${pageNum === currentPage ? 'active' : ''}`}
                      onClick={() => handlePageChange(pageNum)}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  className="page-btn"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
          </>
          )}
        </div>
      </div>
    </div>
  );
}

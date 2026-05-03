import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './MobileMenuBar.css';

export default function MobileMenuBar({ user, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigate = (path) => {
    navigate(path);
    setMenuOpen(false);
  };

  const handleLogout = () => {
    onLogout();
    navigate('/login');
    setMenuOpen(false);
  };

  const menuItems = [
    { label: 'Home', path: '/' },
    { label: 'Events', path: '/events' },
    { label: 'My Tickets', path: '/dashboard/attendee' },
    { label: 'My Dashboard', path: '/dashboard' },
  ];

  return (
    <div className="mobile-menu-bar">
      <button 
        className={`hamburger-menu ${menuOpen ? 'active' : ''}`}
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <span></span>
        <span></span>
        <span></span>
      </button>
      {user && (
        <button type="button" className="mobile-logout-button" onClick={handleLogout}>
          Logout
        </button>
      )}

      {menuOpen && (
        <div className="mobile-menu-overlay" onClick={() => setMenuOpen(false)}>
          <div className="mobile-menu-content" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-menu-header">
              <h3>Menu</h3>
              <button 
                className="close-btn"
                onClick={() => setMenuOpen(false)}
              >
                ✕
              </button>
            </div>
            
            {/* Mobile Banner */}
            <div className="mobile-banner">
              <img 
                src="/public/banner.jpg" 
                alt="ReekTickets Banner" 
                className="mobile-banner-image"
              />
            </div>

            {/* Mobile Logo */}
            <div className="mobile-logo-section">
              <img 
                src="/logo-section.jpg" 
                alt="ReekTickets Logo" 
                className="mobile-logo-image"
              />
            </div>

            <div className="mobile-menu-items">
              {menuItems.map((item) => (
                <button
                  key={item.path}
                  className={`mobile-menu-item ${location.pathname === item.path ? 'active' : ''}`}
                  onClick={() => handleNavigate(item.path)}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {user && (
              <div className="mobile-menu-user">
                <div className="mobile-user-info">
                  <img 
                    src={user.avatarUrl || user.profilePic || null}
                    alt="User avatar"
                    className="mobile-user-avatar"
                  />
                  <div>
                    <p className="mobile-user-name">{user.fullName || user.email}</p>
                    <p className="mobile-user-email">{user.email}</p>
                  </div>
                </div>
                <button 
                  className="logout-btn"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

export default function Navbar({ user, onLogout }) {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const isLoggedIn = Boolean(user); // Toggle auth state here for testing

  const guestMenuItems = [
    { label: 'Home', to: '/' },
    { label: 'Browse Events', to: '/events' },
    { label: 'Create Event', to: '/dashboard/organizer' },
    { label: 'My Tickets', to: '/dashboard/attendee' },
    { label: 'Vendor Registration', to: '/dashboard/vendor' },
    { label: 'Vendor Login', to: '/login' },
    { label: 'Sales Agents', to: '/dashboard/agent' },
    { label: 'Sign Up', to: '/signup' },
    { label: 'Login', to: '/login' },
  ];

  const loggedInMenuItems = [
    { label: 'Home', to: '/' },
    { label: 'Browse Events', to: '/events' },
    { label: 'Dashboard', to: '/dashboard' },
    { label: 'Create Event', to: '/dashboard/organizer' },
    { label: 'My Tickets', to: '/dashboard/attendee' },
    {
      label: 'Logout',
      type: 'button',
      action: () => {
        onLogout?.();
        closeMobileMenu();
      },
    },
  ];

  const menuItems = isLoggedIn ? loggedInMenuItems : guestMenuItems;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      closeMobileMenu();
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/events?search=${encodeURIComponent(searchQuery)}`);
      closeMobileMenu();
      setSearchQuery('');
    }
  };

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  return (
    <header className="top-nav">
      <div className="nav-left" onClick={() => navigate('/')}>
        <img src="/logo-section.jpg" alt="ReekTickets" className="logo-img" />
      </div>

      {/* Desktop Navigation */}
      <nav className="nav-items desktop-nav">
        <Link className="active" to="/">Home</Link>
        <Link to="/dashboard/organizer">Organizer Login</Link>
        <Link to="/dashboard/vendor">Vendor Registration</Link>
        <Link to="/login">Vendor Login</Link>
        <Link to="/dashboard/agent">Sales Agents</Link>
        <Link to="/dashboard/organizer">Create Event</Link>
        <Link to="/dashboard/attendee">My Tickets</Link>
      </nav>

      {/* Desktop Search Bar */}
      <form className="desktop-search-bar" onSubmit={handleSearch}>
        <input 
          type="text" 
          className="desktop-search-input" 
          placeholder="Search events..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          aria-label="Search for events"
        />
        <button type="submit" className="desktop-search-btn" aria-label="Search">
          <img src="/search-icon.png" alt="Search" className="search-icon-image" />
        </button>
      </form>

      {/* Mobile Hamburger Menu Button */}
      <button className="mobile-menu-btn" onClick={toggleMobileMenu} aria-label="Toggle mobile menu">
        <span className={`hamburger ${isMobileMenuOpen ? 'open' : ''}`}></span>
      </button>

      <div className="nav-actions">
        {user ? <button className="btn btn-small" onClick={onLogout}>Logout</button> : <><Link className="btn btn-signup" to="/signup">Sign up</Link><Link className="btn btn-login" to="/login">Login</Link></>}
      </div>

      {/* Mobile Menu Overlay */}
      <div className={`mobile-menu-overlay ${isMobileMenuOpen ? 'open' : ''}`} onClick={handleOverlayClick}></div>

      {/* Mobile Sliding Menu - Slide Down from Top */}
      <nav className={`mobile-menu-dropdown ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="mobile-menu-content">
          <div className="mobile-menu-header">
            <div className="mobile-menu-brand">
              <div className="mobile-menu-logo">RT</div>
              <span className="mobile-menu-title">ReekTickets</span>
            </div>
            <button className="mobile-menu-close" onClick={closeMobileMenu} aria-label="Close menu">
              ×
            </button>
          </div>
          <hr className="mobile-menu-divider" />
          <div className="mobile-menu-items">
            {menuItems.map((item) =>
              item.type === 'button' ? (
                <button
                  key={item.label}
                  className="mobile-menu-item mobile-menu-action"
                  type="button"
                  onClick={item.action}
                >
                  {item.label}
                </button>
              ) : (
                <Link
                  key={item.label}
                  to={item.to}
                  className="mobile-menu-item"
                  onClick={closeMobileMenu}
                >
                  {item.label}
                </Link>
              )
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}

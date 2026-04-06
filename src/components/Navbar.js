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

  const handleOverlayClick = (e) => {
    if (e.target.className === 'mobile-menu-overlay open') {
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

      {/* Mobile Sliding Menu */}
      <nav className={`mobile-menu ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="mobile-menu-header">
          <img src="/reektickets-actual-logo.png" alt="ReekTickets" className="mobile-menu-logo" />
          <button className="mobile-menu-close" onClick={closeMobileMenu} aria-label="Close menu">×</button>
        </div>

        {/* Search Bar in Mobile Menu */}
        <form className="mobile-menu-search" onSubmit={handleSearch}>
          <input 
            type="text" 
            className="mobile-search-input" 
            placeholder="Search events..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search for events"
          />
          <button type="submit" className="mobile-search-btn" aria-label="Search">
            <img src="/search-icon.png" alt="Search" className="search-icon-image" />
          </button>
        </form>

        <div className="mobile-menu-items">
          <Link to="/" onClick={closeMobileMenu}>Home</Link>
          <Link to="/signup" onClick={closeMobileMenu}>Sign up</Link>
          <Link to="/login" onClick={closeMobileMenu}>Login</Link>
          <Link to="/dashboard/organizer" onClick={closeMobileMenu}>Create Event</Link>
          <Link to="/dashboard/vendor" onClick={closeMobileMenu}>Vendor Registration</Link>
          <Link to="/login" onClick={closeMobileMenu}>Vendor Login</Link>
          <Link to="/dashboard/agent" onClick={closeMobileMenu}>Sales Agents</Link>
          <Link to="/dashboard/attendee" onClick={closeMobileMenu}>My Tickets</Link>
        </div>
      </nav>
    </header>
  );
}

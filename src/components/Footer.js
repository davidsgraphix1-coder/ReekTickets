import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>ReekTickets</h3>
          <p>Your gateway to amazing events in Ghana.</p>
        </div>
        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul>
            <li><Link to="/events">Browse Events</Link></li>
            <li><Link to="/dashboard/organizer">Create Event</Link></li>
            <li><Link to="/dashboard/attendee">My Tickets</Link></li>
            <li><Link to="/dashboard">Organizer Dashboard</Link></li>
            <li><Link to="/blog">Blog</Link></li>
          </ul>
        </div>
        <div className="footer-section">
          <h4>Contact Us</h4>
          <div className="contact-details">
            <div className="contact-item">
              <span className="contact-icon">📞</span>
              <a className="contact-text" href="https://wa.me/233273476701" target="_blank" rel="noopener noreferrer">+233273476701</a>
            </div>
            <div className="contact-item">
              <span className="contact-icon">✉️</span>
              <a className="contact-text" href="mailto:reektickets@gmail.com">reektickets@gmail.com</a>
            </div>
          </div>
        </div>
        <div className="footer-section">
          <h4>Connect</h4>
          <div className="social-links">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">Facebook</a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">Twitter</a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">Instagram</a>
            <a href={`https://wa.me/233273476701`} target="_blank" rel="noopener noreferrer">WhatsApp</a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; 2026 ReekTickets. All rights reserved.</p>
        <Link to="/about" className="footer-about-btn">About Us</Link>
      </div>
    </footer>
  );
}
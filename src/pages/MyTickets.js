import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { fetchMyTickets } from '../services/api';

export default function MyTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadTickets = async () => {
      const storedUser = localStorage.getItem('reek_user');
      if (!storedUser) {
        setError('Please login to view your tickets.');
        setLoading(false);
        return;
      }

      const data = await fetchMyTickets();
      if (!data) {
        setError('Unable to fetch tickets right now.');
      } else if (Array.isArray(data)) {
        setTickets(data);
      } else if (data.message) {
        setError(data.message);
      } else {
        setTickets([]);
      }
      setLoading(false);
    };

    loadTickets();
  }, []);

  const user = localStorage.getItem('reek_user') ? JSON.parse(localStorage.getItem('reek_user')) : null;

  return (
    <div className="page my-tickets-page fade-in">
      <SEO
        title="My Tickets – ReekTickets | Your Ghana Event Passes"
        description="View and manage your purchased tickets on ReekTickets. Keep all your Ghana event passes in one secure place."
        keywords="my tickets Ghana, purchased tickets Ghana, ticket management Ghana, event passes Ghana"
        ogTitle="My Tickets on ReekTickets"
        ogDescription="Access your event tickets, download digital passes, and manage orders instantly in Ghana."
        ogImage="/public/banner.jpg"
      />
      <div className="page-head glass">
        <h1>My Tickets</h1>
        <p>Access your purchased event tickets in one place.</p>
      </div>

      <section className="page-content">
        {loading ? (
          <p>Loading your tickets…</p>
        ) : error ? (
          <div>
            <p className="error">{error}</p>
            {!user && <Link to="/login" className="btn btn-primary">Login</Link>}
          </div>
        ) : tickets.length === 0 ? (
          <div>
            <p>You have no tickets yet. Browse events and grab a ticket now.</p>
            <Link to="/events" className="btn btn-secondary">Browse Events</Link>
          </div>
        ) : (
          <div className="ticket-list">
            {tickets.map((ticket) => (
              <div key={ticket._id || ticket.id} className="ticket-card compact">
                <div className="ticket-card-header">
                  <h3>{ticket.event?.title || 'Event ticket'}</h3>
                  <span className={`status-badge status-${ticket.status?.toLowerCase() || 'active'}`}>
                    {ticket.status || 'Active'}
                  </span>
                </div>
                <p>{ticket.event?.location || 'Location unavailable'}</p>
                <p>{ticket.ticketType || 'Ticket'} • GH₵ {ticket.price?.toFixed(2) || '0.00'}</p>
                <p>Access code: <strong>{ticket.smsCode || 'N/A'}</strong></p>
                <div className="ticket-actions">
                  <Link to={`/ticket/${ticket._id}?code=${encodeURIComponent(ticket.smsCode || '')}`} className="btn btn-primary">
                    View Ticket
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

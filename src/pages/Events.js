import { useEffect, useState } from 'react';
import SEO from '../components/SEO';
import { fetchEvents, initPaystack } from '../services/api';
import EventCard from '../components/EventCard';

export default function Events({ user }) {
  const [events, setEvents] = useState([]);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fetchEvents().then((data) => setEvents(Array.isArray(data) ? data : [])).catch(() => setEvents([]));
  }, []);

  const handleBuy = async (event, price, ticketType) => {
    if (!user) {
      setMsg('Please log in first');
      return;
    }
    const res = await initPaystack({ eventId: event._id, email: user.email, amount: price, ticketType });
    if (res.authorization_url) {
      window.location.href = res.authorization_url;
      return;
    }
    setMsg(res.message || 'Payment initialization failed');
  };

  return (
    <div className="page event-page fade-in">
      <SEO
        title="Browse Events in Ghana | ReekTickets"
        description="Find upcoming concerts, parties, and ticketed events across Ghana. Book event tickets instantly on ReekTickets."
        keywords="buy tickets Ghana, Accra concerts tickets, Ghana event booking, online ticket platform Ghana"
        ogTitle="Browse Events in Ghana | ReekTickets"
        ogDescription="Find upcoming concerts, parties, and ticketed events across Ghana. Book event tickets instantly on ReekTickets."
        ogImage="/public/banner.jpg"
        canonical="https://reektickets.com/events"
      />
      <div className="page-head glass"><h2>Browse Events in Ghana</h2><p>Live events curated for you.</p></div>
      {msg && <div className="error">{msg}</div>}
      <div className="grid-3">
        {events.map((event) => <EventCard key={event._id} event={event} onBuy={handleBuy} />)}
      </div>
    </div>
  );
}

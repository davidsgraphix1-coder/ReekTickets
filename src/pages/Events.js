import { useEffect, useState } from 'react';
import SEO from '../components/SEO';
import { fetchEvents, initPaystack } from '../services/api';
import EventCard from '../components/EventCard';

export default function Events({ user }) {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [msg, setMsg] = useState('');

  const categories = ['All', 'Music', 'Business', 'Sports', 'Arts', 'Tech', 'Food', 'General'];

  useEffect(() => {
    fetchEvents().then((data) => {
      const eventArray = Array.isArray(data) ? data : [];
      setEvents(eventArray);
      setFilteredEvents(eventArray);
    }).catch(() => {
      setEvents([]);
      setFilteredEvents([]);
    });
  }, []);

  useEffect(() => {
    let filtered = events;

    // Filter by category
    if (activeCategory !== 'All') {
      filtered = filtered.filter(event => event.category === activeCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(event =>
        event.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.location?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredEvents(filtered);
  }, [events, activeCategory, searchQuery]);

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
    <div className="browse-events-page">
      <SEO
        title="Browse Events in Ghana | ReekTickets"
        description="Find upcoming concerts, parties, and ticketed events across Ghana. Book event tickets instantly on ReekTickets."
        keywords="buy tickets Ghana, Accra concerts tickets, Ghana event booking, online ticket platform Ghana"
        ogTitle="Browse Events in Ghana | ReekTickets"
        ogDescription="Find upcoming concerts, parties, and ticketed events across Ghana. Book event tickets instantly on ReekTickets."
        ogImage="/public/banner.jpg"
        canonical="https://reektickets.com/events"
      />

      {/* Header Section */}
      <div className="browse-header">
        <h1 className="browse-title">
          <span className="title-all">ALL</span>
          <span className="title-events">events</span>
        </h1>
        <div className="title-underline"></div>
      </div>

      {/* Search and Filter Bar */}
      <div className="search-filter-bar">
        <div className="search-container">
          <input
            type="text"
            className="search-input"
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filter-buttons">
          {categories.map(category => (
            <button
              key={category}
              className={`filter-btn ${activeCategory === category ? 'active' : ''}`}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Error Message */}
      {msg && <div className="error-message">{msg}</div>}

      {/* Events Grid */}
      <div className="events-grid">
        {filteredEvents.length > 0 ? (
          filteredEvents.map((event) => (
            <EventCard key={event._id} event={event} onBuy={handleBuy} />
          ))
        ) : (
          <div className="no-events">
            <p>No events found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}

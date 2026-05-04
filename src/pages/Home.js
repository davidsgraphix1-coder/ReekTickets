import { useEffect, useMemo, useState } from 'react';
import { fetchEvents, initPaystack } from '../services/api';
import SEO from '../components/SEO';
import EventCard from '../components/EventCard';

const slides = [
  { title: 'EASY ACCESS TO YOUR FAVOURITE EVENTS', subtitle: 'Buy tickets instantly with secure checkout and event updates.' },
  { title: 'DISCOVER HAPPENING EVENTS NEAR YOU', subtitle: 'Find concerts, conferences, and workshops in one place.' },
  { title: 'MANAGE TICKETS WITH EASE', subtitle: 'Track your purchases, download QR codes, and share with friends.' },
];

const FILTERS = [
  { key: 'trending', label: 'Trending' },
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'popular-accra', label: 'Popular in Accra' },
  { key: 'recent', label: 'Recent' },
];

export default function Home({ user }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [slide, setSlide] = useState(0);
  const [activeFilter, setActiveFilter] = useState('trending');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fetchEvents().then((data) => {
      setEvents(Array.isArray(data) ? data : []);
      setLoading(false);
    }).catch(() => {
      setEvents([]);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    const t = setInterval(() => setSlide((s) => (s + 1) % slides.length), 6000);
    return () => clearInterval(t);
  }, []);

  const nextSlide = () => setSlide((s) => (s + 1) % slides.length);
  const prevSlide = () => setSlide((s) => (s - 1 + slides.length) % slides.length);

  const filteredEvents = useMemo(() => {
    if (!Array.isArray(events) || events.length === 0) return [];
    const now = Date.now();
    const arr = [...events];
    switch (activeFilter) {
      case 'upcoming':
        return arr
          .filter((e) => e.date && new Date(e.date).getTime() >= now)
          .sort((a, b) => new Date(a.date) - new Date(b.date));
      case 'popular-accra':
        return arr.filter((e) =>
          (e.location || e.city || '').toLowerCase().includes('accra')
        );
      case 'recent':
        return arr.sort((a, b) => {
          const ad = new Date(a.createdAt || a.date || 0).getTime();
          const bd = new Date(b.createdAt || b.date || 0).getTime();
          return bd - ad;
        });
      case 'trending':
      default:
        return arr.sort((a, b) => (b.ticketsSold || 0) - (a.ticketsSold || 0));
    }
  }, [events, activeFilter]);

  const handleBuy = async (event, price, ticketType) => {
    if (!user) {
      setMsg('Please log in first');
      return;
    }
    try {
      const res = await initPaystack({ eventId: event._id, email: user.email, amount: price, ticketType });
      if (res.authorization_url) {
        window.location.href = res.authorization_url;
        return;
      }
      setMsg(res.message || 'Payment initialization failed');
    } catch (err) {
      setMsg(err?.message || 'Payment initialization failed');
    }
  };

  const homeJsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'ReekTickets',
      url: 'https://reektickets.com',
      logo: 'https://reektickets.com/reektickets-actual-logo.png',
      sameAs: ['https://facebook.com', 'https://twitter.com', 'https://instagram.com'],
    },
  ];

  return (
    <div className="home-wrapper home-white">
      <SEO
        title="ReekTickets – Ghana’s Top #4 Ticketing Platform | Buy Event Tickets Online"
        description="Buy tickets for concerts, parties, and events in Ghana. ReekTickets is a fast, secure, and reliable ticketing platform for event organizers, vendors, and attendees."
        keywords="tickets Ghana, buy event tickets Ghana, Accra events, Ghana concerts, online ticketing Ghana, event management Ghana, sell tickets online Ghana, ReekTickets"
        ogTitle="ReekTickets – Ghana’s Top #4 Ticketing Platform"
        ogDescription="Buy tickets for top events in Ghana."
        ogImage="/banner.jpg"
        canonical="https://reektickets.com/"
        jsonLd={homeJsonLd}
      />

      {/* HERO BANNER */}
      <section
        className="hero hero-white"
        style={{ backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.66), rgba(0,0,0,0.24)), url('/banner.jpg')` }}
      >
        <div className="hero-content">
          <p className="eyebrow">ReekTickets — Anytime, anywhere</p>
          <h1>{slides[slide].title}</h1>
          <p className="hero-text">{slides[slide].subtitle}</p>
          <div className="hero-controls">
            <button className="hero-arrow" onClick={prevSlide} aria-label="Previous slide">←</button>
            <div className="dots">
              {slides.map((_, index) => (
                <span key={index} className={`dot ${index === slide ? 'active' : ''}`}></span>
              ))}
            </div>
            <button className="hero-arrow" onClick={nextSlide} aria-label="Next slide">→</button>
          </div>
        </div>
      </section>

      {/* ALL EVENTS SECTION (Egotickets-style, dark) */}
      <section className="all-events-section all-events-dark">
        <div className="all-events-inner">
          <div className="all-events-top">
            <div className="all-events-header">
              <p className="all-events-eyebrow">ALL EVENTS</p>
              <h2 className="all-events-title">
                Discover what’s <span className="title-accent">happening</span>
              </h2>
              <p className="all-events-subtitle">
                Filter by what's hot right now, what's coming up next, what's popping in Accra, or the freshly listed.
              </p>
            </div>
            <a href="/events" className="all-events-viewall">View all →</a>
          </div>

          <div className="all-events-filters" role="tablist" aria-label="Filter events">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                role="tab"
                aria-selected={activeFilter === f.key}
                className={`filter-pill ${activeFilter === f.key ? 'active' : ''}`}
                onClick={() => setActiveFilter(f.key)}
              >
                {f.label}
              </button>
            ))}
          </div>

          {msg && <div className="error-message">{msg}</div>}

          <div className="events-grid ego-grid">
            {loading ? (
              <div className="events-empty">Loading events...</div>
            ) : filteredEvents.length === 0 ? (
              <div className="events-empty">No events to show in this category yet.</div>
            ) : (
              filteredEvents.map((event) => (
                <EventCard key={event._id} event={event} onBuy={handleBuy} />
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

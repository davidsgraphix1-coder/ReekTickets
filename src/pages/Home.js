import { useEffect, useState } from 'react';
import { fetchEvents } from '../services/api';
import SEO from '../components/SEO';

const slides = [
  { title: 'EASY ACCESS TO YOUR FAVOURITE EVENTS', subtitle: 'Buy tickets instantly with secure checkout and event updates.' },
  { title: 'DISCOVER HAPPENING EVENTS NEAR YOU', subtitle: 'Find concerts, conferences, and workshops in one place.' },
  { title: 'MANAGE TICKETS WITH EASE', subtitle: 'Track your purchases, download QR codes, and share with friends.' },
];

export default function Home() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    fetchEvents().then((data) => {
      setEvents(Array.isArray(data) ? data : []);
      setLoading(false);
    }).catch(() => {
      setEvents([]);
      setLoading(false);
    });
  }, []);

  const nextSlide = () => setSlide((s) => (s + 1) % slides.length);
  const prevSlide = () => setSlide((s) => (s - 1 + slides.length) % slides.length);

  const homeJsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'ReekTickets',
      url: 'https://reektickets.com',
      logo: 'https://reektickets.com/reektickets-actual-logo.png',
      sameAs: [
        'https://facebook.com',
        'https://twitter.com',
        'https://instagram.com',
      ],
    },
  ];

  return (
    <div className="home-wrapper">
      <SEO
        title="ReekTickets – Ghana’s Top #4 Ticketing Platform | Buy Event Tickets Online"
        description="Buy tickets for concerts, parties, and events in Ghana. ReekTickets is a fast, secure, and reliable ticketing platform for event organizers, vendors, and attendees."
        keywords="tickets Ghana, buy event tickets Ghana, Accra events, Ghana concerts, online ticketing Ghana, event management Ghana, sell tickets online Ghana, ReekTickets"
        ogTitle="ReekTickets – Ghana’s Top #4 Ticketing Platform"
        ogDescription="Buy tickets for top events in Ghana."
        ogImage="/public/banner.jpg"
        canonical="https://reektickets.com/"
        jsonLd={homeJsonLd}
      />
      <section className="hero" style={{ backgroundImage: `url('/public/banner.jpg')`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div className="hero-overlay hero-overlay-clear">
          <div className="hero-content">
            <p className="eyebrow">ReekTickets - Anytime, anywhere</p>
            <h1>{slides[slide].title}</h1>
            <p className="hero-text">{slides[slide].subtitle}</p>
            <div className="hero-controls">
              <button className="hero-arrow" onClick={prevSlide}>←</button>
              <div className="dots">
                {slides.map((_, index) => <span key={index} className={`dot ${index === slide ? 'active' : ''}`}></span>)}
              </div>
              <button className="hero-arrow" onClick={nextSlide}>→</button>
            </div>
          </div>
        </div>
      </section>

      <section className="attraction-section">
        <div className="section-title">
          <span className="purple">Attraction</span>
          <span className="secondary">Events</span>
        </div>
        <div className="cards-grid">
          {loading ? <div style={{ gridColumn: '1 / -1', textAlign: 'center' }}>Loading events...</div> : events.length === 0 ? <div style={{ gridColumn: '1 / -1', textAlign: 'center' }}>No events yet, create one in dashboard.</div> : events.map((event) => (
            <div className="event-card" key={event._id}>
              <div className="card-img" style={{ backgroundImage: `url('${event.banner || '/public/banner.jpg'}')` }} />
              <div className="card-body">
                <h4>{event.title}</h4>
                <p>{event.location}</p>
                <div className="card-meta"><span>{new Date(event.date).toLocaleDateString()}</span><strong>GHS {event.ticketTypes?.[0]?.price || 0}</strong></div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchEvent, fetchEvents } from '../services/api';
import SEO from '../components/SEO';
import EventCard from '../components/EventCard';

export default function EventDetails() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchEvent(id).then((data) => {
      setEvent(data);
      setLoading(false);
    }).catch(() => {
      setError('Event not found');
      setLoading(false);
    });
  }, [id]);

  useEffect(() => {
    if (!event) return;
    fetchEvents()
      .then((data) => {
        const arr = Array.isArray(data) ? data : [];
        setRelated(
          arr
            .filter((e) => e._id !== event._id && (e.category === event.category))
            .slice(0, 3)
        );
      })
      .catch(() => setRelated([]));
  }, [event]);

  if (loading) return <div className="page"><p>Loading event...</p></div>;
  if (error) return <div className="page"><p>{error}</p></div>;
  if (!event) return <div className="page"><p>Event not found</p></div>;

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareText = encodeURIComponent(`Check out ${event.title} on ReekTickets!`);
  const enc = encodeURIComponent(shareUrl);

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${enc}`,
    twitter: `https://twitter.com/intent/tweet?url=${enc}&text=${shareText}`,
    whatsapp: `https://wa.me/?text=${shareText}%20${enc}`,
    telegram: `https://t.me/share/url?url=${enc}&text=${shareText}`,
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const eventSchema = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.title,
    startDate: event.date ? new Date(event.date).toISOString() : undefined,
    location: {
      '@type': 'Place',
      name: event.venueName || event.location || 'Event Venue',
      address: event.address || event.location || 'Accra, Ghana',
    },
    image: [shareUrl + (event.banner ? '' : '')],
    description: event.description || 'Buy tickets for this event on ReekTickets.',
    offers: {
      '@type': 'Offer',
      price: String(event.ticketTypes?.[0]?.price || 0),
      priceCurrency: 'GHS',
      availability: 'https://schema.org/InStock',
    },
  };

  const dateObj = event.date ? new Date(event.date) : null;
  const organizerName =
    event.organizerName || event.organizer?.fullName || event.organizer?.name || 'Organizer';
  const organizerPic =
    event.organizerProfilePic || event.organizer?.profilePic || '/reektickets-actual-logo.png';
  const organizerContact =
    event.organizerContact || event.organizerEmail || event.organizerPhone || 'Contact unavailable';

  return (
    <div className="page event-details-page-v2 fade-in">
      <SEO
        title={`${event.title} | ReekTickets`}
        description={`Buy tickets for ${event.title} in ${event.location || ''}. Secure payments and instant ticket delivery.`}
        keywords={`${event.title}, events Ghana, tickets Ghana, ${event.location || ''}`}
        ogTitle={`${event.title} – ReekTickets`}
        ogDescription={event.description || 'Book tickets now on ReekTickets.'}
        ogImage={event.banner || '/public/banner.jpg'}
        jsonLd={eventSchema}
      />

      <nav aria-label="breadcrumb" className="breadcrumb">
        <Link to="/">Home</Link>
        <span>›</span>
        <Link to="/events">Events</Link>
        <span>›</span>
        <span>{event.title}</span>
      </nav>

      {/* HERO */}
      <section
        className="ed-hero"
        style={{ backgroundImage: `url('${event.banner || '/public/banner.jpg'}')` }}
      >
        <div className="ed-hero-overlay">
          <div className="ed-hero-content">
            {event.category && <span className="ed-category-chip">{event.category}</span>}
            <h1 className="ed-title">{event.title}</h1>
            <div className="ed-meta-row">
              {dateObj && (
                <div className="ed-meta-item">
                  <i className="fas fa-calendar" aria-hidden="true">📅</i>
                  <span>
                    {dateObj.toLocaleDateString()} • {dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              )}
              <div className="ed-meta-item">
                <i className="fas fa-map-marker-alt" aria-hidden="true">📍</i>
                <span>{event.venueName || event.location || 'TBA'}</span>
              </div>
            </div>
            <button
              className="ed-cta-btn"
              onClick={() => (window.location.href = `/checkout/${event._id}`)}
            >
              Get Tickets
            </button>
          </div>
        </div>
      </section>

      {/* SHARE */}
      <section className="ed-share-section">
        <h3 className="ed-section-label">Share this event</h3>
        <div className="ed-share-icons">
          <a className="ed-share-btn ed-share-fb" href={shareLinks.facebook} target="_blank" rel="noopener noreferrer" aria-label="Share on Facebook">
            <i className="fab fa-facebook-f">f</i>
          </a>
          <a className="ed-share-btn ed-share-tw" href={shareLinks.twitter} target="_blank" rel="noopener noreferrer" aria-label="Share on Twitter / X">
            <i className="fab fa-x-twitter">𝕏</i>
          </a>
          <a className="ed-share-btn ed-share-wa" href={shareLinks.whatsapp} target="_blank" rel="noopener noreferrer" aria-label="Share on WhatsApp">
            <i className="fab fa-whatsapp">W</i>
          </a>
          <a className="ed-share-btn ed-share-tg" href={shareLinks.telegram} target="_blank" rel="noopener noreferrer" aria-label="Share on Telegram">
            <i className="fab fa-telegram-plane">T</i>
          </a>
          <button className="ed-share-btn ed-share-copy" onClick={handleCopy} aria-label="Copy link">
            <i className="fas fa-link">🔗</i>
          </button>
        </div>
        {copied && <span className="ed-copied">Link copied!</span>}
      </section>

      {/* ABOUT */}
      <section className="ed-about-section">
        <h2 className="ed-section-title">About this event</h2>
        {event.description && <p className="ed-description">{event.description}</p>}
        {event.aboutEvent && (
          <div className="ed-about-block">
            <h3>Event Details</h3>
            <p>{event.aboutEvent}</p>
          </div>
        )}
      </section>

      {/* ORGANIZED BY */}
      <section className="ed-organizer-section">
        <h2 className="ed-section-title">Organized by</h2>
        <div className="ed-organizer-card">
          <div className="ed-organizer-avatar">
            <img src={organizerPic} alt={organizerName} />
          </div>
          <div className="ed-organizer-info">
            <h3>{organizerName}</h3>
            <p>{organizerContact}</p>
          </div>
          <a
            className="ed-organizer-contact-btn"
            href={
              event.organizerEmail
                ? `mailto:${event.organizerEmail}`
                : event.organizerPhone
                ? `tel:${event.organizerPhone}`
                : '#'
            }
          >
            Contact Organizer
          </a>
        </div>
      </section>

      {/* RELATED */}
      {related.length > 0 && (
        <section className="ed-related-section">
          <h2 className="ed-section-title">Related events</h2>
          <div className="events-grid ego-grid">
            {related.map((e) => (
              <EventCard key={e._id} event={e} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

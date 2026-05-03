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

      {/* SHARE — Egotickets style */}
      <section className="ed-share-section ego-share">
        <h3 className="ed-section-label">Share this event</h3>
        <div className="ego-share-row">
          <a className="ego-share-btn ego-share-fb" href={shareLinks.facebook} target="_blank" rel="noopener noreferrer" aria-label="Share on Facebook">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M13.5 21v-7.5h2.5l.5-3h-3V8.7c0-.9.3-1.5 1.6-1.5H17V4.6c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.5-4 4.1V10.5H8v3h2.5V21h3z"/></svg>
          </a>
          <a className="ego-share-btn ego-share-tw" href={shareLinks.twitter} target="_blank" rel="noopener noreferrer" aria-label="Share on X">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M18.244 2H21l-6.52 7.45L22 22h-6.59l-4.78-6.27L4.97 22H2.21l6.97-7.96L2 2h6.73l4.32 5.72L18.24 2zm-1.16 18.4h1.7L7.02 3.51H5.2L17.08 20.4z"/></svg>
          </a>
          <a className="ego-share-btn ego-share-wa" href={shareLinks.whatsapp} target="_blank" rel="noopener noreferrer" aria-label="Share on WhatsApp">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M20.52 3.48A11.93 11.93 0 0 0 12.04 0C5.5 0 .2 5.3.2 11.84c0 2.09.55 4.13 1.6 5.93L0 24l6.39-1.67a11.86 11.86 0 0 0 5.65 1.44h.01c6.54 0 11.84-5.3 11.84-11.84 0-3.16-1.23-6.13-3.37-8.45zM12.05 21.5a9.65 9.65 0 0 1-4.92-1.35l-.35-.21-3.79.99 1.01-3.69-.23-.38a9.64 9.64 0 0 1-1.49-5.16c0-5.34 4.34-9.68 9.68-9.68 2.59 0 5.02 1.01 6.85 2.84a9.62 9.62 0 0 1 2.83 6.85c0 5.34-4.34 9.79-9.58 9.79zm5.3-7.27c-.29-.15-1.71-.85-1.98-.95-.27-.1-.46-.15-.66.15-.19.29-.76.95-.93 1.14-.17.19-.34.22-.63.07-.29-.15-1.22-.45-2.32-1.43-.86-.77-1.44-1.72-1.61-2.01-.17-.29-.02-.45.13-.6.13-.13.29-.34.43-.51.15-.17.19-.29.29-.49.1-.19.05-.36-.02-.51-.07-.15-.66-1.59-.9-2.18-.24-.57-.48-.5-.66-.51l-.56-.01c-.19 0-.51.07-.78.36-.27.29-1.02 1-1.02 2.43 0 1.43 1.04 2.81 1.18 3 .15.19 2.05 3.13 4.96 4.39.69.3 1.23.48 1.65.62.69.22 1.32.19 1.81.12.55-.08 1.71-.7 1.95-1.37.24-.67.24-1.24.17-1.37-.07-.13-.27-.21-.56-.36z"/></svg>
          </a>
          <a className="ego-share-btn ego-share-tg" href={shareLinks.telegram} target="_blank" rel="noopener noreferrer" aria-label="Share on Telegram">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M21.94 4.4 18.7 19.7c-.24 1.08-.88 1.34-1.78.84l-4.92-3.63-2.37 2.28c-.26.26-.48.48-.99.48l.36-5.04 9.18-8.3c.4-.36-.09-.55-.62-.2L6.2 13.18 1.36 11.7c-1.05-.33-1.07-1.05.22-1.55L20.6 2.93c.87-.32 1.63.2 1.34 1.47z"/></svg>
          </a>
          <a className="ego-share-btn ego-share-li" href={`https://www.linkedin.com/sharing/share-offsite/?url=${enc}`} target="_blank" rel="noopener noreferrer" aria-label="Share on LinkedIn">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zM8.34 18.34H5.67V9.99h2.67v8.35zM7 8.82a1.55 1.55 0 1 1 0-3.1 1.55 1.55 0 0 1 0 3.1zm11.34 9.52h-2.67v-4.06c0-.97-.02-2.22-1.35-2.22-1.36 0-1.57 1.06-1.57 2.15v4.13h-2.67V9.99h2.56v1.14h.04c.36-.68 1.23-1.4 2.54-1.4 2.71 0 3.21 1.78 3.21 4.1v4.51z"/></svg>
          </a>
          <a className="ego-share-btn ego-share-em" href={`mailto:?subject=${encodeURIComponent(event.title)}&body=${shareText}%20${enc}`} aria-label="Share by Email">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M22 5H2a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h20a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1zm-1 2v.4l-9 6.43L3 7.4V7h18zM3 17V9.84l8.42 6.02a1 1 0 0 0 1.16 0L21 9.84V17H3z"/></svg>
          </a>
          <button className="ego-share-btn ego-share-copy" onClick={handleCopy} aria-label="Copy link">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M10.59 13.41a1 1 0 0 1 0-1.41l3-3a1 1 0 0 1 1.41 1.41l-3 3a1 1 0 0 1-1.41 0zm-3.18-2.83a3 3 0 0 1 4.24 0l1.42-1.41a5 5 0 1 0-7.07 7.07l1.41-1.41a3 3 0 0 1 0-4.25zm9.9 1.42-1.41 1.41a3 3 0 1 1-4.24 4.24l-1.42 1.41a5 5 0 1 0 7.07-7.06z"/></svg>
            <span className="ego-share-label">{copied ? 'Copied!' : 'Copy link'}</span>
          </button>
        </div>
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

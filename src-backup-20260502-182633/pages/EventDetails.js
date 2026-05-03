import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchEvent } from '../services/api';
import SEO from '../components/SEO';

export default function EventDetails() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchEvent(id).then((data) => {
      setEvent(data);
      setLoading(false);
    }).catch(() => {
      setError('Event not found');
      setLoading(false);
    });
  }, [id]);

  if (loading) return <div className="page"><p>Loading event...</p></div>;
  if (error) return <div className="page"><p>{error}</p></div>;
  if (!event) return <div className="page"><p>Event not found</p></div>;

  const eventSchema = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.title,
    startDate: new Date(event.date).toISOString(),
    location: {
      '@type': 'Place',
      name: event.location || 'Accra Event Center',
      address: 'Accra, Ghana',
    },
    image: [window.location.origin + (event.banner || '/public/banner.jpg')],
    description: event.description || 'Buy tickets for this event on ReekTickets.',
    offers: {
      '@type': 'Offer',
      price: String(event.ticketTypes?.[0]?.price || 0),
      priceCurrency: 'GHS',
      availability: 'https://schema.org/InStock',
    },
  };

  return (
    <div className="page event-details-page fade-in">
      <SEO
        title={`${event.title} | ReekTickets`}
        description={`Buy tickets for ${event.title} in ${event.location}. Secure payments and instant ticket delivery.`}
        keywords={`${event.title}, events Ghana, tickets Ghana, ${event.location}`}
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
      <div className="event-header">
        <div className="event-main">
          <h1>{event.title}</h1>
          <p className="organizer">By {event.organizer?.fullName || 'Organizer'}</p>
          <div className="event-meta">
            <div className="meta-item">
              <span className="icon">📅</span>
              <span>{new Date(event.date).toLocaleDateString()} at {new Date(event.date).toLocaleTimeString()}</span>
            </div>
            <div className="meta-item">
              <span className="icon">📍</span>
              <span>{event.location}</span>
            </div>
          </div>
          <p className="description">{event.description}</p>
        </div>
        <div className="event-sidebar">
          <div className="sticky-card">
            <h3>{event.location}</h3>
            <p>{new Date(event.date).toLocaleDateString()}</p>
            <p>{new Date(event.date).toLocaleTimeString()}</p>
            <p>Accra</p>
            <button className="btn btn-primary" onClick={() => window.location.href = `/checkout/${event._id}`}>Grab your ticket</button>
            <div className="rsvp">
              <h4>RSVP</h4>
              <p>Interested? Let us know!</p>
            </div>
            <div className="contact">
              <h4>Contact</h4>
              <p>info@reektickets.com</p>
            </div>
            <div className="share">
              <h4>Share</h4>
              <button>Facebook</button>
              <button>Twitter</button>
              <button>WhatsApp</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchEvent } from '../services/api';

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

  return (
    <div className="page event-details-page fade-in">
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
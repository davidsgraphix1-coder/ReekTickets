export default function EventCard({ event, onBuy }) {
  const price = event?.ticketTypes?.[0]?.price || 0;
  const ticketType = event?.ticketTypes?.[0]?.type || 'General';

  const handleCardClick = () => {
    window.location.href = `/events/${event._id}`;
  };

  const handleBuyClick = (e) => {
    e.stopPropagation();
    onBuy(event, price, ticketType);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="event-card-modern" onClick={handleCardClick}>
      <div
        className="event-card-image"
        style={{
          backgroundImage: `url('${event.banner || '/public/banner.jpg'}')`
        }}
      >
        <div className="event-category-tag">{event.category || 'General'}</div>
      </div>

      <div className="event-card-content">
        <h3 className="event-title">{event.title}</h3>

        <div className="event-location">
          <span className="location-icon">📍</span>
          <span>{event.location}</span>
        </div>

        <div className="event-datetime">
          <div className="event-date">
            <span className="date-icon">📅</span>
            <span>{formatDate(event.date)}</span>
          </div>
          <div className="event-time">
            <span className="time-icon">🕐</span>
            <span>{formatTime(event.date)}</span>
          </div>
        </div>

        <button className="grab-ticket-btn" onClick={handleBuyClick}>
          Grab your ticket
        </button>
      </div>
    </div>
  );
}

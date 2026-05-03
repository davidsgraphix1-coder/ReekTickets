export default function EventCard({ event, onBuy }) {
  const price = event?.ticketTypes?.[0]?.price || 0;
  const ticketType = event?.ticketTypes?.[0]?.type || 'General';

  const handleCardClick = () => {
    window.location.href = `/events/${event._id}`;
  };

  const handleBuyClick = (e) => {
    e.stopPropagation();
    if (typeof onBuy === 'function') {
      onBuy(event, price, ticketType);
    } else {
      window.location.href = `/events/${event._id}`;
    }
  };

  const formatDay = (dateString) => {
    if (!dateString) return '--';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { day: 'numeric' });
  };

  const formatMonth = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <article className="ego-event-card" onClick={handleCardClick}>
      <div
        className="ego-card-image"
        style={{ backgroundImage: `url('${event.banner || '/public/banner.jpg'}')` }}
      >
        <div className="ego-date-badge">
          <span className="ego-date-day">{formatDay(event.date)}</span>
          <span className="ego-date-month">{formatMonth(event.date)}</span>
        </div>
        {event.category && (
          <span className="ego-category-pill">{event.category}</span>
        )}
      </div>

      <div className="ego-card-body">
        <h3 className="ego-card-title">{event.title}</h3>

        <div className="ego-card-meta">
          <span className="ego-meta-row">
            <i className="fas fa-map-marker-alt" aria-hidden="true">📍</i>
            <span>{event.location || event.venueName || 'TBA'}</span>
          </span>
          <span className="ego-meta-row">
            <i className="fas fa-clock" aria-hidden="true">🕐</i>
            <span>{formatTime(event.date)}</span>
          </span>
        </div>

        <div className="ego-card-footer">
          <span className="ego-price">
            <small>From</small>
            <strong>GH₵ {price}</strong>
          </span>
          <button className="ego-buy-btn" onClick={handleBuyClick}>
            Buy Ticket
          </button>
        </div>
      </div>
    </article>
  );
}

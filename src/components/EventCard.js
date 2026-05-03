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

  const fmtDay = (d) => d ? new Date(d).toLocaleDateString('en-US', { day: '2-digit' }) : '--';
  const fmtMonth = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short' }).toUpperCase() : '';
  const fmtFull = (d) => {
    if (!d) return 'Date TBA';
    const date = new Date(d);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  };

  const banner = event.banner || event.image || '/banner.jpg';

  return (
    <article className="ego-event-card" onClick={handleCardClick}>
      <div
        className="ego-card-image"
        style={{ backgroundImage: `url('${banner}')` }}
      >
        {event.category && (
          <span className="ego-category-pill">{event.category}</span>
        )}
        <div className="ego-date-badge">
          <span className="ego-date-month">{fmtMonth(event.date)}</span>
          <span className="ego-date-day">{fmtDay(event.date)}</span>
        </div>
      </div>

      <div className="ego-card-body">
        <h3 className="ego-card-title">{event.title}</h3>

        <div className="ego-card-meta">
          <span className="ego-meta-row">
            <span className="ego-meta-icon" aria-hidden="true">📅</span>
            <span>{fmtFull(event.date)}</span>
          </span>
          <span className="ego-meta-row">
            <span className="ego-meta-icon" aria-hidden="true">📍</span>
            <span>{event.location || event.venueName || 'TBA'}</span>
          </span>
        </div>

        <div className="ego-card-footer">
          <span className="ego-price">
            <small>FROM</small>
            <strong>GHS {price}</strong>
          </span>
          <button className="ego-buy-btn" onClick={handleBuyClick}>
            Get tickets
          </button>
        </div>
      </div>
    </article>
  );
}

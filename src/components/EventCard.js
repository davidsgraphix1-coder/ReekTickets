export default function EventCard({ event, onBuy }) {
  const price = event?.ticketTypes?.[0]?.price || 0;
  const ticketType = event?.ticketTypes?.[0]?.type || 'General';
  return (
    <div className="card event-card" onClick={() => window.location.href = `/events/${event._id}`}>
      <div className="card-banner" style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('${event.banner || '/public/banner.jpg'}')` }}>
        <div className="event-tag">{event.category || 'All'}</div>
      </div>
      <div className="card-body">
        <h3>{event.title}</h3>
        <p>{event.description?.slice(0, 120) || 'Exciting event with top experiences.'}</p>
        <div className="event-row">
          <span>{new Date(event.date).toLocaleDateString()}</span>
          <span>{event.location}</span>
        </div>
        <div className="event-footer">
          <div>
            <small>{ticketType}</small>
            <strong>GHS {price}</strong>
          </div>
          <button className="btn btn-small" onClick={(e) => { e.stopPropagation(); onBuy(event, price, ticketType); }}>Buy</button>
        </div>
      </div>
    </div>
  );
}

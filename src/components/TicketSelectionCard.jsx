export default function TicketSelectionCard({ tickets, quantities, onQuantityChange }) {
  return (
    <div className="ticket-selection-list">
      {tickets.map((ticket, index) => {
        const available = Number(ticket.quantity || ticket.available || 0) > 0;
        const soldOut = !available || String(ticket.status || '').toLowerCase() === 'sold out';
        const price = Number(ticket.price || 0);
        const quantity = quantities[index] || 0;

        return (
          <div key={index} className={`ticket-card ${soldOut ? 'ticket-card-disabled' : ''}`}>
            <div className="ticket-card-top">
              <div className="ticket-title">{ticket.type || ticket.name || 'General Admission'}</div>
              <div className="ticket-price">{price > 0 ? `₵ ${price.toFixed(2)}` : 'Free'}</div>
            </div>

            <div className="ticket-card-meta">
              <span className={`badge-pill ${soldOut ? 'badge-danger' : 'badge-success'}`}>
                {soldOut ? 'Sold Out' : (ticket.quantity ? `${ticket.quantity} remaining` : 'Available')}
              </span>
            </div>

            {ticket.description && <p className="ticket-description">{ticket.description}</p>}
            <p className="ticket-note">Admits one person</p>
            <div className="ticket-divider" />

            <div className="ticket-action-row">
              {soldOut ? (
                <button type="button" className="unavailable-button" disabled>
                  Sold Out
                </button>
              ) : (
                <label className="quantity-picker">
                  <span>Quantity</span>
                  <select
                    value={quantity}
                    onChange={(e) => onQuantityChange(index, Number(e.target.value))}
                  >
                    {Array.from({ length: 6 }, (_, idx) => (
                      <option key={idx} value={idx}>{idx}</option>
                    ))}
                  </select>
                </label>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

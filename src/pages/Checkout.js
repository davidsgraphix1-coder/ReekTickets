import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchEvent } from '../services/api';

export default function Checkout() {
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [quantities, setQuantities] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchEvent(eventId).then((data) => {
      setEvent(data);
      const initialQuantities = {};
      (data.ticketTypes || []).forEach((type, index) => {
        initialQuantities[index] = 0;
      });
      setQuantities(initialQuantities);
      setLoading(false);
    }).catch(() => {
      setError('Event not found');
      setLoading(false);
    });
  }, [eventId]);

  const updateQuantity = (index, delta) => {
    setQuantities(prev => ({
      ...prev,
      [index]: Math.max(0, prev[index] + delta)
    }));
  };

  const calculateTotal = () => {
    let total = 0;
    (event?.ticketTypes || []).forEach((type, index) => {
      total += quantities[index] * (type.price || 0);
    });
    return total;
  };

  if (loading) return <div className="page"><p>Loading checkout...</p></div>;
  if (error) return <div className="page"><p>{error}</p></div>;
  if (!event) return <div className="page"><p>Event not found</p></div>;

  return (
    <div className="page checkout-page fade-in">
      <div className="checkout-header">
        <button className="back-btn" onClick={() => window.history.back()}>← Back</button>
        <h1>{event.title}</h1>
        <p>{new Date(event.date).toLocaleDateString()} • {event.location}</p>
      </div>
      <div className="checkout-content">
        <div className="ticket-selection">
          <h2>Ticket Currency | GH₵</h2>
          {(event.ticketTypes || []).map((type, index) => (
            <div key={index} className="ticket-row">
              <div className="ticket-info">
                <h3>{type.type}</h3>
                <p>{new Date(event.date).toLocaleDateString()}</p>
                <p>GH₵ {type.price}</p>
              </div>
              <div className="quantity-selector">
                <button onClick={() => updateQuantity(index, -1)}>-</button>
                <span>{quantities[index]}</span>
                <button onClick={() => updateQuantity(index, 1)}>+</button>
              </div>
            </div>
          ))}
        </div>
        <div className="order-summary">
          <h3>Order Summary</h3>
          {(event.ticketTypes || []).map((type, index) => (
            <div key={index} className="summary-item">
              <span>{quantities[index]} x {type.type}</span>
              <span>GH₵ {quantities[index] * (type.price || 0)}</span>
            </div>
          ))}
          <div className="total">
            <strong>Total: GH₵ {calculateTotal()}</strong>
          </div>
          <button className="btn btn-primary">Proceed to Payment</button>
        </div>
      </div>
    </div>
  );
}
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchEvent, initPaystack } from '../services/api';

export default function Checkout() {
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [quantities, setQuantities] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [paymentMessage, setPaymentMessage] = useState('');
  const [user, setUser] = useState(null);

  // Fee structure
  const SERVICE_FEES = {
    standard: 0.05,  // 5%
    gold: 0.075,     // 7.5%
    platinum: 0.10   // 10%
  };
  const TRANSACTION_FEE = 0.025; // 2.5%

  useEffect(() => {
    const storedUser = localStorage.getItem('reek_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {}
    }

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

  const calculateFees = () => {
    const subtotal = calculateTotal();
    const serviceTier = event?.serviceTier || 'standard';
    const serviceFee = subtotal * SERVICE_FEES[serviceTier];
    const transactionFee = subtotal * TRANSACTION_FEE;
    const totalFees = serviceFee + transactionFee;
    return {
      subtotal,
      serviceFee,
      transactionFee,
      totalFees,
      grandTotal: subtotal + totalFees
    };
  };

  const handleProceed = async () => {
    setPaymentMessage('');
    if (!user?.email) {
      setPaymentMessage('Please log in before making a payment.');
      return;
    }

    const selectedItems = (event?.ticketTypes || []).map((type, index) => ({
      ticketType: type.type || 'General',
      price: type.price || 0,
      quantity: quantities[index] || 0,
    })).filter((item) => item.quantity > 0);

    if (selectedItems.length === 0) {
      setPaymentMessage('Please select at least one ticket.');
      return;
    }

    const amount = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    if (amount <= 0) {
      setPaymentMessage('Your total amount must be greater than zero.');
      return;
    }

    const res = await initPaystack({
      eventId,
      email: user.email,
      amount,
      items: selectedItems,
    });

    if (res.authorization_url) {
      window.location.href = res.authorization_url;
      return;
    }
    setPaymentMessage(res.message || 'Payment initialization failed.');
  };

  if (loading) return <div className="page"><p>Loading checkout...</p></div>;
  if (error) return <div className="page"><p>{error}</p></div>;
  if (!event) return <div className="page"><p>Event not found</p></div>;

  const fees = calculateFees();

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
          
          {/* Fee Breakdown */}
          {calculateTotal() > 0 && (
            <div style={{ borderTop: '1px solid #ddd', marginTop: '12px', paddingTop: '12px' }}>
              <div className="summary-item" style={{ fontSize: '0.9rem', color: '#666' }}>
                <span>Subtotal</span>
                <span>GH₵ {fees.subtotal.toFixed(2)}</span>
              </div>
              <div className="summary-item" style={{ fontSize: '0.9rem', color: '#666' }}>
                <span>Service Fee ({(SERVICE_FEES[event?.serviceTier || 'standard'] * 100).toFixed(1)}%)</span>
                <span>GH₵ {fees.serviceFee.toFixed(2)}</span>
              </div>
              <div className="summary-item" style={{ fontSize: '0.9rem', color: '#666' }}>
                <span>Transaction Fee (2.5%)</span>
                <span>GH₵ {fees.transactionFee.toFixed(2)}</span>
              </div>
              <div className="summary-item" style={{ fontSize: '0.85rem', color: '#999', marginBottom: '8px' }}>
                <span>Total Fees</span>
                <span>GH₵ {fees.totalFees.toFixed(2)}</span>
              </div>
            </div>
          )}
          
          <div className="total" style={{ marginTop: '14px' }}>
            <strong>Grand Total: GH₵ {fees.grandTotal.toFixed(2)}</strong>
            {calculateTotal() > 0 && (
              <p style={{ fontSize: '0.8rem', color: '#999', margin: '4px 0 0 0' }}>
                You will be charged GH₵ {fees.grandTotal.toFixed(2)}
              </p>
            )}
          </div>
          <button className="btn btn-primary" onClick={handleProceed}>Proceed to Payment</button>
          {paymentMessage && <div className="error" style={{ marginTop: '16px' }}>{paymentMessage}</div>}
        </div>
      </div>
    </div>
  );
}
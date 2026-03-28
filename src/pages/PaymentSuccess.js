import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const reference = searchParams.get('reference');
  const [ticket, setTicket] = useState(null);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        if (!reference) {
          setError('No payment reference found');
          setLoading(false);
          return;
        }

        const res = await fetch(`https://reektickets-production.up.railway.app/api/payments/verify?reference=${reference}`);
        const data = await res.json();

        if (!res.ok || data.message === 'Payment not successful') {
          setError('Payment verification failed');
          setLoading(false);
          return;
        }

        setTicket(data.ticket);
        setEvent(data.event);
        setLoading(false);
      } catch (err) {
        setError('Could not verify payment');
        setLoading(false);
      }
    };

    verifyPayment();
  }, [reference]);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  if (loading) return <div className="page"><p>Verifying payment...</p></div>;
  if (error) return <div className="page"><p style={{ color: 'red' }}>{error}</p></div>;
  if (!ticket) return <div className="page"><p>No ticket found</p></div>;

  const ticketLink = `${window.location.origin}/ticket/${ticket._id}?code=${ticket.smsCode}`;

  return (
    <div className="page payment-success fade-in">
      <div style={{ textAlign: 'center', padding: '40px 20px' }}>
        <h1 style={{ color: 'green', fontSize: '32px' }}>✓ Payment Successful!</h1>
        <p style={{ fontSize: '18px', marginBottom: '30px' }}>Your ticket has been generated</p>

        {event && (
          <div style={{ 
            backgroundColor: '#f5f5f5', 
            padding: '20px', 
            borderRadius: '8px', 
            marginBottom: '30px',
            maxWidth: '500px',
            margin: '0 auto 30px'
          }}>
            <h2>{event.title}</h2>
            <p>{new Date(event.date).toLocaleDateString()} • {event.location}</p>
          </div>
        )}

        <div style={{ 
          backgroundColor: '#fff', 
          padding: '30px', 
          borderRadius: '8px', 
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          maxWidth: '500px',
          margin: '0 auto 30px'
        }}>
          <h3>Your Ticket Code</h3>
          <div style={{ 
            backgroundColor: '#f9f9f9', 
            padding: '20px', 
            borderRadius: '8px', 
            fontSize: '36px',
            fontWeight: 'bold',
            letterSpacing: '4px',
            marginBottom: '20px',
            fontFamily: 'monospace',
            color: '#2563eb'
          }}>
            {ticket.smsCode}
          </div>
          <button 
            onClick={() => copyToClipboard(ticket.smsCode)}
            style={{
              backgroundColor: '#2563eb',
              color: 'white',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              marginBottom: '20px'
            }}
          >
            Copy Code
          </button>

          <h3 style={{ marginTop: '30px' }}>Your Ticket Link</h3>
          <div style={{ 
            backgroundColor: '#f0f0f0', 
            padding: '15px', 
            borderRadius: '4px',
            marginBottom: '10px',
            wordBreak: 'break-all',
            fontSize: '12px',
            color: '#000'
          }}>
            {ticketLink}
          </div>
          <button 
            onClick={() => copyToClipboard(ticketLink)}
            style={{
              backgroundColor: '#2563eb',
              color: 'white',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Copy Link
          </button>
        </div>

        <div style={{
          backgroundColor: '#e8f4f8',
          padding: '20px',
          borderRadius: '8px',
          maxWidth: '500px',
          margin: '0 auto',
          textAlign: 'left'
        }}>
          <h4>What's Next?</h4>
          <ul style={{ textAlign: 'left' }}>
            <li>Screenshot this page for your records</li>
            <li>Copy the ticket code and link above</li>
            <li>Show the QR code at the event entrance</li>
            <li>View your ticket anytime in your Dashboard</li>
          </ul>
        </div>

        <div style={{ marginTop: '30px' }}>
          <a 
            href="/dashboard"
            style={{
              display: 'inline-block',
              backgroundColor: '#2563eb',
              color: 'white',
              padding: '12px 30px',
              borderRadius: '4px',
              textDecoration: 'none',
              fontSize: '16px'
            }}
          >
            Go to Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
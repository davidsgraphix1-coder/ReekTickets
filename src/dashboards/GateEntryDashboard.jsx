import { useState } from 'react';
import QRCode from 'react-qr-code';
import SEO from '../components/SEO';
import { verifyTicketCode } from '../services/api';

export default function GateEntryDashboard() {
  const [ticketId, setTicketId] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [ticket, setTicket] = useState(null);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleVerify = async () => {
    setError('');
    setStatus('');
    setTicket(null);
    if (!ticketId || !accessCode) {
      setError('Enter both ticket ID and access code.');
      return;
    }

    setLoading(true);
    try {
      const data = await verifyTicketCode(ticketId.trim(), accessCode.trim());
      setTicket(data);
      setStatus('Ticket verified successfully. Ready for gate entry.');
    } catch (err) {
      setError(err?.message || 'Ticket verification failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page dashboard-page fade-in">
      <SEO
        title="Gate Entry Dashboard – ReekTickets"
        description="Verify tickets quickly at event gates with ticket ID and access code on ReekTickets."
      />
      <div className="page-head glass">
        <h1>Gate Entry Staff</h1>
        <p>Verify ticket access codes and confirm guest entry at the gate.</p>
      </div>

      <section className="page-content">
        <div className="gate-verification-panel">
          <div className="form-group">
            <label>Ticket ID</label>
            <input
              type="text"
              placeholder="Enter Ticket ID"
              value={ticketId}
              onChange={(e) => setTicketId(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Access Code</label>
            <input
              type="text"
              placeholder="Enter access code"
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value)}
            />
          </div>
          <button className="btn btn-primary" onClick={handleVerify} disabled={loading}>
            {loading ? 'Verifying…' : 'Verify Ticket'}
          </button>
          {status && <div className="success" style={{ marginTop: '16px' }}>{status}</div>}
          {error && <div className="error" style={{ marginTop: '16px' }}>{error}</div>}
        </div>

        {ticket && (
          <div className="ticket-card gate-ticket-card">
            <div className="ticket-card-header">
              <h3>{ticket.event?.title || 'Verified Ticket'}</h3>
              <span className={`status-badge status-${ticket.status?.toLowerCase() || 'active'}`}>
                {ticket.status || 'Active'}
              </span>
            </div>
            <p><strong>Event:</strong> {ticket.event?.title || 'Unknown event'}</p>
            <p><strong>Date:</strong> {new Date(ticket.event?.date).toLocaleString()}</p>
            <p><strong>Holder:</strong> {ticket.user?.fullName || ticket.user?.name || 'Guest'}</p>
            <p><strong>Access Code:</strong> {ticket.smsCode}</p>
            <p><strong>Reference:</strong> {ticket.reference || ticket._id}</p>
            <div className="ticket-qr" style={{ marginTop: '24px' }}>
              <QRCode value={ticket.reference || ticket._id || `${ticketId}:${accessCode}`} size={180} />
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

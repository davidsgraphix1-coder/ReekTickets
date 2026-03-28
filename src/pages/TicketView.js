import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { fetchTicket } from '../services/api';
import QRCode from 'react-qr-code';

export default function TicketView() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const inputCode = searchParams.get('code');
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchTicket(id);
        if (inputCode && data.smsCode !== inputCode) {
          setError('Invalid or expired access code.');
          setLoading(false);
          return;
        }
        if (data.smsCodeExpiry && new Date(data.smsCodeExpiry) < new Date()) {
          setError('The access code has expired.');
          setLoading(false);
          return;
        }
        setTicket(data);
      } catch (err) {
        setError('Could not load ticket.');
      }
      setLoading(false);
    }
    load();
  }, [id, inputCode]);

  if (loading) return <div className="page"><p>Loading ticket...</p></div>;
  if (error) return <div className="page"><p className="error">{error}</p></div>;
  if (!ticket) return <div className="page"><p>Ticket not found.</p></div>;

  return (
    <div className="page ticket-view-page fade-in">
      <div className="glass page-head">
        <h2>Your Ticket</h2>
        <p>Show the QR code at event entrance.</p>
      </div>
      <div className="ticket-card">
        <div className="ticket-header">
          <h3>{ticket.event?.title || 'Event'}</h3>
          <p>{ticket.event?.location}</p>
          <p>{new Date(ticket.event?.date).toLocaleString()}</p>
        </div>
        <div className="ticket-details">
          <p>Holder: {ticket.user?.fullName || 'Attendee'}</p>
          <p>Type: {ticket.ticketType || 'General'}</p>
          <p>Reference: {ticket.reference}</p>
        </div>
        <div className="ticket-qr">
          <QRCode value={ticket.reference || ticket._id} size={180} />
        </div>
        <div className="ticket-message">
          <p>Access Code: {ticket.smsCode}</p>
          <p>Valid until: {ticket.smsCodeExpiry ? new Date(ticket.smsCodeExpiry).toLocaleString() : 'N/A'}</p>
        </div>
      </div>
    </div>
  );
}
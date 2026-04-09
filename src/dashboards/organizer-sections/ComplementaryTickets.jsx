import { useState } from 'react';
import { FaPlus } from 'react-icons/fa';
import axios from 'axios';
import API_BASE from '../../config/api';

export default function ComplementaryTickets({ tickets, events, headers, onRefresh }) {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    eventId: '',
    ticketType: 'Complimentary',
    quantity: 1,
    recipientName: '',
    recipientEmail: '',
    recipientPhone: '',
  });

  const complimentaryTickets = tickets.filter((ticket) =>
    (ticket.ticketType || '').toLowerCase().includes('complimentary') ||
    (ticket.price || 0) === 0
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Create complimentary ticket by calling a backend endpoint
      // For now, we'll simulate this by creating a ticket record
      const ticketData = {
        event: formData.eventId,
        ticketType: formData.ticketType,
        price: 0, // Complimentary tickets are free
        quantity: formData.quantity,
        recipientName: formData.recipientName,
        recipientEmail: formData.recipientEmail,
        recipientPhone: formData.recipientPhone,
      };

      await axios.post(`${API_BASE}/tickets/complimentary`, ticketData, { headers });

      setFormData({
        eventId: '',
        ticketType: 'Complimentary',
        quantity: 1,
        recipientName: '',
        recipientEmail: '',
        recipientPhone: '',
      });
      setShowForm(false);
      onRefresh();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create complimentary ticket');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="section fade-in">
      <div className="section-header">
        <h2>Complimentary Tickets</h2>
        <p className="section-subtitle">Create and manage free tickets for your events</p>
      </div>

      {!showForm ? (
        <button
          className="btn btn-primary"
          onClick={() => setShowForm(true)}
          style={{ marginBottom: '20px' }}
        >
          <FaPlus /> Create Complimentary Ticket
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="ticket-form">
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label>Select Event *</label>
            <select
              name="eventId"
              value={formData.eventId}
              onChange={handleInputChange}
              required
            >
              <option value="">-- Choose Event --</option>
              {events.map(event => (
                <option key={event._id} value={event._id}>{event.title}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Ticket Type *</label>
            <select
              name="ticketType"
              value={formData.ticketType}
              onChange={handleInputChange}
              required
            >
              <option value="Complimentary">Complimentary</option>
              <option value="VIP Complimentary">VIP Complimentary</option>
              <option value="Press Complimentary">Press Complimentary</option>
              <option value="Staff Complimentary">Staff Complimentary</option>
            </select>
          </div>

          <div className="form-group">
            <label>Quantity *</label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleInputChange}
              min="1"
              required
            />
          </div>

          <div className="form-group">
            <label>Recipient Name *</label>
            <input
              type="text"
              name="recipientName"
              value={formData.recipientName}
              onChange={handleInputChange}
              placeholder="Full name of recipient"
              required
            />
          </div>

          <div className="form-group">
            <label>Recipient Email *</label>
            <input
              type="email"
              name="recipientEmail"
              value={formData.recipientEmail}
              onChange={handleInputChange}
              placeholder="recipient@example.com"
              required
            />
          </div>

          <div className="form-group">
            <label>Recipient Phone</label>
            <input
              type="tel"
              name="recipientPhone"
              value={formData.recipientPhone}
              onChange={handleInputChange}
              placeholder="+233XXXXXXXXX"
            />
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Complimentary Ticket'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div style={{ marginTop: '40px' }}>
        <h3>Existing Complimentary Tickets</h3>
        {complimentaryTickets.length === 0 ? (
          <p className="no-data">No complimentary tickets found.</p>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Event</th>
                  <th>Ticket Type</th>
                  <th>Attendee</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {complimentaryTickets.map((ticket) => (
                  <tr key={ticket._id} className="table-row-hover">
                    <td>{ticket.event?.title || 'N/A'}</td>
                    <td>{ticket.ticketType || 'Complimentary'}</td>
                    <td>{ticket.user?.fullName || ticket.user?.email || 'Guest'}</td>
                    <td>{new Date(ticket.createdAt).toLocaleDateString()}</td>
                    <td><span className="badge badge-success">{ticket.status || 'active'}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

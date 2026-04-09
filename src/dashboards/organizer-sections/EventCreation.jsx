import axios from 'axios';
import { useState } from 'react';
import { FaPlus, FaTimes } from 'react-icons/fa';
import API_BASE from '../../config/api';

export default function EventCreation({ events, headers, onEventCreated }) {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
    serviceTier: 'standard',
    ticketTypes: [{ type: 'General', price: '', quantity: '' }],
    banner: null,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({ ...prev, banner: e.target.files[0] }));
  };

  const handleTicketTypeChange = (index, field, value) => {
    const updated = [...formData.ticketTypes];
    updated[index][field] = value;
    setFormData(prev => ({ ...prev, ticketTypes: updated }));
  };

  const addTicketType = () => {
    setFormData(prev => ({
      ...prev,
      ticketTypes: [...prev.ticketTypes, { type: '', price: '', quantity: '' }],
    }));
  };

  const removeTicketType = (index) => {
    setFormData(prev => ({
      ...prev,
      ticketTypes: prev.ticketTypes.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const form = new FormData();
      form.append('title', formData.title);
      form.append('description', formData.description);
      form.append('date', formData.date);
      form.append('location', formData.location);
      form.append('serviceTier', formData.serviceTier);
      form.append('ticketTypes', JSON.stringify(formData.ticketTypes));
      if (formData.banner) form.append('banner', formData.banner);

      await axios.post(`${API_BASE}/events`, form, {
        headers: { ...headers, 'Content-Type': 'multipart/form-data' },
      });

      setFormData({
        title: '',
        description: '',
        date: '',
        location: '',
        serviceTier: 'standard',
        ticketTypes: [{ type: 'General', price: '', quantity: '' }],
        banner: null,
      });
      setShowForm(false);
      onEventCreated();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="section fade-in">
      <div className="section-header">
        <h2>Event Creation</h2>
        <p className="section-subtitle">Create and manage your events</p>
      </div>

      {!showForm ? (
        <button 
          className="btn btn-primary"
          onClick={() => setShowForm(true)}
          style={{ marginBottom: '20px' }}
        >
          <FaPlus /> Create New Event
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="event-form">
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label>Event Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="e.g., Tech Conference 2026"
              required
            />
          </div>

          <div className="form-group">
            <label>Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe your event..."
              rows="4"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Date & Time *</label>
              <input
                type="datetime-local"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Location *</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="e.g., Accra Convention Centre"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Banner Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>

          <div className="form-group">
            <label>Service Tier *</label>
            <select
              name="serviceTier"
              value={formData.serviceTier}
              onChange={handleInputChange}
              required
            >
              <option value="standard">Standard (5% service fee)</option>
              <option value="gold">Gold (7.5% service fee)</option>
              <option value="platinum">Platinum (10% service fee)</option>
            </select>
            <small style={{ color: '#666', marginTop: '5px', display: 'block' }}>
              Choose your service tier. All tiers include 2.5% transaction handling fees.
            </small>
          </div>

          <div className="form-group">
            <label>Ticket Types</label>
            {formData.ticketTypes.map((ticket, index) => (
              <div key={index} className="ticket-type-row">
                <input
                  type="text"
                  placeholder="Ticket Type (e.g., VIP, General)"
                  value={ticket.type}
                  onChange={(e) => handleTicketTypeChange(index, 'type', e.target.value)}
                  required
                />
                <input
                  type="number"
                  placeholder="Price (GH₵)"
                  value={ticket.price}
                  onChange={(e) => handleTicketTypeChange(index, 'price', e.target.value)}
                  step="0.01"
                  required
                />
                <input
                  type="number"
                  placeholder="Quantity"
                  value={ticket.quantity}
                  onChange={(e) => handleTicketTypeChange(index, 'quantity', e.target.value)}
                  required
                />
                {formData.ticketTypes.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeTicketType(index)}
                    className="btn btn-danger"
                  >
                    <FaTimes />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addTicketType}
              className="btn btn-secondary"
              style={{ marginTop: '10px' }}
            >
              + Add Ticket Type
            </button>
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Event'}
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

      {/* EXISTING EVENTS */}
      <div style={{ marginTop: '40px' }}>
        <h3>Your Events</h3>
        {events.length === 0 ? (
          <p className="no-data">No events created yet. Create your first event!</p>
        ) : (
          <div className="events-grid">
            {events.map(event => (
              <div key={event._id} className="event-card">
                <div className="event-card-header">
                  <h4>{event.title}</h4>
                  <span className="event-date">{new Date(event.date).toLocaleDateString()}</span>
                </div>
                <p className="event-location">📍 {event.location}</p>
                <p className="event-description">{event.description?.substring(0, 100)}...</p>
                <div className="event-stats">
                  <div><strong>{event.ticketTypes?.length || 0}</strong> Ticket Types</div>
                  <div><strong>{event.ticketTypes?.reduce((sum, t) => sum + (t.quantity || 0), 0) || 0}</strong> Total Tickets</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

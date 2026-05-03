import { useState } from 'react';
import { FaBullhorn, FaEnvelope, FaMobileAlt, FaTags, FaChartLine } from 'react-icons/fa';

export default function EventPromotion({ events }) {
  const [selectedEvent, setSelectedEvent] = useState('');

  return (
    <div className="section fade-in">
      <div className="dashboard-title" style={{ marginBottom: '30px' }}>
        <div className="title-icon"><FaBullhorn /></div>
        <h1>Event Promotion</h1>
      </div>

      <div className="form-group" style={{ maxWidth: '400px', marginBottom: '30px' }}>
        <label>Select Event to Promote</label>
        <select 
          value={selectedEvent} 
          onChange={(e) => setSelectedEvent(e.target.value)}
          className="filter-dropdown"
        >
          <option value="">-- Choose Event --</option>
          {events.map(event => (
            <option key={event._id} value={event._id}>{event.title}</option>
          ))}
        </select>
      </div>

      {selectedEvent && (
        <div style={{ maxWidth: '600px' }}>
          <h3>Promotion Options</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="promo-card" style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '32px', marginBottom: '10px' }}><FaEnvelope /></div>
              <h4>Email Campaign</h4>
              <p style={{ fontSize: '13px', color: '#666' }}>Send promotional emails to subscribers</p>
              <button className="btn btn-secondary">Create Campaign</button>
            </div>

            <div className="promo-card" style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '32px', marginBottom: '10px' }}><FaMobileAlt /></div>
              <h4>Message Campaign</h4>
              <p style={{ fontSize: '13px', color: '#666' }}>Send customer notifications via messaging</p>
              <button className="btn btn-secondary">Create Campaign</button>
            </div>

            <div className="promo-card" style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '32px', marginBottom: '10px' }}><FaTags /></div>
              <h4>Discount Codes</h4>
              <p style={{ fontSize: '13px', color: '#666' }}>Create promo codes for discounts</p>
              <button className="btn btn-secondary">Create Discount</button>
            </div>

            <div className="promo-card" style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '32px', marginBottom: '10px' }}><FaChartLine /></div>
              <h4>Analytics</h4>
              <p style={{ fontSize: '13px', color: '#666' }}>View promotion performance</p>
              <button className="btn btn-secondary">View Stats</button>
            </div>
          </div>
        </div>
      )}

      {!selectedEvent && (
        <p className="no-data">Select an event to view promotion options</p>
      )}
    </div>
  );
}

import { useState } from 'react';
import { FaPlus, FaTimes, FaArrowRight, FaArrowLeft, FaCheck, FaMapMarkerAlt, FaVideo, FaGlobe, FaCalendarAlt, FaTicketAlt, FaCog } from 'react-icons/fa';
import API_BASE from '../../config/api';

export default function EventCreation({ events, headers, onEventCreated }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    // Event Details
    title: '',
    category: 'conference',
    description: '',
    aboutEvent: '',
    banner: null,
    // Organizer Profile
    organizerName: '',
    organizerContact: '',
    organizerEmail: '',
    organizerPhone: '',
    organizerProfilePic: null,
    // Venue & Location
    eventFormat: 'in-person', // in-person, virtual, hybrid
    venueName: '',
    address: '',
    city: '',
    country: 'Ghana',
    platform: 'zoom',
    eventLink: '',
    virtualInstructions: '',
    // Tickets & Pricing
    ticketTypes: [{ type: 'General Admission', price: '', quantity: '' }],
    // Settings & Publish
    isHidden: false,
    privateLink: '',
    hasPassword: false,
    password: '',
    confirmPassword: '',
    isRecurring: false,
    totalOccurrences: 1,
    period: 'weekly',
    recurringDay: 'monday',
    startDate: '',
    endDate: '',
  });

  const steps = [
    { id: 1, title: 'Event Details', description: 'Basic event information', icon: <FaCalendarAlt /> },
    { id: 2, title: 'Venue & Location', description: 'Where and how the event will take place', icon: <FaMapMarkerAlt /> },
    { id: 3, title: 'Tickets & Pricing', description: 'Set up ticket types and pricing', icon: <FaTicketAlt /> },
    { id: 4, title: 'Settings & Publish', description: 'Final settings and publish your event', icon: <FaCog /> }
  ];

  const categories = [
    'conference', 'workshop', 'concert', 'sports', 'theater', 'festival',
    'networking', 'seminar', 'webinar', 'party', 'exhibition', 'other'
  ];

  const platforms = [
    'zoom', 'google-meet', 'microsoft-teams', 'youtube-live',
    'instagram-live', 'facebook-live', 'tiktok-live', 'custom'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (field, e) => {
    setFormData(prev => ({ ...prev, [field]: e.target.files[0] }));
  };

  const handleCheckboxChange = (name) => {
    setFormData(prev => ({ ...prev, [name]: !prev[name] }));
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

  const validateStep = (step) => {
    switch (step) {
      case 1:
        return formData.title && formData.category && formData.description &&
               formData.organizerName && formData.organizerContact;
      case 2:
        if (formData.eventFormat === 'in-person' || formData.eventFormat === 'hybrid') {
          if (!formData.venueName || !formData.address || !formData.city) return false;
        }
        if (formData.eventFormat === 'virtual' || formData.eventFormat === 'hybrid') {
          if (!formData.eventLink) return false;
        }
        return true;
      case 3:
        return formData.ticketTypes.every(ticket => ticket.type && ticket.price && ticket.quantity);
      case 4:
        if (formData.hasPassword && (!formData.password || formData.password !== formData.confirmPassword)) {
          return false;
        }
        if (formData.isRecurring && (!formData.startDate || !formData.endDate)) {
          return false;
        }
        return true;
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length));
      setError('');
    } else {
      setError('Please fill in all required fields');
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    setError('');
  };

  const generatePrivateLink = () => {
    const randomId = Math.random().toString(36).substring(2, 15);
    return `https://reektickets.com/event/private/${randomId}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(currentStep)) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const form = new FormData();
      // Event Details
      form.append('title', formData.title);
      form.append('category', formData.category);
      form.append('description', formData.description);
      form.append('aboutEvent', formData.aboutEvent);
      if (formData.banner) form.append('banner', formData.banner);

      // Organizer Profile
      form.append('organizerName', formData.organizerName);
      form.append('organizerContact', formData.organizerContact);
      form.append('organizerEmail', formData.organizerEmail);
      form.append('organizerPhone', formData.organizerPhone);
      if (formData.organizerProfilePic) form.append('organizerProfilePic', formData.organizerProfilePic);

      // Venue & Location
      form.append('eventFormat', formData.eventFormat);
      form.append('venueName', formData.venueName);
      form.append('address', formData.address);
      form.append('city', formData.city);
      form.append('country', formData.country);
      form.append('platform', formData.platform);
      form.append('eventLink', formData.eventLink);
      form.append('virtualInstructions', formData.virtualInstructions);

      // Tickets & Pricing
      form.append('ticketTypes', JSON.stringify(formData.ticketTypes));

      // Settings & Publish
      form.append('isHidden', formData.isHidden);
      form.append('privateLink', formData.isHidden ? generatePrivateLink() : '');
      form.append('hasPassword', formData.hasPassword);
      form.append('password', formData.password);
      form.append('isRecurring', formData.isRecurring);
      form.append('totalOccurrences', formData.totalOccurrences);
      form.append('period', formData.period);
      form.append('recurringDay', formData.recurringDay);
      form.append('startDate', formData.startDate);
      form.append('endDate', formData.endDate);

      await fetch(`${API_BASE}/events`, {
        method: 'POST',
        headers,
        body: form
      });

      // Reset form
      setFormData({
        title: '', category: 'conference', description: '', aboutEvent: '', banner: null,
        organizerName: '', organizerContact: '', organizerEmail: '', organizerPhone: '', organizerProfilePic: null,
        eventFormat: 'in-person', venueName: '', address: '', city: '', country: 'Ghana',
        platform: 'zoom', eventLink: '', virtualInstructions: '',
        ticketTypes: [{ type: 'General Admission', price: '', quantity: '' }],
        isHidden: false, privateLink: '', hasPassword: false, password: '', confirmPassword: '',
        isRecurring: false, totalOccurrences: 1, period: 'weekly', recurringDay: 'monday',
        startDate: '', endDate: '',
      });
      setCurrentStep(1);
      onEventCreated();
    } catch (err) {
      setError(err.message || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="step-content">
            <div className="form-section">
              <h3>Event Details</h3>
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
                <label>Category *</label>
                <select name="category" value={formData.category} onChange={handleInputChange}>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                  ))}
                </select>
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
              <div className="form-group">
                <label>About Event</label>
                <textarea
                  name="aboutEvent"
                  value={formData.aboutEvent}
                  onChange={handleInputChange}
                  placeholder="Additional details about the event..."
                  rows="3"
                />
              </div>
              <div className="form-group">
                <label>Event Banner</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange('banner', e)}
                />
              </div>
            </div>

            <div className="form-section">
              <h3>Organizer Profile</h3>
              <div className="form-group">
                <label>Organizer Name *</label>
                <input
                  type="text"
                  name="organizerName"
                  value={formData.organizerName}
                  onChange={handleInputChange}
                  placeholder="Your organization or personal name"
                  required
                />
              </div>
              <div className="form-group">
                <label>Contact Information *</label>
                <input
                  type="text"
                  name="organizerContact"
                  value={formData.organizerContact}
                  onChange={handleInputChange}
                  placeholder="How attendees can contact you"
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="organizerEmail"
                    value={formData.organizerEmail}
                    onChange={handleInputChange}
                    placeholder="contact@example.com"
                  />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="tel"
                    name="organizerPhone"
                    value={formData.organizerPhone}
                    onChange={handleInputChange}
                    placeholder="+233 XX XXX XXXX"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Profile Picture</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange('organizerProfilePic', e)}
                />
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="step-content">
            <div className="form-section">
              <h3>Event Format</h3>
              <div className="format-selector">
                <div
                  className={`format-card ${formData.eventFormat === 'in-person' ? 'active' : ''}`}
                  onClick={() => setFormData(prev => ({ ...prev, eventFormat: 'in-person' }))}
                >
                  <FaMapMarkerAlt className="format-icon" />
                  <h4>In-Person</h4>
                  <p>Physical venue attendance</p>
                </div>
                <div
                  className={`format-card ${formData.eventFormat === 'virtual' ? 'active' : ''}`}
                  onClick={() => setFormData(prev => ({ ...prev, eventFormat: 'virtual' }))}
                >
                  <FaVideo className="format-icon" />
                  <h4>Virtual Event</h4>
                  <p>Online-only event</p>
                </div>
                <div
                  className={`format-card ${formData.eventFormat === 'hybrid' ? 'active' : ''}`}
                  onClick={() => setFormData(prev => ({ ...prev, eventFormat: 'hybrid' }))}
                >
                  <FaGlobe className="format-icon" />
                  <h4>Hybrid Event</h4>
                  <p>Both in-person and virtual</p>
                </div>
              </div>
            </div>

            {(formData.eventFormat === 'in-person' || formData.eventFormat === 'hybrid') && (
              <div className="form-section">
                <h3>Venue Details</h3>
                <div className="form-group">
                  <label>Venue Name *</label>
                  <input
                    type="text"
                    name="venueName"
                    value={formData.venueName}
                    onChange={handleInputChange}
                    placeholder="e.g., Accra Convention Centre"
                    required={formData.eventFormat === 'in-person' || formData.eventFormat === 'hybrid'}
                  />
                </div>
                <div className="form-group">
                  <label>Address *</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Full address"
                    required={formData.eventFormat === 'in-person' || formData.eventFormat === 'hybrid'}
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>City *</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="e.g., Accra"
                      required={formData.eventFormat === 'in-person' || formData.eventFormat === 'hybrid'}
                    />
                  </div>
                  <div className="form-group">
                    <label>Country</label>
                    <select name="country" value={formData.country} onChange={handleInputChange}>
                      <option value="Ghana">Ghana</option>
                      <option value="Nigeria">Nigeria</option>
                      <option value="Kenya">Kenya</option>
                      <option value="South Africa">South Africa</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {(formData.eventFormat === 'virtual' || formData.eventFormat === 'hybrid') && (
              <div className="form-section">
                <h3>Virtual Event Details</h3>
                <div className="form-group">
                  <label>Platform</label>
                  <select name="platform" value={formData.platform} onChange={handleInputChange}>
                    {platforms.map(platform => (
                      <option key={platform} value={platform}>
                        {platform.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Event Link *</label>
                  <input
                    type="url"
                    name="eventLink"
                    value={formData.eventLink}
                    onChange={handleInputChange}
                    placeholder="https://zoom.us/..."
                    required={formData.eventFormat === 'virtual' || formData.eventFormat === 'hybrid'}
                  />
                </div>
                <div className="form-group">
                  <label>Virtual Instructions</label>
                  <textarea
                    name="virtualInstructions"
                    value={formData.virtualInstructions}
                    onChange={handleInputChange}
                    placeholder="How to join the virtual event..."
                    rows="3"
                  />
                </div>
              </div>
            )}
          </div>
        );
      case 3:
        return (
          <div className="step-content">
            <div className="form-section">
              <h3>Ticket Types & Pricing</h3>
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
                    <button type="button" onClick={() => removeTicketType(index)} className="remove-btn">
                      <FaTimes />
                    </button>
                  )}
                </div>
              ))}
              <button type="button" onClick={addTicketType} className="add-ticket-btn">
                <FaPlus /> Add Ticket Type
              </button>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="step-content">
            <div className="form-section">
              <h3>Event Settings</h3>

              <div className="setting-group">
                <div className="setting-item">
                  <input
                    type="checkbox"
                    id="isHidden"
                    checked={formData.isHidden}
                    onChange={() => handleCheckboxChange('isHidden')}
                  />
                  <label htmlFor="isHidden">Hidden Event</label>
                </div>
                <p className="setting-description">
                  Hidden events are not visible in public listings. Share the private link to allow access.
                </p>
                {formData.isHidden && (
                  <div className="private-link-preview">
                    <strong>Private Link:</strong> {generatePrivateLink()}
                  </div>
                )}
              </div>

              <div className="setting-group">
                <div className="setting-item">
                  <input
                    type="checkbox"
                    id="hasPassword"
                    checked={formData.hasPassword}
                    onChange={() => handleCheckboxChange('hasPassword')}
                  />
                  <label htmlFor="hasPassword">Password Protection</label>
                </div>
                <p className="setting-description">
                  Require a password for event access.
                </p>
                {formData.hasPassword && (
                  <div className="password-fields">
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Enter password"
                      required={formData.hasPassword}
                    />
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="Confirm password"
                      required={formData.hasPassword}
                    />
                  </div>
                )}
              </div>

              <div className="setting-group">
                <div className="setting-item">
                  <input
                    type="checkbox"
                    id="isRecurring"
                    checked={formData.isRecurring}
                    onChange={() => handleCheckboxChange('isRecurring')}
                  />
                  <label htmlFor="isRecurring">Recurring Event</label>
                </div>
                <p className="setting-description">
                  Create multiple occurrences of this event.
                </p>
                {formData.isRecurring && (
                  <div className="recurring-fields">
                    <div className="form-row">
                      <div className="form-group">
                        <label>Total Occurrences</label>
                        <input
                          type="number"
                          name="totalOccurrences"
                          value={formData.totalOccurrences}
                          onChange={handleInputChange}
                          min="1"
                          max="52"
                        />
                      </div>
                      <div className="form-group">
                        <label>Period</label>
                        <select name="period" value={formData.period} onChange={handleInputChange}>
                          <option value="weekly">Weekly</option>
                          <option value="monthly">Monthly</option>
                        </select>
                      </div>
                    </div>
                    {formData.period === 'weekly' && (
                      <div className="form-group">
                        <label>Day of Week</label>
                        <select name="recurringDay" value={formData.recurringDay} onChange={handleInputChange}>
                          <option value="monday">Monday</option>
                          <option value="tuesday">Tuesday</option>
                          <option value="wednesday">Wednesday</option>
                          <option value="thursday">Thursday</option>
                          <option value="friday">Friday</option>
                          <option value="saturday">Saturday</option>
                          <option value="sunday">Sunday</option>
                        </select>
                      </div>
                    )}
                    <div className="form-row">
                      <div className="form-group">
                        <label>Start Date</label>
                        <input
                          type="date"
                          name="startDate"
                          value={formData.startDate}
                          onChange={handleInputChange}
                          required={formData.isRecurring}
                        />
                      </div>
                      <div className="form-group">
                        <label>End Date</label>
                        <input
                          type="date"
                          name="endDate"
                          value={formData.endDate}
                          onChange={handleInputChange}
                          required={formData.isRecurring}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="form-section review-section">
              <h3>Review & Publish</h3>
              <div className="review-summary">
                <div className="review-item">
                  <strong>Title:</strong> {formData.title}
                </div>
                <div className="review-item">
                  <strong>Format:</strong> {formData.eventFormat.charAt(0).toUpperCase() + formData.eventFormat.slice(1)}
                </div>
                <div className="review-item">
                  <strong>Tickets:</strong> {formData.ticketTypes.length} type(s)
                </div>
                {formData.isHidden && (
                  <div className="review-item">
                    <strong>Visibility:</strong> Hidden (Private Link)
                  </div>
                )}
                {formData.hasPassword && (
                  <div className="review-item">
                    <strong>Access:</strong> Password Protected
                  </div>
                )}
                {formData.isRecurring && (
                  <div className="review-item">
                    <strong>Schedule:</strong> Recurring ({formData.totalOccurrences} times)
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="section fade-in">
      <div className="dashboard-title" style={{ marginBottom: '30px' }}>
        <div className="title-icon"><FaPlus /></div>
        <h1>Create New Event</h1>
      </div>

      {/* Step Indicator */}
      <div className="step-indicator">
        {steps.map((step) => (
          <div key={step.id} className={`step-item ${currentStep >= step.id ? 'active' : ''} ${currentStep > step.id ? 'completed' : ''}`}>
            <div className="step-number">
              {currentStep > step.id ? <FaCheck /> : step.id}
            </div>
            <div className="step-info">
              <div className="step-title">{step.title}</div>
              <div className="step-description">{step.description}</div>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="event-form">
        {error && <div className="error-message">{error}</div>}

        {renderStepContent()}

        {/* Navigation Buttons */}
        <div className="form-navigation">
          {currentStep > 1 && (
            <button type="button" onClick={prevStep} className="btn btn-secondary">
              <FaArrowLeft /> Previous
            </button>
          )}
          {currentStep < steps.length ? (
            <button type="button" onClick={nextStep} className="btn btn-primary">
              Next <FaArrowRight />
            </button>
          ) : (
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating Event...' : 'Create Event'}
            </button>
          )}
        </div>
      </form>

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

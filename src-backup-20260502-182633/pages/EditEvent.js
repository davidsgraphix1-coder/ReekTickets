import { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import axios from 'axios';
import API_BASE from '../config/api';
import Sidebar from '../components/Sidebar';

export default function EditEvent() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [eventData, setEventData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [bannerPreview, setBannerPreview] = useState('');
  const [bannerFile, setBannerFile] = useState(null);
  const [formValues, setFormValues] = useState({
    title: '',
    category: '',
    description: '',
    aboutUs: '',
    eventFormat: 'in-person',
    date: '',
    time: '',
    location: '',
    event_link: '',
    platform: '',
    status: 'published',
    visibility: 'public',
    organizerFullName: '',
    organizerEmail: '',
    organizerPhone: '',
    organizerBusinessName: '',
  });

  const isAdminEdit = location.pathname.startsWith('/dashboard/admin');
  const headers = { Authorization: `Bearer ${localStorage.getItem('reek_token')}` };

  useEffect(() => {
    const loadEvent = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE}/events/${eventId}`);
        const responseBody = res.data;
        const event = responseBody?.data || responseBody;
        if (!event) {
          setError('Event not found');
          return;
        }

        setEventData(event);
        const eventDate = event?.date ? new Date(event.date) : null;
        const formattedDate = eventDate && !Number.isNaN(eventDate.getTime())
          ? eventDate.toLocaleDateString('en-CA')
          : '';
        const formattedTime = eventDate && !Number.isNaN(eventDate.getTime())
          ? eventDate.toTimeString().slice(0, 5)
          : '';

        setFormValues({
          title: event.title || '',
          category: event.category || '',
          description: event.description || '',
          aboutUs: event.aboutUs || '',
          eventFormat: event.eventFormat || 'in-person',
          date: formattedDate,
          time: formattedTime,
          location: event.location || '',
          event_link: event.eventLink || event.event_link || '',
          platform: event.platform || '',
          status: event.status || 'published',
          visibility: typeof event.published !== 'undefined' ? (event.published ? 'public' : 'draft') : event.visibility || 'public',
          organizerFullName: event.organizer_info?.fullName || event.organizer?.fullName || event.organizer?.name || '',
          organizerEmail: event.organizer_info?.email || '',
          organizerPhone: event.organizer_info?.phone || '',
          organizerBusinessName: event.organizer_info?.businessName || '',
        });

        setBannerPreview(event.banner || '');
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Unable to load event');
      } finally {
        setLoading(false);
      }
    };

    loadEvent();
  }, [eventId]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormValues((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleBannerChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBannerFile(file);
    const reader = new FileReader();
    reader.onload = (event) => setBannerPreview(event.target.result);
    reader.readAsDataURL(file);
  };

  const uploadBannerUrl = async () => {
    if (!bannerFile) return null;

    const uploadForm = new FormData();
    uploadForm.append('file', bannerFile);

    const res = await axios.post(`${API_BASE}/upload`, uploadForm, {
      headers: {
        ...headers,
        'Content-Type': 'multipart/form-data',
      },
    });

    return res.data?.url || null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      const eventDateTime = formValues.date
        ? `${formValues.date}T${formValues.time || '00:00'}:00`
        : null;

      const payload = {
        title: formValues.title,
        category: formValues.category,
        description: formValues.description,
        aboutUs: formValues.aboutUs,
        date: eventDateTime,
        location: formValues.location,
        eventFormat: formValues.eventFormat,
        event_link: formValues.event_link,
        platform: formValues.platform,
        status: formValues.status,
        published: formValues.status === 'published',
        visibility: formValues.visibility,
        organizerInfo: {
          fullName: formValues.organizerFullName,
          email: formValues.organizerEmail,
          phone: formValues.organizerPhone,
          businessName: formValues.organizerBusinessName,
        },
      };

      if (bannerFile) {
        const bannerUrl = await uploadBannerUrl();
        if (bannerUrl) {
          payload.banner = bannerUrl;
        }
      }

      if (isAdminEdit) {
        await axios.patch(`${API_BASE}/admin/events/${eventId}`, payload, {
          headers: {
            ...headers,
            'Content-Type': 'application/json',
          },
        });
      } else {
        const form = new FormData();
        Object.entries(payload).forEach(([key, value]) => {
          if (value === undefined || value === null) return;
          if (typeof value === 'object') {
            form.append(key, JSON.stringify(value));
          } else {
            form.append(key, value);
          }
        });
        if (bannerFile) {
          form.append('banner', bannerFile);
        }
        await axios.put(`${API_BASE}/events/${eventId}`, form, {
          headers,
        });
      }

      setSuccess('Event updated successfully.');
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to update event');
    } finally {
      setSaving(false);
    }
  };

  const goBack = () => {
    navigate(isAdminEdit ? '/dashboard/admin#events' : '/dashboard/organizer/dashboard');
  };

  return (
    <div className="edit-event-page">
      <Sidebar />
      <main className="edit-event-main">
        <div className="edit-event-panel">
          <div className="edit-event-header">
            <div>
              <h1>Edit Event</h1>
              <p>Update event details, organizer information, and banner preview.</p>
            </div>
            <button type="button" className="btn btn-outline" onClick={goBack}>
              Back to dashboard
            </button>
          </div>

          {loading ? (
            <div className="loading">Loading event details...</div>
          ) : (
            <form className="edit-event-form" onSubmit={handleSubmit}>
              {error && <div className="error-banner">{error}</div>}
              {success && <div className="success-banner">{success}</div>}

              <div className="form-section">
                <h2>Event Information</h2>
                <div className="form-row">
                  <label>
                    Title
                    <input name="title" value={formValues.title} onChange={handleInputChange} required />
                  </label>
                  <label>
                    Category
                    <input name="category" value={formValues.category} onChange={handleInputChange} required />
                  </label>
                </div>

                <label>
                  Description
                  <textarea name="description" value={formValues.description} onChange={handleInputChange} rows="5" required />
                </label>

                <label>
                  About organizer / event
                  <textarea name="aboutUs" value={formValues.aboutUs} onChange={handleInputChange} rows="3" />
                </label>

                <div className="form-row">
                  <label>
                    Event Type
                    <select name="eventFormat" value={formValues.eventFormat} onChange={handleInputChange}>
                      <option value="in-person">In-Person</option>
                      <option value="virtual">Virtual</option>
                      <option value="hybrid">Hybrid</option>
                    </select>
                  </label>
                  <label>
                    Location
                    <input name="location" value={formValues.location} onChange={handleInputChange} placeholder="Venue, address or event link" />
                  </label>
                </div>

                <div className="form-row">
                  <label>
                    Event Date
                    <input type="date" name="date" value={formValues.date} onChange={handleInputChange} required />
                  </label>
                  <label>
                    Event Time
                    <input type="time" name="time" value={formValues.time} onChange={handleInputChange} />
                  </label>
                </div>

                {(formValues.eventFormat === 'virtual' || formValues.eventFormat === 'hybrid') && (
                  <div className="form-row">
                    <label>
                      Event Link
                      <input name="event_link" value={formValues.event_link} onChange={handleInputChange} placeholder="https://" />
                    </label>
                    <label>
                      Platform
                      <input name="platform" value={formValues.platform} onChange={handleInputChange} placeholder="Zoom, Google Meet, etc." />
                    </label>
                  </div>
                )}
              </div>

              <div className="form-section">
                <h2>Organizer Information</h2>
                <div className="form-row">
                  <label>
                    Organizer Name
                    <input name="organizerFullName" value={formValues.organizerFullName} onChange={handleInputChange} />
                  </label>
                  <label>
                    Business Name
                    <input name="organizerBusinessName" value={formValues.organizerBusinessName} onChange={handleInputChange} />
                  </label>
                </div>
                <div className="form-row">
                  <label>
                    Email
                    <input name="organizerEmail" value={formValues.organizerEmail} onChange={handleInputChange} type="email" />
                  </label>
                  <label>
                    Phone
                    <input name="organizerPhone" value={formValues.organizerPhone} onChange={handleInputChange} type="tel" />
                  </label>
                </div>
              </div>

              <div className="form-section banner-section">
                <h2>Banner Preview</h2>
                <div className="banner-preview-wrapper">
                  {bannerPreview ? (
                    <img src={bannerPreview} alt="Banner preview" />
                  ) : (
                    <div className="banner-empty">No banner selected</div>
                  )}
                </div>
                <label className="banner-upload-btn">
                  Choose new banner
                  <input type="file" accept="image/*" onChange={handleBannerChange} hidden />
                </label>
              </div>

              <div className="form-section status-section">
                <h2>Publishing Settings</h2>
                <div className="form-row">
                  <label>
                    Status
                    <select name="status" value={formValues.status} onChange={handleInputChange}>
                      <option value="published">Published</option>
                      <option value="draft">Draft</option>
                    </select>
                  </label>
                  <label>
                    Visibility
                    <select name="visibility" value={formValues.visibility} onChange={handleInputChange}>
                      <option value="public">Public</option>
                      <option value="private">Private</option>
                    </select>
                  </label>
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-outline" onClick={goBack}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}

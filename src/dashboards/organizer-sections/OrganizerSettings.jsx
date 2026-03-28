import { useState } from 'react';

export default function OrganizerSettings({ organizer }) {
  const [settings, setSettings] = useState({
    businessName: organizer?.fullName || '',
    email: organizer?.email || '',
    phone: organizer?.phone || '',
    website: '',
    bio: '',
    bankAccount: '',
    accountNumber: '',
    notifications: true,
    emailDigest: 'weekly',
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSave = () => {
    alert('Settings saved successfully!');
  };

  return (
    <div className="section fade-in">
      <div className="dashboard-title" style={{ marginBottom: '30px' }}>
        <div className="title-icon">⚙️</div>
        <h1>Settings</h1>
      </div>

      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <h3>Business Information</h3>
        
        <div className="form-group">
          <label>Business Name *</label>
          <input
            type="text"
            name="businessName"
            value={settings.businessName}
            onChange={handleChange}
            disabled
          />
        </div>

        <div className="form-group">
          <label>Email Address *</label>
          <input
            type="email"
            name="email"
            value={settings.email}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Phone Number *</label>
          <input
            type="tel"
            name="phone"
            value={settings.phone}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Website</label>
          <input
            type="url"
            name="website"
            value={settings.website}
            onChange={handleChange}
            placeholder="https://example.com"
          />
        </div>

        <div className="form-group">
          <label>Bio</label>
          <textarea
            name="bio"
            value={settings.bio}
            onChange={handleChange}
            placeholder="Tell us about your business..."
            rows="4"
          />
        </div>

        <h3 style={{ marginTop: '30px' }}>Payment Information</h3>

        <div className="form-group">
          <label>Bank Name *</label>
          <input
            type="text"
            name="bankAccount"
            value={settings.bankAccount}
            onChange={handleChange}
            placeholder="e.g., Ghana Commercial Bank"
          />
        </div>

        <div className="form-group">
          <label>Account Number *</label>
          <input
            type="text"
            name="accountNumber"
            value={settings.accountNumber}
            onChange={handleChange}
            placeholder="Your bank account number"
          />
        </div>

        <h3 style={{ marginTop: '30px' }}>Preferences</h3>

        <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <input
            type="checkbox"
            name="notifications"
            checked={settings.notifications}
            onChange={handleChange}
            id="notif-checkbox"
          />
          <label htmlFor="notif-checkbox" style={{ margin: '0', cursor: 'pointer' }}>
            Enable email notifications
          </label>
        </div>

        <div className="form-group">
          <label>Email Digest Frequency</label>
          <select
            name="emailDigest"
            value={settings.emailDigest}
            onChange={handleChange}
            className="filter-dropdown"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="never">Never</option>
          </select>
        </div>

        <div style={{ marginTop: '30px', display: 'flex', gap: '10px' }}>
          <button className="btn btn-primary" onClick={handleSave}>
            💾 Save Settings
          </button>
          <button className="btn btn-secondary" onClick={() => window.location.reload()}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

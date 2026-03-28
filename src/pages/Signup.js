import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signup } from '../services/api';

export default function Signup({ onLogin }) {
  const [selectedRole, setSelectedRole] = useState('');
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    country: 'Ghana',
    city: '',
    address: '',
    zipCode: '',
    businessName: '',
    contactNumber: '',
    agreeToTerms: false
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const roles = [
    {
      id: 'attendee',
      name: 'Attendee',
      description: 'Buy and attend events',
      icon: '🎫'
    },
    {
      id: 'organizer',
      name: 'Organizer',
      description: 'Create and manage events',
      icon: '🎪'
    },
    {
      id: 'vendor',
      name: 'Vendor',
      description: 'Sell at events',
      icon: '🏪'
    },
    {
      id: 'agent',
      name: 'Sales Agent',
      description: 'Promote and earn commission',
      icon: '💼'
    }
  ];

  const submit = async (e) => {
    e.preventDefault();

    if (!selectedRole) {
      setError('Please select a role');
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!form.agreeToTerms) {
      setError('Please agree to the Terms & Conditions');
      return;
    }

    const signupData = {
      fullName: `${form.firstName} ${form.lastName}`,
      email: form.email,
      phone: `+233${form.phone.replace(/\D/g, '')}`,
      password: form.password,
      role: selectedRole,
      ...(selectedRole === 'organizer' || selectedRole === 'vendor' ? {
        country: form.country,
        city: form.city,
        address: form.address,
        zipCode: form.zipCode,
        businessName: form.businessName,
        contactNumber: form.contactNumber
      } : {})
    };

    const data = await signup(signupData);
    if (data?.token) {
      localStorage.setItem('reek_token', data.token);
      localStorage.setItem('reek_user', JSON.stringify(data.user));
      onLogin(data.user);
      navigate('/dashboard');
      return;
    }
    setError(data.message || 'Signup failed');
  };

  const showBusinessDetails = selectedRole === 'organizer' || selectedRole === 'vendor';

  return (
    <div className="signup-page">
      <div className="signup-container">
        {/* Back Button */}
        <button className="back-btn" type="button" onClick={() => navigate('/') }>
          ← Back
        </button>

        {/* Logo */}
        <div className="signup-logo">
          <img src="/logo-section.jpg" alt="ReekTickets" />
        </div>

        {/* Role Selection */}
        <div className="role-selection">
          <h3>Choose Your Role</h3>
          <div className="role-cards">
            {roles.map((role) => (
              <div
                key={role.id}
                className={`role-card ${selectedRole === role.id ? 'selected' : ''}`}
                onClick={() => setSelectedRole(role.id)}
              >
                <div className="role-icon">{role.icon}</div>
                <h4>{role.name}</h4>
                <p>{role.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Signup Form */}
        {selectedRole && (
          <form onSubmit={submit} className="signup-form">
            {error && <div className="error">{error}</div>}

            {/* Basic Information */}
            <div className="form-section">
              <h4>Basic Information</h4>
              <div className="name-row">
                <input
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  placeholder="First Name"
                  required
                />
                <input
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  placeholder="Last Name"
                  required
                />
              </div>
              <div className="phone-row">
                <div className="phone-code">+233</div>
                <input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="Phone number (without 0 or +233)"
                  required
                />
              </div>
            </div>

            {/* Business Details - Only for Organizer/Vendor */}
            {showBusinessDetails && (
              <div className="form-section">
                <h4>Business Details</h4>
                <div className="business-row">
                  <input
                    value={form.country}
                    onChange={(e) => setForm({ ...form, country: e.target.value })}
                    placeholder="Country"
                    defaultValue="Ghana"
                    required
                  />
                  <input
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    placeholder="City"
                    required
                  />
                </div>
                <input
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="Address"
                  required
                />
                <input
                  value={form.zipCode}
                  onChange={(e) => setForm({ ...form, zipCode: e.target.value })}
                  placeholder="Zip Code"
                  required
                />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="Business Email"
                  required
                />
                <input
                  value={form.businessName}
                  onChange={(e) => setForm({ ...form, businessName: e.target.value })}
                  placeholder="Business Name"
                  required
                />
                <input
                  value={form.contactNumber}
                  onChange={(e) => setForm({ ...form, contactNumber: e.target.value })}
                  placeholder="Contact Number"
                  required
                />
              </div>
            )}

            {/* Email and Password - For all roles */}
            {!showBusinessDetails && (
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="Email"
                required
              />
            )}
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Password"
              required
            />
            <input
              type="password"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              placeholder="Confirm Password"
              required
            />

            {/* Terms Checkbox */}
            <label className="terms-checkbox">
              <input
                type="checkbox"
                checked={form.agreeToTerms}
                onChange={(e) => setForm({ ...form, agreeToTerms: e.target.checked })}
                required
              />
              <span>I agree to all <a href="/terms" target="_blank">Terms & Conditions</a></span>
            </label>

            {/* Submit Button */}
            <button className="signup-btn" type="submit">
              Create Account
            </button>

            {/* Business Partners Button - Only for Organizer/Vendor */}
            {showBusinessDetails && (
              <button className="add-partners-btn" type="button">
                Add More Business Partners
              </button>
            )}
          </form>
        )}

        {/* Bottom Text */}
        <div className="signup-footer">
          Already have an account? <span className="link" onClick={() => navigate('/login')}>Login</span>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { login } from '../services/api';
import SEO from '../components/SEO';

export default function Login({ onLogin }) {
  const [form, setForm] = useState({ identifier: '', password: '', loginType: 'email', selectedRole: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const roles = [
    { id: 'attendee', name: 'Attendee' },
    { id: 'organizer', name: 'Organizer' },
    { id: 'vendor', name: 'Vendor' },
    { id: 'agent', name: 'Sales Agent' },
    { id: 'gate', name: 'Gate Staff' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    const loginData = form.loginType === 'email'
      ? { email: form.identifier, password: form.password }
      : { phone: form.identifier, password: form.password };
    const data = await login(loginData);
    if (data?.token) {
      const normalizedUser = data.user?.role ? data.user : { ...data.user, role: data.user?.email?.toLowerCase() === 'ceoofreektickets@gmail.com' ? 'admin' : data.user?.role };
      localStorage.setItem('reek_token', data.token);
      localStorage.setItem('reek_user', JSON.stringify(normalizedUser));
      onLogin(normalizedUser);
      const role = normalizedUser.role;
      if (role === 'admin') navigate('/dashboard/admin');
      else if (role === 'organizer') navigate('/dashboard/organizer');
      else if (role === 'vendor') navigate('/dashboard/vendor');
      else if (role === 'agent') navigate('/dashboard/agent');
      else if (role === 'gate' || role === 'entry') navigate('/dashboard/gate');
      else navigate('/dashboard/attendee');
      return;
    }
    setError(data.message || 'Login failed');
  };

  return (
    <div className="login-page">
      <SEO
        title="Login – ReekTickets"
        description="Log in to your ReekTickets account to access ticket purchases, event management, and dashboards."
        ogTitle="Login to ReekTickets"
        ogDescription="Securely access your ReekTickets account and manage your events, bookings, or sales."
      />
      <div className="login-container">
        {/* Back Button */}
        <button className="back-btn" type="button" onClick={() => navigate('/signup')}>
          ← Back
        </button>

        {/* Logo */}
        <div className="login-logo">
          <img src="/logo-section.jpg" alt="ReekTickets" />
        </div>

        {/* Header */}
        <div className="login-header">
          <h2>Welcome Back</h2>
          <p>Login to your account</p>
        </div>

        {/* Role Selector (Optional) */}
        <div className="role-selector">
          <label>Login as:</label>
          <div className="role-pills">
            {roles.map((role) => (
              <button
                key={role.id}
                type="button"
                className={`role-pill ${form.selectedRole === role.id ? 'active' : ''}`}
                onClick={() => setForm({ ...form, selectedRole: role.id })}
              >
                {role.name}
              </button>
            ))}
          </div>
        </div>

        {/* Login Form */}
        {error && <div className="error">{error}</div>}
        <form onSubmit={handleSubmit} className="login-form">
          {/* Login Type Selector */}
          <div className="login-type-selector">
            <button
              type="button"
              className={form.loginType === 'email' ? 'active' : ''}
              onClick={() => setForm({ ...form, loginType: 'email', identifier: '' })}
            >
              Email
            </button>
            <button
              type="button"
              className={form.loginType === 'phone' ? 'active' : ''}
              onClick={() => setForm({ ...form, loginType: 'phone', identifier: '' })}
            >
              Phone
            </button>
          </div>

          {/* Identifier Input */}
          {form.loginType === 'email' ? (
            <input
              type="email"
              placeholder="Email"
              value={form.identifier}
              onChange={(e) => setForm({ ...form, identifier: e.target.value })}
              required
            />
          ) : (
            <div className="phone-row">
              <div className="phone-code">+233</div>
              <input
                placeholder="Phone number (without 0 or +233)"
                value={form.identifier}
                onChange={(e) => setForm({ ...form, identifier: e.target.value.replace(/\D/g, '') })}
                required
              />
            </div>
          )}

          {/* Password Input */}
          <div className="password-field">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          {/* Extra Options */}
          <div className="login-options">
            <label className="remember-me">
              <input type="checkbox" />
              <span>Remember Me</span>
            </label>
            <button type="button" className="forgot-password" onClick={() => navigate('/forgot-password')}>Forgot Password?</button>
          </div>

          {/* Login Button */}
          <button className="login-btn" type="submit">Login</button>
        </form>

        {/* Bottom Section */}
        <div className="login-footer">
          Don't have an account? <span className="link" onClick={() => navigate('/signup')}>Sign Up</span>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, signup } from '../services/api';

export default function AdminPortal() {
  const [isSignup, setIsSignup] = useState(false);
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', password: '' });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem('reek_user');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.role === 'admin') {
        navigate('/dashboard/admin');
      }
    }
  }, [navigate]);

  const handleAuth = async (e) => {
    e.preventDefault();
    if (isSignup) {
      const data = await signup({ ...form, role: 'admin' });
      if (data.token) {
        const normalizedUser = data.user?.role ? data.user : { ...data.user, role: data.user?.email?.toLowerCase() === 'ceoofreektickets@gmail.com' ? 'admin' : data.user?.role };
        localStorage.setItem('reek_token', data.token);
        localStorage.setItem('reek_user', JSON.stringify(normalizedUser));
        navigate('/dashboard/admin');
        return;
      }
      setMessage(data.message || 'Signup failed');
      return;
    }

    const data = await login({ email: form.email, password: form.password });
    if (data.token) {
      const normalizedUser = data.user?.role ? data.user : { ...data.user, role: data.user?.email?.toLowerCase() === 'ceoofreektickets@gmail.com' ? 'admin' : data.user?.role };
      localStorage.setItem('reek_token', data.token);
      localStorage.setItem('reek_user', JSON.stringify(normalizedUser));
      navigate('/dashboard/admin');
      return;
    }
    setMessage(data.message || 'Login failed');
  };

  return (
    <div className="signup-page admin-auth-page">
      <div className="signup-container" style={{ maxWidth: '500px' }}>
        <button className="back-btn" type="button" onClick={() => navigate('/')}>← Home</button>
        <div className="signup-logo">
          <img src="/logo-section.jpg" alt="ReekTickets" />
        </div>

        <div className="login-header">
          <h2>{isSignup ? 'Admin Register' : 'Admin Login'}</h2>
          <p>{isSignup ? 'Create an admin account for the Super Admin portal.' : 'Sign in as admin to access ReekTickets controls.'}</p>
        </div>

        {message && <div className="error">{message}</div>}
        <form onSubmit={handleAuth} className="signup-form">
        {isSignup && (
          <input
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            placeholder="Full name"
            required
          />
        )}
        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
        {isSignup && (
          <input
            type="text"
            placeholder="Phone number"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            required
          />
        )}
        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />
        <button className="btn" type="submit">{isSignup ? 'Create Admin' : 'Admin Login'}</button>
      </form>
      <small>
        {isSignup ? 'Already admin? ' : 'Need admin account? '}
        <span className="link" onClick={() => { setIsSignup(!isSignup); setMessage(''); }}>
          {isSignup ? 'Sign in' : 'Sign up'}
        </span>
      </small>
      </div>
    </div>
  );
}

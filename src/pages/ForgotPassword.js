import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { forgotPassword, verifyResetCode, resetPassword } from '../services/api';
import SEO from '../components/SEO';

export default function ForgotPassword() {
  const [step, setStep] = useState(1); // 1: request, 2: verify code, 3: reset password
  const [phone, setPhone] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleStep1 = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    const data = await forgotPassword({ phone });
    setLoading(false);

    if (data?.message) {
      if (data.resetCode) {
        setMessage(`Code: ${data.resetCode} (for testing)`);
      }
      setMessage(data.message);
      setStep(2);
    } else {
      setError(data?.message || 'Failed to send reset code');
    }
  };

  const handleStep2 = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    const data = await verifyResetCode({ phone, resetCode });
    setLoading(false);

    if (data?.verified) {
      setMessage('Code verified! Now enter your new password');
      setStep(3);
    } else {
      setError(data?.message || 'Invalid or expired reset code');
    }
  };

  const handleStep3 = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    const data = await resetPassword({ phone, resetCode, newPassword });
    setLoading(false);

    if (data?.message && !data.message.includes('error')) {
      setMessage('Password reset successfully! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } else {
      setError(data?.message || 'Failed to reset password');
    }
  };

  return (
    <div className="forgot-password-page">
      <SEO
        title="Forgot Password – ReekTickets"
        description="Reset your ReekTickets password securely."
        ogTitle="Forgot Password"
        ogDescription="Reset your ReekTickets account password"
      />
      <div className="forgot-password-container">
        <button className="back-btn" type="button" onClick={() => navigate('/login')}>
          ← Back to Login
        </button>

        <div className="forgot-password-header">
          <h2>Reset Your Password</h2>
          <p>We'll help you get back into your account</p>
        </div>

        {message && <div className="success">{message}</div>}
        {error && <div className="error">{error}</div>}

        {step === 1 && (
          <form onSubmit={handleStep1} className="forgot-password-form">
            <label>Phone Number</label>
            <input
              type="tel"
              placeholder="Enter your phone number (e.g. 027xxxxxxx)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              disabled={loading}
            />
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Sending...' : 'Send Reset Code'}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleStep2} className="forgot-password-form">
            <label>Reset Code</label>
            <p className="help-text">Enter the 6-digit code sent to your phone</p>
            <input
              type="text"
              placeholder="000000"
              value={resetCode}
              onChange={(e) => setResetCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              maxLength="6"
              required
              disabled={loading}
            />
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Verifying...' : 'Verify Code'}
            </button>
            <button
              type="button"
              className="secondary-btn"
              onClick={() => setStep(1)}
              disabled={loading}
            >
              Go Back
            </button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleStep3} className="forgot-password-form">
            <label>New Password</label>
            <input
              type="password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              disabled={loading}
            />
            <label>Confirm Password</label>
            <input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={loading}
            />
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

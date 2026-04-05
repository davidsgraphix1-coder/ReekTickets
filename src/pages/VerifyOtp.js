import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { verifyOtp, resendOtp } from '../services/api';
import SEO from '../components/SEO';

export default function VerifyOtp({ onLogin }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef([]);
  const [verificationCode] = useState(location.state?.verificationCode || '');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [otpSent, setOtpSent] = useState(true); // OTP was sent during signup
  const phone = location.state?.phone || '';

  const handleDigitChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const newDigits = [...digits];
    newDigits[index] = value;
    setDigits(newDigits);
    
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Timer countdown
  useEffect(() => {
    if (!otpSent || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [otpSent, timeLeft]);

  // Expire OTP when time runs out
  useEffect(() => {
    if (timeLeft === 0 && otpSent) {
      setOtpSent(false);
      setError('OTP expired. Please request a new one.');
    }
  }, [timeLeft, otpSent]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const otpCode = digits.join('');
    if (otpCode.length !== 6) {
      setError('Please enter all 6 digits.');
      return;
    }

    setLoading(true);
    try {
      const data = await verifyOtp({ phone: phone.trim(), otpCode });
      if (data?.token) {
        localStorage.setItem('reek_token', data.token);
        localStorage.setItem('reek_user', JSON.stringify(data.user));
        onLogin(data.user);
        const role = data.user.role;
        if (role === 'admin') navigate('/dashboard/admin');
        else if (role === 'organizer') navigate('/dashboard/organizer');
        else if (role === 'vendor') navigate('/dashboard/vendor');
        else if (role === 'agent') navigate('/dashboard/agent');
        else navigate('/dashboard/attendee');
        return;
      }
      setError(data.message || 'Verification failed.');
    } catch (err) {
      setError('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async (e) => {
    e.preventDefault();
    if (!phone) {
      setError('Phone number not available.');
      return;
    }

    setResendLoading(true);
    setResendMessage('');
    setError('');

    try {
      const data = await resendOtp({ phone: phone.trim() });
      if (data?.message) {
        setResendMessage(data.message);
        setTimeLeft(300);
        setOtpSent(true);
        setDigits(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
        // Clear success message after 3 seconds
        setTimeout(() => setResendMessage(''), 3000);
      } else {
        setError('Failed to resend OTP. Please try again.');
      }
    } catch (err) {
      setError('Could not resend OTP. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="verify-otp-page">
      <SEO
        title="Verify Phone – ReekTickets"
        description="Enter the phone verification code to complete your registration."
        ogTitle="ReekTickets Phone Verification"
        ogDescription="Complete your signup by verifying your phone number on ReekTickets."
      />
      <div className="verify-otp-container">
        <button className="verify-back-btn" type="button" onClick={() => navigate('/signup')}>
          ← Back
        </button>

        <div className="verify-logo">
          <img src="/logo-section.jpg" alt="ReekTickets" />
        </div>

        <div className="verify-card">
          <h2 className="verify-title">Verify Your Phone</h2>
          <p className="verify-subtitle">We've sent a 6-digit code to {phone}</p>

        <form onSubmit={handleSubmit} className="verify-form">
            <div className="otp-inputs">
              {digits.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleDigitChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="otp-input"
                  placeholder="0"
                />
              ))}
            </div>

          {/* Test code display removed for production */}
          
          <div className="verify-timer">
            <span className={`timer-text ${timeLeft < 60 ? 'timer-warning' : ''}`}>
              Time remaining: <strong>{formatTime(timeLeft)}</strong>
            </span>
          </div>
          
          {error && <div className="verify-error">{error}</div>}

          <button className="verify-btn" type="submit" disabled={loading || digits.join('').length !== 6 || !otpSent}>
            {loading ? 'Verifying...' : 'Verify Code'}
          </button>

          <div className="verify-footer">
            <p>Didn't receive a code?</p>
            <button
              type="button"
              className="resend-btn"
              onClick={handleResendOtp}
              disabled={resendLoading}
            >
              {resendLoading ? 'Sending...' : 'Resend OTP'}
            </button>
          </div>

          {resendMessage && (
            <div className="verify-success" style={{ 
              marginTop: '1rem', 
              padding: '0.75rem', 
              background: '#dcfce7', 
              border: '1px solid #22c55e', 
              borderRadius: '8px', 
              color: '#166534',
              fontSize: '0.95rem',
              textAlign: 'center'
            }}>
              ✓ {resendMessage}
            </div>
          )}
          </form>
        </div>
      </div>
    </div>
  );
}

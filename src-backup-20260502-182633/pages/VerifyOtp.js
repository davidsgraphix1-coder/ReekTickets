import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { verifyOtp, resendOtp } from '../services/api';
import SEO from '../components/SEO';

function normalizePhone(phone) {
  if (!phone) return '';
  let clean = phone.toString().trim();
  clean = clean.replace(/\s+/g, '').replace(/^\+/, '');
  if (clean.startsWith('0')) {
    clean = `233${clean.slice(1)}`;
  }
  if (!clean.startsWith('233')) {
    clean = `233${clean}`;
  }
  return clean;
}

export default function VerifyOtp({ onLogin }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const [timeLeft, setTimeLeft] = useState(300);
  const [otpSent, setOtpSent] = useState(true);
  const phone = location.state?.phone || location.state?.email || '';
  const phoneDisplay = phone.startsWith('+') ? phone : phone ? `+${phone}` : '';
  const normalizedPhone = normalizePhone(phone);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

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

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  useEffect(() => {
    if (!otpSent || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [otpSent, timeLeft]);

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
      const data = await verifyOtp({ phone: normalizedPhone, otpCode });
      if (data?.token && data?.user) {
        const normalizedUser = data.user.role ? data.user : {
          ...data.user,
          role: data.user.email?.toLowerCase() === 'ceoofreektickets@gmail.com' ? 'admin' : data.user.role || 'attendee'
        };
        localStorage.setItem('reek_token', data.token);
        localStorage.setItem('reek_user', JSON.stringify(normalizedUser));
        onLogin(normalizedUser);
        const role = normalizedUser.role;
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
    if (!normalizedPhone) {
      setError('Phone number not available.');
      return;
    }

    setResendLoading(true);
    setResendMessage('');
    setError('');

    try {
      const data = await resendOtp({ phone: normalizedPhone });
      if (data?.message) {
        setResendMessage(data.message);
        setTimeLeft(300);
        setOtpSent(true);
        setDigits(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
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
        <div className="verify-card">
          <div className="verify-logo">
            <img src="/logo-section.jpg" alt="ReekTickets logo" />
          </div>

          <h2 className="verify-title">Verify Phone</h2>
          <p className="verify-subtitle">Enter the code sent to {phoneDisplay || 'your phone number'}</p>

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

            <div className="verify-timer">
              <span className={`timer-text ${timeLeft < 60 ? 'timer-warning' : ''}`}>
                Time remaining: <strong>{formatTime(timeLeft)}</strong>
              </span>
            </div>

            {error && <div className="verify-error">{error}</div>}

            <button className="verify-btn" type="submit" disabled={loading || digits.join('').length !== 6 || !otpSent}>
              {loading ? 'Verifying...' : 'Verify & Create Account'}
            </button>

            <div className="verify-actions-row">
              <button type="button" className="verify-link" onClick={() => navigate('/signup')}>
                ← Back
              </button>
              <button type="button" className="resend-link" onClick={handleResendOtp} disabled={resendLoading}>
                {resendLoading ? 'Resend Code...' : 'Resend Code'}
              </button>
            </div>

            <div className="verify-login-row">
              <span>Already have an account? </span>
              <button type="button" className="login-link" onClick={() => navigate('/login')}>
                Login
              </button>
            </div>

            {resendMessage && (
              <div className="verify-success">
                ✓ {resendMessage}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

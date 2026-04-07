import React, { useState } from 'react';
import { sendNaloSms } from '../services/api';

const SmsTest = () => {
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('Test SMS from ReekTickets! ✅');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleTestSms = async () => {
    if (!phone || !message) {
      alert('Please enter both phone number and message');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await sendNaloSms({
        to: phone,
        message: message
      });

      setResult({
        success: response.success,
        message: response.message,
        timestamp: new Date().toLocaleString()
      });
    } catch (error) {
      setResult({
        success: false,
        message: `Error: ${error.message}`,
        timestamp: new Date().toLocaleString()
      });
    } finally {
      setLoading(false);
    }
  };

  const formatPhone = (input) => {
    let clean = input.replace(/\D/g, '');
    if (clean.startsWith('0')) {
      clean = '233' + clean.substring(1);
    } else if (!clean.startsWith('233')) {
      clean = '233' + clean;
    }
    return clean;
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value;
    setPhone(formatPhone(value));
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h2>🧪 SMS Testing Tool</h2>
      <p>Test the SMS functionality of ReekTickets</p>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          Phone Number (Ghana format):
        </label>
        <input
          type="text"
          value={phone}
          onChange={handlePhoneChange}
          placeholder="0501234567 or 233501234567"
          style={{
            width: '100%',
            padding: '10px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            fontSize: '16px'
          }}
        />
        <small style={{ color: '#666', display: 'block', marginTop: '5px' }}>
          Will be formatted as: 233xxxxxxxxx
        </small>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          Message:
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
          style={{
            width: '100%',
            padding: '10px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            fontSize: '16px',
            resize: 'vertical'
          }}
        />
      </div>

      <button
        onClick={handleTestSms}
        disabled={loading}
        style={{
          backgroundColor: loading ? '#ccc' : '#007bff',
          color: 'white',
          padding: '12px 24px',
          border: 'none',
          borderRadius: '4px',
          cursor: loading ? 'not-allowed' : 'pointer',
          fontSize: '16px',
          fontWeight: 'bold'
        }}
      >
        {loading ? '📤 Sending SMS...' : '📱 Send Test SMS'}
      </button>

      {result && (
        <div style={{
          marginTop: '20px',
          padding: '15px',
          borderRadius: '4px',
          backgroundColor: result.success ? '#d4edda' : '#f8d7da',
          border: `1px solid ${result.success ? '#c3e6cb' : '#f5c6cb'}`,
          color: result.success ? '#155724' : '#721c24'
        }}>
          <h3 style={{ margin: '0 0 10px 0' }}>
            {result.success ? '✅ SMS Sent Successfully!' : '❌ SMS Failed'}
          </h3>
          <p style={{ margin: '0 0 5px 0', fontWeight: 'bold' }}>{result.message}</p>
          <small style={{ color: '#666' }}>Sent at: {result.timestamp}</small>
        </div>
      )}

      <div style={{ marginTop: '30px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
        <h4>📋 Test Examples:</h4>
        <ul style={{ margin: 0, paddingLeft: '20px' }}>
          <li><strong>Phone:</strong> 0501234567 → 233501234567</li>
          <li><strong>Phone:</strong> 0273476701 → 233273476701</li>
          <li><strong>Message:</strong> "Hello from ReekTickets! Your SMS system is working perfectly."</li>
        </ul>
      </div>
    </div>
  );
};

export default SmsTest;
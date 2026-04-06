# OTP Component Documentation

## Overview
The `OTPComponent` is a React component that handles One-Time Password (OTP) verification for phone numbers. It integrates with your SMS service to send OTP codes via SMS and verify them.

## Features
- Generates random 6-digit OTP codes
- Sends OTP via SMS using your SMS backend
- Verifies user-entered OTP
- 5-minute countdown timer (expires OTP after time runs out)
- Resend OTP functionality
- Success/error messaging
- Loading states

## Installation
The component is ready to use in `/src/components/OTPComponent.jsx`

## Usage

### Basic Usage
```jsx
import OTPComponent from './components/OTPComponent';

function App() {
  const [phone, setPhone] = useState('0273476701');

  const handleVerifySuccess = () => {
    console.log('Phone verified successfully!');
    // Proceed with booking or signup
  };

  const handleVerifyFail = () => {
    console.log('OTP verification failed');
  };

  return (
    <OTPComponent 
      phone={phone}
      onVerifySuccess={handleVerifySuccess}
      onVerifyFail={handleVerifyFail}
    />
  );
}
```

### Props
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `phone` | string | Yes | Phone number to verify in format like '0273476701' |
| `onVerifySuccess` | function | No | Callback when OTP is verified successfully |
| `onVerifyFail` | function | No | Callback when OTP verification fails |

## Component Behavior

### States
1. **Initial State**: Shows "Send OTP" button
   - User enters/confirms phone number
   - Click "Send OTP" to start process

2. **OTP Sent State**: Shows OTP input field
   - User receives OTP via SMS
   - Countdown timer shows remaining time (5 minutes)
   - Can enter OTP to verify
   - Can click "Resend OTP" for new code

3. **Verified State**: Shows success message
   - Green checkmark displayed
   - Phone verified confirmation shown
   - Success callback triggered

## Integration Points

### Where to Use
- **Signup/Registration**: Phone verification during account creation
- **Booking Confirmation**: Verify phone before confirming booking
- **Two-Factor Authentication**: Secondary verification step

### Example in Signup Form
```jsx
import React, { useState } from 'react';
import OTPComponent from './components/OTPComponent';

function SignupForm() {
  const [step, setStep] = useState('phone'); // 'phone' | 'otp' | 'complete'
  const [phone, setPhone] = useState('');
  const [userData, setUserData] = useState({});

  const handlePhoneSubmit = (e) => {
    e.preventDefault();
    if (phone.match(/^\d{10}$/)) {
      setStep('otp');
    }
  };

  const handleOtpSuccess = async () => {
    // Save user data with verified phone
    const response = await fetch('/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...userData, phone, verified: true })
    });
    setStep('complete');
  };

  return (
    <div>
      {step === 'phone' && (
        <form onSubmit={handlePhoneSubmit}>
          <input
            type="tel"
            placeholder="Enter phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <button type="submit">Next</button>
        </form>
      )}

      {step === 'otp' && (
        <OTPComponent 
          phone={phone}
          onVerifySuccess={handleOtpSuccess}
        />
      )}

      {step === 'complete' && (
        <p>✓ Account created successfully!</p>
      )}
    </div>
  );
}

export default SignupForm;
```

## Styling
The component comes with `OTPComponent.css` that provides:
- Responsive card layout
- Color-coded messages (green for success, red for errors)
- Hover effects on buttons
- Mobile-friendly input field

Customize the styles by editing `OTPComponent.css` to match your design system.

## Backend Integration
The component uses your existing SMS service (`smsService.sendSMS`) which:
1. Sends messages via your Flask backend
2. Flask authenticates with Zenoph SDK
3. Messages sent through api.smsonlinegh.com

No additional backend changes needed!

## Tips
- Always validate phone numbers before passing to component
- Store the verified phone in user session/database
- Handle the success callback to proceed with your business logic
- Consider adding rate limiting on your backend if resend is abused
- Test with a real phone number to see the SMS delivery

## Troubleshooting

**OTP not sending?**
- Check that `REACT_APP_SMS_BACKEND_URL` is set in `.env.local`
- Verify Railway backend is running: `https://reektickets-production.up.railway.app`
- Check Railway logs for errors

**Component not showing?**
- Make sure you've imported CSS: `import './components/OTPComponent.css'`
- Check that OTPComponent.jsx exists in `/src/components/`

**OTP expired too quickly?**
- Default is 5 minutes (300 seconds). Edit `const [timeLeft, setTimeLeft] = useState(300)` in OTPComponent.jsx to change

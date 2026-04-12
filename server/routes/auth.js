const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendEmail } = require('../utils/email');
const { connectDB } = require('../config/db');
const { sendOTP } = require('../services/smsService');
const auth = require('../middleware/auth');
const { getUserByEmail, getUserByPhone, updateUser, getUserById, createUser } = require('../models/User');

const router = express.Router();

const useSupabase = process.env.DB_PROVIDER === 'supabase';

// Normalize phone number to standard format (233 + 9 digits)
function normalizePhone(phone) {
  if (!phone) return '';
  let clean = String(phone).trim();
  clean = clean.replace(/\s+/g, '').replace(/^\+/, '');
  if (clean.startsWith('0')) {
    clean = `233${clean.slice(1)}`;
  }
  if (!clean.startsWith('233')) {
    clean = `233${clean}`;
  }
  return clean;
}

function sendOtpSms(phone, otpCode) {
  return new Promise(async (resolve, reject) => {
    try {
      const result = await sendOTP(phone, otpCode);
      
      // Log OTP in non-production for testing
      if (process.env.NODE_ENV !== 'production') {
        console.log(`\n[OTP-DEBUG] Generated OTP for ${phone}: ${otpCode}\n`);
      }
      
      if (result.success) {
        console.log('OTP SMS sent successfully to', phone);
        resolve(result);
      } else {
        console.error('OTP SMS failed:', result.message);
        console.error('OTP SMS error details:', result);
        
        // In non-production, still resolve so signup continues (for testing)
        if (process.env.NODE_ENV !== 'production') {
          console.warn('[OTP-DEBUG] SMS failed but continuing in dev mode');
          resolve({ 
            success: true, 
            message: 'OTP code logged to console (SMS failed in dev)',
            dev_otp: otpCode,
            dev_note: 'Check server logs for OTP code'
          });
        } else {
          reject(new Error(result.message));
        }
      }
    } catch (error) {
      console.error('SMS sending error:', error);
      reject(error);
    }
  });
}

router.post('/signup', async (req, res) => {
  console.log('--- /signup route hit ---');
  console.log('Request body:', req.body);
  try {
    const {
      fullName, email, phone, password, role, businessName
    } = req.body;

    if (!fullName || !email || !phone || !password) {
      console.log('Missing required fields:', { fullName, email, phone, password });
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const existing = await getUserByEmail(email);
    console.log('Existing user by email:', existing ? 'YES' : 'NO');
    
    // Generate OTP
    const otpCode = String(Math.floor(100000 + Math.random() * 900000));
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    const hashed = await bcrypt.hash(password, 10);
    
    // Normalize phone
    const normalizedPhone = normalizePhone(phone);
    console.log('[SIGNUP] Raw phone from request:', phone);
    console.log('[SIGNUP] Normalized phone for storage:', normalizedPhone);

    // Only allow valid roles
    const allowedRoles = ['attendee', 'organizer', 'vendor', 'admin', 'gate'];
    const safeRole = allowedRoles.includes(role) ? role : 'attendee';
    
    // Ensure OTP code is stored as a clean string (6 digits)
    const cleanOtpCode = String(otpCode).trim();
    console.log('[SIGNUP] Generated OTP code:', cleanOtpCode, 'length:', cleanOtpCode.length, 'type:', typeof cleanOtpCode);
    
    const userData = {
      full_name: fullName,
      email: email.toLowerCase(),
      phone: normalizedPhone,
      password_hash: hashed,
      role: safeRole,
      business_name: businessName || null,
      otp_code: cleanOtpCode,
      otp_expiry: otpExpiry.getTime(),
      is_verified: false,
      status: 'pending',
      created_at: new Date().toISOString(),
    };

    let user;
    if (existing) {
      if (existing.is_verified) {
        console.log('Email already registered:', email);
        return res.status(409).json({ message: 'Email already registered' });
      }
      const updates = {
        full_name: fullName,
        phone: normalizedPhone,
        password_hash: hashed,
        role: safeRole,
        business_name: businessName || null,
        otp_code: cleanOtpCode,
        otp_expiry: otpExpiry.getTime(),
        is_verified: false,
        status: 'pending',
      };
      console.log('[SIGNUP] Updating existing user with OTP:', cleanOtpCode);
      user = await updateUser(existing.id || existing._id, updates);
      console.log('[SIGNUP] Updated user. Stored OTP:', user.otp_code, 'Stored phone:', user.phone);
    } else {
      console.log('[SIGNUP] Creating new user with OTP:', cleanOtpCode);
      user = await createUser(userData);
      console.log('[SIGNUP] Created user. Stored OTP:', user.otp_code, 'Stored phone:', user.phone);
    }
    
    const responseData = {
      message: 'Signup complete. User created as pending verification.',
      user: { id: user.id || user._id, fullName: user.full_name, email: user.email, role: user.role, phone: user.phone }
    };
    console.log('Signup response:', responseData);
    
    // Send OTP SMS
    console.log('[SIGNUP] Attempting to send OTP SMS to:', normalizedPhone, 'with code:', otpCode);
    try {
      const smsResult = await sendOtpSms(normalizedPhone, otpCode);
      console.log('[SIGNUP] SMS send result:', smsResult);
      
      if (!smsResult.success) {
        console.warn('[SIGNUP] SMS failed but user was created. User needs to resend OTP. Error:', smsResult.message);
        responseData.message = 'User created but OTP delivery failed. Please use Resend Code button.';
        responseData.smsError = smsResult.message;
        // In development, show the code for testing
        if (process.env.NODE_ENV !== 'production') {
          responseData.otpCode = otpCode;
          responseData.testMode = true;
        }
      } else {
        responseData.message = 'Signup successful! Check your SMS for the verification code.';
      }
    } catch (smsError) {
      console.error('[SIGNUP] SMS sending exception:', smsError);
      responseData.message = 'User created but OTP delivery failed. Please use Resend Code button.';
      responseData.smsError = smsError.message;
      // In development, show the code for testing
      if (process.env.NODE_ENV !== 'production') {
        responseData.otpCode = otpCode;
        responseData.testMode = true;
      }
    }
    
    return res.json(responseData);
  } catch (error) {
    console.error('Signup error:', error);
    if (error && error.response) {
      console.error('Error response data:', error.response.data);
    }
    return res.status(500).json({ message: 'Server error', error: error.message, stack: error.stack });
  }
});


router.post('/login', async (req, res) => {
  try {
    const { email, phone, password } = req.body;
    if ((!email && !phone) || !password) return res.status(400).json({ message: 'Email or phone and password are required' });
    
    let user;
    if (useSupabase) {
      user = await getUserByEmail(email);
      if (!user && phone) {
        // try phone fallback - use normalized phone
        user = await getUserByPhone(phone);
      }
    } else {
      const query = email ? { email: email.toLowerCase() } : { phone: normalizePhone(phone) };
      user = await User.findOne(query);
    }

    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    if (user.is_verified === false) return res.status(403).json({ message: 'Account not verified. Please verify your account.' });

    // Check if account is locked
    if (user.lock_until && user.lock_until > Date.now()) {
      return res.status(423).json({ message: 'Account temporarily locked due to too many failed attempts' });
    }

    if (user.status === 'banned') return res.status(403).json({ message: 'Account banned' });
    if (user.status === 'suspended') return res.status(403).json({ message: 'Account suspended' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      // Increment failed attempts
      const failedAttempts = (user.failed_attempts || 0) + 1;
      const lockUntil = failedAttempts >= 5 ? Date.now() + 2 * 60 * 60 * 1000 : user.lock_until;

      if (useSupabase) {
        await updateUser(user.id, { failedAttempts, lastFailedAttempt: new Date(), lockUntil });
      } else {
        user.failedAttempts = failedAttempts;
        user.lastFailedAttempt = new Date();
        user.lockUntil = lockUntil;
        await user.save();
      }

      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Reset failed attempts on successful login
    if (useSupabase) {
      user = await updateUser(user.id, { failedAttempts: 0, lastFailedAttempt: null, lockUntil: null });
    } else {
      user.failedAttempts = 0;
      user.lastFailedAttempt = undefined;
      user.lockUntil = undefined;
      await user.save();
    }

    const token = jwt.sign({ id: user.id || user._id, role: user.role, email: user.email }, process.env.JWT_SECRET || 'supersecretjwtkey', { expiresIn: '7d' });
    return res.json({ token, user: { id: user.id || user._id, fullName: user.full_name || user.fullName, email: user.email, role: user.role, phone: user.phone } });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
});

router.post('/verify-otp', async (req, res) => {
  try {
    const { email, phone, otpCode } = req.body;
    
    if (!otpCode || (!email && !phone)) {
      return res.status(400).json({ message: 'Email or phone and verification code are required' });
    }

    let user = null;
    if (email) {
      user = await getUserByEmail(email);
    }
    if (!user && phone) {
      user = await getUserByPhone(phone);
    }
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (user.is_verified) {
      return res.status(400).json({ message: 'User already verified' });
    }
    
    // Mark user as verified - accept any OTP entry
    const updatePayload = { is_verified: true, otp_code: null, otp_expiry: null };
    await updateUser(user.id || user._id, updatePayload);
    
    console.log('[VERIFY-OTP] ✅ User verified - phone:', phone || email);

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id || user._id, role: user.role, email: user.email }, 
      process.env.JWT_SECRET || 'supersecretjwtkey', 
      { expiresIn: '7d' }
    );
    
    return res.json({ 
      token, 
      user: { 
        id: user.id || user._id, 
        fullName: user.full_name, 
        email: user.email, 
        role: user.role, 
        phone: user.phone 
      } 
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Resend OTP endpoint
router.post('/resend-otp', async (req, res) => {
  try {
    const { email, phone } = req.body;

    if (!email && !phone) {
      return res.status(400).json({ message: 'Email or phone is required' });
    }

    let user = null;
    if (email) {
      user = await getUserByEmail(email);
    }
    if (!user && phone) {
      user = await getUserByPhone(phone);
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.is_verified) {
      return res.status(400).json({ message: 'User already verified' });
    }

    // Generate new OTP
    const newOtpCode = String(Math.floor(100000 + Math.random() * 900000)).trim();
    const newOtpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    // Update user with new OTP
    const updatePayload = { 
      otp_code: newOtpCode, 
      otp_expiry: newOtpExpiry.toISOString() 
    };
    await updateUser(user.id || user._id, updatePayload);

    // Send OTP via SMS
    try {
      await sendOtpSms(user.phone, newOtpCode);
    } catch (smsError) {
      console.error('SMS sending failed:', smsError);
      return res.status(500).json({ 
        message: 'Failed to send OTP. Please try again.',
        error: smsError.message 
      });
    }

    return res.json({ 
      message: 'OTP resent successfully. Check your SMS.',
      phone: user.phone
    });
  } catch (error) {
    console.error('Resend OTP error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/me', auth, async (req, res) => {
  try {
    const user = await getUserById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.json(user);
  } catch (error) {
    console.error('Fetch current user error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

router.patch('/me/avatar', auth, async (req, res) => {
  try {
    const { avatarUrl } = req.body;
    if (!avatarUrl) return res.status(400).json({ message: 'Avatar URL is required' });
    const user = await getUserById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const updated = await updateUser(user.id, { avatarUrl });
    return res.json(updated);
  } catch (error) {
    console.error('Update avatar error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

router.post('/forgot-password', async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ message: 'Phone number is required' });

    // Normalize phone number (remove spaces, ensure 233 prefix)
    let normalizedPhone = phone.replace(/\s+/g, '').replace(/^\+/, '');
    if (normalizedPhone.startsWith('0')) {
      normalizedPhone = '233' + normalizedPhone.substring(1);
    } else if (!normalizedPhone.startsWith('233')) {
      normalizedPhone = '233' + normalizedPhone;
    }

    const user = await getUserByPhone(normalizedPhone);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const resetCode = String(Math.floor(100000 + Math.random() * 900000));
    const resetExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await updateUser(user.id, {
      otp_code: resetCode,
      otp_expiry: resetExpiry
    });

    // Send SMS with reset code
    const smsResult = await sendOtpSms(normalizedPhone, resetCode);
    if (!smsResult.success) {
      console.error('Failed to send reset SMS:', smsResult);
      return res.status(500).json({ message: 'Failed to send SMS. Please try again.' });
    }

    const response = { message: 'Password reset code sent to your phone' };
    if (process.env.NODE_ENV !== 'production') {
      response.resetCode = resetCode; // For testing in development
    }

    return res.json(response);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
});

router.post('/verify-reset-code', async (req, res) => {
  try {
    const { phone, resetCode } = req.body;
    if (!phone || !resetCode) return res.status(400).json({ message: 'Phone number and reset code are required' });

    // Normalize phone number
    let normalizedPhone = phone.replace(/\s+/g, '').replace(/^\+/, '');
    if (normalizedPhone.startsWith('0')) {
      normalizedPhone = '233' + normalizedPhone.substring(1);
    } else if (!normalizedPhone.startsWith('233')) {
      normalizedPhone = '233' + normalizedPhone;
    }

    const user = await getUserByPhone(normalizedPhone);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.otp_code !== resetCode) return res.status(400).json({ message: 'Invalid reset code' });
    if (!user.otp_expiry || new Date(user.otp_expiry) < new Date()) return res.status(400).json({ message: 'Reset code has expired' });

    return res.json({ message: 'Reset code verified', verified: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
});

router.post('/reset-password', async (req, res) => {
  try {
    const { phone, resetCode, newPassword } = req.body;
    if (!phone || !resetCode || !newPassword) return res.status(400).json({ message: 'Phone number, reset code, and new password are required' });

    // Normalize phone number
    let normalizedPhone = phone.replace(/\s+/g, '').replace(/^\+/, '');
    if (normalizedPhone.startsWith('0')) {
      normalizedPhone = '233' + normalizedPhone.substring(1);
    } else if (!normalizedPhone.startsWith('233')) {
      normalizedPhone = '233' + normalizedPhone;
    }

    const user = await getUserByPhone(normalizedPhone);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.otp_code !== resetCode) return res.status(400).json({ message: 'Invalid reset code' });
    if (!user.otp_expiry || new Date(user.otp_expiry) < new Date()) return res.status(400).json({ message: 'Reset code has expired' });

    const hashed = await bcrypt.hash(newPassword, 10);
    await updateUser(user.id, {
      password: hashed,
      otp_code: null,
      otp_expiry: null
    });

    return res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Test SMS endpoint (for debugging)
router.post('/test-sms', async (req, res) => {
  try {
    const { phone } = req.body;
    
    if (!phone) {
      return res.status(400).json({ message: 'Phone number is required' });
    }

    console.log('[TEST-SMS] Testing SMS to:', phone);
    
    const result = await sendOtpSms(phone, '123456');
    
    return res.json({ 
      message: 'Test SMS sending result',
      phone,
      success: result?.success || false,
      result 
    });
  } catch (error) {
    console.error('[TEST-SMS] Error:', error);
    return res.status(500).json({ 
      message: 'Test SMS failed', 
      error: error.message 
    });
  }
});

module.exports = router;

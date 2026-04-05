const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendEmail } = require('../utils/email');
const { connectDB } = require('../config/db');
const { sendOTP } = require('../services/smsService');
const { getUserByEmail, updateUser, getUserById } = require('../models/User');

const router = express.Router();

const useSupabase = process.env.DB_PROVIDER === 'supabase';

const createUser = async (data) => {
  if (useSupabase) {
    const supabase = await connectDB();
    const { data: created, error } = await supabase.from('users').insert(data).select().single();
    if (error) throw error;
    return created;
  }
  return null;
};

function sendOtpSms(phone, otpCode) {
  return new Promise(async (resolve, reject) => {
    try {
      const result = await sendOTP(phone, otpCode);
      if (result.success) {
        console.log('OTP SMS sent successfully to', phone);
        resolve(result);
      } else {
        console.error('OTP SMS failed:', result.message);
        reject(new Error(result.message));
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
      fullName, firstName, lastName, email, phone, password, role,
      businessName, contactNumber, businessPartners, business_details, termsAccepted
    } = req.body;

    if (!fullName || !email || !phone || !password) {
      console.log('Missing required fields:', { fullName, email, phone, password });
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const existing = await getUserByEmail(email);
    console.log('Existing user:', existing);
    const otpCode = String(Math.floor(100000 + Math.random() * 900000));
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    const hashed = await bcrypt.hash(password, 10);

    // Only allow valid roles
    const allowedRoles = ['attendee', 'organizer', 'vendor', 'admin', 'gate'];
    const safeRole = allowedRoles.includes(role) ? role : 'attendee';
    const userData = {
      fullName,
      firstName,
      lastName,
      email: email.toLowerCase(),
      phone,
      password: hashed,
      role: safeRole,
      businessName,
      contactNumber,
      businessPartners: businessPartners || [],
      business_details: business_details || { country: 'Ghana' },
      termsAccepted: termsAccepted || false,
      otpCode,
      otpExpiry,
      isVerified: false,
      createdAt: new Date(),
    };

    let user;
    if (existing) {
      if (existing.isVerified) {
        console.log('Email already registered:', email);
        return res.status(409).json({ message: 'Email already registered' });
      }
      const updates = {
        fullName,
        firstName,
        lastName,
        phone,
        password: hashed,
        role: safeRole,
        businessName,
        contactNumber,
        businessPartners: businessPartners || [],
        business_details: business_details || { country: 'Ghana' },
        termsAccepted: termsAccepted || false,
        otpCode,
        otpExpiry,
        isVerified: false,
      };
      console.log('Updating existing user:', updates);
      user = await updateUser(existing.id || existing._id, updates);
      console.log('Updated user:', user);
    } else {
      console.log('Creating new user:', userData);
      user = await createUser(userData);
      console.log('Created user:', user);
    }
    // Send OTP via SMS using Python handler
    try {
      await sendOtpSms(phone, otpCode);
      console.log('OTP SMS sent to', phone);
    } catch (smsError) {
      console.error('SMS sending error:', smsError);
      // Optionally, you can return an error or proceed
    }
    const responseData = {
      message: 'Signup complete. Verification code sent via SMS.',
      user: { id: user.id || user._id, fullName: user.fullName, email: user.email, role: user.role, phone: user.phone }
    };
    console.log('Signup response:', responseData);
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
      if (!user) {
        // try phone fallback
        const supabase = await connectDB();
        const { data, error } = await supabase.from('users').select('*').eq('phone', phone).single();
        if (error && error.code !== 'PGRST116') throw error;
        user = data || null;
      }
    } else {
      const query = email ? { email: email.toLowerCase() } : { phone };
      user = await User.findOne(query);
    }

    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    if (user.isVerified === false) return res.status(403).json({ message: 'Account not verified. Please verify your email.' });

    // Check if account is locked
    if (user.lockUntil && user.lockUntil > Date.now()) {
      return res.status(423).json({ message: 'Account temporarily locked due to too many failed attempts' });
    }

    if (user.status === 'banned') return res.status(403).json({ message: 'Account banned' });
    if (user.status === 'suspended') return res.status(403).json({ message: 'Account suspended' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      // Increment failed attempts
      const failedAttempts = (user.failedAttempts || 0) + 1;
      const lockUntil = failedAttempts >= 5 ? Date.now() + 2 * 60 * 60 * 1000 : user.lockUntil;

      if (useSupabase) {
        await updateUser(user, { failedAttempts, lastFailedAttempt: new Date(), lockUntil });
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
      user = await updateUser(user, { failedAttempts: 0, lastFailedAttempt: null, lockUntil: null });
    } else {
      user.failedAttempts = 0;
      user.lastFailedAttempt = undefined;
      user.lockUntil = undefined;
      await user.save();
    }

    const token = jwt.sign({ id: user.id || user._id, role: user.role, email: user.email }, process.env.JWT_SECRET || 'supersecretjwtkey', { expiresIn: '7d' });
    return res.json({ token, user: { id: user._id, fullName: user.fullName, email: user.email, role: user.role, phone: user.phone } });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
});

router.post('/verify-otp', async (req, res) => {
  try {
    const { email, phone, otpCode } = req.body;
    if (!email || !otpCode) return res.status(400).json({ message: 'Email and verification code are required' });

    const user = await getUserByEmail(email);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.isVerified) return res.status(400).json({ message: 'User already verified' });
    if (user.otpCode !== otpCode) return res.status(400).json({ message: 'Invalid verification code' });
    if (!user.otpExpiry || new Date(user.otpExpiry) < new Date()) return res.status(400).json({ message: 'Verification code has expired' });

    const updatePayload = { isVerified: true, otpCode: null, otpExpiry: null };
    if (useSupabase) {
      await updateUser(user, updatePayload);
    } else {
      user.isVerified = true;
      user.otpCode = undefined;
      user.otpExpiry = undefined;
      await user.save();
    }

    const token = jwt.sign({ id: user._id, role: user.role, email: user.email }, process.env.JWT_SECRET || 'supersecretjwtkey', { expiresIn: '7d' });
    return res.json({ token, user: { id: user._id, fullName: user.fullName, email: user.email, role: user.role, phone: user.phone } });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
});

router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const resetCode = String(Math.floor(100000 + Math.random() * 900000));
    const resetExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    user.resetCode = resetCode;
    user.resetExpiry = resetExpiry;
    await user.save();

    const emailSubject = 'ReekTickets Password Reset';
    const emailText = `Your password reset code is ${resetCode}. This code will expire in 15 minutes. Enter this code on the password reset page to proceed.`;
    const sent = await sendEmail({ to: email, subject: emailSubject, text: emailText });

    const response = { message: 'Password reset code sent to your email' };
    if (!sent) {
      console.warn(`Email not configured. Reset code for ${email}: ${resetCode}`);
      response.resetCode = resetCode;
    }

    return res.json(response);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
});

router.post('/verify-reset-code', async (req, res) => {
  try {
    const { email, resetCode } = req.body;
    if (!email || !resetCode) return res.status(400).json({ message: 'Email and reset code are required' });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.resetCode !== resetCode) return res.status(400).json({ message: 'Invalid reset code' });
    if (!user.resetExpiry || new Date(user.resetExpiry) < new Date()) return res.status(400).json({ message: 'Reset code has expired' });

    return res.json({ message: 'Reset code verified', verified: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
});

router.post('/reset-password', async (req, res) => {
  try {
    const { email, resetCode, newPassword } = req.body;
    if (!email || !resetCode || !newPassword) return res.status(400).json({ message: 'Email, reset code, and new password are required' });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.resetCode !== resetCode) return res.status(400).json({ message: 'Invalid reset code' });
    if (!user.resetExpiry || new Date(user.resetExpiry) < new Date()) return res.status(400).json({ message: 'Reset code has expired' });

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    user.resetCode = undefined;
    user.resetExpiry = undefined;
    await user.save();

    return res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

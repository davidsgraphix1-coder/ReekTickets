const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendEmail } = require('../utils/email');

const router = express.Router();

router.post('/signup', async (req, res) => {
  try {
    const {
      fullName, firstName, lastName, email, phone, password, role,
      businessName, contactNumber, businessPartners, businessDetails, termsAccepted
    } = req.body;

    if (!fullName || !email || !phone || !password) return res.status(400).json({ message: 'Missing required fields' });

    const existing = await User.findOne({ email: email.toLowerCase() });
    const otpCode = String(Math.floor(100000 + Math.random() * 900000));
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    const hashed = await bcrypt.hash(password, 10);

    const userData = {
      fullName,
      firstName,
      lastName,
      email: email.toLowerCase(),
      phone,
      password: hashed,
      role: role || 'attendee',
      businessName,
      contactNumber,
      businessPartners: businessPartners || [],
      businessDetails: businessDetails || { country: 'Ghana' },
      termsAccepted: termsAccepted || false,
      otpCode,
      otpExpiry,
      isVerified: false,
    };

    let user;
    if (existing) {
      if (existing.isVerified) {
        return res.status(409).json({ message: 'Email already registered' });
      }
      existing.fullName = fullName;
      existing.firstName = firstName;
      existing.lastName = lastName;
      existing.phone = phone;
      existing.password = hashed;
      existing.role = role || 'attendee';
      existing.businessName = businessName;
      existing.contactNumber = contactNumber;
      existing.businessPartners = businessPartners || [];
      existing.businessDetails = businessDetails || { country: 'Ghana' };
      existing.termsAccepted = termsAccepted || false;
      existing.otpCode = otpCode;
      existing.otpExpiry = otpExpiry;
      existing.isVerified = false;
      user = await existing.save();
    } else {
      user = await User.create(userData);
    }

    const emailSubject = 'ReekTickets email verification';
    const emailText = `Your ReekTickets verification code is ${otpCode}. Enter this code on the verification page to complete signup.`;
    const sent = await sendEmail({ to: email, subject: emailSubject, text: emailText });

    const responseData = {
      message: 'Signup complete. Verification code sent to your email address.',
      user: { id: user._id, fullName: user.fullName, email: user.email, role: user.role, phone: user.phone },
      verificationCode: otpCode,
    };

    if (!sent) {
      console.warn(`Email not configured or failed. Verification code for ${email}: ${otpCode}`);
      responseData.message = 'Signup complete. Email delivery is not configured. Use the verification code shown in the response.';
    }

    return res.json(responseData);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, phone, password } = req.body;
    if ((!email && !phone) || !password) return res.status(400).json({ message: 'Email or phone and password are required' });
    
    const query = email ? { email: email.toLowerCase() } : { phone };
    const user = await User.findOne(query);
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
      user.failedAttempts = (user.failedAttempts || 0) + 1;
      user.lastFailedAttempt = new Date();
      
      // Lock account after 5 failed attempts for 2 hours
      if (user.failedAttempts >= 5) {
        user.lockUntil = Date.now() + 2 * 60 * 60 * 1000; // 2 hours
      }
      
      await user.save();
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Reset failed attempts on successful login
    user.failedAttempts = 0;
    user.lastFailedAttempt = undefined;
    user.lockUntil = undefined;
    await user.save();
    
    const token = jwt.sign({ id: user._id, role: user.role, email: user.email }, process.env.JWT_SECRET || 'supersecretjwtkey', { expiresIn: '7d' });
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

    const query = { email: email.toLowerCase() };
    const user = await User.findOne(query);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.isVerified) return res.status(400).json({ message: 'User already verified' });
    if (user.otpCode !== otpCode) return res.status(400).json({ message: 'Invalid verification code' });
    if (!user.otpExpiry || new Date(user.otpExpiry) < new Date()) return res.status(400).json({ message: 'Verification code has expired' });

    user.isVerified = true;
    user.otpCode = undefined;
    user.otpExpiry = undefined;
    await user.save();

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

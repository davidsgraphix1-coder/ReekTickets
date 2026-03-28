const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

router.post('/signup', async (req, res) => {
  try {
    const {
      fullName, firstName, lastName, email, phone, password, role,
      businessName, contactNumber, businessPartners, businessDetails, termsAccepted
    } = req.body;

    if (!fullName || !email || !phone || !password) return res.status(400).json({ message: 'Missing required fields' });

    // For organizers, require additional validation
    if (role === 'organizer') {
      if (!businessName || !contactNumber || !termsAccepted) {
        return res.status(400).json({ message: 'Business name, contact number, and terms acceptance are required for organizers' });
      }
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(409).json({ message: 'Email already registered' });

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
    };

    const user = await User.create(userData);
    const token = jwt.sign({ id: user._id, role: user.role, email: user.email }, process.env.JWT_SECRET || 'supersecretjwtkey', { expiresIn: '7d' });
    return res.json({ token, user: { id: user._id, fullName: user.fullName, email: user.email, role: user.role, phone: user.phone } });
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

module.exports = router;

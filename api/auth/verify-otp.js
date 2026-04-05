import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Supabase implementation for verify-otp endpoint
    const { email, otpCode } = req.body;
    if (!email || !otpCode) {
      return res.status(400).json({ message: 'Email and verification code are required' });
    }

    // Fetch user by email
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();
    if (userError || !user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (user.isVerified) {
      return res.status(400).json({ message: 'User already verified' });
    }
    if (user.otpCode !== otpCode) {
      return res.status(400).json({ message: 'Invalid verification code' });
    }
    if (!user.otpExpiry || new Date(user.otpExpiry) < new Date()) {
      return res.status(400).json({ message: 'Verification code has expired' });
    }

    // Update user as verified
    const { error: updateError } = await supabase
      .from('users')
      .update({ isVerified: true, otpCode: null, otpExpiry: null })
      .eq('id', user.id);
    if (updateError) {
      throw updateError;
    }

    // Optionally, issue a JWT token after verification
    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email },
      process.env.JWT_SECRET || 'supersecretjwtkey',
      { expiresIn: '7d' }
    );

    return res.json({ message: 'Account verified successfully', token });








  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}
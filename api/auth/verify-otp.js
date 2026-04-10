import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

function resolveField(record, camel, snake) {
  return record?.[camel] ?? record?.[snake];
}

function formatPhone(phone) {
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

async function sendOtpSms(phone, otp) {
  if (!process.env.PYTHON_SMS_BACKEND) {
    throw new Error('PYTHON_SMS_BACKEND must be configured');
  }

  const cleanPhone = formatPhone(phone);
  const message = `Welcome to ReekTickets! Your verification code is ${otp}. Happy ticketing!`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25000);

  try {
    const response = await fetch(`${process.env.PYTHON_SMS_BACKEND}/api/send-sms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: cleanPhone, message }),
      signal: controller.signal,
    });

    clearTimeout(timeout);
    const body = await response.json();
    return { success: response.ok, body };
  } catch (error) {
    clearTimeout(timeout);
    throw error;
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { email, phone, otpCode } = req.body;
    if ((!email && !phone) || !otpCode) {
      return res.status(400).json({ message: 'Email or phone and verification code are required' });
    }

    const query = supabase.from('users').select('*');
    if (email) {
      query.eq('email', email.toLowerCase());
    } else {
      query.eq('phone', formatPhone(phone));
    }

    const { data: user, error: userError } = await query.single();
    if (userError || !user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const isVerified = resolveField(user, 'isVerified', 'is_verified');
    if (isVerified) {
      return res.status(400).json({ message: 'User already verified' });
    }

    // Mark user as verified - no OTP check
    const { error: updateError } = await supabase
      .from('users')
      .update({ is_verified: true, otp_code: null, otp_expiry: null })
      .eq('id', user.id);
    if (updateError) {
      throw updateError;
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email },
      process.env.JWT_SECRET || 'supersecretjwtkey',
      { expiresIn: '7d' }
    );

    const userResponse = {
      id: user.id,
      fullName: resolveField(user, 'fullName', 'full_name'),
      email: user.email,
      phone: user.phone,
      role: user.role,
    };

    return res.status(200).json({
      token,
      user: userResponse,
      message: 'OTP verified successfully'
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
}

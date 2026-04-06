import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import axios from 'axios';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

function formatPhone(phone) {
  let cleanPhone = phone.replace(/\s+/g, '').replace(/^\+/, '');
  if (cleanPhone.startsWith('0')) {
    cleanPhone = '233' + cleanPhone.substring(1);
  } else if (!cleanPhone.startsWith('233')) {
    cleanPhone = '233' + cleanPhone;
  }
  return cleanPhone;
}

async function sendOtpSms(phone, otp) {
  const cleanPhone = formatPhone(phone);
  const message = `Your ReekTickets verification code is ${otp}`;
  const params = {
    apikey: process.env.SMS_API_KEY,
    sender: process.env.SMS_SENDER_ID || 'ReekTickets',
    message,
    recipients: cleanPhone
  };
  const url = `https://${process.env.SMS_HOST || 'api.smsonlinegh.com'}/sms/send/?${new URLSearchParams(params).toString()}`;
  const response = await axios.get(url, {
    timeout: 20000,
    headers: {
      'User-Agent': 'ReekTickets-SMS/1.0',
      'Accept': 'application/json'
    },
    validateStatus: () => true
  });
  return {
    success: response.status === 200,
    status: response.status,
    data: response.data,
    message: response.status === 200 ? 'SMS sent successfully' : `SMS provider returned ${response.status}`
  };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { fullName, email, phone, password, role } = req.body;
    if (!fullName || !email || !phone || !password) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check if user exists
    const { data: existing, error: existingError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();
    if (existing && existing.isVerified) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    // Generate OTP
    const otpCode = String(Math.floor(100000 + Math.random() * 900000));
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    const hashed = await bcrypt.hash(password, 10);

    let user;
    if (existing && !existing.isVerified) {
      // Update existing unverified user
      const { data: updated, error: updateError } = await supabase
        .from('users')
        .update({
          fullName,
          phone,
          password: hashed,
          role: role || 'attendee',
          otpCode,
          otpExpiry,
          isVerified: false
        })
        .eq('id', existing.id)
        .select()
        .single();
      if (updateError) throw updateError;
      user = updated;
    } else {
      // Create new user
      const { data: created, error: createError } = await supabase
        .from('users')
        .insert([
          {
            fullName,
            email: email.toLowerCase(),
            phone,
            password: hashed,
            role: role || 'attendee',
            otpCode,
            otpExpiry,
            isVerified: false
          }
        ])
        .select()
        .single();
      if (createError) throw createError;
      user = created;
    }

    const smsResult = await sendOtpSms(phone, otpCode);
    if (!smsResult.success) {
      console.error('SMS send failed:', smsResult);
    }

    res.status(200).json({
      message: smsResult.success
        ? 'Signup complete. Verification code sent via SMS.'
        : 'Signup complete. SMS sending failed, please retry verification.',
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        phone: user.phone
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}
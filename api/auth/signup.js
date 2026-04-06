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
  try {
    const cleanPhone = formatPhone(phone);
    const message = `Your ReekTickets verification code is ${otp}`;
    const params = {
      apikey: process.env.SMS_API_KEY || 'c6f61e914257462812deaff55c412a213cbf61a6388761016a1b2263d347948b',
      sender: process.env.SMS_SENDER_ID || 'ReekTickets',
      message,
      recipients: cleanPhone
    };
    const url = `https://${process.env.SMS_HOST || 'api.smsonlinegh.com'}/sms/send/?${new URLSearchParams(params).toString()}`;
    
    const response = await axios.get(url, {
      timeout: 20000,
      validateStatus: () => true
    });
    
    // SMSONLINEGH returns 200 with empty body on success
    const isSuccess = response.status === 200;
    
    return {
      success: isSuccess,
      status: response.status,
      message: isSuccess ? 'SMS queued for delivery' : `API returned ${response.status}`
    };
  } catch (error) {
    console.error('SMS error:', error.message);
    return {
      success: false,
      status: 500,
      message: error.message
    };
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    console.log('Signup request received');
    console.log('SUPABASE_URL available:', !!process.env.SUPABASE_URL);
    console.log('SUPABASE_KEY available:', !!process.env.SUPABASE_KEY);

    const { fullName, email, phone, password, role } = req.body;
    if (!fullName || !email || !phone || !password) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    console.log('Creating Supabase client...');
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
    console.log('Supabase client created successfully');

    // Check if user exists
    console.log('Checking if user exists...');
    const { data: existing, error: existingError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();

    if (existingError && existingError.code !== 'PGRST116') {
      console.error('Supabase query error:', existingError);
      throw existingError;
    }

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
      console.log('Updating existing user...');
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
      console.log('Creating new user...');
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

    console.log('User created/updated, sending SMS...');
    const smsResult = await sendOtpSms(phone, otpCode);
    if (!smsResult.success) {
      console.error('SMS send failed:', smsResult);
    }

    console.log('Signup completed successfully');
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
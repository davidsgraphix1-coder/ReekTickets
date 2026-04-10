import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

function resolveField(record, camel, snake) {
  return record?.[camel] ?? record?.[snake];
}

function formatPhone(phone) {
  let cleanPhone = phone.replace(/\s+/g, '').replace(/^\+/, '');

  // If starts with 0, replace 0 with 233
  if (cleanPhone.startsWith('0')) {
    cleanPhone = '233' + cleanPhone.substring(1);
  }
  // If doesn't start with 233, add 233 prefix
  if (!cleanPhone.startsWith('233')) {
    cleanPhone = '233' + cleanPhone;
  }

  return cleanPhone;
}

async function sendOtpSms(phone, otp) {
  const cleanPhone = formatPhone(phone);
  const message = `Welcome to ReekTickets! Your verification code is ${otp}. Happy ticketing!`;
  const pythonBackendUrl = process.env.PYTHON_SMS_BACKEND;
  const smsApiKey = process.env.SMS_API_KEY;
  const smsSenderId = process.env.SMS_SENDER_ID;
  const smsHost = process.env.SMS_API_HOST || 'api.smsonlinegh.com';

  async function tryPythonBackend() {
    if (!pythonBackendUrl) return null;

    try {
      console.log('[SMS] Sending via Python backend:', pythonBackendUrl);
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 25000);
      const response = await fetch(`${pythonBackendUrl}/api/send-sms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleanPhone, message }),
        signal: controller.signal
      });
      clearTimeout(timeout);

      const text = await response.text();
      let body;
      try {
        body = JSON.parse(text);
      } catch (_err) {
        body = text;
      }

      if (response.ok && body?.success) {
        return { success: true, message: 'SMS queued for delivery via Python Zenoph', backend: 'python' };
      }

      console.warn('[SMS] Python backend failed:', response.status, body);
      return null;
    } catch (error) {
      console.error('[SMS] Python backend error:', error.message);
      return null;
    }
  }

  async function trySmsonlinegh() {
    if (!smsApiKey || !smsSenderId) {
      return { success: false, message: 'SMSONLINEGH credentials are not configured' };
    }

    try {
      console.log('[SMS] Sending via SMSONLINEGH');
      const params = {
        apikey: smsApiKey,
        sender: smsSenderId,
        message,
        recipients: cleanPhone
      };
      const url = `https://${smsHost}/sms/send/?${new URLSearchParams(params).toString()}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'User-Agent': 'ReekTickets-SMS/1.0', 'Accept': 'application/json' }
      });
      const text = await response.text();
      let body;
      try {
        body = JSON.parse(text);
      } catch (_err) {
        body = text;
      }

      if (response.ok) {
        return { success: true, message: `SMS sent successfully to ${cleanPhone}`, backend: 'smsonlinegh', data: body };
      }

      console.warn('[SMS] SMSONLINEGH failed:', response.status, body);
      return { success: false, message: 'Failed to send SMS via SMSONLINEGH', backend: 'smsonlinegh', data: body };
    } catch (error) {
      console.error('[SMS] SMSONLINEGH error:', error.message);
      return { success: false, message: error.message || 'SMSONLINEGH API error', backend: 'smsonlinegh' };
    }
  }

  const pythonResult = await tryPythonBackend();
  if (pythonResult?.success) return pythonResult;
  const smsResult = await trySmsonlinegh();
  if (smsResult.success) return smsResult;

  return {
    success: false,
    message: pythonResult?.message || smsResult?.message || 'No SMS backend configured',
    backend: pythonResult?.backend || smsResult?.backend || 'none'
  };
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

    // Check if user exists by email or phone
    console.log('Checking if user exists...');
    const normalizedPhone = formatPhone(phone);
    const { data: existing, error: existingError } = await supabase
      .from('users')
      .select('*')
      .or(`email.eq.${email.toLowerCase()},phone.eq.${normalizedPhone}`)
      .single();

    if (existingError) {
      const noRows = existingError.code === 'PGRST116' || existingError.status === 406;
      if (!noRows) {
        console.error('Supabase query error:', existingError);
        throw existingError;
      }
    }

    const  existingVerified = existing && resolveField(existing, 'isVerified', 'is_verified');
    if (existingVerified) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    // Generate OTP
    const otpCode = String(Math.floor(100000 + Math.random() * 900000));
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    const hashed = await bcrypt.hash(password, 10);

    const allowedRoles = ['attendee', 'organizer', 'vendor', 'admin', 'gate'];
    const safeRole = allowedRoles.includes(role) ? role : 'attendee';
    const isAdmin = safeRole === 'admin';
    const userRecord = {
      full_name: fullName.trim(),
      email: email.toLowerCase(),
      phone: normalizedPhone,
      password: hashed,
      role: safeRole,
      otp_code: otpCode,
      otp_expiry: otpExpiry,
      is_verified: true, // Always verified after signup
      status: 'active' // Always active after signup
    };

    let user;
    if (existing && !existingVerified) {
      // Update existing unverified user
      console.log('Updating existing user...');
      const { data: updated, error: updateError } = await supabase
        .from('users')
        .update(userRecord)
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
        .insert([userRecord])
        .select()
        .single();
      if (createError) throw createError;
      user = created;
    }

    console.log('User created/updated successfully');

    const responseBody = {
      message: isAdmin
        ? 'Admin account created successfully. Redirecting to dashboard.'
        : 'Account created successfully! Welcome to ReekTickets.',
      user: {
        id: user.id,
        fullName: resolveField(user, 'fullName', 'full_name'),
        email: user.email,
        role: user.role,
        phone: user.phone,
        isVerified: resolveField(user, 'isVerified', 'is_verified'),
        status: user.status
      }
    };

    if (!isAdmin) {
      console.log('Sending welcome OTP SMS...');
      const smsResult = await sendOtpSms(phone, otpCode);
      if (!smsResult.success) {
        console.error('SMS send failed:', smsResult);
        // Don't block signup if SMS fails - user is still active
        responseBody.message = 'Account created successfully! Welcome to ReekTickets.';
      }
    } else {
      const token = jwt.sign(
        { id: user.id, role: user.role, email: user.email },
        process.env.JWT_SECRET || 'supersecretjwtkey',
        { expiresIn: '7d' }
      );
      responseBody.token = token;
    }

    res.status(200).json(responseBody);
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

function formatPhone(phone) {
  if (!phone) return '';
  let cleanPhone = phone.toString().trim().replace(/\s+/g, '').replace(/^\+/, '');
  if (cleanPhone.startsWith('0')) {
    cleanPhone = `233${cleanPhone.slice(1)}`;
  } else if (!cleanPhone.startsWith('233')) {
    cleanPhone = `233${cleanPhone}`;
  }
  return cleanPhone;
}

async function sendOtpSms(phone, otp) {
  try {
    const cleanPhone = formatPhone(phone);
    const message = `Your ReekTickets verification code is ${otp}`;
    const pythonBackendUrl = process.env.PYTHON_SMS_BACKEND;

    if (!pythonBackendUrl) {
      throw new Error('PYTHON_SMS_BACKEND must be configured');
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25000);
    const response = await fetch(`${pythonBackendUrl}/api/send-sms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: cleanPhone, message }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    const body = await response.json();
    if (!response.ok) {
      throw new Error(body.message || 'Failed to send OTP SMS');
    }

    return { success: true, message: body.message || 'OTP sent successfully' };
  } catch (error) {
    return { success: false, message: error.message || 'SMS sending failed' };
  }
}

async function createPlaceholderPassword() {
  const randomPassword = Math.random().toString(36).slice(2);
  return bcrypt.hash(randomPassword, 10);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { userId, phone, email, fullName, otpCode } = req.body;

    if (!userId && !phone) {
      return res.status(400).json({ message: 'User ID or phone number is required' });
    }

    const normalizedPhone = phone ? formatPhone(phone) : null;
    let existingUser = null;

    if (userId) {
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (userError) {
        return res.status(404).json({ message: 'User not found' });
      }
      existingUser = user;
    } else {
      const userQuery = supabase.from('users').select('*');
      if (email && normalizedPhone) {
        userQuery.or(`email.eq.${email.toLowerCase()},phone.eq.${normalizedPhone}`);
      } else if (email) {
        userQuery.eq('email', email.toLowerCase());
      } else {
        userQuery.eq('phone', normalizedPhone);
      }

      const { data: user, error: userError } = await userQuery.maybeSingle();
      if (userError) {
        throw userError;
      }
      existingUser = user;
    }

    const existingVerified = existingUser && (existingUser.isVerified ?? existingUser.is_verified);
    if (existingVerified) {
      return res.status(400).json({ message: 'User is already verified' });
    }

    const finalOtpCode = otpCode && /^\d{6}$/.test(otpCode)
      ? otpCode
      : String(Math.floor(100000 + Math.random() * 900000));
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    let userRecord;
    if (existingUser) {
      userRecord = {
        otp_code: finalOtpCode,
        otp_expiry: otpExpiry,
        is_verified: false,
      };
      if (normalizedPhone) userRecord.phone = normalizedPhone;
      if (email) userRecord.email = email.toLowerCase();
      if (fullName) userRecord.full_name = fullName;
      if (!existingUser.password) {
        userRecord.password = await createPlaceholderPassword();
      }

      const { data: updatedUser, error: updateError } = await supabase
        .from('users')
        .update(userRecord)
        .eq('id', existingUser.id)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }
      existingUser = updatedUser;
    } else {
      userRecord = {
        fullName: fullName?.trim() || 'Pending User',
        email: email ? email.toLowerCase() : null,
        phone: normalizedPhone,
        password: await createPlaceholderPassword(),
        role: 'attendee',
        otpCode: finalOtpCode,
        otpExpiry,
        isVerified: false,
      };

      const { data: createdUser, error: createError } = await supabase
        .from('users')
        .insert([userRecord])
        .select()
        .single();

      if (createError) {
        throw createError;
      }
      existingUser = createdUser;
    }

    return res.status(200).json({
      message: 'OTP code set successfully. Use send_sms_example.py to send it manually.',
      otpCode: finalOtpCode,
      user: existingUser,
    });
  } catch (error) {
    console.error('Set OTP error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}

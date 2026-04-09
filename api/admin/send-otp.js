import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

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
    const pythonBackendUrl = process.env.PYTHON_SMS_BACKEND;

    if (!pythonBackendUrl) {
      throw new Error('PYTHON_SMS_BACKEND must be set in environment variables');
    }

    console.log('[SMS] Sending via Python Zenoph backend:', pythonBackendUrl);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25000);
    const response = await fetch(`${pythonBackendUrl}/api/send-sms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: cleanPhone, message }),
      signal: controller.signal
    });
    clearTimeout(timeout);

    const responseText = await response.text();
    let responseBody;
    try {
      responseBody = JSON.parse(responseText);
    } catch (_err) {
      responseBody = responseText;
    }

    console.log('[SMS] Python backend response status:', response.status, 'body:', responseBody);

    if (response.status === 200 && responseBody.success) {
      return {
        success: true,
        status: 200,
        message: 'SMS queued for delivery via Python Zenoph'
      };
    }

    return {
      success: false,
      status: response.status,
      message: responseBody.message || 'Python backend returned an error',
      backendBody: responseBody
    };
  } catch (error) {
    console.error('[SMS] Error:', error.message);
    return {
      success: false,
      status: 500,
      message: error.message.includes('PYTHON_SMS_BACKEND') ? 'SMS backend configuration missing' : error.message
    };
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ message: 'User ID required' });
    }

    // Get user
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isVerified = user.isVerified ?? user.is_verified;
    const otpCode = user.otpCode ?? user.otp_code;
    if (isVerified) {
      return res.status(400).json({ message: 'User already verified' });
    }

    // Send OTP
    const smsResult = await sendOtpSms(user.phone, otpCode);
    if (!smsResult.success) {
      return res.status(500).json({ message: 'Failed to send OTP SMS' });
    }

    return res.status(200).json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}
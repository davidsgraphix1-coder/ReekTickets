import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

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
  return `+${clean}`;
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
        return { success: true, message: body.message || 'OTP sent successfully via Python backend' };
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
      return { success: false, message: 'SMS provider credentials are not configured' };
    }

    try {
      const params = {
        apikey: smsApiKey,
        sender: smsSenderId,
        message,
        recipients: cleanPhone
      };
      const url = `https://${smsHost}/sms/send/?${new URLSearchParams(params).toString()}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': 'ReekTickets-SMS/1.0',
          Accept: 'application/json'
        }
      });
      const text = await response.text();
      let body;
      try {
        body = JSON.parse(text);
      } catch (_err) {
        body = text;
      }

      if (response.ok) {
        return { success: true, message: body?.message || `SMS sent successfully to ${cleanPhone}` };
      }

      return { success: false, message: body?.message || 'Failed to send OTP via SMSONLINEGH' };
    } catch (error) {
      return { success: false, message: error.message || 'SMSONLINEGH API error' };
    }
  }

  const pythonResult = await tryPythonBackend();
  if (pythonResult?.success) return pythonResult;
  return await trySmsonlinegh();
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ message: 'Phone is required' });
    }

    const formattedPhone = formatPhone(phone);
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('phone', formattedPhone)
      .single();

    if (userError || !user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const isVerified = user.is_verified ?? user.isVerified;
    if (isVerified) {
      return res.status(400).json({ message: 'User already verified' });
    }

    const otpCode = String(Math.floor(100000 + Math.random() * 900000));
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    const { error: updateError } = await supabase
      .from('users')
      .update({ otp_code: otpCode, otp_expiry: otpExpiry })
      .eq('id', user.id);

    if (updateError) {
      throw updateError;
    }

    const smsResult = await sendOtpSms(formattedPhone, otpCode);
    if (!smsResult.success) {
      return res.status(500).json({ message: smsResult.message || 'Failed to send OTP' });
    }

    return res.status(200).json({ message: 'OTP resent successfully' });
  } catch (error) {
    console.error('Resend OTP error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
}

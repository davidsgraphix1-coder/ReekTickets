import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function sendOtpSms(phone, otp) {
  const pythonBackendUrl = process.env.PYTHON_SMS_BACKEND;
  const smsApiKey = process.env.SMS_API_KEY;
  const smsSenderId = process.env.SMS_SENDER_ID;
  const smsHost = process.env.SMS_API_HOST || 'api.smsonlinegh.com';

  if (pythonBackendUrl) {
    try {
      console.log('[SMS] Sending via Python backend:', pythonBackendUrl);
      const response = await fetch(`${pythonBackendUrl}/api/send-sms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, message: `Your ReekTickets password reset code is ${otp}` })
      });
      const body = await response.text();
      if (response.ok) {
        return { success: true, message: 'SMS queued for delivery via Python', backend: 'python' };
      } else {
        console.warn('[SMS] Python backend failed:', response.status, body);
      }
    } catch (error) {
      console.error('[SMS] Python backend error:', error.message);
    }
  }

  // Fallback to SMSONLINEGH
  if (!smsApiKey || !smsSenderId) {
    return { success: false, message: 'SMS credentials not configured' };
  }

  try {
    // Normalize phone number
    let cleanPhone = phone.replace(/\s+/g, '').replace(/^\+/, '');
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '233' + cleanPhone.substring(1);
    } else if (!cleanPhone.startsWith('233')) {
      cleanPhone = '233' + cleanPhone;
    }

    console.log('[SMS] Sending via SMSONLINEGH to', cleanPhone);
    const params = {
      apikey: smsApiKey,
      sender: smsSenderId,
      message: `Your ReekTickets password reset code is ${otp}`,
      recipients: cleanPhone
    };

    const url = `https://${smsHost}/sms/send/?${new URLSearchParams(params).toString()}`;
    const response = await fetch(url);
    const body = await response.text();

    if (response.ok) {
      console.log('[SMS] SMSONLINEGH success');
      return { success: true, message: 'SMS sent successfully', backend: 'smsonlinegh' };
    } else {
      console.warn('[SMS] SMSONLINEGH failed:', response.status, body);
      return { success: false, message: 'Failed to send SMS' };
    }
  } catch (error) {
    console.error('[SMS] SMSONLINEGH error:', error.message);
    return { success: false, message: 'SMS sending failed' };
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { action, phone, resetCode, newPassword } = req.body;

    // Normalize phone number for all operations
    let normalizedPhone = phone ? phone.replace(/\s+/g, '').replace(/^\+/, '') : null;
    if (normalizedPhone) {
      if (normalizedPhone.startsWith('0')) {
        normalizedPhone = '233' + normalizedPhone.substring(1);
      } else if (!normalizedPhone.startsWith('233')) {
        normalizedPhone = '233' + normalizedPhone;
      }
    }

    switch (action) {
      case 'request-reset': {
        if (!phone) {
          return res.status(400).json({ message: 'Phone number is required' });
        }

        // Find user by phone
        const { data: user, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('phone', normalizedPhone)
          .single();

        if (userError || !user) {
          return res.status(404).json({ message: 'User not found' });
        }

        // Generate reset code
        const resetCode = String(Math.floor(100000 + Math.random() * 900000));
        const resetExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

        // Update user with reset code
        const { error: updateError } = await supabase
          .from('users')
          .update({
            otp_code: resetCode,
            otp_expiry: resetExpiry
          })
          .eq('id', user.id);

        if (updateError) {
          console.error('Update user error:', updateError);
          return res.status(500).json({ message: 'Failed to generate reset code' });
        }

        // Send SMS
        const smsResult = await sendOtpSms(normalizedPhone, resetCode);
        if (!smsResult.success) {
          console.error('SMS sending failed:', smsResult);
          return res.status(500).json({ message: 'Failed to send SMS. Please try again.' });
        }

        const response = { message: 'Password reset code sent to your phone' };
        if (process.env.NODE_ENV !== 'production') {
          response.resetCode = resetCode; // For testing
        }

        return res.json(response);
      }

      case 'verify-code': {
        if (!phone || !resetCode) {
          return res.status(400).json({ message: 'Phone number and reset code are required' });
        }

        // Find user by phone
        const { data: user, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('phone', normalizedPhone)
          .single();

        if (userError || !user) {
          return res.status(404).json({ message: 'User not found' });
        }

        // Check reset code
        if (user.otp_code !== resetCode) {
          return res.status(400).json({ message: 'Invalid reset code' });
        }

        // Check expiry
        if (!user.otp_expiry || new Date(user.otp_expiry) < new Date()) {
          return res.status(400).json({ message: 'Reset code has expired' });
        }

        return res.json({ message: 'Reset code verified', verified: true });
      }

      case 'reset-password': {
        if (!phone || !resetCode || !newPassword) {
          return res.status(400).json({ message: 'Phone number, reset code, and new password are required' });
        }

        // Find user by phone
        const { data: user, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('phone', normalizedPhone)
          .single();

        if (userError || !user) {
          return res.status(404).json({ message: 'User not found' });
        }

        // Check reset code
        if (user.otp_code !== resetCode) {
          return res.status(400).json({ message: 'Invalid reset code' });
        }

        // Check expiry
        if (!user.otp_expiry || new Date(user.otp_expiry) < new Date()) {
          return res.status(400).json({ message: 'Reset code has expired' });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update user password and clear reset code
        const { error: updateError } = await supabase
          .from('users')
          .update({
            password: hashedPassword,
            otp_code: null,
            otp_expiry: null
          })
          .eq('id', user.id);

        if (updateError) {
          console.error('Update password error:', updateError);
          return res.status(500).json({ message: 'Failed to reset password' });
        }

        return res.json({ message: 'Password reset successfully' });
      }

      default:
        return res.status(400).json({ message: 'Invalid action. Use request-reset, verify-code, or reset-password' });
    }
  } catch (error) {
    console.error('Password reset error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
}
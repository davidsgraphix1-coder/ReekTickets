// SMS OTP endpoint for Vercel serverless

const SMS_API_KEY = process.env.SMS_API_KEY || 'c6f61e914257462812deaff55c412a213cbf61a6388761016a1b2263d347948b';
const SMS_SENDER_ID = process.env.SMS_SENDER_ID || 'ReekTickets';
const SMS_HOST = process.env.SMS_HOST || 'api.smsonlinegh.com';

function formatPhone(phone) {
  let cleanPhone = phone.replace(/\s+/g, '').replace(/^\+/, '');
  if (cleanPhone.startsWith('0')) {
    cleanPhone = '233' + cleanPhone.substring(1);
  } else if (!cleanPhone.startsWith('233')) {
    cleanPhone = '233' + cleanPhone;
  }
  return cleanPhone;
}

async function sendViaSmsonlinegh(phone, message) {
  try {
    const cleanPhone = formatPhone(phone);
    const params = {
      apikey: SMS_API_KEY,
      sender: SMS_SENDER_ID,
      message,
      recipients: cleanPhone
    };

    const url = `https://${SMS_HOST}/sms/send/?${new URLSearchParams(params).toString()}`;
    console.log(`[SMS] SMSONLINEGH API call to ${cleanPhone}`);

    const response = await fetch(url, {
      method: 'GET'
    });

    console.log(`[SMS] SMSONLINEGH response status: ${response.status}`);

    // SMSONLINEGH returns HTTP 200 with empty body on success
    if (response.status === 200) {
      return {
        success: true,
        status: 200,
        message: `SMS queued for delivery to ${cleanPhone}`
      };
    }

    return {
      success: false,
      status: response.status,
      error: `API returned ${response.status}`,
      message: 'Failed to send SMS via SMSONLINEGH'
    };
  } catch (error) {
    console.error('[SMS] SMSONLINEGH error:', error.message);
    return {
      success: false,
      status: 500,
      error: error.message,
      message: `SMSONLINEGH API error: ${error.message}`
    };
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({
        success: false,
        error: 'phone and otp are required'
      });
    }

    const message = `Your ReekTickets verification code is ${otp}`;
    const result = await sendViaSmsonlinegh(phone, message);

    if (result.success) {
      res.status(200).json({
        success: true,
        message: result.message
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error,
        message: result.message
      });
    }

  } catch (error) {
    console.error('SMS OTP error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to send OTP'
    });
  }
}
const SMS_API_KEY = process.env.SMS_API_KEY;
const SMS_SENDER_ID = process.env.SMS_SENDER_ID;
const SMS_HOST = process.env.SMS_API_HOST || 'api.smsonlinegh.com';
const PYTHON_SMS_BACKEND = process.env.PYTHON_SMS_BACKEND;

function formatPhone(phone) {
  let cleanPhone = phone.replace(/\s+/g, '').replace(/^\+/, '');
  if (cleanPhone.startsWith('0')) {
    cleanPhone = '233' + cleanPhone.substring(1);
  } else if (!cleanPhone.startsWith('233')) {
    cleanPhone = '233' + cleanPhone;
  }
  return cleanPhone;
}

async function sendViaPythonBackend(phone, message) {
  if (!PYTHON_SMS_BACKEND) {
    console.log('[SMS] Python backend not configured, skipping');
    return null;
  }

  try {
    const cleanPhone = formatPhone(phone);
    console.log(`[SMS] Trying Python backend at ${PYTHON_SMS_BACKEND}`);

    const response = await fetch(`${PYTHON_SMS_BACKEND}/api/send-sms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: cleanPhone, message })
    });

    const text = await response.text();
    let result;
    try {
      result = JSON.parse(text);
    } catch (_) {
      result = { raw: text };
    }

    console.log(`[SMS] Python backend response status: ${response.status}, body:`, result);

    if (response.status === 200 && result.success) {
      return {
        success: true,
        status: 200,
        message: `SMS sent successfully to ${cleanPhone}`,
        backend: 'python-zenoph',
        data: result
      };
    }

    return null;
  } catch (error) {
    console.error('[SMS] Python backend error:', error.message);
    return null;
  }
}

async function sendViaSmsonlinegh(phone, message) {
  if (!SMS_API_KEY || !SMS_SENDER_ID) {
    return {
      success: false,
      status: 500,
      error: 'SMS_API_KEY or SMS_SENDER_ID not configured',
      message: 'SMS provider credentials are missing',
      backend: 'smsonlinegh'
    };
  }

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
      method: 'GET',
      headers: {
        'User-Agent': 'ReekTickets-SMS/1.0',
        'Accept': 'application/json'
      }
    });

    const text = await response.text();
    let responseData;
    try {
      responseData = JSON.parse(text);
    } catch (_err) {
      responseData = text;
    }

    console.log(`[SMS] SMSONLINEGH response status: ${response.status}`);
    console.log(`[SMS] SMSONLINEGH response data:`, JSON.stringify(responseData).substring(0, 200));

    if (response.status === 200) {
      return {
        success: true,
        status: 200,
        data: responseData,
        message: `SMS sent successfully to ${cleanPhone}`,
        backend: 'smsonlinegh'
      };
    }

    return {
      success: false,
      status: response.status,
      error: `SMSONLINEGH response ${response.status}`,
      message: 'Failed to send SMS via SMSONLINEGH',
      backend: 'smsonlinegh'
    };
  } catch (error) {
    console.error('[SMS] SMSONLINEGH error:', error);
    return {
      success: false,
      status: 500,
      error: error.message,
      message: `SMSONLINEGH API error: ${error.message}`,
      backend: 'smsonlinegh'
    };
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    console.log('[SMS] Environment check:', {
      PYTHON_SMS_BACKEND: !!PYTHON_SMS_BACKEND,
      SMS_API_KEY: !!SMS_API_KEY,
      SMS_SENDER_ID: !!SMS_SENDER_ID
    });

    // Parse request body if it's a string
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (parseError) {
        console.error('[SMS] Failed to parse request body:', parseError);
        return res.status(400).json({ success: false, error: 'Invalid JSON in request body' });
      }
    }

    const { phone, message } = body;
    if (!phone || !message) {
      return res.status(400).json({ success: false, error: 'phone and message are required' });
    }

    console.log('[SMS] /api/sms/send called with:', { phone, messageLength: message?.length });

    // Try Python backend first (Zenoph SDK actually works)
    if (PYTHON_SMS_BACKEND) {
      const pythonResult = await sendViaPythonBackend(phone, message);
      if (pythonResult && pythonResult.success) {
        return res.status(200).json(pythonResult);
      }
    }

    // Fallback to direct SMSONLINEGH
    if (SMS_API_KEY && SMS_SENDER_ID) {
      const smsonlineghResult = await sendViaSmsonlinegh(phone, message);
      return res.status(smsonlineghResult.success ? 200 : 500).json(smsonlineghResult);
    }

    return res.status(500).json({
      success: false,
      error: 'No SMS backend configured',
      message: 'SMS provider configuration missing'
    });
  } catch (error) {
    console.error('[SMS] send.js error:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to send SMS'
    });
  }
}

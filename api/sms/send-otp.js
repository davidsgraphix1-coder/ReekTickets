// SMS OTP endpoint for Vercel serverless

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
    return {
      success: false,
      status: 500,
      error: 'PYTHON_SMS_BACKEND is not configured',
      message: 'Python backend configuration missing'
    };
  }

  try {
    const cleanPhone = formatPhone(phone);
    const url = `${PYTHON_SMS_BACKEND}/api/send-sms`;

    console.log('[SMS] send-otp calling Python Zenoph backend:', url);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25000);
    const response = await fetch(url, {
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
        message: `SMS queued for delivery to ${cleanPhone}`,
        backend: 'python-zenoph',
        backendBody: responseBody
      };
    }

    return {
      success: false,
      status: response.status,
      error: responseBody.error || 'Python backend returned an error',
      message: 'Failed to send OTP',
      backend: 'python-zenoph',
      backendBody: responseBody
    };
  } catch (error) {
    console.error('[SMS] Python backend error:', error.message);
    return {
      success: false,
      status: 500,
      error: error.message,
      message: error.message.includes('PYTHON_SMS_BACKEND') ? 'Python backend configuration missing' : 'Python backend unavailable'
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
    const result = await sendViaPythonBackend(phone, message);

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
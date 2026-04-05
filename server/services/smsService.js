/**
 * SMS Service for Node.js Backend
 * Vercel-compatible SMS sending (pure HTTP, no child processes)
 */

const axios = require('axios');

const SMS_API_KEY = process.env.SMS_API_KEY || 'c6f61e914257462812deaff55c412a213cbf61a6388761016a1b2263d347948b';
const SMS_SENDER_ID = process.env.SMS_SENDER_ID || 'ReekTickets';
const SMS_HOST = process.env.SMS_HOST || 'api.smsonlinegh.com';

/**
 * Send SMS via pure HTTP (Vercel-compatible)
 */
async function sendSMS(phone, message) {
  try {
    console.log(`[SMS] Sending to ${phone}: ${message.substring(0, 50)}...`);

    // Clean phone number
    let cleanPhone = phone.replace(/\s+/g, '').replace(/^\+/, '');

    // Convert to international format if local format
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '233' + cleanPhone.substring(1);
    } else if (!cleanPhone.startsWith('233')) {
      cleanPhone = '233' + cleanPhone;
    }

    console.log(`[SMS] Cleaned phone: ${cleanPhone}`);

    // Build query parameters
    const params = {
      apikey: SMS_API_KEY,
      sender: SMS_SENDER_ID,
      message: message,
      recipients: cleanPhone
    };

    const url = `https://${SMS_HOST}/sms/send/?${new URLSearchParams(params).toString()}`;

    console.log(`[SMS] Calling API: ${url.substring(0, 100)}...`);

    const response = await axios.get(url, {
      timeout: 20000,
      headers: {
        'User-Agent': 'ReekTickets-SMS-Service/1.0',
        'Accept': 'application/json'
      },
      validateStatus: function(status) {
        return status >= 200 && status < 500; // Don't throw on 4xx
      }
    });

    console.log(`[SMS] API response status: ${response.status}`);
    console.log(`[SMS] API response data: ${JSON.stringify(response.data).substring(0, 200)}`);

    if (response.status === 200) {
      return {
        success: true,
        status: 200,
        data: response.data,
        message: `SMS sent successfully to ${cleanPhone}`
      };
    } else {
      console.error(`[SMS] API returned ${response.status}: ${JSON.stringify(response.data)}`);
      return {
        success: false,
        status: response.status,
        data: response.data,
        message: `SMS API returned ${response.status}`
      };
    }

  } catch (error) {
    console.error('[SMS] Error:', error.message);

    // Try to extract useful error info
    let errorMsg = error.message;
    if (error.response) {
      errorMsg = `HTTP ${error.response.status}: ${error.response.statusText}`;
    } else if (error.code === 'ECONNREFUSED') {
      errorMsg = 'SMS service unreachable (connection refused)';
    } else if (error.code === 'ENOTFOUND') {
      errorMsg = 'SMS service host not found (DNS issue)';
    } else if (error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED') {
      errorMsg = 'SMS service timeout';
    }

    return {
      success: false,
      status: 500,
      error: errorMsg,
      message: `Failed to send SMS: ${errorMsg}`
    };
  }
}

/**
 * Send OTP SMS
 */
async function sendOTP(phone, otp) {
  const message = `Your ReekTickets verification code is ${otp}`;
  return await sendSMS(phone, message);
}

/**
 * Send ticket confirmation SMS
 */
async function sendTicketConfirmation(phone, ticketDetails) {
  const message = `Your ReekTickets ticket is confirmed! Event: ${ticketDetails.eventName}, Date: ${ticketDetails.date}, Code: ${ticketDetails.code}`;
  return await sendSMS(phone, message);
}

/**
 * Health check for SMS service
 */
async function healthCheck() {
  try {
    const result = await sendSMS('0273476701', 'SMS service health check');
    return {
      success: true,
      message: 'SMS service is operational',
      testResult: result.success
    };
  } catch (error) {
    return {
      success: false,
      message: 'SMS service health check failed',
      error: error.message
    };
  }
}

module.exports = {
  sendSMS,
  sendOTP,
  sendTicketConfirmation,
  healthCheck
};

/**
 * Send OTP SMS
 */
async function sendOTP(phone, otp) {
  const message = `Your ReekTickets verification code is ${otp}`;
  return await sendSMS(phone, message);
}

/**
 * Send ticket confirmation SMS
 */
async function sendTicketConfirmation(phone, ticketDetails) {
  const message = `Your ReekTickets ticket is confirmed! Event: ${ticketDetails.eventName}, Date: ${ticketDetails.date}, Code: ${ticketDetails.code}`;
  return await sendSMS(phone, message);
}

/**
 * Health check for SMS service
 */
async function healthCheck() {
  try {
    // Simple test SMS to verify API connectivity
    const testResult = await sendSMS('0273476701', 'SMS service health check');
    return {
      success: true,
      message: 'SMS service is operational',
      testResult: testResult.success
    };
  } catch (error) {
    return {
      success: false,
      message: 'SMS service health check failed',
      error: error.message
    };
  }
}

module.exports = {
  sendSMS,
  sendOTP,
  sendTicketConfirmation,
  healthCheck
};

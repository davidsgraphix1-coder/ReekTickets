/**
 * SMS Service for Node.js Backend
 * Using Termii SMS API (reliable for Ghana)
 */

const axios = require('axios');

const SMS_API_KEY = process.env.SMS_API_KEY || 'c6f61e914257462812deaff55c412a213cbf61a6388761016a1b2263d347948b';
const SMS_SENDER_ID = process.env.SMS_SENDER_ID || 'ReekTickets';
const SMS_HOST = process.env.SMS_HOST || 'api.ng.termii.com';

// Gateway configuration - prioritize environment variable
let SMS_GATEWAY_URL = process.env.SMS_GATEWAY_URL;
if (!SMS_GATEWAY_URL) {
  // Default to local for development
  SMS_GATEWAY_URL = 'http://localhost:8001';
}

const USE_GATEWAY = process.env.USE_SMS_GATEWAY !== 'false';

/**
 * Send SMS via Termii API (reliable SMS provider)
 */
async function sendViaTermii(phone, message) {
  try {
    console.log(`[SMS] Using Termii API: ${SMS_HOST}`);

    // Clean phone number
    let cleanPhone = phone.replace(/\s+/g, '').replace(/^\+/, '');

    // Convert to international format
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '233' + cleanPhone.substring(1);
    } else if (!cleanPhone.startsWith('233')) {
      cleanPhone = '233' + cleanPhone;
    }

    console.log(`[SMS] Sending to cleaned phone: ${cleanPhone}`);

    const payload = {
      to: cleanPhone,
      from: SMS_SENDER_ID,
      sms: message,
      type: "plain",
      channel: "generic",
      api_key: SMS_API_KEY
    };

    const url = `https://${SMS_HOST}/api/sms/send`;
    console.log(`[SMS] Termii API call to ${cleanPhone}`);

    const response = await axios.post(url, payload, {
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'ReekTickets-SMS/1.0'
      },
      validateStatus: () => true
    });

    console.log(`[SMS] Termii response status: ${response.status}`);
    console.log(`[SMS] Termii response data:`, JSON.stringify(response.data, null, 2));

    if (response.status === 200 && response.data && response.data.message === "Successfully Sent") {
      console.log(`[SMS] Termii success: ${response.data.message_id || 'no-id'}`);
      return {
        success: true,
        status: 200,
        data: response.data,
        message: `SMS sent successfully via Termii to ${cleanPhone}`
      };
    } else {
      console.error(`[SMS] Termii failed: ${response.data?.message || 'Unknown error'}`);
      return {
        success: false,
        status: response.status,
        error: response.data?.message || 'Termii API error',
        message: `Termii failed: ${response.data?.message || 'Unknown error'}`
      };
    }

  } catch (error) {
    console.error('[SMS] Termii error:', error.message);
    let errorMsg = error.message;

    if (error.response) {
      errorMsg = `HTTP ${error.response.status}: ${error.response.data?.message || error.response.statusText}`;
    } else if (error.code === 'ECONNREFUSED') {
      errorMsg = 'Termii service unreachable';
    } else if (error.code === 'ENOTFOUND') {
      errorMsg = 'Termii host not found';
    } else if (error.code === 'ETIMEDOUT') {
      errorMsg = 'Termii request timeout';
    }

    return {
      success: false,
      status: 500,
      error: errorMsg,
      message: `Termii API error: ${errorMsg}`
    };
  }
}

/**
 * Send SMS via HTTP Gateway (if available - runs Python handler)
 */
async function sendViaGateway(phone, message) {
  try {
    console.log(`[SMS] Trying gateway: ${SMS_GATEWAY_URL}`);

    const response = await axios.post(`${SMS_GATEWAY_URL}/send-sms`, {
      phone,
      message
    }, {
      timeout: 20000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.data && response.data.success) {
      console.log('[SMS] Gateway sent successfully');
      return response.data;
    } else {
      throw new Error('Gateway returned non-success');
    }
  } catch (error) {
    console.error('[SMS] Gateway failed:', error.message);
    return null; // Return null to trigger fallback
  }
}

/**
 * Send SMS - main function with Termii as primary
 */
async function sendSMS(phone, message) {
  try {
    console.log(`[SMS] Sending to ${phone}: ${message.substring(0, 50)}...`);

    // Try gateway first if enabled (for local development)
    if (USE_GATEWAY) {
      const gatewayResult = await sendViaGateway(phone, message);
      if (gatewayResult && gatewayResult.success) {
        return gatewayResult;
      }
    }

    // Use Termii API (works on Vercel)
    console.log('[SMS] Using Termii API');
    return await sendViaTermii(phone, message);

  } catch (error) {
    console.error('[SMS] Unexpected error:', error.message);
    return {
      success: false,
      status: 500,
      error: error.message,
      message: 'SMS sending failed'
    };
  }
}

/**
 * Send SMS - main function with Termii as primary
 */
async function sendSMS(phone, message) {
  try {
    console.log(`[SMS] Sending to ${phone}: ${message.substring(0, 50)}...`);

    // Try gateway first if enabled (for local development)
    if (USE_GATEWAY) {
      const gatewayResult = await sendViaGateway(phone, message);
      if (gatewayResult && gatewayResult.success) {
        return gatewayResult;
      }
    }

    // Use Termii API (works on Vercel)
    console.log('[SMS] Using Termii API');
    return await sendViaTermii(phone, message);

  } catch (error) {
    console.error('[SMS] Unexpected error:', error.message);
    return {
      success: false,
      status: 500,
      error: error.message,
      message: 'SMS sending failed'
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
 * Health check
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

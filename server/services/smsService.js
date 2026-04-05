/**
 * SMS Service for Node.js Backend
 * Hybrid approach: Try SMS gateway first, fallback to direct HTTP API
 */

const axios = require('axios');

const SMS_API_KEY = process.env.SMS_API_KEY || 'c6f61e914257462812deaff55c412a213cbf61a6388761016a1b2263d347948b';
const SMS_SENDER_ID = process.env.SMS_SENDER_ID || 'ReekTickets';
const SMS_HOST = process.env.SMS_HOST || 'api.smsonlinegh.com';
const SMS_GATEWAY_URL = process.env.SMS_GATEWAY_URL || 'http://localhost:8001';
const USE_GATEWAY = process.env.USE_SMS_GATEWAY !== 'false'; // Default true

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
 * Send SMS via direct HTTP API (fallback for Vercel)
 */
async function sendViaDirectAPI(phone, message) {
  try {
    console.log(`[SMS] Using direct API: ${SMS_HOST}`);

    // Clean phone number
    let cleanPhone = phone.replace(/\s+/g, '').replace(/^\+/, '');

    // Convert to international format
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '233' + cleanPhone.substring(1);
    } else if (!cleanPhone.startsWith('233')) {
      cleanPhone = '233' + cleanPhone;
    }

    const params = {
      apikey: SMS_API_KEY,
      sender: SMS_SENDER_ID,
      message: message,
      recipients: cleanPhone
    };

    const url = `https://${SMS_HOST}/sms/send/?${new URLSearchParams(params).toString()}`;
    console.log(`[SMS] Direct API call to ${cleanPhone}`);

    const response = await axios.get(url, {
      timeout: 20000,
      headers: {
        'User-Agent': 'ReekTickets-SMS/1.0',
        'Accept': 'application/json'
      },
      validateStatus: () => true // Accept all status codes
    });

    console.log(`[SMS] Direct API response: ${response.status}`);

    if (response.status === 200) {
      console.log(`[SMS] Direct API success`);
      return {
        success: true,
        status: 200,
        data: response.data,
        message: `SMS sent successfully to ${cleanPhone}`
      };
    } else {
      console.error(`[SMS] Direct API failed with ${response.status}`);
      return {
        success: false,
        status: response.status,
        error: `API returned ${response.status}`,
        message: `Direct API failed: HTTP ${response.status}`
      };
    }

  } catch (error) {
    console.error('[SMS] Direct API error:', error.message);
    return {
      success: false,
      status: 500,
      error: error.message,
      message: `Direct API error: ${error.message}`
    };
  }
}

/**
 * Send SMS - main function with fallback logic
 */
async function sendSMS(phone, message) {
  try {
    console.log(`[SMS] Sending to ${phone}: ${message.substring(0, 50)}...`);

    // Try gateway first if enabled
    if (USE_GATEWAY) {
      const gatewayResult = await sendViaGateway(phone, message);
      if (gatewayResult && gatewayResult.success) {
        return gatewayResult;
      }
    }

    // Fallback to direct API
    console.log('[SMS] Using direct API fallback');
    return await sendViaDirectAPI(phone, message);

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

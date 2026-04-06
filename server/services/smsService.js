/**
 * SMS Service for Node.js Backend
 * Using SMSONLINEGH API for SMS delivery
 */

const axios = require('axios');

const SMS_API_KEY = process.env.SMS_API_KEY || 'c6f61e914257462812deaff55c412a213cbf61a6388761016a1b2263d347948b';
const SMS_SENDER_ID = process.env.SMS_SENDER_ID || 'ReekTickets';
const SMS_HOST = process.env.SMS_HOST || 'api.smsonlinegh.com';

// Use the public Render SMS gateway by default in production.
// If Vercel has SMS_GATEWAY_URL configured, it will override this.
const SMS_GATEWAY_URL = process.env.SMS_GATEWAY_URL || 'https://reektickets.onrender.com';
const USE_GATEWAY = process.env.USE_SMS_GATEWAY !== 'false';

function formatPhone(phone) {
  let cleanPhone = phone.replace(/\s+/g, '').replace(/^\+/, '');
  if (cleanPhone.startsWith('0')) {
    cleanPhone = '233' + cleanPhone.substring(1);
  } else if (!cleanPhone.startsWith('233')) {
    cleanPhone = '233' + cleanPhone;
  }
  return cleanPhone;
}

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
    }

    console.error('[SMS] Gateway returned non-success', response.data);
    return null;
  } catch (error) {
    console.error('[SMS] Gateway failed:', error.message);
    return null;
  }
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

    const response = await axios.get(url, {
      timeout: 20000,
      headers: {
        'User-Agent': 'ReekTickets-SMS/1.0',
        'Accept': 'application/json'
      },
      validateStatus: () => true
    });

    console.log(`[SMS] SMSONLINEGH response status: ${response.status}`);
    console.log(`[SMS] SMSONLINEGH response data:`, JSON.stringify(response.data).substring(0, 200));

    if (response.status === 200) {
      return {
        success: true,
        status: 200,
        data: response.data,
        message: `SMS sent successfully to ${cleanPhone}`
      };
    }

    return {
      success: false,
      status: response.status,
      error: `SMSONLINEGH response ${response.status}`,
      message: 'Failed to send SMS via SMSONLINEGH'
    };
  } catch (error) {
    console.error('[SMS] SMSONLINEGH error:', error.message);
    let errorMsg = error.message;
    if (error.response) {
      errorMsg = `HTTP ${error.response.status}: ${error.response.statusText}`;
    }
    return {
      success: false,
      status: 500,
      error: errorMsg,
      message: `SMSONLINEGH API error: ${errorMsg}`
    };
  }
}

async function sendSMS(phone, message) {
  try {
    console.log(`[SMS] Sending to ${phone}: ${message.substring(0, 50)}...`);

    if (USE_GATEWAY) {
      const gatewayResult = await sendViaGateway(phone, message);
      if (gatewayResult && gatewayResult.success) {
        return gatewayResult;
      }
    }

    return await sendViaSmsonlinegh(phone, message);
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

async function sendOTP(phone, otp) {
  const message = `Your ReekTickets verification code is ${otp}`;
  return await sendSMS(phone, message);
}

async function sendTicketConfirmation(phone, ticketDetails) {
  const message = `Your ReekTickets ticket is confirmed! Event: ${ticketDetails.eventName}, Date: ${ticketDetails.date}, Code: ${ticketDetails.code}`;
  return await sendSMS(phone, message);
}

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


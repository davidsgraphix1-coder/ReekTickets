/**
 * SMS Service for Node.js Backend
 * Sends SMS via direct API or Python backend
 */

const https = require('https');
const http = require('http');

const SMS_API_HOST = process.env.SMS_API_HOST || 'api.smsonlinegh.com';
const SMS_API_KEY = process.env.SMS_API_KEY || process.env.API_KEY;
const SMS_SENDER_ID = process.env.SMS_SENDER_ID || process.env.SENDER_ID || 'ReekTickets';

/**
 * Send SMS via direct HTTP GET to SMS API
 */
async function sendSMSDirectAPI(phone, message) {
  return new Promise((resolve, reject) => {
    try {
      if (!SMS_API_KEY) {
        throw new Error('SMS_API_KEY not configured');
      }

      const queryString = new URLSearchParams({
        apikey: SMS_API_KEY,
        sender: SMS_SENDER_ID,
        message: message,
        recipients: phone
      }).toString();

      const urlStr = `https://${SMS_API_HOST}/sms/send/?${queryString}`;
      const url = new URL(urlStr);

      console.log(`[SMS] Sending to ${phone} via direct API`);

      const options = {
        hostname: url.hostname,
        port: 443,
        path: url.pathname + url.search,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      };

      const req = https.request(options, (res) => {
        let body = '';
        res.on('data', (chunk) => { body += chunk; });
        res.on('end', () => {
          try {
            const parsed = JSON.parse(body);
            const success = res.statusCode === 200;
            console.log(`[SMS] Response ${res.statusCode}:`, parsed);
            
            resolve({
              success: success,
              status: res.statusCode,
              data: parsed,
              message: success ? 'SMS sent successfully' : `Failed with status ${res.statusCode}`
            });
          } catch {
            const success = res.statusCode === 200;
            resolve({
              success: success,
              status: res.statusCode,
              data: body,
              message: success ? 'SMS sent successfully' : `Failed with status ${res.statusCode}`
            });
          }
        });
      });

      req.on('error', (error) => {
        console.error('[SMS] API Error:', error.message);
        resolve({
          success: false,
          status: 500,
          error: error.message,
          message: `Failed to send SMS: ${error.message}`
        });
      });

      req.setTimeout(10000, () => {
        req.destroy();
        resolve({
          success: false,
          status: 504,
          error: 'Request timeout',
          message: 'SMS request timed out'
        });
      });

      req.end();
    } catch (error) {
      console.error('[SMS] Error:', error.message);
      resolve({
        success: false,
        status: 500,
        error: error.message,
        message: `Failed to send SMS: ${error.message}`
      });
    }
  });
}

/**
 * Send SMS
 */
async function sendSMS(phone, message) {
  try {
    if (!phone || !message) {
      throw new Error('Phone and message are required');
    }

    const cleanPhone = phone.replace(/\s/g, '');
    if (!/^0\d{9}$/.test(cleanPhone) && !/^2[0-9]{8}$/.test(cleanPhone)) {
      throw new Error('Invalid phone format. Use format like 0273476701');
    }

    return await sendSMSDirectAPI(cleanPhone, message);

  } catch (error) {
    console.error('[SMS] sendSMS Error:', error.message);
    return {
      success: false,
      status: 500,
      error: error.message,
      message: `Failed to send SMS: ${error.message}`
    };
  }
}

/**
 * Send OTP
 */
async function sendOTP(phone, otp) {
  const message = `Your ReekTickets OTP is: ${otp}. Valid for 5 minutes.`;
  return sendSMS(phone, message);
}

/**
 * Send ticket confirmation SMS
 */
async function sendTicketConfirmation(phone, ticketCode) {
  const ticketLink = `${process.env.REACT_APP_URL || 'https://reetickets.com'}/ticket/${ticketCode}`;
  const message = `Your ReekTickets ticket code: ${ticketCode}. View: ${ticketLink}`;
  return sendSMS(phone, message);
}

/**
 * Send booking confirmation SMS
 */
async function sendBookingConfirmation(phone, eventName, ticketCode) {
  const message = `Booking confirmed for ${eventName}. Ticket: ${ticketCode}. Visit reetickets.com for details.`;
  return sendSMS(phone, message);
}

/**
 * Health check
 */
async function healthCheck() {
  if (!SMS_API_KEY) {
    return {
      status: 'unconfigured',
      error: 'SMS_API_KEY not configured',
      configured: false
    };
  }

  return {
    status: 'healthy',
    host: SMS_API_HOST,
    sender_id: SMS_SENDER_ID,
    configured: true
  };
}

module.exports = {
  sendSMS,
  sendOTP,
  sendTicketConfirmation,
  sendBookingConfirmation,
  healthCheck
};

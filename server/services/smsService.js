/**
 * SMS Service for Node.js Backend
 * Sends SMS via Python handler (SMSONLINEGH API)
 */

const { spawn } = require('child_process');
const path = require('path');

const SMS_API_HOST = process.env.SMS_API_HOST || 'api.smsonlinegh.com';
const SMS_API_KEY = process.env.SMS_API_KEY || process.env.API_KEY || 'c6f61e914257462812deaff55c412a213cbf61a6388761016a1b2263d347948b';
const SMS_SENDER_ID = process.env.SMS_SENDER_ID || process.env.SENDER_ID || 'ReekTickets';

/**
 * Send SMS via Python handler
 */
async function sendSMSViaPython(phone, message) {
  return new Promise((resolve) => {
    try {
      const pythonScript = path.join(__dirname, '..', 'sms_handler.py');
      const python = spawn('python3', [pythonScript]);
      
      let output = '';
      let errorOutput = '';
      
      python.stdout.on('data', (data) => {
        output += data.toString();
      });
      
      python.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });
      
      python.on('close', (code) => {
        try {
          if (errorOutput) {
            console.error('[SMS] Python stderr:', errorOutput);
          }
          
          const result = JSON.parse(output);
          console.log(`[SMS] Python result: ${result.success ? 'SUCCESS' : 'FAILED'}`, result.message);
          resolve(result);
        } catch (parseError) {
          console.error('[SMS] Failed to parse Python output:', output, parseError);
          resolve({
            success: false,
            status: 500,
            error: 'Failed to parse SMS handler response',
            message: 'SMS handler error'
          });
        }
      });
      
      python.on('error', (error) => {
        console.error('[SMS] Python process error:', error.message);
        resolve({
          success: false,
          status: 500,
          error: error.message,
          message: `SMS handler error: ${error.message}`
        });
      });
      
      // Send input to Python script
      const inputData = JSON.stringify({ phone, message });
      python.stdin.write(inputData);
      python.stdin.end();
      
      // Timeout after 15 seconds
      setTimeout(() => {
        python.kill();
        resolve({
          success: false,
          status: 504,
          error: 'SMS handler timeout',
          message: 'SMS request timed out'
        });
      }, 15000);
      
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
 * Fallback: Send SMS via direct API (if Python not available)
 */
async function sendSMSDirectAPI(phone, message) {
  return new Promise((resolve) => {
    try {
      const https = require('https');
      
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

      console.log(`[SMS] Sending to ${phone} via direct API (fallback)`);

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
            console.log(`[SMS] Direct API Response ${res.statusCode}:`, parsed);
            
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
      console.error('[SMS] Fallback Error:', error.message);
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

    // Try Python handler first
    console.log('[SMS] Attempting to send via Python handler...');
    let result = await sendSMSViaPython(phone, message);
    
    if (!result.success) {
      console.warn('[SMS] Python handler failed, trying direct API fallback...');
      result = await sendSMSDirectAPI(phone, message);
    }
    
    return result;

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
  const ticketLink = `${process.env.REACT_APP_URL || 'https://reektickets.com'}/ticket/${ticketCode}`;
  const message = `Your ReekTickets ticket code: ${ticketCode}. View: ${ticketLink}`;
  return sendSMS(phone, message);
}

/**
 * Send booking confirmation SMS
 */
async function sendBookingConfirmation(phone, eventName, ticketCode) {
  const message = `Booking confirmed for ${eventName}. Ticket: ${ticketCode}. Visit reektickets.com for details.`;
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

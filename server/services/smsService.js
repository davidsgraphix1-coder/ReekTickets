/**
 * SMS Service for Node.js Backend
 * Sends SMS via Python handler (local) or HTTP Gateway (Vercel)
 */

const axios = require('axios');
const { spawn } = require('child_process');
const path = require('path');

const SMS_API_KEY = process.env.SMS_API_KEY || process.env.API_KEY || 'c6f61e914257462812deaff55c412a213cbf61a6388761016a1b2263d347948b';
const SMS_SENDER_ID = process.env.SMS_SENDER_ID || process.env.SENDER_ID || 'ReekTickets';
const PYTHON_HANDLER = path.join(__dirname, '..', 'sms_handler.py');
const IS_VERCEL = !!process.env.VERCEL || !!process.env.VERCEL_ENV;
const SMS_GATEWAY_URL = process.env.SMS_GATEWAY_URL || 'http://localhost:8001';

/**
 * Send SMS via HTTP Gateway (for Vercel/serverless)
 */
async function sendViaGateway(phone, message) {
  try {
    console.log(`[SMS] Using HTTP gateway: ${SMS_GATEWAY_URL}`);
    
    const response = await axios.post(`${SMS_GATEWAY_URL}/send-sms`, {
      phone,
      message
    }, {
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('[SMS] Gateway error:', error.message);
    return {
      success: false,
      status: 500,
      error: error.message,
      message: 'SMS gateway unavailable'
    };
  }
}

/**
 * Send SMS via Python handler (spawn - local development only)
 */
function sendViaPython(phone, message) {
  return new Promise((resolve) => {
    try {
      console.log(`[SMS] Using Python handler locally`);
      
      const handler = spawn('python3', [PYTHON_HANDLER], {
        stdio: ['pipe', 'pipe', 'pipe'],
        timeout: 15000
      });

      let stdout = '';
      let stderr = '';

      handler.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      handler.stderr.on('data', (data) => {
        stderr += data.toString();
        console.log(`[SMS] Python stderr: ${data}`);
      });

      handler.on('close', (code) => {
        console.log(`[SMS] Handler exit code: ${code}`);

        if (code === 0 && stdout) {
          try {
            const result = JSON.parse(stdout);
            if (result.success) {
              console.log(`[SMS] Success: ${phone}`);
              resolve(result);
            } else {
              console.error(`[SMS] Handler returned failure: ${result.message}`);
              resolve(result);
            }
          } catch (e) {
            console.error(`[SMS] Failed to parse handler output: ${stdout}`);
            resolve({
              success: false,
              status: 500,
              error: 'Invalid response format',
              message: 'SMS handler returned invalid JSON'
            });
          }
        } else {
          console.error(`[SMS] Handler failed with code ${code}`);
          resolve({
            success: false,
            status: 500,
            error: stderr || 'Handler process failed',
            message: 'SMS handler process failed'
          });
        }
      });

      handler.on('error', (err) => {
        console.error(`[SMS] Failed to spawn handler: ${err.message}`);
        resolve({
          success: false,
          status: 500,
          error: err.message,
          message: 'Failed to spawn SMS handler'
        });
      });

      setTimeout(() => {
        try {
          handler.kill('SIGTERM');
        } catch (e) {
          console.error(`[SMS] Failed to kill handler: ${e.message}`);
        }
      }, 15000);

      const input = JSON.stringify({ phone, message });
      handler.stdin.write(input);
      handler.stdin.end();

    } catch (error) {
      console.error('[SMS] Error in sendViaPython:', error.message);
      resolve({
        success: false,
        status: 500,
        error: error.message,
        message: 'Error in sendViaPython'
      });
    }
  });
}

/**
 * Send SMS - main function that routes to appropriate handler
 */
async function sendSMS(phone, message) {
  try {
    console.log(`[SMS] Sending to ${phone}: ${message.substring(0, 50)}...`);
    console.log(`[SMS] Environment: ${IS_VERCEL ? 'Vercel' : 'Local'}`);

    // Clean phone number
    let cleanPhone = phone.replace(/\s+/g, '').replace(/^\+/, '');

    // Convert to international format if local format
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '233' + cleanPhone.substring(1);
    } else if (!cleanPhone.startsWith('233')) {
      cleanPhone = '233' + cleanPhone;
    }

    // Route based on environment
    if (IS_VERCEL) {
      console.log('[SMS] Using gateway for Vercel');
      return await sendViaGateway(cleanPhone, message);
    } else {
      console.log('[SMS] Using Python handler for local development');
      return await sendViaPython(cleanPhone, message);
    }

  } catch (error) {
    console.error('[SMS] Error in sendSMS:', error.message);
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

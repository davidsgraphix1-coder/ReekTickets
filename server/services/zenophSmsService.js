/**
 * SMS Service using Zenoph SDK (Python)
 * This wraps the Zenoph.Notify SDK for reliable SMS delivery via SMSONLINEGH
 */

const { spawn } = require('child_process');
const path = require('path');

const SMS_API_KEY = process.env.SMS_API_KEY;
const SMS_SENDER_ID = process.env.SMS_SENDER_ID || 'ReekTickets';
const ZENOPH_PYTHON_PATH = '/home/dosei1213/zenoph.notify-2.23.10-python';

console.log('[Zenoph SMS] Service initialized');
console.log('[Zenoph SMS] - API_KEY:', SMS_API_KEY ? `SET (${SMS_API_KEY.substring(0, 8)}...)` : 'NOT SET');
console.log('[Zenoph SMS] - SENDER_ID:', SMS_SENDER_ID);
console.log('[Zenoph SMS] - Python path:', ZENOPH_PYTHON_PATH);
console.log('[Zenoph SMS] - Env SMS_SENDER_ID:', process.env.SMS_SENDER_ID);

function formatPhone(phone) {
  let cleanPhone = phone.replace(/\s+/g, '').replace(/^\+/, '');
  if (cleanPhone.startsWith('0')) {
    cleanPhone = '233' + cleanPhone.substring(1);
  } else if (!cleanPhone.startsWith('233')) {
    cleanPhone = '233' + cleanPhone;
  }
  return cleanPhone;
}

function sendSmsViaPython(apiKey, senderId, phone, message) {
  return new Promise((resolve, reject) => {
    const pythonScript = path.join(ZENOPH_PYTHON_PATH, 'zenoph_sms_wrapper.py');
    const pythonPath = path.join(ZENOPH_PYTHON_PATH, '.venv/bin/python3');
    
    console.log('[Zenoph SMS] Spawning Python process...');
    console.log('[Zenoph SMS] Script:', pythonScript);
    console.log('[Zenoph SMS] Python:', pythonPath);
    console.log('[Zenoph SMS] Working dir:', ZENOPH_PYTHON_PATH);
    
    const python = spawn(pythonPath, [pythonScript, apiKey, senderId, phone, message], {
      cwd: ZENOPH_PYTHON_PATH,
      env: {
        ...process.env,
        PYTHONPATH: ZENOPH_PYTHON_PATH
      },
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let stdout = '';
    let stderr = '';

    python.stdout.on('data', (data) => {
      const chunk = data.toString();
      console.log('[Zenoph SMS] stdout chunk:', chunk);
      stdout += chunk;
    });

    python.stderr.on('data', (data) => {
      const chunk = data.toString();
      console.error('[Zenoph SMS] stderr chunk:', chunk);
      stderr += chunk;
    });

    python.on('close', (code) => {
      console.log('[Zenoph SMS] Python process exit code:', code);
      console.log('[Zenoph SMS] Full stdout:', stdout);
      console.log('[Zenoph SMS] Full stderr:', stderr);

      if (code !== 0) {
        console.error('[Zenoph SMS] Python script failed with code', code);
        return reject(new Error(`Python script failed with code ${code}: ${stderr}`));
      }

      try {
        // Extract JSON from stdout (ignore any debug output before it)
        const jsonMatch = stdout.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error(`No JSON found in output: ${stdout}`);
        }
        const result = JSON.parse(jsonMatch[0]);
        console.log('[Zenoph SMS] Parsed result:', result);
        resolve(result);
      } catch (e) {
        console.error('[Zenoph SMS] Failed to parse Python output:', e.message);
        reject(new Error(`Failed to parse SMS response: ${e.message}`));
      }
    });

    python.on('error', (err) => {
      console.error('[Zenoph SMS] Failed to spawn Python process:', err);
      reject(err);
    });
  });
}

async function sendSMS(phone, message) {
  try {
    const cleanPhone = formatPhone(phone);
    
    if (!SMS_API_KEY) {
      console.error('[Zenoph SMS] ERROR: SMS_API_KEY not configured');
      return {
        success: false,
        error: 'SMS_API_KEY not configured',
        message: 'SMS service configuration error'
      };
    }

    console.log(`[Zenoph SMS] Sending to ${cleanPhone}: ${message.substring(0, 50)}...`);
    
    const result = await sendSmsViaPython(SMS_API_KEY, SMS_SENDER_ID, cleanPhone, message);
    
    console.log('[Zenoph SMS] Send result:', result);
    return {
      success: result.success === true || result.status === 200,
      data: result,
      message: result.success ? `SMS sent successfully to ${cleanPhone}` : result.message
    };
  } catch (error) {
    console.error('[Zenoph SMS] Error:', error.message);
    return {
      success: false,
      error: error.message,
      message: 'SMS sending failed'
    };
  }
}

async function sendOTP(phone, otp) {
  const message = `Your ReekTickets verification code is ${otp}. It expires in 10 minutes.`;
  console.log(`[Zenoph OTP] Sending OTP to ${phone}: "${message}"`);
  const result = await sendSMS(phone, message);
  console.log(`[Zenoph OTP] Result:`, JSON.stringify(result));
  return result;
}

async function sendTicketConfirmation(phone, ticketDetails) {
  const message = `Your ReekTickets ticket is confirmed! Event: ${ticketDetails.eventName}, Date: ${ticketDetails.date}, Code: ${ticketDetails.code}`;
  return await sendSMS(phone, message);
}

module.exports = {
  sendSMS,
  sendOTP,
  sendTicketConfirmation
};

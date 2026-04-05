#!/usr/bin/env node

/**
 * SMS Gateway Server
 * Runs as a standalone service that handles SMS sending
 * Communicates with the SMS Handler via child_process.spawn
 * Exposes HTTP endpoints for SMS sending
 */

const express = require('express');
const { spawn } = require('child_process');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.SMS_GATEWAY_PORT || 8001;
const PYTHON_HANDLER = path.join(__dirname, 'sms_handler.py');

app.use(express.json());

/**
 * Send SMS via Python handler
 */
function sendViaPython(phone, message) {
  return new Promise((resolve) => {
    try {
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
      });

      handler.on('close', (code) => {
        if (code === 0 && stdout) {
          try {
            const result = JSON.parse(stdout);
            resolve(result);
          } catch (e) {
            resolve({
              success: false,
              status: 500,
              error: 'Invalid response format',
              message: 'SMS handler returned invalid JSON'
            });
          }
        } else {
          resolve({
            success: false,
            status: 500,
            error: stderr || 'Handler failed',
            message: 'SMS handler process failed'
          });
        }
      });

      handler.on('error', (err) => {
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
        } catch (e) {}
      }, 15000);

      const input = JSON.stringify({ phone, message });
      handler.stdin.write(input);
      handler.stdin.end();

    } catch (error) {
      resolve({
        success: false,
        status: 500,
        error: error.message,
        message: 'Error in SMS gateway'
      });
    }
  });
}

/**
 * POST /send-sms
 * Send SMS
 */
app.post('/send-sms', async (req, res) => {
  try {
    const { phone, message } = req.body;

    if (!phone || !message) {
      return res.status(400).json({
        success: false,
        error: 'phone and message are required'
      });
    }

    console.log(`[GATEWAY] Sending SMS to ${phone}`);
    const result = await sendViaPython(phone, message);
    
    res.json(result);
  } catch (error) {
    console.error('[GATEWAY] Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /send-otp
 * Send OTP SMS
 */
app.post('/send-otp', async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({
        success: false,
        error: 'phone and otp are required'
      });
    }

    const message = `Your ReekTickets verification code is ${otp}`;
    console.log(`[GATEWAY] Sending OTP to ${phone}`);
    const result = await sendViaPython(phone, message);
    
    res.json(result);
  } catch (error) {
    console.error('[GATEWAY] Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Health check
 */
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'sms-gateway' });
});

app.listen(PORT, () => {
  console.log(`[SMS Gateway] Server running on port ${PORT}`);
  console.log(`[SMS Gateway] Python handler: ${PYTHON_HANDLER}`);
});

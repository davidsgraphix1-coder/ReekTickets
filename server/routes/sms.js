const express = require('express');
const { sendSMS, sendOTP, sendTicketConfirmation } = require('../services/zenophSmsService');

const router = express.Router();

/**
 * POST /api/sms/send
 * Send SMS to a phone number
 */
router.post('/send', async (req, res) => {
  try {
    const { phone, message } = req.body;

    console.log('[SMS Route] /send endpoint called with:', { phone, messageLength: message?.length });

    if (!phone || !message) {
      console.log('[SMS Route] Missing required fields');
      return res.status(400).json({
        success: false,
        error: 'phone and message are required'
      });
    }

    const response = await sendSMS(phone, message);
    console.log('[SMS Route] sendSMS response:', response);

    if (response.success) {
      return res.status(200).json(response);
    } else {
      return res.status(500).json(response);
    }
  } catch (error) {
    console.error('[SMS Route] /send error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to send SMS'
    });
  }
});

/**
 * POST /api/sms/send-otp
 * Send OTP to a phone number
 */
router.post('/send-otp', async (req, res) => {
  try {
    const { phone, otp } = req.body;

    console.log('[SMS Route] /send-otp endpoint called with:', { phone });

    if (!phone || !otp) {
      console.log('[SMS Route] Missing required fields for OTP');
      return res.status(400).json({
        success: false,
        error: 'phone and otp are required'
      });
    }

    const response = await sendOTP(phone, otp);
    console.log('[SMS Route] sendOTP response:', response);

    if (response.success) {
      return res.status(200).json(response);
    } else {
      return res.status(500).json(response);
    }
  } catch (error) {
    console.error('[SMS Route] /send-otp error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to send OTP'
    });
  }
});

/**
 * POST /api/sms/send-ticket
 * Send ticket confirmation SMS
 */
router.post('/send-ticket', async (req, res) => {
  try {
    const { phone, ticketCode } = req.body;

    if (!phone || !ticketCode) {
      return res.status(400).json({
        success: false,
        error: 'phone and ticketCode are required'
      });
    }

    const response = await sendTicketConfirmation(phone, ticketCode);

    if (response.success) {
      return res.status(200).json(response);
    } else {
      return res.status(500).json(response);
    }
  } catch (error) {
    console.error('[SMS Route] /send-ticket error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to send ticket SMS'
    });
  }
});

/**
 * POST /api/sms/test
 * Test SMS endpoint - sends a test message
 */
router.post('/test', async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({
        success: false,
        error: 'phone is required'
      });
    }

    console.log('[SMS Route] Test endpoint called for:', phone);
    const testMessage = `Test SMS from ReekTickets. Timestamp: ${new Date().toISOString()}`;
    const response = await sendSMS(phone, testMessage);

    console.log('[SMS Route] Test response:', response);
    return res.status(response.success ? 200 : 500).json(response);
  } catch (error) {
    console.error('[SMS Route] Test error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Test SMS failed'
    });
  }
});

/**
 * GET /api/sms/health
 * Health check for SMS service
 */
router.get('/health', async (req, res) => {
  try {
    // Simple health check - Zenoph SDK is available
    return res.status(200).json({
      status: 'healthy',
      service: 'Zenoph SMS',
      message: 'SMS service is operational'
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message
    });
  }
});

module.exports = router;


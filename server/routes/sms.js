const express = require('express');
const { sendSMS, sendOTP, sendTicketConfirmation, healthCheck } = require('../services/smsService');

const router = express.Router();

/**
 * POST /api/sms/send
 * Send SMS to a phone number
 */
router.post('/send', async (req, res) => {
  try {
    const { phone, message } = req.body;

    if (!phone || !message) {
      return res.status(400).json({
        success: false,
        error: 'phone and message are required'
      });
    }

    const response = await sendSMS(phone, message);

    if (response.success) {
      return res.status(200).json(response);
    } else {
      return res.status(500).json(response);
    }
  } catch (error) {
    console.error('SMS send error:', error);
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

    if (!phone || !otp) {
      return res.status(400).json({
        success: false,
        error: 'phone and otp are required'
      });
    }

    const response = await sendOTP(phone, otp);

    if (response.success) {
      return res.status(200).json(response);
    } else {
      return res.status(500).json(response);
    }
  } catch (error) {
    console.error('OTP send error:', error);
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
    console.error('Ticket SMS error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to send ticket SMS'
    });
  }
});

/**
 * GET /api/sms/health
 * Health check for SMS service
 */
router.get('/health', async (req, res) => {
  try {
    const health = await healthCheck();
    
    if (health.status === 'healthy') {
      return res.status(200).json(health);
    } else {
      return res.status(503).json(health);
    }
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message
    });
  }
});

module.exports = router;

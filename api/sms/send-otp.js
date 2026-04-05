// SMS OTP endpoint for Vercel serverless
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({
        success: false,
        error: 'phone and otp are required'
      });
    }

    // For now, just log the OTP (in production, integrate with SMS service)
    console.log(`SMS OTP for ${phone}: ${otp}`);

    // Simulate SMS sending
    const success = Math.random() > 0.1; // 90% success rate for testing

    if (success) {
      res.status(200).json({
        success: true,
        message: `OTP sent to ${phone}`,
        otp: otp // Include for testing
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'SMS service temporarily unavailable',
        message: 'Failed to send OTP'
      });
    }

  } catch (error) {
    console.error('SMS OTP error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to send OTP'
    });
  }
}
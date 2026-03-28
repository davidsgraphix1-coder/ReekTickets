require('dotenv').config();

async function testSMSAPI() {
  try {
    const testPhone = '+233501234567'; // Test Ghana number
    const testMessage = 'ReekTickets Test: This is a test SMS from your ticketing platform. Code: 123456';

    console.log('Testing Africa\'s Talking SMS API...');
    console.log('Phone:', testPhone);
    console.log('Message:', testMessage);
    console.log('API Key configured:', !!process.env.AFRICASTALKING_API_KEY);
    console.log('Username configured:', !!process.env.AFRICASTALKING_USERNAME);

    if (!process.env.AFRICASTALKING_API_KEY || !process.env.AFRICASTALKING_USERNAME) {
      console.log('❌ AFRICASTALKING_API_KEY or AFRICASTALKING_USERNAME not found in environment variables');
      return;
    }

    console.log('Sending SMS via Africa\'s Talking...');

    const params = new URLSearchParams({
      username: process.env.AFRICASTALKING_USERNAME,
      to: testPhone,
      message: testMessage,
      from: 'ReekTickets'
    });

    const response = await fetch('https://api.africastalking.com/version1/messaging', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'apiKey': process.env.AFRICASTALKING_API_KEY,
      },
      body: params.toString(),
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    let result;
    try {
      result = await response.json();
      console.log('Response body:', JSON.stringify(result, null, 2));
    } catch (parseError) {
      const textResult = await response.text();
      console.log('Response text:', textResult);
      result = { error: 'Failed to parse JSON', text: textResult };
    }

    if (response.ok && result.SMSMessageData) {
      console.log('✅ SMS sent successfully!');
      console.log('Recipients:', result.SMSMessageData.Recipients);
    } else {
      console.log('❌ SMS failed:', result.message || result.error || result.text || 'Unknown error');
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

testSMSAPI();
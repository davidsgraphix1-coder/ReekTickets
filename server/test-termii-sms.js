require('dotenv').config();

async function testTermiiSMS() {
  try {
    const testPhone = '+233501234567'; // Test Ghana number
    const testMessage = 'ReekTickets Test: Your ticket code is 123456. Use this link to view your ticket and QR: http://localhost:3000/ticket/test?code=123456';

    console.log('Testing Termii SMS API...');
    console.log('API Key configured:', !!process.env.TERMII_API_KEY);
    console.log('Phone:', testPhone);
    console.log('Message:', testMessage);

    if (!process.env.TERMII_API_KEY) {
      console.log('❌ Missing Termii API key');
      return;
    }

    console.log('\nSending SMS via Termii...');
    const response = await fetch('https://api.ng.termii.com/api/sms/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: testPhone,
        from: 'ReekTickets',
        sms: testMessage,
        channel: 'generic',
        api_key: process.env.TERMII_API_KEY,
        type: 'plain',
      }),
    });

    const text = await response.text();
    console.log('Response status:', response.status);
    console.log('Response text:', text);
    
    let result;
    try {
      result = JSON.parse(text);
      console.log('Response body:', JSON.stringify(result, null, 2));
    } catch (e) {
      console.log('Note: Response was not JSON');
      result = { text };
    }

    if (response.ok || result.code === 'success') {
      console.log('✅ SMS sent successfully!');
    } else {
      console.log('❌ SMS failed:', result);
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

testTermiiSMS();
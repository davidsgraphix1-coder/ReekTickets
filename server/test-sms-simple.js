require('dotenv').config();

async function testSMSAPI() {
  try {
    const testPhone = '+233501234567'; // Test Ghana number
    const testMessage = 'ReekTickets Test: This is a test SMS from your ticketing platform. Code: 123456';

    console.log('Testing textverified SMS API...');
    console.log('Phone:', testPhone);
    console.log('Message:', testMessage);
    console.log('API Key configured:', !!process.env.TEXTVERIFIED_API_KEY);
    console.log('API Key starts with:', process.env.TEXTVERIFIED_API_KEY?.substring(0, 10) + '...');

    if (!process.env.TEXTVERIFIED_API_KEY) {
      console.log('❌ TEXTVERIFIED_API_KEY not found in environment variables');
      return;
    }

    console.log('Sending SMS via textverified...');

    const requestBody = {
      to: testPhone,
      message: testMessage,
      from: process.env.TEXTVERIFIED_SENDER || 'ReekTickets',
      type: 'text',
    };

    console.log('Request body:', JSON.stringify(requestBody, null, 2));

    const response = await fetch('https://backend.textverified.com/v2/verification/sms/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.TEXTVERIFIED_API_KEY}`,
      },
      body: JSON.stringify(requestBody),
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

    if (response.ok && result.success !== false) {
      console.log('✅ SMS sent successfully!');
    } else {
      console.log('❌ SMS failed:', result.message || result.error || result.text || 'Unknown error');
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    console.error('Error details:', error);
  }
}

testSMSAPI();
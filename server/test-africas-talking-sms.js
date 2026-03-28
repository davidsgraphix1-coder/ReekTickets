require('dotenv').config();

async function testAfricasTalkingSMS() {
  try {
    const testPhone = '+233501234567'; // Test Ghana number
    const testMessage = 'ReekTickets Test: Your ticket code is 123456. Use this link to view your ticket and QR: http://localhost:3000/ticket/test?code=123456';

    console.log('Testing Africa\'s Talking SMS API...');
    console.log('Username:', process.env.AFRICASTALKING_USERNAME);
    console.log('API Key configured:', !!process.env.AFRICASTALKING_API_KEY);
    console.log('Phone:', testPhone);
    console.log('Message:', testMessage);

    if (!process.env.AFRICASTALKING_API_KEY || !process.env.AFRICASTALKING_USERNAME) {
      console.log('❌ Missing Africa\'s Talking credentials');
      return;
    }

    const params = new URLSearchParams({
      username: process.env.AFRICASTALKING_USERNAME,
      to: testPhone,
      message: testMessage,
      from: 'ReekTickets'
    });

    console.log('\nSending SMS via Africa\'s Talking...');
    console.log('Request params:', params.toString());
    
    const response = await fetch('https://api.africastalking.com/version1/messaging', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
        'X-API-Key': process.env.AFRICASTALKING_API_KEY,
      },
      body: params.toString(),
    });

    const text = await response.text();
    console.log('Response status:', response.status);
    console.log('Response text:', text);
    
    let result;
    try {
      result = JSON.parse(text);
    } catch (e) {
      console.log('Note: Response was not JSON');
      result = { text };
    }

    if (response.ok || (result.SMSMessageData && result.SMSMessageData.Recipients)) {
      console.log('✅ SMS sent successfully!');
      if (result.SMSMessageData?.Recipients) {
        result.SMSMessageData.Recipients.forEach(r => {
          console.log(`   → ${r.number}: ${r.status}`);
        });
      }
    } else {
      console.log('❌ SMS failed:', result);
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

testAfricasTalkingSMS();
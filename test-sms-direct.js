#!/usr/bin/env node

// Simple SMS Test Script for ReekTickets
// Tests the SMS functionality directly

const BACKEND_URL = process.env.REACT_APP_SMS_BACKEND_URL || 'https://web-production-944d5.up.railway.app';

async function testSMS() {
  console.log('🧪 Testing ReekTickets SMS System');
  console.log('==================================');
  console.log(`Backend URL: ${BACKEND_URL}`);
  console.log('');

  // Test 1: Health Check
  console.log('1. Testing Health Check...');
  try {
    const healthResponse = await fetch(`${BACKEND_URL}/api/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health check response:', healthData);
  } catch (error) {
    console.log('❌ Health check failed:', error.message);
  }

  console.log('');

  // Test 2: Send SMS
  console.log('2. Testing SMS Send...');
  try {
    const smsResponse = await fetch(`${BACKEND_URL}/api/send-sms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phone: '0273476701',
        message: 'Test SMS from ReekTickets - Direct API Test'
      })
    });

    const smsData = await smsResponse.json();
    console.log('📱 SMS Response:', smsData);

    if (smsData.success) {
      console.log('✅ SMS sent successfully!');
    } else {
      console.log('❌ SMS failed:', smsData.message);
    }
  } catch (error) {
    console.log('❌ SMS request failed:', error.message);
  }

  console.log('');
  console.log('3. Testing Ticket SMS Format...');
  try {
    const ticketResponse = await fetch(`${BACKEND_URL}/api/send-sms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phone: '0273476701',
        ticket: {
          smsCode: 'ABC123',
          reference: 'TICKET-001',
          event: {
            title: 'Test Event',
            location: 'Test Venue',
            date: '2026-05-01'
          }
        },
        ticketLink: 'https://reektickets.com/ticket/ABC123?code=ABC123'
      })
    });

    const ticketData = await ticketResponse.json();
    console.log('🎫 Ticket SMS Response:', ticketData);

    if (ticketData.success) {
      console.log('✅ Ticket SMS sent successfully!');
    } else {
      console.log('❌ Ticket SMS failed:', ticketData.message);
    }
  } catch (error) {
    console.log('❌ Ticket SMS request failed:', error.message);
  }

  console.log('');
  console.log('==================================');
  console.log('🎉 SMS Testing Complete!');
  console.log('');
  console.log('💡 Tips:');
  console.log('   - Check Railway logs if SMS fails');
  console.log('   - Verify API_KEY and API_HOST in Railway env vars');
  console.log('   - Check SMS Online GH account for credits');
}

testSMS().catch(console.error);
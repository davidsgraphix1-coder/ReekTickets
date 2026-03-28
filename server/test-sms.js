const mongoose = require('mongoose');
const User = require('./models/User');
const Event = require('./models/Event');
const Ticket = require('./models/Ticket');
require('dotenv').config();

async function testSMS() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Create test user with phone number
    const testUser = await User.create({
      fullName: 'Test User',
      email: 'test@example.com',
      phone: '+233501234567', // Ghana test number
      password: 'testpass123',
      role: 'attendee'
    });
    console.log('Created test user:', testUser._id);

    // Create test event
    const testEvent = await Event.create({
      title: 'Test Event',
      description: 'Test event for SMS testing',
      date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      location: 'Test Venue',
      organizer: testUser._id,
      ticketTypes: [{ type: 'General', price: 50, quantity: 100 }]
    });
    console.log('Created test event:', testEvent._id);

    // Create test ticket
    const testTicket = await Ticket.create({
      user: testUser._id,
      event: testEvent._id,
      ticketType: 'General',
      price: 50,
      reference: 'TEST123',
      status: 'active'
    });
    console.log('Created test ticket:', testTicket._id);

    // Now test SMS sending
    const code = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    testTicket.smsCode = code;
    testTicket.smsCodeExpiry = expiresAt;
    await testTicket.save();

    const appUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    const accessLink = `${appUrl}/ticket/${testTicket._id}?code=${code}`;
    const message = `ReekTickets: Your ticket code is ${code}. Use this link to view your ticket and QR: ${accessLink}`;

    console.log('Sending SMS to:', testUser.phone);
    console.log('Message:', message);

    if (process.env.TEXTVERIFIED_API_KEY) {
      const fetch = require('node-fetch');
      const response = await fetch('https://api.textverified.com/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.TEXTVERIFIED_API_KEY}`,
        },
        body: JSON.stringify({
          to: testUser.phone,
          message,
          from: process.env.TEXTVERIFIED_SENDER || 'ReekTickets',
          type: 'text',
        }),
      });

      const result = await response.json();
      console.log('SMS API Response:', result);

      if (response.ok) {
        console.log('✅ SMS sent successfully!');
      } else {
        console.log('❌ SMS failed:', result);
      }
    } else {
      console.log('❌ TEXTVERIFIED_API_KEY not configured');
    }

    // Clean up test data
    await Ticket.deleteOne({ _id: testTicket._id });
    await Event.deleteOne({ _id: testEvent._id });
    await User.deleteOne({ _id: testUser._id });
    console.log('Cleaned up test data');

  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

testSMS();
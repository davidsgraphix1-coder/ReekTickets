#!/usr/bin/env node

// Local SMS Mock Server for Testing
// Simulates the Railway backend SMS functionality

const http = require('http');
const url = require('url');

const PORT = process.env.PORT || 5001;

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Health check endpoint
  if (pathname === '/api/health' && req.method === 'GET') {
    res.writeHead(200);
    res.end(JSON.stringify({
      status: 'healthy',
      service: 'SMS Backend (Local Mock)',
      host: 'api.smsonlinegh.com',
      sender_id: 'ReekTickets',
      version: '1.0.0',
      mode: 'mock'
    }));
    return;
  }

  // SMS send endpoints
  if ((pathname === '/api/send-sms' || pathname === '/api/sms/send' || pathname === '/sms/send') && req.method === 'POST') {
    let body = '';

    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        const { phone, message, ticket, ticketLink } = data;

        if (!phone || (!message && !ticket)) {
          res.writeHead(400);
          res.end(JSON.stringify({
            success: false,
            error: 'phone and message/ticket are required'
          }));
          return;
        }

        let finalMessage = message;
        if (ticket && !message) {
          // Format ticket message
          const eventTitle = ticket.event?.title || ticket.event?.name || 'Your Event';
          const eventDate = ticket.event?.date || ticket.date || '';
          const eventLocation = ticket.event?.location || ticket.location || 'Venue';
          const ticketCode = ticket.smsCode || ticket.code || ticket.reference;
          const link = ticketLink || 'https://reektickets.com/ticket';

          finalMessage = [
            'Thank you for using ReekTickets!',
            `Event: ${eventTitle}`,
            eventDate ? `Date: ${eventDate}` : null,
            `Location: ${eventLocation}`,
            `Ticket Code: ${ticketCode}`,
            `Access Code: ${ticketCode}`,
            `View your ticket: ${link}`,
            'Show this SMS at the gate for quick entry.'
          ].filter(Boolean).join('\n');
        }

        console.log(`\n📱 SMS Sent to: ${phone}`);
        console.log(`💬 Message:\n${finalMessage}\n`);

        res.writeHead(200);
        res.end(JSON.stringify({
          success: true,
          status: 200,
          message: 'SMS sent successfully',
          phone: phone,
          data: {
            timestamp: new Date().toISOString(),
            messageLength: finalMessage.length,
            mode: 'mock'
          }
        }));
      } catch (error) {
        res.writeHead(500);
        res.end(JSON.stringify({
          success: false,
          error: error.message,
          message: 'Failed to send SMS'
        }));
      }
    });
    return;
  }

  // Root endpoint
  if (pathname === '/' && req.method === 'GET') {
    res.writeHead(200);
    res.end(JSON.stringify({
      status: 'OK',
      message: 'ReekTickets SMS Backend is running (Mock Mode)',
      endpoints: [
        'GET /api/health',
        'POST /api/send-sms',
        'POST /api/sms/send'
      ]
    }));
    return;
  }

  // Not found
  res.writeHead(404);
  res.end(JSON.stringify({
    error: 'Not found',
    available_endpoints: [
      'GET /api/health',
      'POST /api/send-sms',
      'POST /api/sms/send'
    ]
  }));
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 ReekTickets SMS Backend (Mock) running on http://0.0.0.0:${PORT}`);
  console.log(`\n📋 Endpoints:`);
  console.log(`   GET  /api/health       - Check backend health`);
  console.log(`   POST /api/send-sms     - Send SMS`);
  console.log(`   POST /api/sms/send     - Send SMS (alias)`);
  console.log(`\n💡 Set REACT_APP_SMS_BACKEND_URL=http://localhost:${PORT} in your React env`);
  console.log(`\n🧪 Testing:`);
  console.log(`   node test-sms-direct.js\n`);
});

server.on('error', (err) => {
  console.error(`❌ Server error: ${err.message}`);
  process.exit(1);
});
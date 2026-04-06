const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', 'server', '.env') });

const connectDB = require('../server/config/db');

// Create Express app
const app = express();

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: '*',
  credentials: true
}));

let dbConnected = false;

// Database connection middleware
app.use(async (req, res, next) => {
  if (!dbConnected) {
    try {
      await connectDB();
      dbConnected = true;
    } catch (err) {
      console.error('DB connection error:', err);
    }
  }
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
try {
  app.use('/auth', require('../server/routes/auth'));
  app.use('/events', require('../server/routes/events'));
  app.use('/payments', require('../server/routes/payments'));
  app.use('/support', require('../server/routes/support'));
  app.use('/sms', require('../server/routes/sms'));
  app.use('/tickets', require('../server/routes/extras').router || require('../server/routes/extras'));
  app.use('/upload', require('../server/routes/upload'));
} catch (e) {
  console.error('Routes error:', e);
}

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message });
});

// 404
app.use((req, res) => {
  res.status(404).json({ message: 'Not found' });
});

module.exports = app;



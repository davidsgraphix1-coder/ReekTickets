const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('../config/db');

// Load environment
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const app = express();

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: true,
  credentials: true
}));

app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Database connection middleware
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('DB connection error:', err);
    // Still allow requests to proceed even if DB is down (for testing)
    next();
  }
});

// Routes
app.use('/api/auth', require('../routes/auth'));
app.use('/api/events', require('../routes/events'));
app.use('/api/payments', require('../routes/payments'));
app.use('/api/support', require('../routes/support'));
app.use('/api/sms', require('../routes/sms'));
app.use('/api', require('../routes/extras'));
app.use('/api/upload', require('../routes/upload'));

// Error handling
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message });
});

// Serverless export for Vercel
module.exports = app;
module.exports.handler = app;

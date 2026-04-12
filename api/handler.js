const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', 'server', '.env') });

// Fallback to Vercel environment variables
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

// Strip /api prefix for route matching (Vercel may not strip it)
app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    req.url = req.url.replace(/^\/api/, '');
    req.path = req.path.replace(/^\/api/, '');
    console.log('[API] Stripped /api prefix:', req.path, req.method);
  }
  next();
});

let dbConnected = false;

// Database connection middleware
app.use(async (req, res, next) => {
  if (!dbConnected) {
    try {
      await connectDB();
      dbConnected = true;
      console.log('[API] Database connected');
    } catch (err) {
      console.error('[API] DB connection error:', err);
    }
  }
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Test endpoint
app.get('/test', (req, res) => {
  res.json({ message: 'API handler is working!' });
});

// Routes - mount with proper paths (path stripping middleware converts /api/* to /*)
try {
  console.log('[API] Attempting to load routes...');
  const authRouter = require('../server/routes/auth');
  console.log('[API] Auth router loaded:', !!authRouter);
  app.use('/auth', authRouter);
  
  const smsRouter = require('../server/routes/sms');
  console.log('[API] SMS router loaded:', !!smsRouter);
  app.use('/sms', smsRouter);
  
  app.use('/events', require('../server/routes/events'));
  app.use('/payments', require('../server/routes/payments'));
  app.use('/support', require('../server/routes/support'));
  app.use('/upload', require('../server/routes/upload'));
  
  // Add vendor and agent routes if they exist (before generic routes)
  try {
    app.use('/vendor', require('../server/routes/vendor'));
  } catch (err) {
    console.log('[API] Vendor routes not available:', err.message);
  }
  
  try {
    app.use('/agent', require('../server/routes/agent'));
  } catch (err) {
    console.log('[API] Agent routes not available:', err.message);
  }
  
  // Mount extras router at root (must be last)
  const extrasRouter = require('../server/routes/extras');
  console.log('[API] Extras router loaded:', !!extrasRouter);
  console.log('[API] Extras router type:', typeof extrasRouter);
  app.use('/', extrasRouter);
  console.log('[API] Extras router mounted at /');
} catch (e) {
  console.error('[API] Routes error:', e.message);
  console.error('[API] Stack:', e.stack);
}

// 404
app.use((err, req, res, next) => {
  console.error('[API] Error handler:', err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

app.use((req, res) => {
  console.warn('[API] 404:', req.method, req.path);
  res.status(404).json({ message: 'API endpoint not found', path: req.path });
});

// Export for Vercel serverless
module.exports = (req, res) => {
  return app(req, res);
};



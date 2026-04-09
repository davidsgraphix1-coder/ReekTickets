const http = require('http');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Conditionally import Socket.IO only for local development
let initSocket = null;
if (require.main === module) {
  const { initSocket: socketInit } = require('./services/socket');
  initSocket = socketInit;
}

// Load environment variables from server/.env by default, fall back to root .env.
const envPath = path.join(__dirname, '.env');
const envResult = dotenv.config({ path: envPath });
if (envResult.error) {
  console.warn(`Could not load ${envPath}, falling back to default .env`);
  dotenv.config();
} else {
  console.log(`Loaded environment from ${envPath}`);
}


// --- ENVIRONMENT VARIABLE VALIDATION ---
const requiredEnv = [
  'SUPABASE_URL',
  'SUPABASE_KEY',
  'JWT_SECRET',
  'FRONTEND_URL',
  'PAYSTACK_SECRET_KEY',
];
const missingEnv = requiredEnv.filter((key) => !process.env[key]);
if (missingEnv.length) {
  console.error('Missing required environment variables:', missingEnv.join(', '));
  process.exit(1);
}

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: true,
  credentials: true
}));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/events', require('./routes/events'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/support', require('./routes/support'));
app.use('/support', require('./routes/support'));
app.use('/api/sms', require('./routes/sms'));
app.use('/api', require('./routes/extras'));
app.use('/api/upload', require('./routes/upload'));

// --- GLOBAL ERROR HANDLER ---
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;

if (require.main === module) {
  const server = http.createServer(app);
  initSocket(server);
  server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

// Export Express app for serverless environments (Vercel)
// Skip Socket.IO in serverless as it doesn't support persistent connections
const serverless = require('serverless-http');
module.exports = serverless(app, {
  binary: ['image/*', 'application/octet-stream']
});

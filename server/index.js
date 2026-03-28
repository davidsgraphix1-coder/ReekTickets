const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const serverless = require('serverless-http');
const connectDB = require('./config/db');

dotenv.config();
const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(cors({
  origin: [
    'https://reektickets-d9wl7b4hb-bernicesarpomaa1-wqs-projects.vercel.app',
    'http://localhost:3000'
  ],
  credentials: true
}));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Middleware to ensure DB connection
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('DB connection error:', err);
    res.status(500).json({ message: 'Database connection failed' });
  }
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/events', require('./routes/events'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api', require('./routes/extras'));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 5000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

module.exports = serverless(app);

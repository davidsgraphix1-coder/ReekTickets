const express = require('express');
const cors = require('cors');
require('dotenv').config({ path: require('path').join(__dirname, '..', 'server', '.env') });

const connectDB = require('../server/config/db');

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: '*', credentials: true }));

let dbReady = false;

app.use(async (req, res, next) => {
  if (!dbReady) {
    try {
      await connectDB();
      dbReady = true;
    } catch (e) {
      console.error('DB error:', e);
    }
  }
  next();
});

app.get('/health', (req, res) => res.json({ status: 'ok' }));

try {
  app.use('/auth', require('../server/routes/auth'));
  app.use('/events', require('../server/routes/events'));
  app.use('/payments', require('../server/routes/payments'));
  app.use('/support', require('../server/routes/support'));
  app.use('/sms', require('../server/routes/sms'));
  app.use('/', require('../server/routes/extras'));
  app.use('/upload', require('../server/routes/upload'));
} catch (e) {
  console.error(e);
}

app.use((err, req, res, next) => res.status(500).json({ error: err.message }));
app.use((req, res) => res.status(404).json({ message: 'Not found' }));

module.exports = app;

const express = require('express');
const axios = require('axios');
const auth = require('../middleware/auth');
const Event = require('../models/Event');
const Payment = require('../models/Payment');
const Ticket = require('../models/Ticket');
const User = require('../models/User');
const Wallet = require('../models/Wallet');

const router = express.Router();

router.post('/paystack', auth, async (req, res) => {
  try {
    const { eventId, email, amount, ticketType } = req.body;
    if (!eventId || !email || !amount) return res.status(400).json({ message: 'Missing payment info' });
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    const paystackKey = process.env.PAYSTACK_SECRET_KEY;
    if (!paystackKey) return res.status(500).json({ message: 'Paystack key not configured' });
    const response = await axios.post('https://api.paystack.co/transaction/initialize', {
      email,
      amount: Math.round(amount * 100),
      callback_url: `${process.env.CLIENT_URL || 'http://localhost:3000'}/payment/success`,
      metadata: { eventId, userId: req.user.id, ticketType },
    }, {
      headers: { Authorization: `Bearer ${paystackKey}`, 'Content-Type': 'application/json' },
    });
    const data = response.data;
    return res.json({ authorization_url: data.data.authorization_url, reference: data.data.reference });
  } catch (error) {
    console.error(error?.response?.data || error.message);
    return res.status(500).json({ message: 'Paystack initialization failed' });
  }
});

router.get('/verify', async (req, res) => {
  try {
    const { reference } = req.query;
    if (!reference) return res.status(400).json({ message: 'Missing reference' });
    const paystackKey = process.env.PAYSTACK_SECRET_KEY;
    const response = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: { Authorization: `Bearer ${paystackKey}` },
    });
    const data = response.data;
    if (!data.data || data.data.status !== 'success') {
      return res.status(400).json({ message: 'Payment not successful' });
    }
    const metadata = data.data.metadata || {};
    const amount = data.data.amount / 100;
    const payment = await Payment.create({
      user: metadata.userId,
      event: metadata.eventId,
      reference,
      amount,
      status: 'success',
      provider: 'paystack',
      meta: data.data,
    });
    const ticket = await Ticket.create({
      user: metadata.userId,
      event: metadata.eventId,
      ticketType: metadata.ticketType || 'General',
      price: amount,
      reference,
      status: 'active',
    });

    const code = String(Math.floor(100000 + Math.random() * 900000));
    ticket.smsCode = code;
    ticket.smsCodeExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await ticket.save();

    const event = await Event.findById(metadata.eventId);
    return res.json({ message: 'Payment verified', payment, ticket, event });
  } catch (error) {
    console.error(error?.response?.data || error.message);
    return res.status(500).json({ message: 'Paystack verification failed' });
  }
});

router.post('/withdraw', auth, async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ message: 'Invalid amount' });
    const wallet = await Wallet.findOne({ user: req.user.id });
    if (!wallet || wallet.balance < amount) return res.status(400).json({ message: 'Insufficient balance' });
    wallet.balance -= amount;
    wallet.updatedAt = new Date();
    await wallet.save();
    res.json({ message: 'Withdrawal successful', balance: wallet.balance });
  } catch (error) {
    res.status(500).json({ message: 'Withdrawal failed' });
  }
});

router.get('/summary', auth, async (req, res) => {
  try {
    const events = await Event.find({ organizer: req.user.id }).select('_id');
    const eventIds = events.map(e => e._id);
    const totalRevenue = await Payment.aggregate([
      { $match: { event: { $in: eventIds } } },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }
    ]);
    const totalTickets = await Ticket.countDocuments({ event: { $in: eventIds } });
    res.json({
      totalRevenue: totalRevenue[0]?.total || 0,
      totalTickets,
      totalSales: totalRevenue[0]?.count || 0,
    });
  } catch (error) {
    res.status(500).json({ message: 'Could not fetch sale summary' });
  }
});

router.get('/activity', auth, async (req, res) => {
  try {
    const events = await Event.find({ organizer: req.user.id }).select('_id');
    const eventIds = events.map(e => e._id);
    const activities = await Ticket.find({ event: { $in: eventIds } })
      .populate('user', 'fullName email')
      .populate('event', 'title');
    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: 'Could not fetch event activity' });
  }
});

router.get('/failed', auth, async (req, res) => {
  try {
    const events = await Event.find({ organizer: req.user.id }).select('_id');
    const eventIds = events.map(e => e._id);
    const failedPayments = await Payment.find({ event: { $in: eventIds }, status: { $ne: 'success' } });
    res.json(failedPayments);
  } catch (error) {
    res.status(500).json({ message: 'Could not fetch failed payments' });
  }
});

router.post('/refund', auth, async (req, res) => {
  try {
    const { paymentId } = req.body;
    if (!paymentId) return res.status(400).json({ message: 'Missing paymentId' });
    const payment = await Payment.findById(paymentId);
    if (!payment) return res.status(404).json({ message: 'Payment not found' });
    payment.status = 'refunded';
    await payment.save();
    await Ticket.updateMany({ reference: payment.reference }, { status: 'refunded' });
    res.json({ message: 'Refund processed', payment });
  } catch (error) {
    res.status(500).json({ message: 'Refund failed' });
  }
});

router.post('/donations', auth, async (req, res) => {
  try {
    const { eventId, amount } = req.body;
    if (!eventId || !amount) return res.status(400).json({ message: 'Missing eventId or amount' });
    const donation = await Payment.create({
      user: req.user.id,
      event: eventId,
      amount,
      status: 'donation',
      provider: 'manual',
      meta: { type: 'donation' },
    });
    res.json({ message: 'Donation received', donation });
  } catch (error) {
    res.status(500).json({ message: 'Donation failed' });
  }
});

module.exports = router;

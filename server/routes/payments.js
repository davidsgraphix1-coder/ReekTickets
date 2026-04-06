const express = require('express');
const axios = require('axios');
const auth = require('../middleware/auth');
const Event = require('../models/Event');
const Payment = require('../models/Payment');
const Ticket = require('../models/Ticket');
const User = require('../models/User');
const Wallet = require('../models/Wallet');

const router = express.Router();

// Fee calculation utilities
const SERVICE_FEES = {
  standard: 0.05,  // 5%
  gold: 0.075,     // 7.5%
  platinum: 0.10   // 10%
};

const TRANSACTION_FEE = 0.025; // 2.5% for Ghana Cedis transactions

const calculateFees = (amount, serviceTier = 'standard') => {
  const serviceFee = amount * SERVICE_FEES[serviceTier];
  const transactionFee = amount * TRANSACTION_FEE;
  const totalFees = serviceFee + transactionFee;
  const organizerAmount = amount - totalFees;

  return {
    originalAmount: amount,
    serviceFee,
    transactionFee,
    totalFees,
    organizerAmount
  };
};

router.post('/paystack', auth, async (req, res) => {
  try {
    const { eventId, email, amount, ticketType, quantity = 1, items } = req.body;
    if (!eventId || !email || !amount) return res.status(400).json({ message: 'Missing payment info' });
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    const paystackKey = process.env.PAYSTACK_SECRET_KEY;
    if (!paystackKey) return res.status(500).json({ message: 'Paystack key not configured' });
    const metadata = { eventId, userId: req.user.id };
    if (Array.isArray(items) && items.length > 0) {
      metadata.items = items;
    } else {
      metadata.ticketType = ticketType || 'General';
      metadata.quantity = quantity;
    }
    const response = await axios.post('https://api.paystack.co/transaction/initialize', {
      email,
      amount: Math.round(amount * 100),
      callback_url: `${process.env.CLIENT_URL || 'http://localhost:3000'}/payment/success`,
      metadata,
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

    const tickets = [];
    const createTicket = async (ticketType, price) => {
      const ticket = await Ticket.create({
        user: metadata.userId,
        event: metadata.eventId,
        ticketType: ticketType || 'General',
        price,
        reference,
        status: 'active',
      });
      ticket.smsCode = String(Math.floor(100000 + Math.random() * 900000));
      ticket.smsCodeExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
      await ticket.save();
      tickets.push(ticket);
    };

    if (Array.isArray(metadata.items) && metadata.items.length > 0) {
      for (const item of metadata.items) {
        const itemPrice = item.price || 0;
        const itemQuantity = Number(item.quantity) || 1;
        for (let i = 0; i < itemQuantity; i += 1) {
          // Create one ticket per unit purchased
          // Use the same reference for all tickets in this payment
          // and preserve the item price for each ticket
          // Ticket type falls back to General if missing
          // eslint-disable-next-line no-await-in-loop
          await createTicket(item.ticketType || 'General', itemPrice);
        }
      }
    } else {
      const quantity = Number(metadata.quantity) || 1;
      for (let i = 0; i < quantity; i += 1) {
        // eslint-disable-next-line no-await-in-loop
        await createTicket(metadata.ticketType || 'General', amount / quantity);
      }
    }

    await Event.findById(metadata.eventId);
    await User.findById(metadata.userId);
    return res.json({ message: 'Payment verified', payment, ticket: tickets[0], tickets, event });
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

// Organizer payout request
router.post('/organizer/payout', auth, async (req, res) => {
  try {
    const { amount, bankDetails } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ message: 'Invalid amount' });
    if (!bankDetails) return res.status(400).json({ message: 'Bank details required' });

    // Check if user is an organizer
    const user = await User.findById(req.user.id);
    if (!user || user.role !== 'organizer') return res.status(403).json({ message: 'Access denied' });

    // Calculate available balance from events with proper fee deductions
    const events = await Event.find({ organizer: req.user.id }).select('_id serviceTier');
    const eventIds = events.map(e => e._id);
    
    // Get all successful payments for organizer's events
    const payments = await Payment.find({ 
      event: { $in: eventIds }, 
      status: 'success' 
    }).populate('event');
    
    // Calculate total organizer earnings after fees
    let totalOrganizerEarnings = 0;
    for (const payment of payments) {
      const event = events.find(e => e._id.toString() === payment.event.toString());
      const serviceTier = event?.serviceTier || 'standard';
      const feeCalculation = calculateFees(payment.amount, serviceTier);
      totalOrganizerEarnings += feeCalculation.organizerAmount;
    }

    const availableBalance = totalOrganizerEarnings;
    if (availableBalance < amount) return res.status(400).json({ message: 'Insufficient available balance' });

    // Here you would integrate with Paystack Transfer API for bank transfers
    // For now, we'll create a payout record
    const payout = await Payment.create({
      user: req.user.id,
      amount: -amount, // Negative to indicate payout
      status: 'pending',
      provider: 'paystack_transfer',
      meta: { type: 'organizer_payout', bankDetails },
    });

    res.json({ message: 'Payout request submitted successfully', payout, reference: payout._id });
  } catch (error) {
    console.error('Organizer payout error:', error);
    res.status(500).json({ message: 'Payout request failed' });
  }
});

// Get organizer payout history
router.get('/organizer/payouts', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || user.role !== 'organizer') return res.status(403).json({ message: 'Access denied' });

    const payouts = await Payment.find({
      user: req.user.id,
      'meta.type': 'organizer_payout'
    }).sort({ createdAt: -1 });

    res.json(payouts);
  } catch (error) {
    res.status(500).json({ message: 'Could not fetch payout history' });
  }
});

router.get('/summary', auth, async (req, res) => {
  try {
    const events = await Event.find({ organizer: req.user.id }).select('_id serviceTier');
    const eventIds = events.map(e => e._id);
    
    // Get all payments for organizer's events
    const payments = await Payment.find({ event: { $in: eventIds } }).populate('event');
    
    let totalRevenue = 0;
    let totalOrganizerEarnings = 0;
    let totalServiceFees = 0;
    let totalTransactionFees = 0;
    
    for (const payment of payments) {
      if (payment.status === 'success') {
        totalRevenue += payment.amount;
        const event = events.find(e => e._id.toString() === payment.event.toString());
        const serviceTier = event?.serviceTier || 'standard';
        const feeCalculation = calculateFees(payment.amount, serviceTier);
        totalOrganizerEarnings += feeCalculation.organizerAmount;
        totalServiceFees += feeCalculation.serviceFee;
        totalTransactionFees += feeCalculation.transactionFee;
      }
    }
    
    const totalTickets = await Ticket.countDocuments({ event: { $in: eventIds } });
    const totalSales = payments.filter(p => p.status === 'success').length;
    
    res.json({
      totalRevenue,
      totalOrganizerEarnings,
      totalServiceFees,
      totalTransactionFees,
      totalTickets,
      totalSales,
      serviceTierBreakdown: events.reduce((acc, event) => {
        acc[event.serviceTier || 'standard'] = (acc[event.serviceTier || 'standard'] || 0) + 1;
        return acc;
      }, {})
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

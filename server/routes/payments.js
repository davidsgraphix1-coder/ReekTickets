
const express = require('express');
const router = express.Router();
const axios = require('axios');
const auth = require('../middleware/auth');
const { getUserByEmail, updateUser, getUserById } = require('../models/User');
const { getEventById } = require('../models/Event');
const { createPayment, getPaymentById } = require('../models/Payment');
const { connectDB } = require('../config/db');
// TODO: Implement Ticket and Wallet helpers for Supabase

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
    const event = await getEventById(eventId);
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
    const payment = await createPayment({
      user: metadata.userId,
      event: metadata.eventId,
      reference,
      amount,
      status: 'success',
      provider: 'paystack',
      meta: data.data,
    });

    const tickets = [];
    // TODO: Implement createTicket helper for Supabase and push to tickets array
    const createTicket = async (ticketType, price, userId, eventId) => {
      const supabase = await connectDB();
      const smsCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      const ticketData = {
        user: userId,
        event: eventId,
        ticketType,
        price,
        smsCode,
        status: 'active',
        created_at: new Date().toISOString(),
      };

      const { data: ticket, error } = await supabase
        .from('tickets')
        .insert(ticketData)
        .select()
        .single();

      if (error) {
        console.error('Error creating purchased ticket:', error);
        return null;
      }

      tickets.push(ticket);
      return ticket;
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
          await createTicket(item.ticketType || 'General', itemPrice, metadata.userId, metadata.eventId);
        }
      }
    } else {
      const quantity = Number(metadata.quantity) || 1;
      for (let i = 0; i < quantity; i += 1) {
        // eslint-disable-next-line no-await-in-loop
        await createTicket(metadata.ticketType || 'General', amount / quantity, metadata.userId, metadata.eventId);
      }
    }

    // Optionally fetch event and user with Supabase if needed
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
    // TODO: Implement wallet logic with Supabase
    // Example: fetch wallet, check balance, update balance, save
    res.json({ message: 'Withdrawal successful (Supabase logic not yet implemented)' });
  } catch (error) {
    res.status(500).json({ message: 'Withdrawal failed' });
  }
});

// Organizer payout request (Paystack transfer)
router.post('/organizer/payout', auth, async (req, res) => {
  try {
    const { amount, paystackEmail } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ message: 'Invalid amount' });
    if (!paystackEmail) return res.status(400).json({ message: 'Paystack email required' });

    // Check if user is an organizer
    const user = await getUserById(req.user.id);
    if (!user || user.role !== 'organizer') return res.status(403).json({ message: 'Access denied' });

    // Calculate available balance from events with proper fee deductions
    const supabase = await connectDB();

    // Fetch all events for this organizer
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('id, serviceTier')
      .eq('organizer', req.user.id);

    if (eventsError) throw eventsError;

    if (!events || events.length === 0) {
      return res.status(400).json({ message: 'No events found for organizer' });
    }

    const eventIds = events.map(e => e.id);

    // Fetch all successful payments for organizer's events
    const { data: payments, error: paymentsError } = await supabase
      .from('payments')
      .select('id, amount, event')
      .in('event', eventIds)
      .eq('status', 'success');

    if (paymentsError) throw paymentsError;

    // Calculate total available balance
    let totalAvailableBalance = 0;
    if (payments && payments.length > 0) {
      for (const payment of payments) {
        const event = events.find(e => e.id === payment.event);
        const serviceTier = event?.serviceTier || 'standard';
        const feeCalculation = calculateFees(payment.amount, serviceTier);
        totalAvailableBalance += feeCalculation.organizerAmount;
      }
    }

    // Check if requested amount is available
    if (amount > totalAvailableBalance) {
      return res.status(400).json({
        message: 'Insufficient balance',
        availableBalance: totalAvailableBalance,
        requestedAmount: amount
      });
    }

    // Create payout record in Supabase
    const payoutRecord = {
      user: req.user.id,
      amount,
      reference: `PAYOUT-${req.user.id}-${Date.now()}`,
      status: 'pending',
      provider: 'paystack',
      meta: {
        type: 'organizer_payout',
        paystackEmail,
        requestedAt: new Date().toISOString(),
        totalAvailableBalance
      },
      created_at: new Date().toISOString()
    };

    const { data: payout, error: payoutError } = await supabase
      .from('payments')
      .insert(payoutRecord)
      .select()
      .single();

    if (payoutError) throw payoutError;

    res.json({
      message: 'Payout request submitted successfully. Awaiting admin approval.',
      payoutId: payout.id,
      amount,
      status: 'pending',
      availableBalance: totalAvailableBalance,
      remainingBalance: totalAvailableBalance - amount
    });
  } catch (error) {
    console.error('Organizer payout error:', error);
    res.status(500).json({ message: 'Payout request failed' });
  }
});

// Admin: Get all pending payouts
router.get('/admin/pending-payouts', auth, async (req, res) => {
  try {
    const user = await getUserById(req.user.id);
    if (!user || user.role !== 'admin') return res.status(403).json({ message: 'Admin access denied' });

    const supabase = await connectDB();
    const { data: payouts, error } = await supabase
      .from('payments')
      .select('*')
      .eq('status', 'pending')
      .contains('meta', { type: 'organizer_payout' })
      .order('created_at', { ascending: true });

    if (error) throw error;

    // Fetch organizer details for each payout
    const payoutsWithOrganizerDetails = await Promise.all(
      (payouts || []).map(async (payout) => {
        const organizer = await getUserById(payout.user);
        return {
          ...payout,
          organizerName: organizer?.fullName || 'Unknown',
          organizerEmail: organizer?.email || 'Unknown'
        };
      })
    );

    res.json(payoutsWithOrganizerDetails);
  } catch (error) {
    console.error('Admin pending payouts error:', error);
    res.status(500).json({ message: 'Could not fetch pending payouts' });
  }
});

// Admin: Process and approve a payout (initiate Paystack transfer)
router.post('/admin/process-payout/:payoutId', auth, async (req, res) => {
  try {
    const { payoutId } = req.params;
    if (!payoutId) return res.status(400).json({ message: 'Payout ID required' });

    const user = await getUserById(req.user.id);
    if (!user || user.role !== 'admin') return res.status(403).json({ message: 'Admin access denied' });

    const supabase = await connectDB();

    // Fetch payout record
    const { data: payout, error: fetchError } = await supabase
      .from('payments')
      .select('*')
      .eq('id', payoutId)
      .single();

    if (fetchError || !payout) return res.status(404).json({ message: 'Payout not found' });

    // Check if payout is still pending
    if (payout.status !== 'pending') {
      return res.status(400).json({ message: `Payout already ${payout.status}` });
    }

    // Verify it's an organizer payout
    if (payout.meta?.type !== 'organizer_payout') {
      return res.status(400).json({ message: 'Invalid payout type' });
    }

    const paystackKey = process.env.PAYSTACK_SECRET_KEY;
    if (!paystackKey) return res.status(500).json({ message: 'Paystack key not configured' });

    const paystackEmail = payout.meta?.paystackEmail;
    if (!paystackEmail) return res.status(400).json({ message: 'No Paystack email on file' });

    // Step 1: Create recipient on Paystack
    let recipientCode;
    try {
      const recipientResponse = await axios.post(
        'https://api.paystack.co/transferrecipient',
        {
          type: 'nuban',
          name: `Organizer Payout`,
          account_number: paystackEmail, // Email acts as identifier (Paystack will resolve)
          bank_code: 'paystack', // Paystack account recipient
          currency: 'GHS'
        },
        {
          headers: { Authorization: `Bearer ${paystackKey}`, 'Content-Type': 'application/json' }
        }
      );
      recipientCode = recipientResponse.data.data.recipient_code;
    } catch (recipientError) {
      console.error('Paystack recipient creation error:', recipientError?.response?.data || recipientError.message);
      return res.status(400).json({
        message: 'Could not create Paystack recipient. Verify email is linked to a valid Paystack account.',
        error: recipientError?.response?.data?.message
      });
    }

    // Step 2: Initiate transfer
    try {
      // Generate unique reference (lowercase, dashes/underscores only, 16-50 chars)
      const uniqueRef = `payout-${payoutId.substring(0, 8)}-${Date.now()}`.toLowerCase().replace(/[^a-z0-9_-]/g, '');
      
      const transferResponse = await axios.post(
        'https://api.paystack.co/transfer',
        {
          source: 'balance',
          amount: Math.round(payout.amount * 100), // Amount in pesewas (100 pesewas = 1 GHS)
          recipient: recipientCode,
          reference: uniqueRef,
          reason: `ReekTickets organizer payout`,
          currency: 'GHS'
        },
        {
          headers: { Authorization: `Bearer ${paystackKey}`, 'Content-Type': 'application/json' }
        }
      );

      const transferData = transferResponse.data.data;

      // Step 3: Update payout status in Supabase
      const updatedPayoutMeta = {
        ...payout.meta,
        paystackTransferId: transferData.id,
        paystackTransferCode: transferData.transfer_code,
        paystackTransferReference: transferData.reference,
        paystackUniqueRef: uniqueRef,
        processedAt: new Date().toISOString(),
        processedBy: req.user.id
      };

      const { data: updatedPayout, error: updateError } = await supabase
        .from('payments')
        .update({
          status: 'processing',
          meta: updatedPayoutMeta
        })
        .eq('id', payoutId)
        .select()
        .single();

      if (updateError) throw updateError;

      res.json({
        message: 'Payout processed successfully',
        payout: updatedPayout,
        paystackTransferStatus: transferData.status
      });
    } catch (transferError) {
      console.error('Paystack transfer error:', transferError?.response?.data || transferError.message);
      return res.status(400).json({
        message: 'Paystack transfer failed',
        error: transferError?.response?.data?.message
      });
    }
  } catch (error) {
    console.error('Admin process payout error:', error);
    res.status(500).json({ message: 'Payout processing failed' });
  }
});

// Get organizer payout history
router.get('/organizer/payouts', auth, async (req, res) => {
  try {
    const user = await getUserById(req.user.id);
    if (!user || user.role !== 'organizer') return res.status(403).json({ message: 'Access denied' });
    const { connectDB } = require('../config/db');
    const supabase = await connectDB();
    // Query payments where user matches and meta.type is 'organizer_payout'
    const { data: payouts, error } = await supabase
      .from('payments')
      .select('*')
      .eq('user', req.user.id)
      .contains('meta', { type: 'organizer_payout' })
      .order('createdAt', { ascending: false });
    if (error) throw error;
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

// Admin: Get revenue summary (total service fees collected)
router.get('/admin/revenue-summary', auth, async (req, res) => {
  try {
    const user = await getUserById(req.user.id);
    if (!user || user.role !== 'admin') return res.status(403).json({ message: 'Admin access denied' });

    const supabase = await connectDB();

    // Fetch all successful payments
    const { data: allPayments, error: paymentsError } = await supabase
      .from('payments')
      .select('*')
      .eq('status', 'success')
      .not('meta', 'is', null);

    if (paymentsError) throw paymentsError;

    // Calculate total service fees and transaction fees
    let totalServiceFees = 0;
    let totalTransactionFees = 0;
    let totalGrandTotal = 0;
    const paymentsByTier = {
      standard: { count: 0, amount: 0, serviceFee: 0 },
      gold: { count: 0, amount: 0, serviceFee: 0 },
      platinum: { count: 0, amount: 0, serviceFee: 0 }
    };

    if (allPayments && allPayments.length > 0) {
      // Fetch all events to get their service tiers
      const { data: allEvents } = await supabase.from('events').select('id, serviceTier');
      const eventMap = (allEvents || []).reduce((acc, event) => {
        acc[event.id] = event.serviceTier || 'standard';
        return acc;
      }, {});

      for (const payment of allPayments) {
        const serviceTier = eventMap[payment.event] || 'standard';
        const feeCalculation = calculateFees(payment.amount, serviceTier);
        
        totalServiceFees += feeCalculation.serviceFee;
        totalTransactionFees += feeCalculation.transactionFee;
        totalGrandTotal += feeCalculation.serviceFee + feeCalculation.transactionFee;

        if (paymentsByTier[serviceTier]) {
          paymentsByTier[serviceTier].count += 1;
          paymentsByTier[serviceTier].amount += payment.amount;
          paymentsByTier[serviceTier].serviceFee += feeCalculation.serviceFee;
        }
      }
    }

    // Calculate total already withdrawn
    const { data: withdrawals } = await supabase
      .from('payments')
      .select('amount')
      .contains('meta', { type: 'admin_withdrawal' })
      .eq('status', 'completed');

    const totalWithdrawn = (withdrawals || []).reduce((sum, w) => sum + (w.amount || 0), 0);
    const availableBalance = totalServiceFees - totalWithdrawn;

    res.json({
      totalServiceFees,
      totalTransactionFees,
      totalGrandTotal,
      totalWithdrawn,
      availableBalance,
      paymentsByTier,
      totalTransactions: allPayments ? allPayments.length : 0
    });
  } catch (error) {
    console.error('Admin revenue summary error:', error);
    res.status(500).json({ message: 'Could not fetch revenue summary' });
  }
});

// Admin: Request withdrawal of platform fees
router.post('/admin/request-withdrawal', auth, async (req, res) => {
  try {
    const { amount, accountNumber, bankCode, accountName } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ message: 'Invalid amount' });
    if (!accountNumber || !bankCode || !accountName) {
      return res.status(400).json({ message: 'Bank account details required (account number, bank code, account name)' });
    }

    const user = await getUserById(req.user.id);
    if (!user || user.role !== 'admin') return res.status(403).json({ message: 'Admin access denied' });

    const supabase = await connectDB();

    // Get current revenue summary to check available balance
    const { data: allPayments } = await supabase
      .from('payments')
      .select('*')
      .eq('status', 'success')
      .not('meta', 'is', null);

    let totalServiceFees = 0;
    if (allPayments && allPayments.length > 0) {
      const { data: allEvents } = await supabase.from('events').select('id, serviceTier');
      const eventMap = (allEvents || []).reduce((acc, event) => {
        acc[event.id] = event.serviceTier || 'standard';
        return acc;
      }, {});

      for (const payment of allPayments) {
        const serviceTier = eventMap[payment.event] || 'standard';
        const feeCalculation = calculateFees(payment.amount, serviceTier);
        totalServiceFees += feeCalculation.serviceFee;
      }
    }

    // Calculate total withdrawn
    const { data: withdrawals } = await supabase
      .from('payments')
      .select('amount')
      .contains('meta', { type: 'admin_withdrawal' })
      .eq('status', 'completed');

    const totalWithdrawn = (withdrawals || []).reduce((sum, w) => sum + (w.amount || 0), 0);
    const availableBalance = totalServiceFees - totalWithdrawn;

    if (amount > availableBalance) {
      return res.status(400).json({
        message: 'Insufficient balance',
        availableBalance,
        requestedAmount: amount
      });
    }

    // Create withdrawal record
    const withdrawalRecord = {
      user: req.user.id,
      amount,
      reference: `ADMIN-WITHDRAWAL-${Date.now()}`,
      status: 'pending',
      provider: 'paystack',
      meta: {
        type: 'admin_withdrawal',
        accountNumber,
        bankCode,
        accountName,
        requestedAt: new Date().toISOString()
      },
      created_at: new Date().toISOString()
    };

    const { data: withdrawal, error: withdrawalError } = await supabase
      .from('payments')
      .insert(withdrawalRecord)
      .select()
      .single();

    if (withdrawalError) throw withdrawalError;

    res.json({
      message: 'Withdrawal request submitted successfully',
      withdrawalId: withdrawal.id,
      amount,
      status: 'pending',
      availableBalance: availableBalance - amount
    });
  } catch (error) {
    console.error('Admin withdrawal request error:', error);
    res.status(500).json({ message: 'Withdrawal request failed' });
  }
});

// Admin: Get all admin withdrawals
router.get('/admin/withdrawals', auth, async (req, res) => {
  try {
    const user = await getUserById(req.user.id);
    if (!user || user.role !== 'admin') return res.status(403).json({ message: 'Admin access denied' });

    const supabase = await connectDB();
    const { data: withdrawals, error } = await supabase
      .from('payments')
      .select('*')
      .contains('meta', { type: 'admin_withdrawal' })
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json(withdrawals || []);
  } catch (error) {
    console.error('Admin withdrawals fetch error:', error);
    res.status(500).json({ message: 'Could not fetch withdrawals' });
  }
});

// Admin: Process admin withdrawal (approve and send via Paystack)
router.post('/admin/process-withdrawal/:withdrawalId', auth, async (req, res) => {
  try {
    const { withdrawalId } = req.params;
    if (!withdrawalId) return res.status(400).json({ message: 'Withdrawal ID required' });

    const user = await getUserById(req.user.id);
    if (!user || user.role !== 'admin') return res.status(403).json({ message: 'Admin access denied' });

    const supabase = await connectDB();

    // Fetch withdrawal record
    const { data: withdrawal, error: fetchError } = await supabase
      .from('payments')
      .select('*')
      .eq('id', withdrawalId)
      .single();

    if (fetchError || !withdrawal) return res.status(404).json({ message: 'Withdrawal not found' });

    // Check if withdrawal is still pending
    if (withdrawal.status !== 'pending') {
      return res.status(400).json({ message: `Withdrawal already ${withdrawal.status}` });
    }

    // Verify it's an admin withdrawal
    if (withdrawal.meta?.type !== 'admin_withdrawal') {
      return res.status(400).json({ message: 'Invalid withdrawal type' });
    }

    const paystackKey = process.env.PAYSTACK_SECRET_KEY;
    if (!paystackKey) return res.status(500).json({ message: 'Paystack key not configured' });

    const accountNumber = withdrawal.meta?.accountNumber;
    const bankCode = withdrawal.meta?.bankCode;
    const accountName = withdrawal.meta?.accountName;

    if (!accountNumber || !bankCode || !accountName) {
      return res.status(400).json({ message: 'No bank account details on file' });
    }

    // Step 1: Create recipient on Paystack
    let recipientCode;
    try {
      const recipientResponse = await axios.post(
        'https://api.paystack.co/transferrecipient',
        {
          type: 'nuban',
          name: accountName,
          account_number: accountNumber,
          bank_code: bankCode,
          currency: 'GHS'
        },
        {
          headers: { Authorization: `Bearer ${paystackKey}`, 'Content-Type': 'application/json' }
        }
      );
      recipientCode = recipientResponse.data.data.recipient_code;
    } catch (recipientError) {
      console.error('Paystack recipient creation error:', recipientError?.response?.data || recipientError.message);
      return res.status(400).json({
        message: 'Could not create Paystack recipient. Verify bank account details are correct.',
        error: recipientError?.response?.data?.message
      });
    }

    // Step 2: Initiate transfer
    try {
      const transferResponse = await axios.post(
        'https://api.paystack.co/transfer',
        {
          source: 'balance',
          reason: `ReekTickets admin withdrawal`,
          amount: Math.round(withdrawal.amount * 100),
          recipient: recipientCode
        },
        {
          headers: { Authorization: `Bearer ${paystackKey}`, 'Content-Type': 'application/json' }
        }
      );

      const transferData = transferResponse.data.data;

      // Step 3: Update withdrawal status
      const updatedWithdrawalMeta = {
        ...withdrawal.meta,
        paystackTransferId: transferData.id,
        paystackTransferCode: transferData.transfer_code,
        paystackTransferReference: transferData.reference,
        processedAt: new Date().toISOString()
      };

      const { data: updatedWithdrawal, error: updateError } = await supabase
        .from('payments')
        .update({
          status: 'completed',
          meta: updatedWithdrawalMeta
        })
        .eq('id', withdrawalId)
        .select()
        .single();

      if (updateError) throw updateError;

      res.json({
        message: 'Withdrawal processed successfully',
        withdrawal: updatedWithdrawal,
        paystackTransferStatus: transferData.status
      });
    } catch (transferError) {
      console.error('Paystack transfer error:', transferError?.response?.data || transferError.message);
      return res.status(400).json({
        message: 'Paystack transfer failed',
        error: transferError?.response?.data?.message
      });
    }
  } catch (error) {
    console.error('Admin process withdrawal error:', error);
    res.status(500).json({ message: 'Withdrawal processing failed' });
  }
});

// ===== ORGANIZER MOBILE MONEY WITHDRAWALS =====

// Organizer: Request mobile money withdrawal
router.post('/organizer/request-withdrawal', auth, async (req, res) => {
  try {
    const { amount, mobileNumber, provider, fullName } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ message: 'Invalid amount' });
    if (!mobileNumber || mobileNumber.length < 9) return res.status(400).json({ message: 'Invalid mobile number' });
    if (!provider) return res.status(400).json({ message: 'Provider required' });
    if (!fullName) return res.status(400).json({ message: 'Full name required' });

    const user = await getUserById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const supabase = await connectDB();

    // Get organizer's available balance
    const { data: allPayments } = await supabase
      .from('payments')
      .select('*')
      .eq('status', 'success')
      .not('meta', 'is', null);

    let organizerEarnings = 0;
    if (allPayments && allPayments.length > 0) {
      for (const payment of allPayments) {
        if (payment.user === req.user.id) {
          const feeCalc = calculateFees(payment.amount, 'standard');
          organizerEarnings += feeCalc.organizerAmount;
        }
      }
    }

    // Subtract already withdrawn amounts
    const { data: approvedWithdrawals } = await supabase
      .from('payments')
      .select('amount')
      .eq('user', req.user.id)
      .contains('meta', { type: 'organizer_withdrawal' })
      .eq('status', 'approved');

    const withdrawnAmount = (approvedWithdrawals || []).reduce((sum, w) => sum + (w.amount || 0), 0);
    const availableBalance = organizerEarnings - withdrawnAmount;

    if (amount > availableBalance) {
      return res.status(400).json({
        message: 'Insufficient balance',
        availableBalance,
        requestedAmount: amount
      });
    }

    // Create withdrawal request
    const withdrawalRecord = {
      user: req.user.id,
      amount,
      reference: `ORGANIZER-WITHDRAWAL-${Date.now()}`,
      status: 'pending',
      provider: 'mobile_money',
      meta: {
        type: 'organizer_withdrawal',
        mobileNumber,
        provider,
        fullName,
        requestedAt: new Date().toISOString()
      },
      created_at: new Date().toISOString()
    };

    const { data: withdrawal, error: withdrawalError } = await supabase
      .from('payments')
      .insert(withdrawalRecord)
      .select()
      .single();

    if (withdrawalError) throw withdrawalError;

    res.json({
      message: 'Withdrawal request submitted successfully',
      withdrawalId: withdrawal.id,
      amount,
      status: 'pending'
    });
  } catch (error) {
    console.error('Organizer withdrawal request error:', error);
    res.status(500).json({ message: 'Withdrawal request failed' });
  }
});

// Organizer: Get withdrawal history
router.get('/organizer/withdrawals', auth, async (req, res) => {
  try {
    const user = await getUserById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const supabase = await connectDB();
    const { data: withdrawals, error } = await supabase
      .from('payments')
      .select('*')
      .eq('user', req.user.id)
      .contains('meta', { type: 'organizer_withdrawal' })
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json(withdrawals || []);
  } catch (error) {
    console.error('Organizer withdrawals fetch error:', error);
    res.status(500).json({ message: 'Could not fetch withdrawals' });
  }
});

// Admin: Get all organizer withdrawal requests
router.get('/admin/organizer-withdrawals', auth, async (req, res) => {
  try {
    const user = await getUserById(req.user.id);
    if (!user || user.role !== 'admin') return res.status(403).json({ message: 'Admin access denied' });

    const supabase = await connectDB();
    const { data: withdrawals, error } = await supabase
      .from('payments')
      .select('*')
      .contains('meta', { type: 'organizer_withdrawal' })
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json(withdrawals || []);
  } catch (error) {
    console.error('Admin organizer withdrawals fetch error:', error);
    res.status(500).json({ message: 'Could not fetch withdrawals' });
  }
});

// Admin: Approve organizer withdrawal
router.post('/admin/approve-organizer-withdrawal/:withdrawalId', auth, async (req, res) => {
  try {
    const { withdrawalId } = req.params;
    if (!withdrawalId) return res.status(400).json({ message: 'Withdrawal ID required' });

    const user = await getUserById(req.user.id);
    if (!user || user.role !== 'admin') return res.status(403).json({ message: 'Admin access denied' });

    const supabase = await connectDB();

    // Fetch withdrawal record
    const { data: withdrawal, error: fetchError } = await supabase
      .from('payments')
      .select('*')
      .eq('id', withdrawalId)
      .single();

    if (fetchError || !withdrawal) return res.status(404).json({ message: 'Withdrawal not found' });

    if (withdrawal.status !== 'pending') {
      return res.status(400).json({ message: `Withdrawal already ${withdrawal.status}` });
    }

    // Update withdrawal status to approved
    const updatedMeta = {
      ...withdrawal.meta,
      approvedAt: new Date().toISOString(),
      approvedBy: req.user.id
    };

    const { data: updatedWithdrawal, error: updateError } = await supabase
      .from('payments')
      .update({
        status: 'approved',
        meta: updatedMeta
      })
      .eq('id', withdrawalId)
      .select()
      .single();

    if (updateError) throw updateError;

    res.json({
      message: 'Withdrawal approved successfully',
      withdrawal: updatedWithdrawal
    });
  } catch (error) {
    console.error('Admin approve withdrawal error:', error);
    res.status(500).json({ message: 'Could not approve withdrawal' });
  }
});

// Admin: Decline organizer withdrawal
router.post('/admin/decline-organizer-withdrawal/:withdrawalId', auth, async (req, res) => {
  try {
    const { withdrawalId } = req.params;
    const { reason } = req.body;
    
    if (!withdrawalId) return res.status(400).json({ message: 'Withdrawal ID required' });

    const user = await getUserById(req.user.id);
    if (!user || user.role !== 'admin') return res.status(403).json({ message: 'Admin access denied' });

    const supabase = await connectDB();

    // Fetch withdrawal record
    const { data: withdrawal, error: fetchError } = await supabase
      .from('payments')
      .select('*')
      .eq('id', withdrawalId)
      .single();

    if (fetchError || !withdrawal) return res.status(404).json({ message: 'Withdrawal not found' });

    if (withdrawal.status !== 'pending') {
      return res.status(400).json({ message: `Withdrawal already ${withdrawal.status}` });
    }

    // Update withdrawal status to declined
    const updatedMeta = {
      ...withdrawal.meta,
      declinedAt: new Date().toISOString(),
      declinedBy: req.user.id,
      declineReason: reason || 'No reason provided'
    };

    const { data: updatedWithdrawal, error: updateError } = await supabase
      .from('payments')
      .update({
        status: 'declined',
        meta: updatedMeta
      })
      .eq('id', withdrawalId)
      .select()
      .single();

    if (updateError) throw updateError;

    res.json({
      message: 'Withdrawal declined successfully',
      withdrawal: updatedWithdrawal
    });
  } catch (error) {
    console.error('Admin decline withdrawal error:', error);
    res.status(500).json({ message: 'Could not decline withdrawal' });
  }
});

module.exports = router;

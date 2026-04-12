const express = require('express');
const router = express.Router();

// Temporarily comment out model imports to test if they're the issue
// const Wallet = require('../models/Wallet');
// const Offer = require('../models/Offer');
// const Invitation = require('../models/Invitation');
// const Coupon = require('../models/Coupon');

const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');
// const Ticket = require('../models/Ticket');
// const Payment = require('../models/Payment');
// const User = require('../models/User');
// const Event = require('../models/Event');
// const SalesAgent = require('../models/SalesAgent');
// const Announcement = require('../models/Announcement');
// const AgentSales = require('../models/AgentSales');
// const ReportMessage = require('../models/ReportMessage');
const { connectDB } = require('../config/db');

// ===== SUPABASE ENDPOINTS FOR ORGANIZER DASHBOARD =====

// Catch-all logging route for debugging
router.use((req, res, next) => {
  console.log('[EXTRAS] Route:', req.method, req.path);
  next();
});

// Test endpoint to verify routes are loading
router.get('/test-routes', async (req, res) => {
  console.log('[TEST-ROUTES] Received request at /test-routes');
  res.json({ message: 'Routes loaded successfully!', timestamp: new Date().toISOString() });
});

// GET /users - return users (no auth required for now)
router.get('/users', async (req, res) => {
  console.log('[USERS] Received request at /users');
  try {
    const supabase = await connectDB();
    const { data: users, error } = await supabase.from('users').select('*').limit(100);
    if (error) throw error;
    res.json(users || []);
  } catch (error) {
    console.error('[USERS] Error:', error.message);
    res.json([]);
  }
});

// GET /vendors - return vendor users (no auth required for now)
router.get('/vendors', async (req, res) => {
  try {
    const supabase = await connectDB();
    const { data: vendors, error } = await supabase.from('users').select('*').eq('role', 'vendor').limit(100);
    if (error) throw error;
    res.json(vendors || []);
  } catch (error) {
    console.error('[VENDORS] Error:', error.message);
    res.json([]);
  }
});

// GET /notifications - return user notifications (no auth required for now)
router.get('/notifications', async (req, res) => {
  try {
    const supabase = await connectDB();
    const { data: notifications, error } = await supabase.from('notifications').select('*').limit(50);
    if (error) throw error;
    res.json(notifications || []);
  } catch (error) {
    console.error('[NOTIFICATIONS] Error:', error.message);
    res.json([]);
  }
});

// GET /messages - return user messages (no auth required for now)
router.get('/messages', async (req, res) => {
  try {
    const supabase = await connectDB();
    const { data: messages, error } = await supabase.from('messages').select('*').limit(50);
    if (error) throw error;
    res.json(messages || []);
  } catch (error) {
    console.error('[MESSAGES] Error:', error.message);
    res.json([]);
  }
});





// Wallet endpoints
router.get('/wallets', auth, async (req, res) => {
  try {
    const wallets = await Wallet.getAllWallets();
    if (!wallets) return res.status(404).json({ message: 'No wallets found' });
    res.json(wallets);
  } catch (error) {
    console.error('Fetch wallets error:', error);
    res.status(500).json({ message: 'Could not fetch wallets' });
  }
});

router.get('/wallets/:id', auth, async (req, res) => {
  try {
    if (!req.params.id) return res.status(400).json({ message: 'Wallet ID required' });
    const wallet = await Wallet.getWalletById(req.params.id);
    if (!wallet) return res.status(404).json({ message: 'Wallet not found' });
    res.json(wallet);
  } catch (error) {
    console.error('Fetch wallet by ID error:', error);
    res.status(500).json({ message: 'Could not fetch wallet' });
  }
});

router.post('/wallets', auth, async (req, res) => {
  try {
    if (!req.body) return res.status(400).json({ message: 'Wallet data required' });
    const wallet = await Wallet.createWallet(req.body);
    res.status(201).json(wallet);
  } catch (error) {
    console.error('Create wallet error:', error);
    res.status(500).json({ message: 'Could not create wallet' });
  }
});

router.patch('/wallets/:id', auth, async (req, res) => {
  try {
    if (!req.params.id) return res.status(400).json({ message: 'Wallet ID required' });
    const wallet = await Wallet.updateWallet(req.params.id, req.body);
    if (!wallet) return res.status(404).json({ message: 'Wallet not found' });
    res.json(wallet);
  } catch (error) {
    console.error('Update wallet error:', error);
    res.status(500).json({ message: 'Could not update wallet' });
  }
});

router.delete('/wallets/:id', auth, async (req, res) => {
  try {
    if (!req.params.id) return res.status(400).json({ message: 'Wallet ID required' });
    await Wallet.deleteWallet(req.params.id);
    res.status(204).end();
  } catch (error) {
    console.error('Delete wallet error:', error);
    res.status(500).json({ message: 'Could not delete wallet' });
  }
});


// Offer endpoints
router.get('/offers', auth, async (req, res) => {
  try {
    const offers = await Offer.getAllOffers();
    if (!offers) return res.status(404).json({ message: 'No offers found' });
    res.json(offers);
  } catch (error) {
    console.error('Fetch offers error:', error);
    res.status(500).json({ message: 'Could not fetch offers' });
  }
});

router.get('/offers/:id', auth, async (req, res) => {
  try {
    if (!req.params.id) return res.status(400).json({ message: 'Offer ID required' });
    const offer = await Offer.getOfferById(req.params.id);
    if (!offer) return res.status(404).json({ message: 'Offer not found' });
    res.json(offer);
  } catch (error) {
    console.error('Fetch offer by ID error:', error);
    res.status(500).json({ message: 'Could not fetch offer' });
  }
});

router.post('/offers', auth, async (req, res) => {
  try {
    if (!req.body) return res.status(400).json({ message: 'Offer data required' });
    const offer = await Offer.createOffer(req.body);
    res.status(201).json(offer);
  } catch (error) {
    console.error('Create offer error:', error);
    res.status(500).json({ message: 'Could not create offer' });
  }
});

router.patch('/offers/:id', auth, async (req, res) => {
  try {
    if (!req.params.id) return res.status(400).json({ message: 'Offer ID required' });
    const offer = await Offer.updateOffer(req.params.id, req.body);
    if (!offer) return res.status(404).json({ message: 'Offer not found' });
    res.json(offer);
  } catch (error) {
    console.error('Update offer error:', error);
    res.status(500).json({ message: 'Could not update offer' });
  }
});

router.delete('/offers/:id', auth, async (req, res) => {
  try {
    if (!req.params.id) return res.status(400).json({ message: 'Offer ID required' });
    await Offer.deleteOffer(req.params.id);
    res.status(204).end();
  } catch (error) {
    console.error('Delete offer error:', error);
    res.status(500).json({ message: 'Could not delete offer' });
  }
});


// Invitation endpoints
router.get('/invitations', auth, async (req, res) => {
  try {
    const invitations = await Invitation.getAllInvitations();
    if (!invitations) return res.status(404).json({ message: 'No invitations found' });
    res.json(invitations);
  } catch (error) {
    console.error('Fetch invitations error:', error);
    res.status(500).json({ message: 'Could not fetch invitations' });
  }
});

router.get('/invitations/:id', auth, async (req, res) => {
  try {
    if (!req.params.id) return res.status(400).json({ message: 'Invitation ID required' });
    const invitation = await Invitation.getInvitationById(req.params.id);
    if (!invitation) return res.status(404).json({ message: 'Invitation not found' });
    res.json(invitation);
  } catch (error) {
    console.error('Fetch invitation by ID error:', error);
    res.status(500).json({ message: 'Could not fetch invitation' });
  }
});

router.post('/invitations', auth, async (req, res) => {
  try {
    if (!req.body) return res.status(400).json({ message: 'Invitation data required' });
    const invitation = await Invitation.createInvitation(req.body);
    res.status(201).json(invitation);
  } catch (error) {
    console.error('Create invitation error:', error);
    res.status(500).json({ message: 'Could not create invitation' });
  }
});

router.patch('/invitations/:id', auth, async (req, res) => {
  try {
    if (!req.params.id) return res.status(400).json({ message: 'Invitation ID required' });
    const invitation = await Invitation.updateInvitation(req.params.id, req.body);
    if (!invitation) return res.status(404).json({ message: 'Invitation not found' });
    res.json(invitation);
  } catch (error) {
    console.error('Update invitation error:', error);
    res.status(500).json({ message: 'Could not update invitation' });
  }
});

router.delete('/invitations/:id', auth, async (req, res) => {
  try {
    if (!req.params.id) return res.status(400).json({ message: 'Invitation ID required' });
    await Invitation.deleteInvitation(req.params.id);
    res.status(204).end();
  } catch (error) {
    console.error('Delete invitation error:', error);
    res.status(500).json({ message: 'Could not delete invitation' });
  }
});

// Coupon endpoints
router.get('/coupons', auth, async (req, res) => {
  try {
    const coupons = await Coupon.getAllCoupons();
    if (!coupons) return res.status(404).json({ message: 'No coupons found' });
    res.json(coupons);
  } catch (error) {
    console.error('Fetch coupons error:', error);
    res.status(500).json({ message: 'Could not fetch coupons' });
  }
});

router.get('/coupons/:id', auth, async (req, res) => {
  try {
    if (!req.params.id) return res.status(400).json({ message: 'Coupon ID required' });
    const coupon = await Coupon.getCouponById(req.params.id);
    if (!coupon) return res.status(404).json({ message: 'Coupon not found' });
    res.json(coupon);
  } catch (error) {
    console.error('Fetch coupon by ID error:', error);
    res.status(500).json({ message: 'Could not fetch coupon' });
  }
});

router.post('/coupons', auth, async (req, res) => {
  try {
    if (!req.body) return res.status(400).json({ message: 'Coupon data required' });
    const coupon = await Coupon.createCoupon(req.body);
    res.status(201).json(coupon);
  } catch (error) {
    console.error('Create coupon error:', error);
    res.status(500).json({ message: 'Could not create coupon' });
  }
});

router.patch('/coupons/:id', auth, async (req, res) => {
  try {
    if (!req.params.id) return res.status(400).json({ message: 'Coupon ID required' });
    const coupon = await Coupon.updateCoupon(req.params.id, req.body);
    if (!coupon) return res.status(404).json({ message: 'Coupon not found' });
    res.json(coupon);
  } catch (error) {
    console.error('Update coupon error:', error);
    res.status(500).json({ message: 'Could not update coupon' });
  }
});

router.delete('/coupons/:id', auth, async (req, res) => {
  try {
    if (!req.params.id) return res.status(400).json({ message: 'Coupon ID required' });
    await Coupon.deleteCoupon(req.params.id);
    res.status(204).end();
  } catch (error) {
    console.error('Delete coupon error:', error);
    res.status(500).json({ message: 'Could not delete coupon' });
  }
});

// Coupon endpoints
router.get('/coupons', auth, async (req, res) => {
  try {
    const coupons = await Coupon.getAllCoupons();
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ message: 'Could not fetch coupons' });
  }
});

router.get('/coupons/:id', auth, async (req, res) => {
  try {
    const coupon = await Coupon.getCouponById(req.params.id);
    if (!coupon) return res.status(404).json({ message: 'Coupon not found' });
    res.json(coupon);
  } catch (error) {
    res.status(500).json({ message: 'Could not fetch coupon' });
  }
});

router.post('/coupons', auth, async (req, res) => {
  try {
    const coupon = await Coupon.createCoupon(req.body);
    res.status(201).json(coupon);
  } catch (error) {
    res.status(500).json({ message: 'Could not create coupon' });
  }
});

router.patch('/coupons/:id', auth, async (req, res) => {
  try {
    const coupon = await Coupon.updateCoupon(req.params.id, req.body);
    if (!coupon) return res.status(404).json({ message: 'Coupon not found' });
    res.json(coupon);
  } catch (error) {
    res.status(500).json({ message: 'Could not update coupon' });
  }
});

router.delete('/coupons/:id', auth, async (req, res) => {
  try {
    await Coupon.deleteCoupon(req.params.id);
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ message: 'Could not delete coupon' });
  }
});




router.get('/tickets', auth, async (req, res) => {
  try {
    if (!req.user || !req.user.role) return res.status(401).json({ message: 'Unauthorized' });
    let tickets;
    if (req.user.role === 'organizer') {
      const organizerEventIds = await Event.find({ organizer: req.user.id }).select('_id');
      const eventIds = organizerEventIds.map((item) => item._id);
      tickets = await Ticket.find({ event: { $in: eventIds } }).populate('event').populate('user', 'fullName email phone');
    } else if (req.user.role === 'admin') {
      tickets = await Ticket.find().populate('event').populate('user', 'fullName email phone');
    } else {
      tickets = await Ticket.find({ user: req.user.id }).populate('event').populate('user', 'fullName email phone');
    }
    if (!tickets) return res.status(404).json({ message: 'No tickets found' });
    res.json(tickets);
  } catch (error) {
    console.error('Fetch tickets error:', error);
    res.status(500).json({ message: 'Could not fetch tickets' });
  }
});

// Get single ticket by id (for QR/OCR access)

router.get('/tickets/:id', async (req, res) => {
  try {
    if (!req.params.id) return res.status(400).json({ message: 'Ticket ID required' });
    const authHeader = req.headers.authorization;
    let requesterId = null;
    let requesterRole = null;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretjwtkey');
        requesterId = decoded.id;
        requesterRole = decoded.role;
      } catch (err) {
        requesterId = null;
        requesterRole = null;
      }
    }
    const ticket = await Ticket.findById(req.params.id).populate('event').populate('user', 'fullName email phone');
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
    const accessCode = req.query.code;
    const codeValid = accessCode && ticket.smsCode === accessCode && (!ticket.smsCodeExpiry || new Date(ticket.smsCodeExpiry) > new Date());
    if (codeValid) {
      return res.json(ticket);
    }
    if (requesterId && (ticket.user._id.toString() === requesterId || requesterRole === 'admin')) {
      return res.json(ticket);
    }
    return res.status(403).json({ message: 'Forbidden' });
  } catch (error) {
    console.error('Fetch ticket by ID error:', error);
    res.status(500).json({ message: 'Could not fetch ticket' });
  }
});



router.get('/payments', auth, async (req, res) => {
  try {
    if (!req.user || !req.user.id) return res.status(401).json({ message: 'Unauthorized' });
    const payments = await Payment.find({ user: req.user.id });
    if (!payments) return res.status(404).json({ message: 'No payments found' });
    res.json(payments);
  } catch (error) {
    console.error('Fetch payments error:', error);
    res.status(500).json({ message: 'Could not fetch payments' });
  }
});


// Create complimentary ticket
router.post('/tickets/complimentary', auth, async (req, res) => {
  try {
    const { event, ticketType, quantity, recipientName, recipientEmail, recipientPhone } = req.body;

    // Validate event exists and belongs to organizer
    const eventDoc = await Event.findById(event);
    if (!eventDoc || eventDoc.organizer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Event not found or access denied' });
    }

    const supabase = await connectDB();

    // Create complimentary tickets (one per quantity)
    const tickets = [];
    for (let i = 0; i < quantity; i++) {
      const smsCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      const ticketData = {
        user: req.user.id, // Organizer creates it, but it's for the recipient
        event,
        ticketType,
        price: 0,
        smsCode,
        status: 'active',
        recipientName,
        recipientEmail,
        recipientPhone,
        created_at: new Date().toISOString(),
      };

      const { data: ticket, error } = await supabase
        .from('tickets')
        .insert(ticketData)
        .select()
        .single();

      if (error) {
        console.error('Error creating complimentary ticket:', error);
        continue;
      }

      tickets.push(ticket);

      // Send SMS automatically for complimentary tickets
      if (recipientPhone) {
        try {
          const ticketLink = `${process.env.FRONTEND_URL || 'https://reektickets.com'}/ticket/${ticket.id}?code=${ticket.smsCode}`;
          const message = `Your complimentary ReekTickets ticket is ready. Code: ${ticket.smsCode}. View at: ${ticketLink}`;
          const { sendOTP } = require('../services/smsService');
          await sendOTP(recipientPhone, message);
          console.log(`Complimentary ticket SMS sent to ${recipientPhone} for ticket ${ticket.id}`);
        } catch (smsError) {
          console.error('Failed to send complimentary ticket SMS:', smsError);
          // Don't fail the ticket creation if SMS fails
        }
      }
    }

    res.json({ message: `${quantity} complimentary ticket(s) created successfully`, tickets });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Could not create complimentary ticket' });
  }
});

// Create physical ticket
router.post('/tickets/physical', auth, async (req, res) => {
  try {
    const { event, ticketType, quantity, recipientName, recipientEmail, recipientPhone, pickupLocation, pickupDate } = req.body;

    // Validate event exists and belongs to organizer
    const eventDoc = await Event.findById(event);
    if (!eventDoc || eventDoc.organizer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Event not found or access denied' });
    }

    const supabase = await connectDB();

    // Create physical tickets (one per quantity)
    const tickets = [];
    for (let i = 0; i < quantity; i++) {
      const smsCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      const ticketData = {
        user: req.user.id,
        event,
        ticketType,
        price: 0,
        smsCode,
        status: 'active',
        recipientName,
        recipientEmail,
        recipientPhone,
        pickupLocation,
        pickupDate: pickupDate ? new Date(pickupDate).toISOString() : null,
        created_at: new Date().toISOString(),
      };

      const { data: ticket, error } = await supabase
        .from('tickets')
        .insert(ticketData)
        .select()
        .single();

      if (error) {
        console.error('Error creating physical ticket:', error);
        continue;
      }

      tickets.push(ticket);

      // Send SMS automatically for physical tickets
      if (recipientPhone) {
        try {
          const ticketLink = `${process.env.FRONTEND_URL || 'https://reektickets.com'}/ticket/${ticket.id}?code=${ticket.smsCode}`;
          const message = `Your physical ReekTickets ticket is ready. Code: ${ticket.smsCode}. View at: ${ticketLink}. Pickup: ${pickupLocation || 'TBA'}`;
          const { sendOTP } = require('../services/smsService');
          await sendOTP(recipientPhone, message);
          console.log(`Physical ticket SMS sent to ${recipientPhone} for ticket ${ticket.id}`);
        } catch (smsError) {
          console.error('Failed to send physical ticket SMS:', smsError);
          // Don't fail the ticket creation if SMS fails
        }
      }
    }

    res.json({ message: `${quantity} physical ticket(s) created successfully`, tickets });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Could not create physical ticket' });
  }
});

// Admin routes
const handleSupabaseTable = async (table) => {
  const supabase = await connectDB();
  const { data, error } = await supabase.from(table).select('*');
  if (error) throw error;
  return data || [];
};

router.get('/admin/users', auth, async (req, res) => {
  try {
    const users = await handleSupabaseTable('users');
    res.json(users);
  } catch (error) {
    console.error('Could not fetch admin users:', error);
    res.status(500).json({ message: 'Could not fetch users' });
  }
});

router.patch('/admin/users/:id/role', auth, async (req, res) => {
  try {
    const supabase = await connectDB();
    const { role } = req.body;
    const { data, error } = await supabase.from('users').update({ role }).eq('id', req.params.id).select().single();
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Could not update user role:', error);
    res.status(500).json({ message: 'Could not update role' });
  }
});

router.patch('/admin/users/:id/status', auth, async (req, res) => {
  try {
    const supabase = await connectDB();
    const { status } = req.body;
    const { data, error } = await supabase.from('users').update({ status }).eq('id', req.params.id).select().single();
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Could not update user status:', error);
    res.status(500).json({ message: 'Could not update status' });
  }
});

router.delete('/admin/users/:id', auth, async (req, res) => {
  try {
    const supabase = await connectDB();
    const { error } = await supabase.from('users').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ message: 'User deleted' });
  } catch (error) {
    console.error('Could not delete user:', error);
    res.status(500).json({ message: 'Could not delete user' });
  }
});

router.get('/admin/events', auth, async (req, res) => {
  try {
    const events = await handleSupabaseTable('events');
    res.json(events);
  } catch (error) {
    console.error('Could not fetch events:', error);
    res.status(500).json({ message: 'Could not fetch events' });
  }
});

router.patch('/admin/events/:id', auth, async (req, res) => {
  try {
    const supabase = await connectDB();
    const updates = req.body;
    const { data, error } = await supabase.from('events').update(updates).eq('id', req.params.id).select().single();
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Could not update event:', error);
    res.status(500).json({ message: 'Could not update event' });
  }
});

router.delete('/admin/events/:id', auth, async (req, res) => {
  try {
    const supabase = await connectDB();
    const { error } = await supabase.from('events').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ message: 'Event deleted' });
  } catch (error) {
    console.error('Could not delete event:', error);
    res.status(500).json({ message: 'Could not delete event' });
  }
});

router.get('/admin/tickets', auth, async (req, res) => {
  try {
    const tickets = await handleSupabaseTable('tickets');
    res.json(tickets);
  } catch (error) {
    console.error('Could not fetch tickets:', error);
    res.status(500).json({ message: 'Could not fetch tickets' });
  }
});

router.get('/admin/payments', auth, async (req, res) => {
  try {
    const payments = await handleSupabaseTable('payments');
    res.json(payments);
  } catch (error) {
    console.error('Could not fetch payments:', error);
    res.status(500).json({ message: 'Could not fetch payments' });
  }
});

router.get('/admin/reports', auth, async (req, res) => {
  try {
    const reports = await handleSupabaseTable('report_messages').catch(() => []);
    res.json(reports);
  } catch (error) {
    console.error('Could not fetch reports:', error);
    res.status(500).json({ message: 'Could not fetch reports' });
  }
});

router.post('/admin/set-user-otp', auth, async (req, res) => {
  try {
    const supabase = await connectDB();
    const { userId, phone, email, fullName, role = 'attendee' } = req.body;

    if (!userId && !phone) {
      return res.status(400).json({ message: 'Phone number or user ID is required' });
    }

    const otpCode = String(Math.floor(100000 + Math.random() * 900000));
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    let existingUser = null;
    if (userId) {
      const { data, error } = await supabase.from('users').select('*').eq('id', userId).single().catch(() => ({ data: null }));
      existingUser = data;
    }
    if (!existingUser && email) {
      const { data, error } = await supabase.from('users').select('*').eq('email', email).single().catch(() => ({ data: null }));
      existingUser = data;
    }
    if (!existingUser && phone) {
      const { data, error } = await supabase.from('users').select('*').eq('phone', phone).single().catch(() => ({ data: null }));
      existingUser = data;
    }

    const userData = {
      email: email || null,
      phone: phone || (existingUser && existingUser.phone) || null,
      fullName: fullName || (existingUser && existingUser.fullName) || null,
      role: (existingUser && existingUser.role) || role,
      otpCode,
      otpExpiry,
      status: 'pending',
      isVerified: false,
      created_at: new Date().toISOString()
    };

    let savedUser;
    if (existingUser) {
      const { data, error } = await supabase.from('users').update(userData).eq('id', existingUser.id).select().single();
      if (error) throw error;
      savedUser = data;
    } else {
      const { data, error } = await supabase.from('users').insert(userData).select().single();
      if (error) throw error;
      savedUser = data;
    }

    res.json({ message: 'OTP set successfully', otpCode, user: savedUser });
  } catch (error) {
    console.error('Could not set user OTP:', error);
    res.status(500).json({ message: 'Could not set OTP' });
  }
});

console.log('[EXTRAS] Final router stack length:', router.stack.length);
console.log('[EXTRAS] Routes in router:', router.stack.map((layer, i) => `${i}: ${layer.route ? layer.route.path + ' (' + Object.keys(layer.route.methods).join(', ').toUpperCase() + ')' : 'middleware'}`).slice(0, 10).join(', '));

module.exports = router;

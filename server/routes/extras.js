const express = require('express');
const router = express.Router();

const Wallet = require('../models/Wallet');
const Offer = require('../models/Offer');
const Invitation = require('../models/Invitation');
const Coupon = require('../models/Coupon');

const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');
const Ticket = require('../models/Ticket');
const Payment = require('../models/Payment');
const User = require('../models/User');
const Event = require('../models/Event');
const SalesAgent = require('../models/SalesAgent');
const Announcement = require('../models/Announcement');
const AgentSales = require('../models/AgentSales');
const ReportMessage = require('../models/ReportMessage');
const { connectDB } = require('../config/db');



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


router.get('/users', auth, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    if (!users) return res.status(404).json({ message: 'No users found' });
    res.json(users);
  } catch (error) {
    console.error('Fetch users error:', error);
    res.status(500).json({ message: 'Could not fetch users' });
  }
});

router.get('/vendors', auth, async (req, res) => {
  try {
    const vendors = await User.find({ role: 'vendor' }).select('-password');
    res.json(vendors);
  } catch (error) {
    res.status(500).json({ message: 'Could not fetch vendors' });
  }
});

router.get('/notifications', auth, async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.user.id }).sort({ createdAt: -1 }).limit(10);
    const notifications = payments.map((p) => ({
      _id: p._id,
      title: `Payment received: GH₵ ${p.amount.toFixed(2)}`,
      message: `Transaction ${p.reference}`,
      time: p.createdAt,
      read: false,
    }));
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Could not fetch notifications' });
  }
});

router.get('/messages', auth, async (req, res) => {
  try {
    // If message store exists in future, replace this static logic with DB model
    const messages = [
      { _id: 'm1', sender: 'Support', subject: 'Welcome to ReekTickets', body: 'Your organizer dashboard is ready.', createdAt: new Date(), unread: true },
    ];
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Could not fetch messages' });
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

router.get('/admin/users', auth, async (req, res) => {
  try {
    // Removed admin role check for development
    // const user = await User.findById(req.user.id);
    // if (!user || user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
    // const users = await User.find().select('-password');
    // res.json(users);
    const users = await User.getAllUsers();
    res.json(users);
  } catch (error) {
    console.error('Could not fetch admin users:', error);
    res.status(500).json({ message: 'Could not fetch users' });
  }
});

router.get('/vendor/applications', auth, async (req, res) => {
  try {
    const VendorApplication = require('../models/VendorApplication');
    const applications = await VendorApplication.find({ vendor: req.user.id })
      .populate('event', 'title')
      .populate('vendor', 'fullName email')
      .sort({ applicationDate: -1 });
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: 'Could not fetch applications' });
  }
});

// Vendor profile endpoints
router.get('/vendor/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role !== 'vendor') return res.status(403).json({ message: 'Forbidden' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Could not fetch profile' });
  }
});

router.patch('/vendor/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role !== 'vendor') return res.status(403).json({ message: 'Forbidden' });

    const { fullName, email, phone, businessName } = req.body;
    if (fullName) user.fullName = fullName;
    if (email) user.email = email.toLowerCase();
    if (phone) user.phone = phone;
    if (businessName) user.businessName = businessName;

    await user.save();

    res.json({
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      businessName: user.businessName,
      role: user.role,
    });
  } catch (error) {
    console.error('Vendor profile update error:', error);
    res.status(500).json({ message: 'Could not update profile' });
  }
});

router.get('/agent/sales', auth, async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.user.id });
    const sales = payments.map((p) => ({ ...p.toObject(), eventTitle: 'Event Sale', amount: p.amount }));
    res.json(sales);
  } catch (error) {
    res.status(500).json({ message: 'Could not fetch sales' });
  }
});

// Get sales agent profile
router.get('/agent/profile', auth, async (req, res) => {
  try {
    if (req.user.role !== 'agent') return res.status(403).json({ message: 'Forbidden' });
    let agent = await SalesAgent.getSalesAgentById(req.user.id);
    if (!agent) {
      // Create agent profile if it doesn't exist
      const referralCode = `AGENT_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      agent = await SalesAgent.createSalesAgent({
        user_id: req.user.id,
        referral_code: referralCode,
      });
    }
    res.json(agent);
  } catch (error) {
    console.error('Agent profile fetch error:', error);
    res.status(500).json({ message: 'Could not fetch agent profile' });
  }
});

// Update sales agent profile
router.patch('/agent/profile', auth, async (req, res) => {
  try {
    if (req.user.role !== 'agent') return res.status(403).json({ message: 'Forbidden' });
    const agent = await SalesAgent.updateSalesAgent(req.user.id, req.body);
    if (!agent) return res.status(404).json({ message: 'Agent profile not found' });
    res.json(agent);
  } catch (error) {
    console.error('Agent profile update error:', error);
    res.status(500).json({ message: 'Could not update agent profile' });
  }
});
// Announcements endpoints (Supabase)
router.get('/announcements', auth, async (req, res) => {
  try {
    const announcements = await Announcement.getAllAnnouncements();
    res.json(announcements);
  } catch (error) {
    res.status(500).json({ message: 'Could not fetch announcements' });
  }
});

router.get('/announcements/:id', auth, async (req, res) => {
  try {
    const announcement = await Announcement.getAnnouncementById(req.params.id);
    if (!announcement) return res.status(404).json({ message: 'Announcement not found' });
    res.json(announcement);
  } catch (error) {
    res.status(500).json({ message: 'Could not fetch announcement' });
  }
});

router.post('/announcements', auth, async (req, res) => {
  try {
    const announcement = await Announcement.createAnnouncement(req.body);
    res.status(201).json(announcement);
  } catch (error) {
    res.status(500).json({ message: 'Could not create announcement' });
  }
});

router.patch('/announcements/:id', auth, async (req, res) => {
  try {
    const announcement = await Announcement.updateAnnouncement(req.params.id, req.body);
    if (!announcement) return res.status(404).json({ message: 'Announcement not found' });
    res.json(announcement);
  } catch (error) {
    res.status(500).json({ message: 'Could not update announcement' });
  }
});

router.delete('/announcements/:id', auth, async (req, res) => {
  try {
    await Announcement.deleteAnnouncement(req.params.id);
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ message: 'Could not delete announcement' });
  }
});

// Get agent sales with detailed information
router.get('/agent/sales-detailed', auth, async (req, res) => {
  try {
    if (req.user.role !== 'agent') return res.status(403).json({ message: 'Forbidden' });

    const agent = await SalesAgent.findOne({ user_id: req.user.id });
    if (!agent) return res.status(404).json({ message: 'Agent profile not found' });

    const sales = await AgentSales.find({ agent_id: agent._id })
      .populate('event_id', 'title')
      .populate('buyer_id', 'fullName email')
      .populate('ticket_id', 'type')
      .sort({ date: -1 });

    res.json(sales);
  } catch (error) {
    console.error('Agent sales fetch error:', error);
    res.status(500).json({ message: 'Could not fetch agent sales' });
  }
});

// Get agent statistics
router.get('/agent/stats', auth, async (req, res) => {
  try {
    if (req.user.role !== 'agent') return res.status(403).json({ message: 'Forbidden' });

    const agent = await SalesAgent.findOne({ user_id: req.user.id });
    if (!agent) return res.status(404).json({ message: 'Agent profile not found' });

    const sales = await AgentSales.find({ agent_id: agent._id });

    const totalTicketsSold = sales.reduce((acc, sale) => acc + sale.quantity, 0);
    const totalEarnings = sales.reduce((acc, sale) => acc + sale.commission, 0);
    const activeEvents = [...new Set(sales.map(sale => sale.event_id.toString()))].length;
    const totalClicks = agent.total_sales || 0; // This would need to be tracked separately

    res.json({
      totalTicketsSold,
      totalEarnings,
      activeEvents,
      totalClicks,
      totalCommission: agent.total_commission,
      availableBalance: agent.total_commission * 0.8, // 80% available for withdrawal
      pendingEarnings: agent.total_commission * 0.2, // 20% pending
      withdrawnAmount: 0, // This would need a separate withdrawal model
    });
  } catch (error) {
    console.error('Agent stats fetch error:', error);
    res.status(500).json({ message: 'Could not fetch agent stats' });
  }
});

// Generate referral link for event
router.post('/agent/referral-link', auth, async (req, res) => {
  try {
    if (req.user.role !== 'agent') return res.status(403).json({ message: 'Forbidden' });

    const { eventId } = req.body;
    const agent = await SalesAgent.findOne({ user_id: req.user.id });
    if (!agent) return res.status(404).json({ message: 'Agent profile not found' });

    const referralLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/event/${eventId}?ref=${agent.referral_code}`;

    res.json({ referralLink, referralCode: agent.referral_code });
  } catch (error) {
    console.error('Referral link generation error:', error);
    res.status(500).json({ message: 'Could not generate referral link' });
  }
});

// Get agent leaderboard
router.get('/agent/leaderboard', auth, async (req, res) => {
  try {
    const agents = await SalesAgent.find()
      .populate('user_id', 'fullName')
      .sort({ total_commission: -1 })
      .limit(10);

    const leaderboard = agents.map((agent, index) => ({
      rank: index + 1,
      name: agent.user_id.fullName,
      totalCommission: agent.total_commission,
      level: agent.level,
    }));

    res.json(leaderboard);
  } catch (error) {
    console.error('Leaderboard fetch error:', error);
    res.status(500).json({ message: 'Could not fetch leaderboard' });
  }
});

// Get agent notifications
router.get('/agent/notifications', auth, async (req, res) => {
  try {
    if (req.user.role !== 'agent') return res.status(403).json({ message: 'Forbidden' });

    const agent = await SalesAgent.findOne({ user_id: req.user.id });
    if (!agent) return res.status(404).json({ message: 'Agent profile not found' });

    // Mock notifications - in real app, this would be a separate model
    const notifications = [
      {
        id: '1',
        title: 'Commission Earned',
        message: `You earned GH₵${agent.total_commission.toFixed(2)} in commission this month`,
        time: new Date(),
        read: false,
      },
      {
        id: '2',
        title: 'New Event Available',
        message: 'A new event is available for you to promote',
        time: new Date(Date.now() - 86400000), // 1 day ago
        read: false,
      },
    ];

    res.json(notifications);
  } catch (error) {
    console.error('Agent notifications fetch error:', error);
    res.status(500).json({ message: 'Could not fetch notifications' });
  }
});

// Report messages: user-facing report form submission
router.post('/report', auth, async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ message: 'Report message is required.' });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    const report = new ReportMessage({
      user_id: user._id,
      user_name: user.fullName || user.email,
      role: user.role || 'attendee',
      message: message.trim(),
    });

    await report.save();
    res.status(201).json({ message: 'Report message submitted.' });
  } catch (error) {
    console.error('Report submission failed:', error);
    res.status(500).json({ message: 'Could not submit report.' });
  }
});

// Admin fetch all report messages
router.get('/admin/reports', auth, async (req, res) => {
  try {
    // Removed admin role check for development
    // const admin = await User.findById(req.user.id);
    // if (!admin || admin.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });

    // const validRoles = ['attendee', 'organizer', 'vendor', 'agent', 'admin'];
    // const filter = {};
    // if (req.query.role && validRoles.includes(req.query.role)) {
    //   filter.role = req.query.role;
    // }

    // const reports = await ReportMessage.find(filter).sort({ createdAt: -1 });
    // res.json(reports);
    res.json([]); // Return empty for now
  } catch (error) {
    console.error('Fetch reports failed:', error);
    res.status(500).json({ message: 'Could not fetch reports.' });
  }
});

// Admin create announcement
router.post('/admin/announcements', auth, async (req, res) => {
  try {
    const admin = await User.findById(req.user.id);
    if (!admin || admin.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });

    const { message, roles } = req.body;
    if (!message || typeof message !== 'string' || !message.trim().length) {
      return res.status(400).json({ message: 'Announcement message is required.' });
    }

    const validRoles = ['attendee', 'organizer', 'vendor', 'agent', 'admin'];
    const targetRoles = Array.isArray(roles) && roles.length > 0
      ? (roles.includes('all')
        ? validRoles
        : Array.from(new Set(roles.filter((role) => validRoles.includes(role)))))
      : validRoles;

    const announcement = new Announcement({
      createdBy: admin._id,
      createdByName: admin.fullName || admin.email,
      roles: targetRoles,
      message: message.trim(),
    });

    await announcement.save();
    res.status(201).json({ message: 'Announcement sent successfully.' });
  } catch (error) {
    console.error('Create announcement failed:', error);
    res.status(500).json({ message: 'Could not create announcement.' });
  }
});

// Admin list announcements
router.get('/admin/announcements', auth, async (req, res) => {
  try {
    const admin = await User.findById(req.user.id);
    if (!admin || admin.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });

    const announcements = await Announcement.find().sort({ createdAt: -1 });
    res.json(announcements);
  } catch (error) {
    console.error('Fetch announcements failed:', error);
    res.status(500).json({ message: 'Could not fetch announcements.' });
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

module.exports = router;

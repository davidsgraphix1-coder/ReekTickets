const express = require('express');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');
const Ticket = require('../models/Ticket');
const Payment = require('../models/Payment');
const User = require('../models/User');
const Event = require('../models/Event');
const SalesAgent = require('../models/SalesAgent');
const AgentSales = require('../models/AgentSales');
const ReportMessage = require('../models/ReportMessage');
const Announcement = require('../models/Announcement');

const router = express.Router();

router.get('/tickets', auth, async (req, res) => {
  try {
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

    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: 'Could not fetch tickets' });
  }
});

// Get single ticket by id (for QR/OCR access)
router.get('/tickets/:id', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    let requesterId = null;
    let requesterRole = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretjwtkey');
        requesterId = decoded.id;
        requesterRole = decoded.role;
      } catch {
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
    res.status(500).json({ message: 'Could not fetch ticket' });
  }``
});


router.get('/payments', auth, async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.user.id });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: 'Could not fetch payments' });
  }
});

router.get('/users', auth, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
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

    // Create complimentary tickets (one per quantity)
    const tickets = [];
    for (let i = 0; i < quantity; i++) {
      const ticket = await Ticket.create({
        user: req.user.id, // Organizer creates it, but it's for the recipient
        event,
        ticketType,
        price: 0,
        smsCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
        status: 'active',
        recipientName,
        recipientEmail,
        recipientPhone,
      });
      tickets.push(ticket);
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

    // Create physical tickets (one per quantity)
    const tickets = [];
    for (let i = 0; i < quantity; i++) {
      const ticket = await Ticket.create({
        user: req.user.id,
        event,
        ticketType,
        price: 0,
        smsCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
        status: 'active',
        recipientName,
        recipientEmail,
        recipientPhone,
        pickupLocation,
        pickupDate: pickupDate ? new Date(pickupDate) : null,
      });
      tickets.push(ticket);
    }

    res.json({ message: `${quantity} physical ticket(s) created successfully`, tickets });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Could not create physical ticket' });
  }
});

router.get('/admin/users', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
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

    let agent = await SalesAgent.findOne({ user_id: req.user.id }).populate('user_id', 'fullName email phone');
    if (!agent) {
      // Create agent profile if it doesn't exist
      const referralCode = `AGENT_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      agent = new SalesAgent({
        user_id: req.user.id,
        referral_code: referralCode,
      });
      await agent.save();
      agent = await SalesAgent.findById(agent._id).populate('user_id', 'fullName email phone');
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

    const agent = await SalesAgent.findOneAndUpdate(
      { user_id: req.user.id },
      { ...req.body },
      { new: true, runValidators: true }
    ).populate('user_id', 'fullName email phone');

    if (!agent) return res.status(404).json({ message: 'Agent profile not found' });
    res.json(agent);
  } catch (error) {
    console.error('Agent profile update error:', error);
    res.status(500).json({ message: 'Could not update agent profile' });
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
    const admin = await User.findById(req.user.id);
    if (!admin || admin.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });

    const validRoles = ['attendee', 'organizer', 'vendor', 'agent', 'admin'];
    const filter = {};
    if (req.query.role && validRoles.includes(req.query.role)) {
      filter.role = req.query.role;
    }

    const reports = await ReportMessage.find(filter).sort({ createdAt: -1 });
    res.json(reports);
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
router.get('/admin/users', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Could not fetch users' });
  }
});

router.patch('/admin/users/:id/role', auth, async (req, res) => {
  try {
    const admin = await User.findById(req.user.id);
    if (!admin || admin.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
    const { role } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.role = role;
    await user.save();
    res.json(user);
  } catch (error) { res.status(500).json({ message: 'Could not update role' }); }
});

router.patch('/admin/users/:id/status', auth, async (req, res) => {
  try {
    const admin = await User.findById(req.user.id);
    if (!admin || admin.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
    const { status } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.status = status;
    await user.save();
    res.json(user);
  } catch (error) { res.status(500).json({ message: 'Could not update status' }); }
});

router.delete('/admin/users/:id', auth, async (req, res) => {
  try {
    const admin = await User.findById(req.user.id);
    if (!admin || admin.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (error) { res.status(500).json({ message: 'Could not delete user' }); }
});

router.get('/admin/events', auth, async (req, res) => {
  try {
    const admin = await User.findById(req.user.id);
    if (!admin || admin.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
    const events = await Event.find().populate('organizer', 'fullName email');
    res.json(events);
  } catch (error) { res.status(500).json({ message: 'Could not fetch events' }); }
});

router.patch('/admin/events/:id', auth, async (req, res) => {
  try {
    const admin = await User.findById(req.user.id);
    if (!admin || admin.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    const updates = req.body;
    Object.assign(event, updates);
    await event.save();
    res.json(event);
  } catch (error) { res.status(500).json({ message: 'Could not update event' }); }
});

router.delete('/admin/events/:id', auth, async (req, res) => {
  try {
    const admin = await User.findById(req.user.id);
    if (!admin || admin.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: 'Event deleted' });
  } catch (error) { res.status(500).json({ message: 'Could not delete event' }); }
});

router.get('/admin/tickets', auth, async (req, res) => {
  try {
    const admin = await User.findById(req.user.id);
    if (!admin || admin.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
    const tickets = await Ticket.find().populate('user', 'fullName email').populate('event', 'title');
    res.json(tickets);
  } catch (error) { res.status(500).json({ message: 'Could not fetch tickets' }); }
});

router.get('/admin/payments', auth, async (req, res) => {
  try {
    const admin = await User.findById(req.user.id);
    if (!admin || admin.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
    const payments = await Payment.find().populate('user', 'fullName email');
    res.json(payments);
  } catch (error) { res.status(500).json({ message: 'Could not fetch payments' }); }
});

module.exports = router;

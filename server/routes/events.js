const express = require('express');
const multer = require('multer');
const auth = require('../middleware/auth');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

router.get('/', async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1 }).populate('organizer', 'fullName email');
    return res.json(events);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Could not fetch events' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('organizer', 'fullName email');
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json(event);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Could not fetch event' });
  }
});

router.post('/', auth, upload.single('banner'), async (req, res) => {
  try {
    const { title, description, date, location, category, ticketTypes } = req.body;
    if (!title || !date || !location || !ticketTypes) return res.status(400).json({ message: 'Required fields missing' });
    const banner = req.file ? `/uploads/${req.file.filename}` : '/banner.jpg';
    const event = await Event.create({
      title,
      description,
      date: new Date(date),
      location,
      category: category || 'General',
      banner,
      organizer: req.user.id,
      ticketTypes: JSON.parse(ticketTypes),
      status: 'pending',
      published: false,
    });
    res.json(event);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Could not create event' });
  }
});


// Get all events for the logged-in organizer
router.get('/my-events', auth, async (req, res) => {
  try {
    const events = await Event.find({ organizer: req.user.id }).sort({ date: 1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: 'Could not fetch organizer events' });
  }
});

// Edit event (organizer only)
router.put('/:id', auth, upload.single('banner'), async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    if (event.organizer.toString() !== req.user.id) return res.status(403).json({ message: 'Forbidden' });
    const { title, description, date, location, category, ticketTypes } = req.body;
    if (title) event.title = title;
    if (description) event.description = description;
    if (date) event.date = new Date(date);
    if (location) event.location = location;
    if (category) event.category = category;
    if (ticketTypes) event.ticketTypes = JSON.parse(ticketTypes);
    if (req.file) event.banner = `/uploads/${req.file.filename}`;
    await event.save();
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: 'Could not update event' });
  }
});

// Delete event (organizer only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    if (event.organizer.toString() !== req.user.id) return res.status(403).json({ message: 'Forbidden' });
    await event.deleteOne();
    res.json({ message: 'Event deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Could not delete event' });
  }
});

// Add or update live stream link for an event (organizer only)
router.post('/:id/live', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    if (event.organizer.toString() !== req.user.id) return res.status(403).json({ message: 'Forbidden' });
    const { streamUrl } = req.body;
    if (!streamUrl) return res.status(400).json({ message: 'Missing stream URL' });
    event.streamUrl = streamUrl;
    await event.save();
    res.json({ message: 'Live stream link updated', event });
  } catch (error) {
    res.status(500).json({ message: 'Could not update live stream' });
  }
});

// Send invitations to guests (organizer only)
router.post('/:id/invitations', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    if (event.organizer.toString() !== req.user.id) return res.status(403).json({ message: 'Forbidden' });
    const { guestEmails } = req.body;
    if (!Array.isArray(guestEmails) || guestEmails.length === 0) return res.status(400).json({ message: 'No guest emails provided' });
    const Invitation = require('../models/Invitation');
    const invites = await Promise.all(guestEmails.map(email => Invitation.create({ event: event._id, organizer: req.user.id, guestEmail: email })));
    // TODO: send emails via nodemailer
    res.json({ message: 'Invitations sent', invites });
  } catch (error) {
    res.status(500).json({ message: 'Could not send invitations' });
  }
});

// Get invitation history for an event (organizer only)
router.get('/:id/invitations', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    if (event.organizer.toString() !== req.user.id) return res.status(403).json({ message: 'Forbidden' });
    const Invitation = require('../models/Invitation');
    const invites = await Invitation.find({ event: event._id });
    res.json(invites);
  } catch (error) {
    res.status(500).json({ message: 'Could not fetch invitations' });
  }
});

// Visitor overview for an event (organizer only)
router.get('/:id/visitors', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    if (event.organizer.toString() !== req.user.id) return res.status(403).json({ message: 'Forbidden' });
    const Ticket = require('../models/Ticket');
    const tickets = await Ticket.find({ event: event._id }).populate('user', 'fullName email');
    const visitors = tickets.map(t => ({
      attendee: t.user,
      ticketType: t.ticketType,
      entryStatus: t.status
    }));
    res.json(visitors);
  } catch (error) {
    res.status(500).json({ message: 'Could not fetch visitors' });
  }
});

// Book staff ticket (organizer only)
router.post('/:id/staff-ticket', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    if (event.organizer.toString() !== req.user.id) return res.status(403).json({ message: 'Forbidden' });
    const { staffName, staffEmail, staffPhone, ticketType } = req.body;
    if (!staffName || !staffEmail) return res.status(400).json({ message: 'Missing staff info' });
    const Ticket = require('../models/Ticket');
    const ticket = await Ticket.create({
      event: event._id,
      ticketType: ticketType || 'Staff',
      recipientName: staffName,
      recipientEmail: staffEmail,
      recipientPhone: staffPhone,
      status: 'staff',
    });
    res.json({ message: 'Staff ticket booked', ticket });
  } catch (error) {
    res.status(500).json({ message: 'Could not book staff ticket' });
  }
});

module.exports = router;

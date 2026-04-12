const express = require('express');
const multer = require('multer');
const auth = require('../middleware/auth');
const { connectDB } = require('../config/db');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

router.get('/', async (req, res) => {
  try {
    const supabase = await connectDB();
    const { data: events, error } = await supabase.from('events').select('*').order('date', { ascending: true });
    if (error) throw error;
    return res.json(events);
  } catch (error) {
    console.error('[EVENTS] Error fetching events:', error.message, error.code);
    res.status(500).json({ message: 'Could not fetch events', error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const supabase = await connectDB();
    const { data: event, error } = await supabase.from('events').select('*').eq('id', req.params.id).single();
    if (error && error.code !== 'PGRST116') throw error;
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json(event);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Could not fetch event' });
  }
});

router.post('/', auth, upload.single('banner'), async (req, res) => {
  try {
    const { title, description, aboutUs, date, location, category, ticketTypes } = req.body;
    if (!title || !date || !location || !ticketTypes) return res.status(400).json({ message: 'Required fields missing' });
    const banner = req.file ? `/uploads/${req.file.filename}` : '/banner.jpg';
    const eventData = {
      title,
      description,
      about_us: aboutUs || '',
      date: new Date(date).toISOString(),
      location,
      category: category || 'General',
      banner,
      organizer: req.user.id,
      ticketTypes: JSON.parse(ticketTypes),
      status: 'pending',
      published: false,
      created_at: new Date().toISOString(),
    };

    const supabase = await connectDB();
    const { data: event, error } = await supabase.from('events').insert(eventData).select().single();
    if (error) throw error;
    res.json(event);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Could not create event' });
  }
});


// Get all events for the logged-in organizer
router.get('/my-events', auth, async (req, res) => {
  try {
    const supabase = await connectDB();
    const { data: events, error } = await supabase.from('events').select('*').eq('organizer', req.user.id).order('date', { ascending: true });
    if (error) throw error;
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: 'Could not fetch organizer events' });
  }
});

// Edit event (organizer only)
router.put('/:id', auth, upload.single('banner'), async (req, res) => {
  try {
    const supabase = await connectDB();
    const { data: existingEvent, error: fetchError } = await supabase.from('events').select('*').eq('id', req.params.id).single();
    if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;
    if (!existingEvent) return res.status(404).json({ message: 'Event not found' });
    if (existingEvent.organizer !== req.user.id) return res.status(403).json({ message: 'Forbidden' });

    const { title, description, aboutUs, date, location, category, ticketTypes } = req.body;
    const updates = {};
    if (title) updates.title = title;
    if (description) updates.description = description;
    if (aboutUs !== undefined) updates.about_us = aboutUs;
    if (date) updates.date = new Date(date).toISOString();
    if (location) updates.location = location;
    if (category) updates.category = category;
    if (ticketTypes) updates.ticketTypes = JSON.parse(ticketTypes);
    if (req.file) updates.banner = `/uploads/${req.file.filename}`;

    const { data: event, error } = await supabase.from('events').update(updates).eq('id', req.params.id).select().single();
    if (error) throw error;
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: 'Could not update event' });
  }
});

// Delete event (organizer only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const supabase = await connectDB();
    const { data: existingEvent, error: fetchError } = await supabase.from('events').select('*').eq('id', req.params.id).single();
    if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;
    if (!existingEvent) return res.status(404).json({ message: 'Event not found' });
    if (existingEvent.organizer !== req.user.id) return res.status(403).json({ message: 'Forbidden' });

    const { error } = await supabase.from('events').delete().eq('id', req.params.id);
    if (error) throw error;
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

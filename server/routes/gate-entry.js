const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { connectDB } = require('../config/db');

// Middleware to verify gate entry staff authorization
const requireGateStaff = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretjwtkey');
    const allowedRoles = ['admin', 'gate_entry', 'organizer'];
    if (!allowedRoles.includes(decoded.role)) {
      return res.status(403).json({ message: 'Unauthorized - gate entry staff only' });
    }

    req.userId = decoded.id;
    req.userRole = decoded.role;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

/**
 * POST /api/gate-entry/scan
 * Verify and scan a ticket at gate entry
 * Body: { ticketId, accessCode, eventId }
 */
router.post('/scan', requireGateStaff, async (req, res) => {
  try {
    const supabase = await connectDB();
    const { ticketId, accessCode, eventId } = req.body;

    if (!ticketId || !accessCode) {
      return res.status(400).json({ message: 'Ticket ID and access code required' });
    }

    // Fetch ticket from Supabase
    const { data: ticket, error: ticketError } = await supabase
      .from('tickets')
      .select('*, event:events(*), attendee:users(*)')
      .eq('id', ticketId)
      .single();

    if (ticketError || !ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // Verify access code (SMS code)
    const codeValid = ticket.sms_code === accessCode && 
      (!ticket.sms_code_expiry || new Date(ticket.sms_code_expiry) > new Date());
    
    if (!codeValid) {
      return res.status(403).json({ message: 'Invalid or expired access code' });
    }

    // Check if ticket is already used (prevent double entry)
    if (ticket.status === 'used' || ticket.entry_timestamp) {
      return res.status(400).json({ 
        message: 'Ticket already used for entry',
        data: { 
          ticketId,
          attendee: ticket.attendee?.full_name || 'Guest',
          previousEntryTime: ticket.entry_timestamp
        }
      });
    }

    // Mark ticket as entered
    const { data: updatedTicket, error: updateError } = await supabase
      .from('tickets')
      .update({
        status: 'used',
        entry_timestamp: new Date().toISOString(),
        gate_entry_staff_id: req.userId,
        wristband_status: 'pending' // Default pending until staff issues wristband
      })
      .eq('id', ticketId)
      .select('*, event:events(*), attendee:users(*)')
      .single();

    if (updateError) {
      console.error('Error updating ticket:', updateError);
      return res.status(500).json({ message: 'Could not mark entry' });
    }

    // Log entry in gate_entry_logs
    const { error: logError } = await supabase
      .from('gate_entry_logs')
      .insert({
        ticket_id: ticketId,
        event_id: ticket.event_id,
        attendee_id: ticket.user_id,
        gate_staff_id: req.userId,
        entry_timestamp: new Date().toISOString(),
        wristband_issued: false
      });

    if (logError) {
      console.error('Error creating gate entry log:', logError);
      // Continue anyway - log creation failure is non-critical
    }

    return res.json({
      message: 'Ticket verified successfully',
      data: {
        ticketId: updatedTicket.id,
        attendeeName: updatedTicket.attendee?.full_name || 'Guest',
        attendeeEmail: updatedTicket.attendee?.email,
        attendeePhone: updatedTicket.attendee?.phone,
        eventTitle: updatedTicket.event?.title,
        ticketType: updatedTicket.ticket_type,
        entryTime: updatedTicket.entry_timestamp,
        wristbandStatus: updatedTicket.wristband_status,
        status: updatedTicket.status
      }
    });
  } catch (error) {
    console.error('Gate entry scan error:', error);
    res.status(500).json({ message: 'Error scanning ticket' });
  }
});

/**
 * POST /api/gate-entry/issue-wristband
 * Issue wristband to attendee after ticket is scanned
 * Body: { ticketId, wristbandNumber }
 */
router.post('/issue-wristband', requireGateStaff, async (req, res) => {
  try {
    const supabase = await connectDB();
    const { ticketId, wristbandNumber } = req.body;

    if (!ticketId) {
      return res.status(400).json({ message: 'Ticket ID required' });
    }

    // Fetch ticket
    const { data: ticket, error: ticketError } = await supabase
      .from('tickets')
      .select('*, attendee:users(*)')
      .eq('id', ticketId)
      .single();

    if (ticketError || !ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // Check if ticket has been scanned
    if (ticket.status !== 'used' || !ticket.entry_timestamp) {
      return res.status(400).json({ message: 'Ticket must be scanned first before issuing wristband' });
    }

    // Update wristband status
    const { data: updatedTicket, error: updateError } = await supabase
      .from('tickets')
      .update({
        wristband_status: 'issued',
        wristband_number: wristbandNumber || null,
        wristband_issued_at: new Date().toISOString(),
        wristband_issued_by: req.userId
      })
      .eq('id', ticketId)
      .select('*, attendee:users(*)')
      .single();

    if (updateError) {
      console.error('Error updating wristband:', updateError);
      return res.status(500).json({ message: 'Could not issue wristband' });
    }

    // Update gate entry log
    const { error: logError } = await supabase
      .from('gate_entry_logs')
      .update({
        wristband_issued: true,
        wristband_number: wristbandNumber || null,
        wristband_issued_at: new Date().toISOString()
      })
      .eq('ticket_id', ticketId);

    if (logError) {
      console.error('Error updating gate entry log:', logError);
      // Continue anyway
    }

    return res.json({
      message: 'Wristband issued successfully',
      data: {
        ticketId: updatedTicket.id,
        attendeeName: updatedTicket.attendee?.full_name || 'Guest',
        wristbandNumber: wristbandNumber,
        wristbandStatus: updatedTicket.wristband_status,
        issuedAt: updatedTicket.wristband_issued_at
      }
    });
  } catch (error) {
    console.error('Issue wristband error:', error);
    res.status(500).json({ message: 'Error issuing wristband' });
  }
});

/**
 * GET /api/gate-entry/entry-logs?eventId=xxx
 * Get list of all scanned/entered tickets for an event
 */
router.get('/entry-logs', requireGateStaff, async (req, res) => {
  try {
    const supabase = await connectDB();
    const { eventId } = req.query;

    if (!eventId) {
      return res.status(400).json({ message: 'Event ID required' });
    }

    const { data: logs, error } = await supabase
      .from('gate_entry_logs')
      .select('*, ticket:tickets(*), attendee:users(*), event:events(*)')
      .eq('event_id', eventId)
      .order('entry_timestamp', { ascending: false });

    if (error) {
      console.error('Error fetching entry logs:', error);
      return res.status(500).json({ message: 'Could not fetch entry logs' });
    }

    // Summary stats
    const totalScanned = logs.length;
    const wristbandsIssued = logs.filter(l => l.wristband_issued).length;
    const pendingWristbands = logs.filter(l => !l.wristband_issued).length;

    return res.json({
      data: logs,
      stats: {
        totalScanned,
        wristbandsIssued,
        pendingWristbands
      }
    });
  } catch (error) {
    console.error('Entry logs error:', error);
    res.status(500).json({ message: 'Error fetching entry logs' });
  }
});

/**
 * GET /api/gate-entry/entry-logs/:ticketId
 * Get entry log for a specific ticket
 */
router.get('/entry-logs/:ticketId', requireGateStaff, async (req, res) => {
  try {
    const supabase = await connectDB();
    const { ticketId } = req.params;

    const { data: log, error } = await supabase
      .from('gate_entry_logs')
      .select('*, ticket:tickets(*), attendee:users(*)')
      .eq('ticket_id', ticketId)
      .single();

    if (error || !log) {
      return res.status(404).json({ message: 'Entry log not found' });
    }

    return res.json({ data: log });
  } catch (error) {
    console.error('Entry log error:', error);
    res.status(500).json({ message: 'Error fetching entry log' });
  }
});

module.exports = router;

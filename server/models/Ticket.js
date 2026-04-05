const mongoose = require('mongoose');

const TicketSchema = new mongoose.Schema({
});

// Supabase helper placeholder for 'tickets' table
module.exports = mongoose.model('Ticket', TicketSchema);

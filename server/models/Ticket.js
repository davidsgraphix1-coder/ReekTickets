const mongoose = require('mongoose');

const TicketSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  ticketType: String,
  price: Number,
  reference: String,
  smsCode: String,
  smsCodeExpiry: Date,
  status: { type: String, default: 'active' },
  // Additional fields for complimentary and physical tickets
  recipientName: String,
  recipientEmail: String,
  recipientPhone: String,
  pickupLocation: String,
  pickupDate: Date,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Ticket', TicketSchema);

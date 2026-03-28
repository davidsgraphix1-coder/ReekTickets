const mongoose = require('mongoose');

const TicketTypeSchema = new mongoose.Schema({
  type: String,
  price: Number,
  quantity: Number,
});

const EventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  date: Date,
  location: String,
  category: String,
  banner: String,
  organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  ticketTypes: [TicketTypeSchema],
  status: { type: String, enum: ['pending','approved','rejected'], default: 'pending' },
  published: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Event', EventSchema);

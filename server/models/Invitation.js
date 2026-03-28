const mongoose = require('mongoose');

const InvitationSchema = new mongoose.Schema({
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  guestEmail: { type: String, required: true },
  status: { type: String, enum: ['sent', 'accepted', 'declined'], default: 'sent' },
  sentAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Invitation', InvitationSchema);

const mongoose = require('mongoose');

const ReportMessageSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  user_name: { type: String, required: true },
  role: { type: String, enum: ['attendee', 'organizer', 'vendor', 'agent', 'admin'], required: true },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('ReportMessage', ReportMessageSchema);
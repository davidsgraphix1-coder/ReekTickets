const mongoose = require('mongoose');

const AnnouncementSchema = new mongoose.Schema({
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdByName: { type: String, required: true },
  roles: [{ type: String, enum: ['attendee', 'organizer', 'vendor', 'agent', 'admin'], required: true }],
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Announcement', AnnouncementSchema);

const mongoose = require('mongoose');

const SupportMessageSchema = new mongoose.Schema({
  chatId: { type: mongoose.Schema.Types.ObjectId, ref: 'SupportChat', required: true },
  sender: { type: String, enum: ['user', 'admin'], required: true },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  fileUrl: String,
  emoji: String,
}, { timestamps: true });

module.exports = mongoose.model('SupportMessage', SupportMessageSchema);

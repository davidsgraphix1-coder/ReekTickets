const mongoose = require('mongoose');

const SupportUserSchema = new mongoose.Schema({
  name: String,
  email: String,
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  avatar: String,
  banned: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('SupportUser', SupportUserSchema);

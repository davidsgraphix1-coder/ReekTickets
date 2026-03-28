const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  firstName: { type: String },
  lastName: { type: String },
  email: { type: String, required: true, unique: true, lowercase: true },
  phone: { type: String, required: true },
  role: { type: String, enum: ['attendee', 'organizer', 'vendor', 'agent', 'admin'], default: 'attendee' },
  status: { type: String, enum: ['active', 'suspended', 'banned'], default: 'active' },
  password: { type: String, required: true },
  failedAttempts: { type: Number, default: 0 },
  lastFailedAttempt: { type: Date },
  lockUntil: { type: Date },

  // Organizer specific fields
  businessName: { type: String },
  contactNumber: { type: String },
  businessPartners: [{ firstName: String, lastName: String, phone: String }],
  businessDetails: {
    country: { type: String, default: 'Ghana' },
    city: { type: String },
    address: { type: String },
    zipCode: { type: String },
  },
  termsAccepted: { type: Boolean, default: false },

  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', UserSchema);

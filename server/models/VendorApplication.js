const mongoose = require('mongoose');

const VendorApplicationSchema = new mongoose.Schema({
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  vendorType: { type: String, enum: ['food', 'merchandise', 'services', 'entertainment'], required: true },
  payableAmount: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  applicationDate: { type: Date, default: Date.now },
  booth: String,
  notes: String,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('VendorApplication', VendorApplicationSchema);
const mongoose = require('mongoose');

const CouponSchema = new mongoose.Schema({
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  code: { type: String, required: true, unique: true },
  discount: Number,
  validFrom: Date,
  validTo: Date,
  usageCount: { type: Number, default: 0 },
  maxUsage: Number,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Coupon', CouponSchema);

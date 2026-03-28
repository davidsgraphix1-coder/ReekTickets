const mongoose = require('mongoose');

const SalesAgentSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  referral_code: { type: String, required: true, unique: true },
  total_sales: { type: Number, default: 0 },
  total_commission: { type: Number, default: 0 },
  commission_rate: { type: Number, default: 0.05 }, // 5% default commission
  created_at: { type: Date, default: Date.now },
  // Commission levels
  level: { type: String, enum: ['bronze', 'silver', 'gold'], default: 'bronze' },
  level_threshold: { type: Number, default: 0 }, // Sales threshold for level
});

module.exports = mongoose.model('SalesAgent', SalesAgentSchema);
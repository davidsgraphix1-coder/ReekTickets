const mongoose = require('mongoose');

const AgentSalesSchema = new mongoose.Schema({
  sale_id: { type: String, required: true, unique: true },
  agent_id: { type: mongoose.Schema.Types.ObjectId, ref: 'SalesAgent', required: true },
  event_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  buyer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  ticket_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Ticket', required: true },
  quantity: { type: Number, required: true },
  amount: { type: Number, required: true },
  commission: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  status: { type: String, enum: ['pending', 'completed', 'cancelled'], default: 'completed' },
});

module.exports = mongoose.model('AgentSales', AgentSalesSchema);
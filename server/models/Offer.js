const mongoose = require('mongoose');

const OfferSchema = new mongoose.Schema({
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: String,
  description: String,
  discount: Number,
  code: String,
  validFrom: Date,
  validTo: Date,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Offer', OfferSchema);

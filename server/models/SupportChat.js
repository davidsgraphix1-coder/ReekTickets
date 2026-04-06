const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: String,
    enum: ['user', 'admin', 'system'],
    default: 'user',
  },
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  read: { type: Boolean, default: false },
});

const SupportChatSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    category: { type: String, required: true },
    status: {
      type: String,
      enum: ['open', 'pending', 'closed'],
      default: 'open',
    },
    messages: [messageSchema],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('SupportChat', SupportChatSchema);

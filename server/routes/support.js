const express = require('express');
const router = express.Router();
const User = require('../models/User');
const SupportChat = require('../models/SupportChat');

// Middleware: Only allow logged-in users (replace with real auth in production)
function requireUser(req, res, next) {
  if (!req.headers['x-user-id']) return res.status(401).json({ message: 'Not authenticated' });
  req.userId = req.headers['x-user-id'];
  next();
}
function requireAdmin(req, res, next) {
  // TODO: Replace with real admin check
  if (!req.headers['x-admin']) return res.status(403).json({ message: 'Admin only' });
  next();
}

// User: Create or get open chat
router.post('/chat', requireUser, async (req, res) => {
  const { category } = req.body;
  let chat = await SupportChat.findOne({ userId: req.userId, status: 'open' });
  if (!chat) {
    chat = await SupportChat.create({ userId: req.userId, category, messages: [] });
  }
  res.json(chat);
});

// User: Send message
router.post('/chat/:chatId/message', requireUser, async (req, res) => {
  const { text, fileUrl, emoji } = req.body;
  const chat = await SupportChat.findById(req.params.chatId);
  if (!chat) return res.status(404).json({ message: 'Chat not found' });
  chat.messages.push({ sender: 'user', text, fileUrl, emoji });
  await chat.save();
  res.json(chat);
});

// User: Get chat messages
router.get('/chat/:chatId/messages', requireUser, async (req, res) => {
  const chat = await SupportChat.findById(req.params.chatId);
  if (!chat) return res.status(404).json({ message: 'Chat not found' });
  res.json(chat.messages);
});

// Admin: List all chats
router.get('/admin/chats', requireAdmin, async (req, res) => {
  const chats = await SupportChat.find().populate('userId');
  res.json(chats);
});

// Admin: Reply to chat
router.post('/admin/chat/:chatId/message', requireAdmin, async (req, res) => {
  const { text, fileUrl, emoji } = req.body;
  const chat = await SupportChat.findById(req.params.chatId);
  if (!chat) return res.status(404).json({ message: 'Chat not found' });
  chat.messages.push({ sender: 'admin', text, fileUrl, emoji });
  await chat.save();
  res.json(chat);
});

// Admin: Close chat
router.post('/admin/chat/:chatId/close', requireAdmin, async (req, res) => {
  const chat = await SupportChat.findById(req.params.chatId);
  if (!chat) return res.status(404).json({ message: 'Chat not found' });
  chat.status = 'closed';
  await chat.save();
  res.json(chat);
});

// Admin: Delete chat
router.delete('/admin/chat/:chatId', requireAdmin, async (req, res) => {
  await SupportChat.findByIdAndDelete(req.params.chatId);
  res.json({ success: true });
});

// Admin: Ban user
router.post('/admin/user/:userId/ban', requireAdmin, async (req, res) => {
  const user = await User.findById(req.params.userId);
  if (!user) return res.status(404).json({ message: 'User not found' });
  user.status = 'banned';
  await user.save();
  res.json(user);
});

// Admin: Analytics
router.get('/admin/analytics', requireAdmin, async (req, res) => {
  const totalChats = await SupportChat.countDocuments();
  const openChats = await SupportChat.countDocuments({ status: 'open' });
  const closedChats = await SupportChat.countDocuments({ status: 'closed' });
  const pendingChats = await SupportChat.countDocuments({ status: 'pending' });
  res.json({ totalChats, openChats, closedChats, pendingChats });
});

module.exports = router;

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getUserById, updateUser } = require('../models/User');
const {
  getSupportChatById,
  createSupportChat,
  updateSupportChat,
  deleteSupportChat,
  findSupportChatByUser,
  getAllSupportChats
} = require('../models/SupportChat');

function requireAdminRole(req, res, next) {
  const role = req.user?.role;
  const email = req.user?.email?.toLowerCase();
  const isFallbackAdmin = email === 'ceoofreektickets@gmail.com';
  if (!isFallbackAdmin && (!role || !['admin', 'supporter'].includes(role))) {
    return res.status(403).json({ message: 'Admin or support role required' });
  }
  next();
}

function requireAdminOnly(req, res, next) {
  const email = req.user?.email?.toLowerCase();
  const isFallbackAdmin = email === 'ceoofreektickets@gmail.com';
  if (!isFallbackAdmin && req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Admin only' });
  }
  next();
}

router.options('/chat', (req, res) => res.sendStatus(200));
router.options('/chat/:chatId/message', (req, res) => res.sendStatus(200));
router.options('/chat/:chatId/messages', (req, res) => res.sendStatus(200));

// User: Create or get open chat
router.post('/chat', auth, async (req, res) => {
  try {
    const { category } = req.body;
    const userId = req.user.id;
    let chat = await findSupportChatByUser(userId, 'open');
    if (!chat) {
      chat = await createSupportChat({ userId, category, messages: [], status: 'open', createdAt: new Date().toISOString() });
    }
    return res.json(chat);
  } catch (error) {
    console.error('Support chat create error:', error);
    return res.status(500).json({ message: 'Could not create or fetch chat', error: error.message });
  }
});

// User: Send message
router.post('/chat/:chatId/message', auth, async (req, res) => {
  try {
    const { text, fileUrl, emoji, id } = req.body;
    const chat = await getSupportChatById(req.params.chatId);
    if (!chat) return res.status(404).json({ message: 'Chat not found' });
    if (chat.userId !== req.user.id) return res.status(403).json({ message: 'Not authorized for this chat' });

    const messages = Array.isArray(chat.messages) ? chat.messages : [];
    const newMessage = {
      sender: 'user',
      id: id || `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      text: text || '',
      fileUrl: fileUrl || null,
      emoji: emoji || null,
      timestamp: new Date().toISOString(),
    };
    messages.push(newMessage);
    const updated = await updateSupportChat(chat.id, { messages, updatedAt: new Date().toISOString(), status: 'open' });
    return res.json(updated);
  } catch (error) {
    console.error('Support chat send message error:', error);
    return res.status(500).json({ message: 'Could not send message', error: error.message });
  }
});

// User: Get chat messages
router.get('/chat/:chatId/messages', auth, async (req, res) => {
  try {
    const chat = await getSupportChatById(req.params.chatId);
    if (!chat) return res.status(404).json({ message: 'Chat not found' });
    if (chat.userId !== req.user.id) return res.status(403).json({ message: 'Not authorized for this chat' });
    return res.json(chat.messages || []);
  } catch (error) {
    console.error('Support chat fetch messages error:', error);
    return res.status(500).json({ message: 'Could not fetch messages', error: error.message });
  }
});

// Admin: List all chats
router.get('/admin/chats', auth, requireAdminRole, async (req, res) => {
  try {
    const chats = await getAllSupportChats();
    const chatsWithUser = await Promise.all(chats.map(async (chat) => {
      const user = await getUserById(chat.userId);
      return { ...chat, userId: user || { id: chat.userId } };
    }));
    return res.json(chatsWithUser);
  } catch (error) {
    console.error('Support admin chats error:', error);
    return res.status(500).json({ message: 'Could not fetch chats', error: error.message });
  }
});

// Admin: Reply to chat
router.post('/admin/chat/:chatId/message', auth, requireAdminRole, async (req, res) => {
  try {
    const { text, fileUrl, emoji, id } = req.body;
    const chat = await getSupportChatById(req.params.chatId);
    if (!chat) return res.status(404).json({ message: 'Chat not found' });
    const messages = Array.isArray(chat.messages) ? chat.messages : [];
    const newMessage = {
      sender: 'admin',
      id: id || `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      text: text || '',
      fileUrl: fileUrl || null,
      emoji: emoji || null,
      timestamp: new Date().toISOString(),
    };
    messages.push(newMessage);
    const updated = await updateSupportChat(chat.id, { messages, updatedAt: new Date().toISOString() });
    return res.json(updated);
  } catch (error) {
    console.error('Support admin send message error:', error);
    return res.status(500).json({ message: 'Could not send admin message', error: error.message });
  }
});

// Admin: Close chat
router.post('/admin/chat/:chatId/close', auth, requireAdminRole, async (req, res) => {
  try {
    const chat = await getSupportChatById(req.params.chatId);
    if (!chat) return res.status(404).json({ message: 'Chat not found' });
    const updated = await updateSupportChat(chat.id, { status: 'closed', updatedAt: new Date().toISOString() });
    return res.json(updated);
  } catch (error) {
    console.error('Support admin close chat error:', error);
    return res.status(500).json({ message: 'Could not close chat', error: error.message });
  }
});

// Admin: Delete chat
router.delete('/admin/chat/:chatId', auth, requireAdminRole, async (req, res) => {
  try {
    await deleteSupportChat(req.params.chatId);
    return res.json({ success: true });
  } catch (error) {
    console.error('Support admin delete chat error:', error);
    return res.status(500).json({ message: 'Could not delete chat', error: error.message });
  }
});

// Admin: Ban user
router.post('/admin/user/:userId/ban', auth, requireAdminOnly, async (req, res) => {
  try {
    const user = await getUserById(req.params.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const updated = await updateUser(user.id, { status: 'banned' });
    return res.json(updated);
  } catch (error) {
    console.error('Support admin ban user error:', error);
    return res.status(500).json({ message: 'Could not ban user', error: error.message });
  }
});

// Admin: Analytics
router.get('/admin/analytics', auth, requireAdminRole, async (req, res) => {
  try {
    const chats = await getAllSupportChats();
    const totalChats = chats.length;
    const openChats = chats.filter(chat => chat.status === 'open').length;
    const closedChats = chats.filter(chat => chat.status === 'closed').length;
    const pendingChats = chats.filter(chat => chat.status === 'pending').length;
    return res.json({ totalChats, openChats, closedChats, pendingChats });
  } catch (error) {
    console.error('Support admin analytics error:', error);
    return res.status(500).json({ message: 'Could not fetch analytics', error: error.message });
  }
});

module.exports = router;

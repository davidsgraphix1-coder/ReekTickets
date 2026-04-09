const { Server } = require('socket.io');
const { getSupportChatById, updateSupportChat } = require('../models/SupportChat');

let io;

function initSocket(server) {
  io = new Server(server, {
    cors: { origin: '*' }
  });

  io.on('connection', (socket) => {
    socket.on('join', (chatId) => {
      socket.join(chatId);
    });

    socket.on('userMessage', async ({ chatId, message }) => {
      try {
        const chat = await getSupportChatById(chatId);
        if (chat) {
          const messages = Array.isArray(chat.messages) ? chat.messages : [];
          messages.push({ sender: 'user', text: message.text || '', fileUrl: message.fileUrl || null, emoji: message.emoji || null, timestamp: message.timestamp || new Date().toISOString() });
          await updateSupportChat(chat.id, { messages, updatedAt: new Date().toISOString() });
        }
      } catch (error) {
        console.error('Socket userMessage save error:', error);
      }
      io.to(chatId).emit('newMessage', { sender: 'user', ...message });
    });

    socket.on('adminMessage', async ({ chatId, message }) => {
      try {
        const chat = await getSupportChatById(chatId);
        if (chat) {
          const messages = Array.isArray(chat.messages) ? chat.messages : [];
          messages.push({ sender: 'admin', text: message.text || '', fileUrl: message.fileUrl || null, emoji: message.emoji || null, timestamp: message.timestamp || new Date().toISOString() });
          await updateSupportChat(chat.id, { messages, updatedAt: new Date().toISOString() });
        }
      } catch (error) {
        console.error('Socket adminMessage save error:', error);
      }
      io.to(chatId).emit('newMessage', { sender: 'admin', ...message });
    });
  });
}

module.exports = { initSocket };

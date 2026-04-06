const { Server } = require('socket.io');
const SupportChat = require('../models/SupportChat');

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
        const chat = await SupportChat.findById(chatId);
        if (chat) {
          chat.messages.push({ sender: 'user', text: message.text, fileUrl: message.fileUrl, timestamp: message.timestamp });
          await chat.save();
        }
      } catch (error) {
        console.error('Socket userMessage save error:', error);
      }
      io.to(chatId).emit('newMessage', { sender: 'user', ...message });
    });

    socket.on('adminMessage', async ({ chatId, message }) => {
      try {
        const chat = await SupportChat.findById(chatId);
        if (chat) {
          chat.messages.push({ sender: 'admin', text: message.text, fileUrl: message.fileUrl, timestamp: message.timestamp });
          await chat.save();
        }
      } catch (error) {
        console.error('Socket adminMessage save error:', error);
      }
      io.to(chatId).emit('newMessage', { sender: 'admin', ...message });
    });
  });
}

module.exports = { initSocket };

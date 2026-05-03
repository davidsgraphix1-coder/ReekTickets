import React, { useState, useRef, useEffect } from 'react';
import { FaPaperPlane, FaTimes } from 'react-icons/fa';
import { useSocket } from '../hooks/useSocket';
import axios from 'axios';
import './RealtimeChat.css';

export default function RealtimeChat({ userId, userName, isOpen, onClose }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatId, setChatId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);
  const { on, off, emit } = useSocket(chatId, true);
  
  const token = localStorage.getItem('reek_token');
  const headers = { Authorization: `Bearer ${token}` };

  // Initialize or fetch existing chat
  useEffect(() => {
    if (!isOpen || !userId) return;

    const initChat = async () => {
      try {
        setLoading(true);
        // Try to fetch existing chat
        const res = await axios.get(`/api/support/user/chats`, { headers });
        const existingChat = res.data.find(chat => chat.user_id === userId);
        
        if (existingChat) {
          setChatId(existingChat.id || existingChat._id);
          setMessages(existingChat.messages || []);
        } else {
          // Create new chat
          const newChatRes = await axios.post('/api/support/create', {
            userId,
            category: 'general',
            messages: []
          }, { headers });
          setChatId(newChatRes.data.id || newChatRes.data._id);
          setMessages([]);
        }
        setError('');
      } catch (err) {
        console.error('Failed to initialize chat:', err);
        setError('Failed to load chat. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    initChat();
  }, [isOpen, userId]);

  // Listen for new messages
  useEffect(() => {
    if (!chatId) return;

    const handleNewMessage = (msg) => {
      setMessages(prev => {
        const exists = prev.some(m => m.id === msg.id);
        if (exists) return prev;
        return [...prev, msg];
      });
    };

    on('newMessage', handleNewMessage);

    return () => {
      off('newMessage');
    };
  }, [chatId, on, off]);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !chatId) return;

    const messageText = newMessage.trim();
    setNewMessage('');

    try {
      const messageObj = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        text: messageText,
        timestamp: new Date().toISOString()
      };

      // Send via API
      await axios.post(`/api/support/chat/${chatId}/message`, {
        text: messageText,
        id: messageObj.id
      }, { headers });

      // Emit via socket for real-time
      emit('userMessage', { chatId, message: messageObj });

      // Add to local messages
      setMessages(prev => [...prev, { sender: 'user', ...messageObj }]);
    } catch (err) {
      console.error('Failed to send message:', err);
      setError('Failed to send message. Please try again.');
      setNewMessage(messageText); // Restore message on error
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="realtime-chat-container">
      <div className="chat-header">
        <h3>Support Chat - {userName || 'Support'}</h3>
        <button className="close-btn" onClick={onClose} aria-label="Close chat">
          <FaTimes />
        </button>
      </div>

      {error && <div className="chat-error">{error}</div>}

      <div className="messages-container">
        {loading ? (
          <div className="chat-loading">Loading chat...</div>
        ) : messages.length === 0 ? (
          <div className="chat-empty">
            <p>Start a conversation with support</p>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div key={msg.id || idx} className={`message ${msg.sender || 'user'}`}>
              <div className="message-content">
                {msg.text}
                {msg.fileUrl && <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer">Attachment</a>}
              </div>
              <div className="message-time">
                {new Date(msg.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-area">
        <textarea
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message... (Shift+Enter for new line)"
          rows="2"
        />
        <button
          onClick={handleSendMessage}
          disabled={!newMessage.trim() || loading}
          className="send-btn"
          aria-label="Send message"
        >
          <FaPaperPlane /> Send
        </button>
      </div>
    </div>
  );
}

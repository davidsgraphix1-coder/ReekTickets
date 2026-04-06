import React, { useState, useEffect } from 'react';
import ChatButton from './ChatButton';
import ChatWindow from './ChatWindow';
import styles from './SupportChat.module.css';
import { FaInfoCircle, FaTicketAlt, FaCreditCard, FaUsers, FaStore, FaUserShield, FaUserCircle, FaUndo, FaExclamationTriangle } from 'react-icons/fa';
import { socket } from '../services/socket';

const SUPPORT_CATEGORIES = [
  { key: 'event', label: 'Event Inquiry & Information', icon: FaInfoCircle, color: '#a855f7' },
  { key: 'ticket', label: 'Ticket Purchase Issues', icon: FaTicketAlt, color: '#ec4899' },
  { key: 'payment', label: 'Payment & Billing', icon: FaCreditCard, color: '#3b82f6' },
  { key: 'organizer', label: 'Organizer Support', icon: FaUsers, color: '#f59e42' },
  { key: 'vendor', label: 'Vendor Support', icon: FaStore, color: '#f97316' },
  { key: 'agent', label: 'Sales Agent Support', icon: FaUserShield, color: '#14b8a6' },
  { key: 'account', label: 'Account Login / Signup Issues', icon: FaUserCircle, color: '#6366f1' },
  { key: 'refund', label: 'Refund Requests', icon: FaUndo, color: '#10b981' },
  { key: 'fraud', label: 'Report Fraud / Suspicious Activity', icon: FaExclamationTriangle, color: '#ef4444' },
];

const AUTO_REPLIES = {
  payment: 'For Paystack payment issues, please ensure your card is enabled for online transactions. If you were charged but did not receive a ticket, contact support with your transaction reference.',
  refund: 'Refund requests are processed within 3-5 business days. Please provide your ticket code and payment reference.',
  fraud: 'Thank you for reporting suspicious activity. Our team will investigate and respond as soon as possible.',
  account: 'For login or signup issues, try resetting your password. If you still have trouble, contact support with your email address.'
};

export default function SupportChat({ user }) {
  const [open, setOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [chatId, setChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [connected, setConnected] = useState(false);

  const currentUser = user || (typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('reek_user') || 'null') : null);
  const isMobile = typeof window !== 'undefined' ? window.innerWidth < 700 : false;
  // Use real avatar if available
  const userAvatar = currentUser?.avatarUrl || currentUser?.profilePic || 'https://i.pravatar.cc/120?img=12';

  const handleSend = (msg) => {
    if (!chatId || !msg.trim()) return;
    const messageObj = { text: msg, timestamp: Date.now() };
    setMessages(prev => [...prev, { sender: 'user', ...messageObj }]);
    setInput('');
    socket.emit('userMessage', { chatId, message: messageObj });
    setTyping(true);
    // Auto-reply for certain categories
    if (AUTO_REPLIES[selectedCategory]) {
      setTimeout(() => {
        setMessages(prev => [...prev, { sender: 'admin', text: AUTO_REPLIES[selectedCategory], timestamp: Date.now() }]);
        setTyping(false);
      }, 900);
    }
  };

  // Handle file upload from chat
  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file || !chatId) return;
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });
    const data = await res.json();
    if (data.url) {
      const messageObj = { text: '', fileUrl: data.url, timestamp: Date.now() };
      setMessages(prev => [...prev, { sender: 'user', ...messageObj }]);
      socket.emit('userMessage', { chatId, message: messageObj });
    }
  };

  // Connect to socket and join chat room
  useEffect(() => {
    if (!open || !selectedCategory || !currentUser) return;
    // Fetch or create chat
    fetch('/api/support/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-id': currentUser._id || currentUser.id },
      body: JSON.stringify({ category: selectedCategory })
    })
      .then(res => res.json())
      .then(chat => {
        setChatId(chat._id);
        setMessages(chat.messages || []);
        socket.connect();
        socket.emit('join', chat._id);
        setConnected(true);
      });
    return () => {
      socket.disconnect();
      setConnected(false);
    };
  }, [open, selectedCategory, currentUser]);

  // Listen for new messages
  useEffect(() => {
    if (!connected) return;
    socket.on('newMessage', msg => {
      setMessages(m => [...m, msg]);
      setTyping(false);
    });
    return () => {
      socket.off('newMessage');
    };
  }, [connected]);

  return (
    <>
      <ChatButton onClick={() => setOpen(true)} />
      {open && (
        <div
          className={isMobile ? styles.mobileModal : styles.panelOverlay}
          style={{ pointerEvents: 'auto' }}
        >
          <div className={isMobile ? styles.mobilePanel : styles.panel}>
            <button
              className={styles.closeBtn}
              onClick={e => {
                e.stopPropagation();
                setOpen(false);
              }}
              aria-label="Close support chat"
              tabIndex={0}
              style={{ zIndex: 10000 }}
            >×</button>
            <div className={styles.panelContent}>
              {/* Top Section */}
              <div className={styles.topSection}>
                <div className={styles.bannerBg}>
                  <div className={styles.gradientOverlay}></div>
                </div>
                <div className={styles.topTextWrap}>
                  <h3 className={styles.wave}>Hi there <span role="img" aria-label="wave">👋</span></h3>
                  <h2 className={styles.welcome}>Welcome to ReekTickets Support</h2>
                  <p className={styles.subtitle}>We’re here to help you with your ticketing experience</p>
                  <div className={styles.agentAvatars}>
                    <img src={userAvatar} alt="Your profile" className={styles.agentAvatar} />
                  </div>
                </div>
              </div>
              {!currentUser ? (
                <div className={styles.authNotice}>
                  <p>Please log in to start a support chat. Your account information is required to continue.</p>
                </div>
              ) : (
                <>
                  <div className={styles.categoriesSection}>
                    <h4 className={styles.categoriesTitle}>How can we help?</h4>
                    <div className={styles.categoriesGrid}>
                      {SUPPORT_CATEGORIES.map(cat => {
                        const Icon = cat.icon;
                        return (
                          <button
                            key={cat.key}
                            className={styles.categoryBtn + (selectedCategory === cat.key ? ' ' + styles.selected : '')}
                            style={{ '--cat-color': cat.color }}
                            onClick={() => setSelectedCategory(cat.key)}
                            aria-label={cat.label}
                          >
                            <span className={styles.categoryIcon} style={{ background: cat.color }}>
                              <Icon size={22} />
                            </span>
                            <span className={styles.categoryLabel}>{cat.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  {selectedCategory && (
                    <div className={styles.chatSection}>
                      <ChatWindow
                        messages={messages}
                        onSend={handleSend}
                        input={input}
                        setInput={setInput}
                        onFile={handleFile}
                        typing={typing}
                        disabled={false}
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

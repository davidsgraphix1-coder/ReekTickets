import React, { useState, useEffect, useMemo } from 'react';
import ChatButton from './ChatButton';
import ChatWindow from './ChatWindow';
import styles from './SupportChat.module.css';
import { FaInfoCircle, FaTicketAlt, FaCreditCard, FaUsers, FaStore, FaUserShield, FaUserCircle, FaUndo, FaExclamationTriangle } from 'react-icons/fa';
import API_BASE from '../config/api';

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

const EMOJI_SET = ['😊', '👍', '🙏', '🎟️', '💬', '📎', '⚠️', '💳', '🔒', '💡', '🙌', '🎉', '✨', '🔥', '🙌🏾', '💯', '🛠️', '📌', '📝', '🚀', '👀', '💬', '🤝', '🔔', '🎫', '👍🏾', '🥳', '💥'];

const createMessage = ({ sender, text = '', fileUrl = null, emoji = null }) => ({
  id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
  sender,
  text,
  fileUrl,
  emoji,
  timestamp: new Date().toISOString(),
});

const buildSupportUrl = (path) => {
  const cleanedBase = API_BASE.replace(/\/+/g, '/').replace(/\/$/, '');
  const cleanedPath = path.startsWith('/') ? path : `/${path}`;
  return `${cleanedBase}${cleanedPath}`;
};

const buildSupportFallbackUrl = (path) => {
  const cleanedBase = API_BASE.replace(/\/api$/, '').replace(/\/+$/, '');
  const cleanedPath = path.startsWith('/') ? path : `/${path}`;
  return `${cleanedBase}${cleanedPath}`;
};

const supportFetch = async (path, options) => {
  const endpoints = [
    buildSupportUrl(path),
    buildSupportFallbackUrl(path),
    `/api${path}`,
    path,
  ];
  let lastError = null;
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint, options);
      if (response.status === 404 || response.status === 405) {
        lastError = new Error(`Request failed at ${endpoint} (${response.status})`);
        continue;
      }
      return response;
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError || new Error('Support API request failed');
};

export default function SupportChat({ user }) {
  const [open, setOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [chatId, setChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [chatError, setChatError] = useState('');

  const currentUser = user || (typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('reek_user') || 'null') : null);
  const authToken = typeof window !== 'undefined' ? localStorage.getItem('reek_token') : null;
  const isAuthenticated = Boolean(currentUser && authToken);
  const headers = useMemo(() => ({
    'Content-Type': 'application/json',
    ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
  }), [authToken]);
  const isMobile = typeof window !== 'undefined' ? window.innerWidth < 700 : false;
  const userAvatar = currentUser?.avatarUrl || currentUser?.profilePic || 'https://i.pravatar.cc/120?img=12';

  const addMessage = (message) => {
    setMessages(prev => {
      const exists = prev.some((m) => m.id && message.id && m.id === message.id);
      return exists ? prev : [...prev, message];
    });
  };

  const handleSend = async (msg) => {
    if (!chatId || !msg.trim()) return;

    const messageObj = createMessage({ sender: 'user', text: msg.trim() });
    addMessage(messageObj);
    setInput('');

    try {
      const response = await supportFetch(`/support/chat/${chatId}/message`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ text: messageObj.text, fileUrl: messageObj.fileUrl, emoji: messageObj.emoji, id: messageObj.id }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `Failed to send support message (${response.status})`);
      }
      setChatError('');
    } catch (error) {
      console.error('Failed to send support message', error);
      setChatError('Unable to send support message. Please try again.');
    }

    if (AUTO_REPLIES[selectedCategory]) {
      setTyping(true);
      setTimeout(() => {
        const autoMessage = createMessage({ sender: 'admin', text: AUTO_REPLIES[selectedCategory] });
        addMessage(autoMessage);
        setTyping(false);
      }, 900);
    }
  };

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file || !chatId) return;

    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await supportFetch('/upload', { method: 'POST', body: formData });
      const data = await res.json().catch(() => null);
      if (res.ok && data?.url) {
        const messageObj = createMessage({ sender: 'user', text: '', fileUrl: data.url });
        addMessage(messageObj);
        try {
          const messageResponse = await supportFetch(`/support/chat/${chatId}/message`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ text: messageObj.text, fileUrl: messageObj.fileUrl, emoji: messageObj.emoji, id: messageObj.id }),
          });
          if (!messageResponse.ok) {
            const errorData = await messageResponse.json().catch(() => null);
            throw new Error(errorData?.message || `Failed to send support file message (${messageResponse.status})`);
          }
        } catch (error) {
          console.error('Failed to send file support message', error);
          setChatError('Unable to attach file to support chat. Please try again.');
        }
      } else {
        throw new Error(data?.message || 'File upload failed');
      }
    } catch (error) {
      console.error('File upload failed', error);
      setChatError('File upload failed. Please try again.');
    }
  };

  useEffect(() => {
    if (!open || !selectedCategory || !isAuthenticated) {
      if (open && selectedCategory && currentUser && !authToken) {
        setChatError('Please log in to start a support chat.');
      }
      return;
    }

    let active = true;
    let pollInterval = null;

    const initChat = async () => {
      try {
        const response = await supportFetch('/support/chat', {
          method: 'POST',
          headers,
          body: JSON.stringify({ category: selectedCategory }),
        });
        const data = await response.json().catch(() => null);
        if (!response.ok) {
          throw new Error(data?.message || `Failed to start support chat (${response.status})`);
        }
        const chat = data;
        if (!active) return;
        const id = chat.id || chat._id;
        setChatId(id);
        setMessages(chat.messages || []);
        setChatError('');

        // Start polling for new messages
        pollInterval = setInterval(async () => {
          if (!active) return;
          try {
            const messagesResponse = await supportFetch(`/support/chat/${id}/messages`, {
              method: 'GET',
              headers,
            });
            if (messagesResponse.ok) {
              const messagesData = await messagesResponse.json().catch(() => null);
              if (Array.isArray(messagesData)) {
                setMessages(messagesData);
              }
            }
          } catch (error) {
            console.error('Failed to poll messages', error);
          }
        }, 2000); // Poll every 2 seconds
      } catch (error) {
        console.error('Failed to initialize support chat', error);
        setChatError(error.message || 'Unable to start support chat. Please try again.');
      }
    };

    initChat();

    return () => {
      active = false;
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [open, selectedCategory, currentUser, headers]);

  const handleEmojiSelect = (emoji) => {
    setInput((prev) => `${prev || ''}${emoji}`);
    setEmojiOpen(false);
  };

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
              onClick={(e) => {
                e.stopPropagation();
                setOpen(false);
              }}
              aria-label="Close support chat"
              tabIndex={0}
              style={{ zIndex: 10000 }}
            >×</button>
            <div className={styles.panelContent}>
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
              {!isAuthenticated ? (
                <div className={styles.authNotice}>
                  <p>Please log in to start a support chat. Your account information is required to continue.</p>
                </div>
              ) : (
                <>
                  <div className={styles.categoriesSection}>
                    <h4 className={styles.categoriesTitle}>How can we help?</h4>
                    <div className={styles.categoriesGrid}>
                      {SUPPORT_CATEGORIES.map((cat) => {
                        const Icon = cat.icon;
                        return (
                          <button
                            key={cat.key}
                            className={styles.categoryBtn + (selectedCategory === cat.key ? ` ${styles.selected}` : '')}
                            style={{ '--cat-color': cat.color }}
                            onClick={() => {
                              setSelectedCategory(cat.key);
                              setEmojiOpen(false);
                            }}
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
                      {chatError && <div className={styles.errorNotice}>{chatError}</div>}
                      <ChatWindow
                        messages={messages}
                        onSend={handleSend}
                        input={input}
                        setInput={setInput}
                        onFile={handleFile}
                        onEmojiToggle={() => setEmojiOpen((prev) => !prev)}
                        emojiOpen={emojiOpen}
                        emojiOptions={EMOJI_SET}
                        onEmojiSelect={handleEmojiSelect}
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

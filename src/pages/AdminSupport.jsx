import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import ProfilePicUpload from '../components/ProfilePicUpload';
import styles from './AdminSupport.module.css';
import { FaSearch } from 'react-icons/fa';
import axios from 'axios';
import { socket } from '../services/socket';

export default function AdminSupport() {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const defaultAvatar = '/default-avatar.png';
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('open');
  const [analytics, setAnalytics] = useState({});
  const [adminInput, setAdminInput] = useState('');
  const chatPanelRef = useRef(null);

  const authToken = typeof window !== 'undefined' ? localStorage.getItem('reek_token') : null;
  const headers = useMemo(() => ({ Authorization: `Bearer ${authToken}` }), [authToken]);

  const fetchChats = useCallback(async () => {
    try {
      const res = await axios.get('/api/support/admin/chats', { headers });
      setChats(res.data.filter((c) => (filter === 'all' ? true : c.status === filter)));
    } catch (error) {
      console.error('Failed to fetch support chats', error);
    }
  }, [filter, headers]);

  const fetchAnalytics = useCallback(async () => {
    try {
      const res = await axios.get('/api/support/admin/analytics', { headers });
      setAnalytics(res.data);
    } catch (error) {
      console.error('Failed to fetch support analytics', error);
    }
  }, [headers]);

  useEffect(() => {
    fetchChats();
    fetchAnalytics();
  }, [fetchChats, fetchAnalytics]);

  const createMessageId = () => typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  const addSelectedChatMessage = (message) => {
    setSelectedChat((chat) => {
      if (!chat) return chat;
      const exists = (chat.messages || []).some((m) => m.id && message.id && m.id === message.id);
      if (exists) return chat;
      return { ...chat, messages: [...(chat.messages || []), message] };
    });
  };

  useEffect(() => {
    if (!selectedChat) return;
    if (!socket.connected) socket.connect();
    const chatId = selectedChat.id || selectedChat._id;
    socket.emit('join', chatId);

    const handleNewMessage = (msg) => {
      addSelectedChatMessage(msg);
    };

    socket.on('newMessage', handleNewMessage);
    return () => {
      socket.off('newMessage', handleNewMessage);
      if (socket.connected) socket.disconnect();
    };
  }, [selectedChat]);

  const handleAdminSend = async () => {
    if (!selectedChat || !adminInput.trim()) return;
    const chatId = selectedChat.id || selectedChat._id;
    const messageObj = { id: createMessageId(), text: adminInput.trim(), timestamp: new Date().toISOString() };
    try {
      await axios.post(`/api/support/admin/chat/${chatId}/message`, { text: messageObj.text, id: messageObj.id }, { headers });
      addSelectedChatMessage({ sender: 'admin', ...messageObj });
      if (socket && socket.connected) {
        socket.emit('adminMessage', { chatId, message: messageObj });
      }
      setAdminInput('');
    } catch (error) {
      console.error('Failed to send admin message', error);
    }
  };

  const handleClose = async () => {
    if (!selectedChat) return;
    const chatId = selectedChat.id || selectedChat._id;
    try {
      await axios.post(`/api/support/admin/chat/${chatId}/close`, {}, { headers });
      setSelectedChat({ ...selectedChat, status: 'closed' });
      fetchChats();
    } catch (error) {
      console.error('Failed to close chat', error);
    }
  };

  const handleDelete = async () => {
    if (!selectedChat) return;
    const chatId = selectedChat.id || selectedChat._id;
    try {
      await axios.delete(`/api/support/admin/chat/${chatId}`, { headers });
      setSelectedChat(null);
      fetchChats();
    } catch (error) {
      console.error('Failed to delete chat', error);
    }
  };

  const handleBan = async () => {
    if (!selectedChat) return;
    const userId = selectedChat.userId?.id || selectedChat.userId?._id || selectedChat.userId;
    if (!userId) return;
    try {
      await axios.post(`/api/support/admin/user/${userId}/ban`, {}, { headers });
      fetchChats();
    } catch (error) {
      console.error('Failed to ban user', error);
    }
  };

  return (
    <div className={styles.adminSupportPage}>
      <div className={styles.sidebar}>
        <div className={styles.analytics}>
          <span>Total: {analytics.totalChats || 0}</span>
          <span>Open: {analytics.openChats || 0}</span>
          <span>Closed: {analytics.closedChats || 0}</span>
        </div>
        <div className={styles.filters}>
          <button onClick={() => setFilter('open')} className={filter === 'open' ? styles.active : ''}>Open</button>
          <button onClick={() => setFilter('closed')} className={filter === 'closed' ? styles.active : ''}>Closed</button>
          <button onClick={() => setFilter('all')} className={filter === 'all' ? styles.active : ''}>All</button>
        </div>
        <div className={styles.searchBox}>
          <FaSearch />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users..." />
        </div>
        <div className={styles.chatList}>
          {chats.filter((c) => {
            const name = c.userId?.fullName || c.userId?.email || '';
            return name.toLowerCase().includes(search.toLowerCase());
          }).map((chat) => (
            <div
              key={chat.id || chat._id}
              className={styles.chatListItem + ((selectedChat && (selectedChat.id || selectedChat._id) === (chat.id || chat._id)) ? ' ' + styles.selected : '')}
              onClick={() => setSelectedChat(chat)}
            >
              <span className={styles.userName}>{chat.userId?.fullName || chat.userId?.email || 'Unknown User'}</span>
              <span className={`${styles.status} ${styles[chat.status]}`}>{chat.status}</span>
            </div>
          ))}
        </div>
      </div>
      <div className={styles.chatPanel}>
        {selectedChat ? (
          <div>
            <h3>Chat with {selectedChat.userId?.fullName || selectedChat.userId?.email || 'User'}</h3>
            <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '12px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ flex: '0 0 auto' }}>
                <ProfilePicUpload
                  avatarUrl={selectedChat.userId?.avatarUrl || selectedChat.userId?.profilePic || defaultAvatar}
                  readonly={true}
                  disabled={true}
                />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: '600', margin: '0 0 4px 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {selectedChat.userId?.fullName || 'Unknown User'}
                </p>
                <p style={{ margin: '0', color: '#6b7280', fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {selectedChat.userId?.email || 'No email'}
                </p>
                <p style={{ margin: '4px 0 0 0', color: '#9ca3af', fontSize: '0.85rem' }}>
                  Status: <span style={{ fontWeight: '600', color: selectedChat.status === 'open' ? '#10b981' : '#ef4444' }}>{selectedChat.status}</span>
                </p>
              </div>
            </div>
            <div className={styles.adminChatWindow} ref={chatPanelRef}>
              {(selectedChat.messages || []).map((msg, i) => {
                const avatar = (msg.sender === 'user' || msg.sender === 'supporter')
                  ? selectedChat.userId?.avatarUrl || selectedChat.userId?.profilePic || defaultAvatar
                  : undefined;
                return (
                  <div key={msg.id || i} className={msg.sender === 'admin' ? styles.adminMsg : styles.userMsg} style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
                    {(msg.sender === 'user' || msg.sender === 'supporter') && (
                      <img src={avatar} alt="avatar" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', border: '2px solid #a855f7', marginRight: 4 }} />
                    )}
                    <div>
                      <div className={styles.bubble}>{msg.text}{msg.emoji ? ` ${msg.emoji}` : ''}</div>
                      <span className={styles.timestamp}>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                );
              })}
            </div>
            <form className={styles.inputRow} onSubmit={(e) => { e.preventDefault(); handleAdminSend(); }}>
              <input
                className={styles.input}
                type="text"
                placeholder="Type a reply..."
                value={adminInput}
                onChange={(e) => setAdminInput(e.target.value)}
                disabled={selectedChat.status === 'closed'}
              />
              <button type="submit" className={styles.sendBtn} disabled={!adminInput.trim() || selectedChat.status === 'closed'}>Send</button>
            </form>
            <div className={styles.adminControls}>
              <button onClick={handleClose} disabled={selectedChat.status === 'closed'}>Close Chat</button>
              <button onClick={handleDelete}>Delete Chat</button>
              <button onClick={handleBan}>Ban User</button>
            </div>
          </div>
        ) : (
          <div className={styles.emptyState}>Select a chat to view conversation</div>
        )}
      </div>
    </div>
  );
}

# Socket.IO Real-Time Chat Support System - Complete Setup Guide

## Overview
The ReekTickets platform includes a real-time support chat system powered by Socket.IO, enabling admins to handle customer support messages instantly.

---

## Architecture

### Backend (Node.js/Express)
- **Location**: `/server/services/socket.js`
- **Server Framework**: Socket.IO v4
- **Database**: Supabase (SupportChat model)
- **CORS**: Enabled for all origins (can be restricted in production)

### Frontend (React)
- **Location**: `/src/services/socket.js`
- **Socket Client**: socket.io-client 
- **UI Component**: `/src/pages/AdminSupport.jsx`
- **Styles**: `/src/pages/AdminSupport.module.css`

---

## Backend Socket Configuration

### File: `/server/services/socket.js`

The socket server handles real-time communication for support chats.

#### Key Functions:

1. **initSocket(server)**
   - Initializes Socket.IO server
   - Configures CORS for cross-origin requests
   - Sets up event handlers

2. **Socket Events**:

   | Event | Direction | Purpose |
   |-------|-----------|---------|
   | `join` | Client → Server | Join a chat room |
   | `userMessage` | Client → Server | User sends a message |
   | `adminMessage` | Client → Server | Admin sends a response |
   | `newMessage` | Server → All | Broadcast new message to chat room |

#### Message Structure:
```javascript
{
  id: string,              // Unique message ID
  text: string,            // Message content
  sender: string,          // 'user' or 'admin'
  timestamp: string,       // ISO 8601 timestamp
  fileUrl?: string,        // Optional file attachment
  emoji?: string           // Optional emoji reaction
}
```

---

## Frontend Socket Setup

### File: `/src/services/socket.js`

```javascript
import { io } from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

export const socket = io(SOCKET_URL, { autoConnect: false });
```

#### Environment Variables:
```env
# .env.production or .env.local
REACT_APP_SOCKET_URL=https://reektickets.com

# Optional for local development
REACT_APP_SOCKET_URL=http://localhost:5000
```

---

## Adobe Support Chat Component

### File: `/src/pages/AdminSupport.jsx`

#### Features:

1. **Chat List**
   - View all open/closed support chats
   - Filter by status (open, closed, all)
   - Search by user name or email
   - Analytics dashboard (total, open, closed chats)

2. **Chat Panel**
   - Display conversation history
   - Show user profile picture and information
   - Real-time message updates
   - Send message input
   - Admin controls (close, delete, ban user)

3. **Real-Time Updates**
   - Auto-connect socket on chat selection
   - Listen for new messages via `newMessage` event
   - Auto-disconnect when chat is deselected
   - Message deduplication to prevent duplicates

#### Key Functions:

```javascript
// Initialize socket connection
if (!selectedChat) return;
if (!socket.connected) socket.connect();
const chatId = selectedChat.id || selectedChat._id;
socket.emit('join', chatId);

// Listen for new messages
const handleNewMessage = (msg) => {
  addSelectedChatMessage(msg);
};

socket.on('newMessage', handleNewMessage);

// Send admin message
const messageObj = { 
  id: createMessageId(), 
  text: adminInput.trim(), 
  timestamp: new Date().toISOString() 
};

await axios.post(`/api/support/admin/chat/${chatId}/message`, 
  { text: messageObj.text, id: messageObj.id }, 
  { headers }
);

if (socket && socket.connected) {
  socket.emit('adminMessage', { chatId, message: messageObj });
}
```

---

## API Endpoints

### Support Chat Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `POST` | `/api/support/chat` | Create/get open chat (user) |
| `GET` | `/api/support/chat/:id/messages` | Get chat messages |
| `POST` | `/api/support/chat/:id/message` | Add message to chat |
| `GET` | `/api/support/admin/chats` | Get all admin chats |
| `GET` | `/api/support/admin/analytics` | Get admin statistics |
| `POST` | `/api/support/admin/chat/:chatId/message` | Admin sends message |
| `POST` | `/api/support/admin/chat/:chatId/close` | Close chat |
| `DELETE` | `/api/support/admin/chat/:chatId` | Delete chat |
| `POST` | `/api/support/admin/user/:userId/ban` | Ban user from chat |

### Authentication
All admin endpoints require:
- Bearer token in Authorization header
- Admin or supporter role
- Or fallback admin email: `ceoofreektickets@gmail.com`

---

## Usage Instructions

### For Users:
1. Access support chat from the help icon in header
2. Send message
3. Wait for admin response in real-time
4. Attach files or emoji (if supported)

### For Admins:
1. Go to Admin Dashboard
2. Click on "Support" or "Support Chat" tab
3. View list of user chats on sidebar
4. Click chat to open conversation
5. Type response and click "Send"
6. Use "Close Chat", "Delete Chat", or "Ban User" controls as needed

---

## Deployment Notes

### Production Checklist:

1. **CORS Configuration** ✅
   - Update `/server/services/socket.js` line 7:
   ```javascript
   cors: { origin: process.env.FRONTEND_URL || '*' }
   ```

2. **Socket URL** ✅
   - Set `REACT_APP_SOCKET_URL` in production environment
   - Should point to your backend server URL

3. **Database** ✅
   - Ensure Supabase `support_chats` table exists
   - Required columns: `id`, `userId`, `messages`, `status`, `createdAt`, `updatedAt`

4. **Environment Variables** ✅
   ```
   # Frontend
   REACT_APP_SOCKET_URL=https://reektickets.com
   
   # Backend (if applicable)
   SOCKET_CORS_ORIGIN=https://reektickets.com
   ```

---

## Troubleshooting

### Socket Connection Issues:
1. **Check SOCKET_URL**: Ensure environment variable is set correctly
2. **CORS Errors**: Verify CORS is enabled on backend
3. **Browser Console**: Check for connection errors in DevTools

### Real-Time Messages Not Appearing:
1. Verify socket is connected: `socket.connected === true`
2. Check that you've joined the chat room: `socket.emit('join', chatId)`
3. Verify message event listener is attached

### Messages Duplicating:
1. Check message ID deduplication logic in `addSelectedChatMessage()`
2. Ensure unique ID generation via `createMessageId()`

---

## Security Best Practices

1. ✅ Validate user roles (admin/supporter)
2. ✅ Check chat ownership before allowing message
3. ✅ Sanitize user input
4. ✅ Rate limit socket events (recommended)
5. ✅ Authenticate socket connections (optional enhancement)

---

## Future Enhancements

- [ ] Typing indicators ("User is typing...")
- [ ] File upload support for chat
- [ ] Message reactions/emoji
- [ ] Chat search within single conversation
- [ ] Automatic response templates
- [ ] Multi-admin assignment
- [ ] Chat history export
- [ ] Bot integration for auto-responses

---

## Support Contact
For issues or questions, contact: ceoofreektickets@gmail.com

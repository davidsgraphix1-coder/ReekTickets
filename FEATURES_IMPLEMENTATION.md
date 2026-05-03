# ReekTickets - Complete Feature Implementation Guide

## Table of Contents
1. [Mobile Responsive Dashboards](#mobile-responsive-dashboards)
2. [Socket.IO Real-Time Chat](#socketio-real-time-chat)
3. [Admin Profile Pictures](#admin-profile-pictures)

---

## Mobile Responsive Dashboards

### Overview
All dashboards have been updated with comprehensive mobile responsive design to prevent horizontal overflow and ensure proper functionality on all screen sizes.

### Changes Made

#### Dashboard Files Updated:
1. **AdminDashboard.css** ✅
2. **OrganizerDashboard.css** ✅
3. **VendorDashboard.css** ✅
4. **SalesAgentDashboard.css** ✅
5. **AttendeeDashboard.css** ✅
6. **AdminSupport.module.css** ✅

### Key CSS Improvements

#### 1. **Overflow Prevention**
```css
* {
  box-sizing: border-box;
}

html, body {
  overflow-x: hidden;
  max-width: 100vw;
}

.dashboard {
  width: 100%;
  max-width: 100vw;
  overflow-x: hidden;
}
```

**Purpose**: Eliminates the black line on the right side by preventing any horizontal scroll.

#### 2. **Responsive Breakpoints**

**Mobile (max-width: 480px)**
- Smallest devices (iPhone SE, old Android phones)
- Single column layouts
- Minimal padding and font sizes
- Hidden non-essential UI elements

**Tablet (768px - 480px)**
- Medium devices (iPad Mini, larger phones)
- Flexible grid layouts
- Touch-friendly button sizes
- Adjusted font sizes

**Desktop (1024px+)**
- Full features visible
- Multi-column layouts
- Optimal spacing and typography

#### 3. **Sidebar Behavior**

**Desktop (> 768px)**
- Fixed sidebar visible
- Main content has margin-left offset
- Full navigation always visible

**Mobile (≤ 768px)**
- Fixed sidebar hidden by default using `translateX(-100%)`
- Slides in from left when menu opened
- Mobile menu toggle button visible
- Dark overlay when menu is open

```css
@media (max-width: 768px) {
  .admin-sidebar {
    position: fixed;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
  }

  .admin-sidebar.mobile-open {
    transform: translateX(0);
  }

  .admin-main {
    margin-left: 0;
    width: 100%;
  }
}
```

### Testing Mobile Responsiveness

#### Browser DevTools:
1. Open Chrome/Firefox DevTools (`F12`)
2. Click device toggle (mobile icon)
3. Select device or custom dimensions
4. Test at 375px, 480px, 768px, 1024px widths

#### Real Device Testing (Recommended):
- iPhone (12, 13, 14, 15)
- Samsung Galaxy (S21, S22, S23)
- iPad (Mini, Air, Pro)
- Android tablets

### Known Mobile Issues Fixed:
- ✅ Black line on right side (overflow-x: hidden)
- ✅ Unreadable text on small screens (adjusted font-size)
- ✅ Overlapping buttons (flexbox adjustments)
- ✅ Horizontal scroll issues (width constraints)
- ✅ Fixed sidebar blocking content (transformed position)

---

## Socket.IO Real-Time Chat

**See: [SOCKET_IO_CHAT_GUIDE.md](./SOCKET_IO_CHAT_GUIDE.md) for complete details**

### Quick Reference

#### Backend Setup:
- **File**: `/server/services/socket.js`
- **Status**: ✅ Fully configured
- **Features**: 
  - Real-time message broadcasting
  - Chat room management with socket rooms
  - Message persistence to Supabase

#### Frontend Setup:
- **Client File**: `/src/services/socket.js`
- **UI Component**: `/src/pages/AdminSupport.jsx`
- **Features**:
  - Connect/disconnect socket
  - Listen for real-time messages
  - Message sending and receiving
  - User presence indicators

#### Quick Usage:
```javascript
import { socket } from '../services/socket.js';

// Connect to socket
if (!socket.connected) socket.connect();

// Join a chat room
socket.emit('join', chatId);

// Listen for new messages
socket.on('newMessage', (message) => {
  console.log('New message:', message);
});

// Send message
socket.emit('userMessage', { 
  chatId, 
  message: { text: 'Hello' } 
});
```

---

## Admin Profile Pictures

### Overview
Admins can now create new admin accounts with profile pictures. Each admin can manage their profile picture, and all admins are displayed with their profile pictures throughout the system.

### Architecture

#### Database Schema
The `users` table includes a new column:
- `profile_picture` (VARCHAR, optional) - URL to admin profile picture

#### API Endpoints

**1. Create Admin with Profile Picture**
```
POST /api/admin-management/create-admin
Authorization: Bearer {token}
Role Required: admin

Body:
{
  "fullName": "John Admin",
  "email": "john@reektickets.com",
  "phone": "0273476701",
  "password": "SecurePass123",
  "profilePicture": "https://..."  // Optional
}

Response:
{
  "message": "Admin account created successfully",
  "admin": {
    "id": "uuid",
    "fullName": "John Admin",
    "email": "john@reektickets.com",
    "phone": "233273476701",
    "profilePicture": "https://...",
    "role": "admin",
    "status": "active"
  }
}
```

**2. Update Admin Profile**
```
POST /api/admin-management/update-admin/:adminId
Authorization: Bearer {token}
Role Required: admin

Body:
{
  "fullName": "Updated Name",
  "phone": "0273476701",
  "profilePicture": "https://new-image-url.jpg",
  "status": "active"  // or "suspended" | "inactive"
}

Response: Updated admin object
```

**3. Get All Admins**
```
GET /api/admin-management/admins
Authorization: Bearer {token}
Role Required: admin

Response:
{
  "count": 5,
  "admins": [
    {
      "id": "uuid",
      "fullName": "Admin Name",
      "email": "admin@reektickets.com",
      "phone": "233...",
      "profilePicture": "https://...",
      "status": "active",
      "createdAt": "2024-01-15T10:30:00Z"
    },
    ...
  ]
}
```

**4. Deactivate Admin**
```
DELETE /api/admin-management/admin/:adminId
Authorization: Bearer {token}
Role Required: admin

Response:
{
  "message": "Admin account deactivated successfully"
}
```

### Frontend Components

#### AddAdminModal Component
**File**: `/src/components/AddAdminModal.jsx`

Features:
- Profile picture upload with preview
- Form validation
- Password strength requirements (8+ characters)
- Error and success notifications
- Responsive design

#### Usage in AdminDashboard:
```javascript
import AddAdminModal from '../components/AddAdminModal';

// In component JSX:
<AddAdminModal 
  isOpen={showAddAdminModal}
  onClose={() => setShowAddAdminModal(false)}
  onAdminAdded={(newAdmin) => {
    console.log('New admin:', newAdmin);
  }}
  authToken={token}
/>
```

#### Opening the Modal:
1. Go to Admin Dashboard
2. Click "Add New Admin" button in Quick Actions section
3. Fill in admin details:
   - Full Name (required)
   - Email (required, must be unique)
   - Phone (required)
   - Password (required, 8+ chars)
   - Confirm Password
   - Profile Picture (optional, click to upload)
4. Click "Create Admin"

### Profile Picture Upload Process

1. **Image Selection**
   - Click profile picture area or "Choose Photo" button
   - Select image file (JPEG, PNG, GIF, etc.)
   - Preview displays immediately

2. **Upload to Storage**
   - Image sent to `/api/upload` endpoint
   - Returns imageURL
   - URL stored with admin record

3. **Display**
   - Profile picture shown in admin list
   - Displayed in admin details
   - Shown in chat support interface when admin responds

### Example Implementation

```javascript
// Creating new admin with profile picture
const handleCreateAdmin = async () => {
  const formData = new FormData();
  formData.append('file', profilePictureFile);
  
  // Upload image
  const uploadRes = await axios.post('/api/upload', formData);
  const profilePictureUrl = uploadRes.data.url;
  
  // Create admin
  const adminRes = await axios.post(
    '/api/admin-management/create-admin',
    {
      fullName: 'John Admin',
      email: 'john@reektickets.com',
      phone: '0273476701',
      password: 'SecurePass123',
      profilePicture: profilePictureUrl
    },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  
  console.log('Admin created:', adminRes.data.admin);
};
```

### Security Features

✅ **Authentication**: Only admins can create other admins
✅ **Authorization**: Role-based access control
✅ **Password**: Hashed using bcrypt (10 rounds)
✅ **Email**: Unique constraint in database
✅ **Phone**: Normalized and validated
✅ **Image Upload**: Validated file type and size
✅ **Super Admin**: Cannot be deleted/deactivated

### Admin Status Management

**Status Values**:
- `active` - Admin can login and manage platform (default)
- `suspended` - Admin cannot login but account preserved
- `inactive` - Admin account deactivated

```javascript
// Suspending an admin
await axios.post('/api/admin-management/update-admin/:adminId', 
  { status: 'suspended' },
  { headers: { Authorization: token } }
);
```

### Displaying Admin Profile Pictures

#### In Admin List:
```javascript
{admins.map(admin => (
  <div key={admin.id}>
    <img 
      src={admin.profilePicture || '/default-avatar.png'} 
      alt={admin.fullName}
      style={{ width: 50, height: 50, borderRadius: '50%' }}
    />
    <span>{admin.fullName}</span>
  </div>
))}
```

#### In Chat Support:
The AdminSupport component automatically displays admin profile pictures when they respond to chats.

### Admin Management Best Practices

1. **Profile Pictures**
   - Use clear, professional photos
   - Square format recommended (1:1 aspect ratio)
   - Keep file size < 5MB
   - Supported formats: JPG, PNG, GIF, WebP

2. **Account Security**
   - Create strong passwords (min 8 chars)
   - Regularly update profile information
   - Monitor admin activity in logs
   - Suspend inactive admins

3. **Role Management**
   - Only grant admin role to trusted personnel
   - Document admin responsibilities
   - Review admin permissions quarterly
   - Maintain super admin security

---

## Deployment Checklist

### Before Going Live:

- [ ] **Mobile Testing**
  - [ ] Test on iPhone SE (375px)
  - [ ] Test on iPhone 12/13/14 (390px)
  - [ ] Test on Android phone (412px)
  - [ ] Test on iPad (768px)
  - [ ] Test on desktop (1024px+)
  - [ ] Verify no horizontal scrolling
  - [ ] Check sidebar toggle works
  - [ ] Confirm touch interactions

- [ ] **Socket.IO**
  - [ ] CORS configured correctly
  - [ ] REACT_APP_SOCKET_URL set in .env
  - [ ] Verify production URL
  - [ ] Test real-time messaging
  - [ ] Check connection stability

- [ ] **Admin Features**
  - [ ] Create test admin with profile picture
  - [ ] Verify image upload works
  - [ ] Test admin login
  - [ ] Check profile picture displays
  - [ ] Test admin status updates
  - [ ] Verify email uniqueness constraint

- [ ] **Production Environment Variables**
  ```
  # Frontend
  REACT_APP_SOCKET_URL=https://reektickets.com
  
  # Backend (if needed)
  SOCKET_CORS_ORIGIN=https://reektickets.com
  ```

---

## Support & Troubleshooting

### Mobile Issues
- **Black line on right side**: Ensure `overflow-x: hidden` on body/html
- **Text too small**: Check font-size in media queries
- **Buttons not clickable**: Verify z-index and positioning

### Socket.IO Issues
- **Messages not arriving**: Check socket connection and room join
- **Real-time not working**: Verify CORS and environment variables
- **Connection drops**: Check firewall and network configuration

### Admin Profile Pictures
- **Picture not uploading**: Check file size and format
- **Image not displaying**: Verify URL is accessible and valid
- **Permission denied**: Ensure user has admin role

---

## Version History

- **v1.0** (Current)
  - ✅ Mobile responsive redesign
  - ✅ Socket.IO real-time chat fully functional
  - ✅ Admin profile picture management system
  - ✅ Comprehensive documentation

---

## Questions?
Contact: ceoofreektickets@gmail.com

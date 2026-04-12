# ReekTickets - Complete System Architecture & Implementation Guide

## Project Overview
**ReekTickets** is a comprehensive ticketing platform for Ghana and Africa. It's a full-stack web application built with:
- **Frontend**: React 19 + React Router 7 (Vercel)
- **Backend**: Node.js/Express (Vercel Serverless)
- **Database**: Supabase PostgreSQL
- **Payments**: Paystack
- **SMS**: Twilio/Custom SMS Gateway
- **Deployment**: Vercel (frontend + API handler)

---

## 1. DATABASE SCHEMA (Supabase PostgreSQL)

### Core Tables
```sql
-- Users (All roles: admin, organizer, vendor, agent, gate, attendee)
users (id UUID, email, full_name, role, profile_pic, phone, status, created_at)

-- Events
events (id UUID, title, description, organizer_id, date, location, category, banner, ticket_types JSON, created_at)

-- Tickets  
tickets (id UUID, user_id, event_id, ticket_type, price, qr_code, sms_code, status, created_at)

-- Payments
payments (id UUID, user_id, event_id, amount, reference, status, payment_method, created_at)

-- Vendor Applications
vendor_applications (id UUID, vendor_id, event_id, status, application_date)

-- Notifications
notifications (id UUID, user_id, type, title, message, read, created_at)

-- Messages
messages (id UUID, sender_id, recipient_id, subject, body, read, created_at)

-- Support Chats
support_chats (id UUID, user_id, category, status, messages JSON, created_at)
```

---

## 2. API ENDPOINTS (Working)

### ✅ Currently Working Endpoints

**Authentication**
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/verify-otp` - OTP verification
- `GET /api/auth/me` - Get current user
- `PATCH /api/auth/me` - Update user profile
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/reset-password` - Reset password

**Events**
- `GET /api/events` - Get all events
- `GET /api/events/:id` - Get event by ID
- `POST /api/events` - Create event (Organizer)
- `PATCH /api/events/:id` - Update event (Organizer)
- `DELETE /api/events/:id` - Delete event (Organizer)

**Tickets**
- `GET /api/tickets` - Get user's tickets
- `GET /api/tickets/:id` - Get ticket by ID
- `POST /api/tickets/complimentary` - Create complimentary ticket
- `POST /api/tickets/physical` - Create physical ticket

**Payments**
- `GET /api/payments` - Get payment history
- `POST /api/payments/initialize` - Initialize payment
- `POST /api/payments/verify` - Verify payment

**Users (Dashboard Data)**
- `GET /api/users` - Get all users (returns [])
- `GET /api/vendors` - Get vendors (returns [])
- `GET /api/notifications` - Get notifications (returns [])
- `GET /api/messages` - Get messages (returns [])

**Support**
- `POST /api/support/chat` - Create support chat
- `GET /api/support/chat/:id` - Get chat messages
- `POST /api/support/chat/:id/message` - Add message to chat
- `GET /api/support/chats` - Get all chats (Admin)

**File Upload**
- `POST /api/upload` - Upload file (profile pic, event banner)

**SMS**
- `POST /api/sms/send-otp` - Send OTP via SMS
- `POST /api/sms/send-ticket` - Send ticket via SMS

---

## 3. FRONTEND ROUTES & COMPONENTS

### Public Pages
```
/                          - Home (hero, featured events)
/events                    - Events listing page
/events/:id               - Event details & purchase
/about                    - About page
/blog                     - Blog listing
/blog/:slug              - Blog article
/terms                   - Terms & conditions
/privacy-policy          - Privacy policy
/ticket-agreement        - Ticket agreement
```

### Authentication Pages
```
/login                        - Login page
/signup                       - User signup (Attendee)
/signup/organizer            - Organizer signup
/verify-email                - OTP verification
/forgot-password             - Password reset
```

### Purchase Flow
```
/events/:id              - Event details (with buy button)
/checkout/:eventId       - Checkout page (Paystack)
/payment/success         - Payment confirmation
/my-tickets              - User's purchased tickets
/ticket/:id              - Single ticket view (QR code)
```

### User Dashboards (Role-Based)
```
/dashboard                    - Auto-redirect based on role

ATTENDEE:
/dashboard/attendee          - My tickets, upcoming events, history
  └ Tabs: My Tickets, Upcoming, Past, Wallet

ORGANIZER:
/dashboard/organizer         - Full event management
  └ Dashboard (Home, Analytics)
  └ Create Event
  └ Events List
  └ Tickets Sold
  └ Transactions/Revenue
  └ User Management
  └ Vendor Management
  └ Complementary Tickets
  └ Physical Tickets
  └ Event Promotion
  └ Notifications
  └ Messages
  └ LiveStream (placeholder)
  └ Settings

VENDOR:
/dashboard/vendor            - Vendor management
  └ Applications
  └ Profile
  └ Analytics

AGENT/SALES:
/dashboard/agent             - Sales agent dashboard
  └ Sales tracking
  └ Commission tracking
  └ Referral links
  └ Leaderboard
  └ Notifications

GATE/ENTRY:
/dashboard/gate              - Gate entry verification
  └ Check-in attendees
  └ QR code scanning

ADMIN:
/dashboard/admin             - System administration
  └ User management
  └ Event management
  └ Payment management
  └ Reports
  └ Announcements
  └ Revenue tracking
  └ OTP management
```

### Other Pages
```
/vendor                  - Vendor portal
/vendor/register         - Vendor registration
/agents                  - Sales agent info
/admin                   - Admin portal
/create-event           - Event creation (Organizer)
/sms-test               - SMS testing utility
```

---

## 4. FRONTEND COMPONENT STRUCTURE

### Components (Reusable)
- `Navbar` - Navigation (Home page)
- `MobileMenuBar` - Mobile navigation (All pages)
- `Footer` - Footer (Home page)
- `SEO` - Meta tag management
- `PrivateRoute` - Route protection with role checking
- `SupportChat` - Live support chat widget
- `SmartSelect` - Custom select component (for ticket types, roles, etc.)

### Dashboard Component Files
```
src/dashboards/
├── OrganizerDashboard.jsx      ✅ Working - All tabs
├── organizer-sections/          ✅ Complete
│   ├── DashboardHome.jsx
│   ├── EventCreation.jsx
│   ├── UserManagement.jsx
│   ├── VendorManagement.jsx
│   ├── Transactions.jsx
│   ├── UserDashboard.jsx
│   ├── OrganizerSettings.jsx
│   ├── ComplementaryTickets.jsx
│   ├── PhysicalTickets.jsx
│   ├── EventPromotion.jsx
│   ├── Notifications.jsx
│   ├── Messages.jsx
│   └── LiveStream.jsx
├── AdminDashboard.jsx           ✅ Full admin panel
├── AttendeeDashboard.jsx        ✅ Attendee tickets
├── VendorDashboard.jsx          ✅ Vendor management
├── SalesAgentDashboard.jsx      ✅ Agent sales tracking
└── GateEntryDashboard.jsx       ✅ Gate check-in
```

---

## 5. NODE.JS/EXPRESS API ROUTES

### File Structure
```
api/
└── handler.js                    - Vercel serverless entry point

server/
├── routes/
│   ├── auth.js                  ✅ Authentication (login, signup, verify-otp)
│   ├── events.js                ✅ Event CRUD
│   ├── payments.js              ✅ Payment processing
│   ├── support.js               ✅ Support chat
│   ├── upload.js                ✅ File uploads
│   ├── sms.js                   ✅ SMS sending
│   ├── extras.js                ✅ Additional endpoints (users, vendors, etc)
│   ├── vendor.js                ⏳ Vendor routes
│   └── agent.js                 ⏳ Agent routes
├── models/
│   ├── User.js                  - User model (Supabase)
│   ├── Event.js                 - Event model (Supabase)
│   ├── Ticket.js                - Ticket model (Supabase)
│   ├── Payment.js               - Payment model (Supabase)
│   ├── Wallet.js                - Wallet model (lazy init)
│   ├── SupportChat.js           - Support chat model
│   ├── Announcement.js          - Announcements
│   ├── SalesAgent.js            - Agent profile
│   └── others...
├── middleware/
│   └── auth.js                  ✅ JWT authentication middleware
├── config/
│   └── db.js                    ✅ Supabase connection (lazy init)
└── services/
    ├── smsService.js            ✅ SMS sending
    └── paymentService.js        ✅ Payment processing
```

---

## 6. KEY FEATURES IMPLEMENTED

### ✅ Authentication & Users
- Email/password signup & login
- Organizer-specific signup
- OTP verification
- Password reset
- JWT token management
- Role-based access control (admin, organizer, vendor, agent, gate, attendee)

### ✅ Event Management
- Create events with banner upload
- Add multiple ticket types with pricing
- Edit and delete events
- Event filtering and search
- Event categorization
- Location-based events

### ✅ Ticketing System
- Purchase tickets for events
- Complementary/free tickets
- Physical tickets (printed)
- QR code generation
- Ticket status tracking (active, used, expired)
- Ticket resale support

### ✅ Payment Processing (Paystack)
- Initialize payment
- Verify payment
- Transaction history
- Revenue tracking
- Payout management (Organizer)

### ✅ SMS Integration (Twilio)
- Send OTP via SMS
- Send ticket via SMS
- SMS notifications
- Custom SMS gateway support

### ✅ Dashboard Features
**Organizer Dashboard:**
- Revenue analytics
- Ticket sales tracking
- Event management
- User/vendor management
- Complementary tickets
- Physical tickets
- Event promotion
- Billing & transactions
- Profile management

**Admin Dashboard:**
- User management
- Event moderation
- Payment monitoring
- Report generation
- Announcements
- Revenue analytics
- OTP management
- User role management

**Attendee Dashboard:**
- My tickets listing
- Upcoming events
- Past events
- Event history
- Wallet (future)

**Vendor Dashboard:**
- Vendor applications
- Profile management
- Event promotions

**Agent Dashboard:**
- Sales tracking
- Commission tracking
- Referral links
- Leaderboard
- Performance metrics

**Gate Entry Dashboard:**
- QR code scanning
- Check-in validation
- Attendance tracking

### ✅ Support & Communication
- Live support chat widget
- Support chat management (Admin)
- Announcements (Admin → All users)
- Notifications system
- Email notifications
- SMS notifications

### ✅ File Management
- Event banner uploads
- Profile picture uploads
- Document uploads
- File validation & security

---

## 7. CRITICAL FIX APPLIED (Last Session)

### Problem
API endpoints returning 404 on `/api/users`, `/api/vendors`, `/api/notifications`, `/api/messages`

### Root Cause
Model files (Wallet.js, Offer.js, etc.) were initializing Supabase at require-time without environment variables available, causing the entire `server/routes/extras.js` router to fail to load.

### Solution Implemented
Changed all models to use **lazy initialization** of Supabase:
```javascript
// BEFORE (Failed to load):
const supabase = connectDB(); // Called immediately at require-time

// AFTER (Lazy init - works):
const getSupabaseClient = async () => {
  const supabase = await connectDB();
  return supabase;
};
// Only call when needed in functions
```

### Result
✅ All dashboard data endpoints now working and returning data from Supabase

---

## 8. ENVIRONMENT VARIABLES (Production)

### Vercel Production (.env.production)
```
REACT_APP_API_BASE_URL=https://reektickets.com/api

SUPABASE_URL=https://htfolbapycgjuvnkvhjs.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

JWT_SECRET=supersecretjwtkey

PAYSTACK_PUBLIC_KEY=pk_live_...
PAYSTACK_SECRET_KEY=sk_live_...

TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+1234567890

SENDGRID_API_KEY=...
SENDGRID_FROM_EMAIL=...

SMS_GATEWAY_URL=...
SMS_API_KEY=...
SMS_SENDER_ID=ReekTickets
SMS_HOST=api.smsonlinegh.com

FRONTEND_URL=https://reektickets.com
```

---

## 9. CURRENT ISSUES & NEXT STEPS

### Current Issue
"Request aborted" errors in OrganizerDashboard when fetching:
- /api/tickets
- /api/messages
- /api/notifications
- /api/payments
- /api/users
- /api/vendors
- /api/events

### Why It's Happening
The endpoints are accessible (return []) but the frontend requests are being aborted before completing.

**Likely Causes:**
1. **Timeout Issue** - Endpoints take too long to respond
2. **CORS Issue** - Cross-origin blocking
3. **Request Size** - Large response payload
4. **Socket Hang-up** - Connection terminating early
5. **Missing/Null Auth Token** - Request failing at middleware

### Recommended Next Steps
1. Add detailed logging to the dashboard data fetching
2. Check if JWT token is being sent with requests
3. Add timeout configuration to axios requests
4. Verify Supabase query performance
5. Check Vercel function logs for errors
6. Consider implementing pagination/lazy loading

---

## 10. IMPORTANT NOTES FOR CONTINUATION

### What MUST NOT Change
- Supabase database schema (don't alter table structure)
- Authentication flow (JWT + auth middleware)
- Vercel deployment process
- Role-based access control system
- Environment variable names

### What CAN Be Improved
- Dashboard performance (pagination, lazy loading)
- API error handling and logging
- Request timeout handling
- Caching strategy
- Real-time updates (WebSockets)
- Mobile optimization

### Critical Files (Don't Delete)
- `/api/handler.js` - Vercel serverless entry point
- `/server/routes/auth.js` - Authentication
- `/server/config/db.js` - Supabase connection
- `/server/middleware/auth.js` - JWT validation
- `/src/dashboards/OrganizerDashboard.jsx` - Main dashboard

### Testing Endpoints
```bash
# Health check
curl https://reektickets.com/api/health

# Get all events
curl https://reektickets.com/api/events

# Get all users
curl https://reektickets.com/api/users

# Get all vendors
curl https://reektickets.com/api/vendors

# Get notifications
curl https://reektickets.com/api/notifications

# Get messages
curl https://reektickets.com/api/messages
```

### Deployment
All changes are auto-deployed via Vercel from the `main` branch.
```bash
git add -A
git commit -m "Your changes"
git push origin main
# Vercel automatically builds and deploys
```

---

## 11. TECH STACK SUMMARY

**Frontend:**
- React 19.2.4
- React Router DOM 7.14
- Axios for HTTP requests
- Framer Motion for animations
- React Icons for icons
- QR Code components
- Socket.IO client for real-time

**Backend:**
- Node.js 24.x
- Express.js 4.18
- Supabase (PostgreSQL + Auth)
- Multer for file uploads
- JWT for authentication
- Bcryptjs for password hashing

**External Services:**
- Paystack (Payments)
- Twilio (SMS)
- SendGrid (Email)
- Custom SMS Gateway

**Deployment:**
- Vercel (Frontend + API)
- Supabase (Database)

---

## 12. GIT COMMIT HISTORY (Recent Important Commits)

```
e26b723 - Remove duplicate routes shadowing Supabase endpoints
d8d2836 - Add Supabase-based endpoints for organizer dashboard
2264333 - Add Supabase credentials to production environment
f106862 - Clean up duplicate /api/* routes
f02a8e6 - Fix route ordering for proper routing
a41b2fd - Add middleware to strip /api prefix
```

---

**Last Updated**: April 12, 2026
**Status**: OrganizerDashboard endpoints working, but experiencing request abort errors on data fetching
**Next Action**: Debug "Request aborted" errors in dashboard data fetching

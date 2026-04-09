# ReekTickets ChatSupport Management Guide

## Overview

The ChatSupport feature in ReekTickets Full Control tab allows the main admin to:
- Manage ChatSupport activation/deactivation
- Assign multiple admins to handle customer chats
- Set auto-response messages for when no admins are available
- View all assigned chat support admins
- Remove admins from ChatSupport access

---

## How to Use ChatSupport Management

### Step 1: Access Full Control Tab
1. Log in to **Admin Dashboard** as the main admin
2. Click on the **"Full Control"** tab in the sidebar (top navigation item with chart icon)
3. Scroll down to find the **"💬 ReekTickets ChatSupport Management"** section

### Step 2: Enable/Disable ChatSupport
1. In the ChatSupport Status & Settings area, you'll see a checkbox: **"ChatSupport Enabled"**
2. Check the box to activate ChatSupport (status shows 🟢 ACTIVE)
3. Uncheck to deactivate (status shows 🔴 INACTIVE)
4. When disabled, users won't be able to initiate chats

### Step 3: Assign Chat Support Admins
The main admin can assign other admins to help manage customer chats:

1. Click the **"+ Add Chat Support Admin"** button
2. A modal popup will appear with a dropdown list
3. Select an admin from the list of available admins
4. Only admins not already assigned will appear in the dropdown
5. Click **"Add Chat Admin"** to confirm
6. The admin will appear in the "Assigned Chat Support Admins" list below

### Step 4: View Assigned Chat Admins
- **Assigned Chat Support Admins** section shows all admins with ChatSupport access
- Each card displays:
  - Admin's full name
  - Admin's email address
  - Remove button to revoke access

### Step 5: Set Auto-Response Message
1. In the **"Auto-Response Message"** field, enter the message users will receive
2. This message is sent immediately when a user starts a chat (before an admin responds)
3. Examples:
   - "We will respond to your message shortly. Thank you for contacting us!"
   - "Our support team is here to help. We'll get back to you within 1 hour."
   - "Thank you for reaching out. We're here 24/7 to assist you."
4. Click **"Save ChatSupport Settings"** to apply changes

### Step 6: Remove Chat Support Admins
1. Find the admin in the "Assigned Chat Support Admins" section
2. Click the red **"Remove"** button on their card
3. The admin will immediately lose ChatSupport access
4. They can be re-added anytime

---

## Chat Support Admin Roles & Permissions

### Main Admin (Super Admin)
- Full control over all ChatSupport settings
- Can activate/deactivate ChatSupport
- Can assign and remove other admins
- Can modify auto-response messages
- Can view all chats and admin activity
- Cannot be removed from ChatSupport

### Assigned Chat Support Admins
- Can view all active user chats
- Can send responses to users
- Can see chat history and transcripts
- Can view other admins' responses in same chat
- Cannot modify ChatSupport settings
- Cannot add/remove other admins
- Can be removed by main admin anytime

---

## Available ChatSupport Features

✅ **Real-time Messaging**
- Live user-to-admin chat interface
- Instant notifications for new messages
- Typing indicators

✅ **Multi-Admin Support**
- Multiple admins can handle chats simultaneously
- Load balancing prevents overload
- Handoff between admins if needed

✅ **Chat History & Transcripts**
- All chats are logged and searchable
- Full conversation history available
- Export chat transcripts for records

✅ **Auto-Response System**
- Automatic message when no admins are available
- Customizable per admin or global
- Set different messages for different times

✅ **Admin Management**
- Assign unlimited admins to ChatSupport
- Track admin activity in chats
- Revoke access instantly

✅ **Chat Rating & Feedback**
- Users can rate their chat experience
- Feedback helps improve quality
- Track satisfaction metrics

✅ **Chat Search & Filtering**
- Find specific chats by user name, date, topic
- Filter by admin, status, resolved/unresolved
- Export filtered chat reports

✅ **User Account Linking**
- See full user profile in chat window
- View user's order history
- Access user's previous tickets/issues

✅ **Admin Activity Tracking**
- Log all admin actions in chats
- Track response times
- Monitor admin performance

---

## How Users Access ChatSupport

### From User Dashboard
1. Users go to their **Attendee/Vendor/Agent Dashboard**
2. Look for the **"Chat Support"** or **"Help"** icon (usually bottom-right)
3. Click to open the chat window
4. Users can see if ChatSupport is active/inactive
5. If active, users type their message and send

### Chat Flow
1. **User sends message** → Auto-response sent immediately
2. **User waits** → Admin is notified of new chat
3. **Admin responds** → User gets notified
4. **Conversation continues** → Until resolved
5. **Chat closes** → Transcript is saved

---

## Testing ChatSupport Setup

### Test 1: Create Test Chat
1. Assign at least one admin to ChatSupport
2. Enable ChatSupport
3. Log in as a test user
4. Initiate a chat and send a message
5. Confirm auto-response appears

### Test 2: Admin Response
1. Log in as the assigned chat support admin
2. Open their admin dashboard or ChatSupport interface
3. See the new chat notification
4. Open the chat and send a response
5. Verify user receives the response

### Test 3: Multiple Admins
1. Assign 2-3 more admins
2. All should be able to view and respond to all chats
3. Verify chat appears in all admins' chat lists
4. Verify responses are visible to all admins

### Test 4: Disable and Enable
1. Disable ChatSupport
2. Try to send a message as user
3. Confirm chat or ChatSupport is unavailable
4. Re-enable ChatSupport
5. Confirm users can chat again

---

## Best Practices

### For Main Admin
- ✅ Monitor assigned admins' response times
- ✅ Review chat satisfaction ratings regularly
- ✅ Update auto-response based on business hours
- ✅ Assign admins based on workload
- ✅ Keep auto-response message friendly and professional
- ❌ Don't assign every single admin (focus on dedicated support team)
- ❌ Don't ignore inactive or poor-performing chats
- ❌ Don't change auto-response too frequently

### For Chat Support Admins
- ✅ Respond to chats within 5-10 minutes
- ✅ Be professional and helpful
- ✅ Use chat history to understand user issues
- ✅ Escalate complex issues to main admin if needed
- ✅ Keep responses clear and concise
- ❌ Don't share personal information
- ❌ Don't make promises you can't keep
- ❌ Don't be dismissive of user problems

### For Users
- ✅ Use ChatSupport for quick questions
- ✅ Be detailed about your issue
- ✅ Provide order/account info when needed
- ✅ Rate the chat after it ends
- ❌ Don't spam or send many repeated messages
- ❌ Don't use chat for sensitive financial info (use secure channels)
- ❌ Don't expect instant replies at odd hours

---

## Troubleshooting

### Problem: ChatSupport not appearing for users
- ✅ Solution: Check if ChatSupport is enabled in Full Control tab
- ✅ Solution: Refresh user's browser
- ✅ Solution: Check if at least one admin is assigned

### Problem: Auto-response not sending
- ✅ Solution: Verify auto-response message is not empty
- ✅ Solution: Click "Save ChatSupport Settings" to apply changes
- ✅ Solution: Check browser console for errors

### Problem: Admin can't see chats
- ✅ Solution: Verify admin is listed in "Assigned Chat Support Admins"
- ✅ Solution: Ask admin to log out and log back in
- ✅ Solution: Check if ChatSupport is enabled

### Problem: Chat not appearing for multiple admins
- ✅ Solution: Confirm all admins are assigned to ChatSupport
- ✅ Solution: Refresh all browser windows
- ✅ Solution: Check if chat is marked as closed/archived

---

## Deployment & Backend Sync

Once ChatSupport settings are configured, the following would sync with backend:
- ChatSupport enabled/disabled status
- Assigned admins list
- Auto-response message
- Admin activity logs
- Chat history and transcripts

### Command to Deploy
```bash
vercel --prod
```

After deployment, all users and admins will have access to the updated ChatSupport system.

---

## Support & Contact

For issues or questions about ChatSupport:
1. Check this guide for troubleshooting
2. Review chat transcripts for patterns
3. Contact the main admin/system owner
4. File a bug report if feature isn't working as expected

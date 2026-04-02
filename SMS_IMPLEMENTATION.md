# SMS Implementation Complete ✅

## What Was Added

### 1. Node.js Backend SMS Service
- **File**: `server/services/smsService.js`
- **Functions**: 
  - `sendSMS(phone, message)` - Send SMS to phone number
  - `sendOTP(phone, otp)` - Send OTP code
  - `sendTicketConfirmation(phone, ticketCode)` - Send ticket SMS
  - `sendBookingConfirmation(phone, eventName, ticketCode)` - Send booking SMS
  - `healthCheck()` - Verify SMS service is configured

### 2. SMS Routes
- **File**: `server/routes/sms.js`
- **Endpoints**:
  - `POST /api/sms/send` - Send custom SMS
  - `POST /api/sms/send-otp` - Send OTP
  - `POST /api/sms/send-ticket` - Send ticket confirmation
  - `GET /api/sms/health` - Health check

### 3. React SMS Service
- **File**: `src/services/smsService.js` (Updated)
- **Endpoint**: `/api/sms/send` (changed from `/api/send-sms`)

### 4. Environment Variables
Added to `server/.env`:
```
SMS_API_KEY=c6f61e914257462812deaff55c412a213cbf61a6388761016a1b2263d347948b
SMS_API_HOST=api.smsonlinegh.com
SMS_SENDER_ID=ReekTickets
```

---

## How It Works

```
React App
    ↓ (sendSMS)
    ↓ https://reektickets-production.up.railway.app/api/sms/send
Node.js Backend (server/index.js)
    ↓ (sms route handler)
SMS Service (smsService.js)
    ↓ (Direct API call via HTTPS)
SMS Online GH API (api.smsonlinegh.com)
    ↓ (SMS delivery)
↓ User's Phone
```

---

## To Deploy to Railway

1. **Commit and push changes**:
```bash
cd /home/dosei1213/reektickets
git add server/services/smsService.js
git add server/routes/sms.js
git add server/index.js
git add server/.env
git add src/services/smsService.js
git commit -m "Add SMS functionality via SMS Online GH API"
git push
```

2. **Railway will auto-deploy** (watch dashboard)

3. **Verify deployment**:
   - Go to: `https://reektickets-production.up.railway.app/api/sms/health`
   - Should return: `{"status":"healthy","host":"api.smsonlinegh.com",...}`

---

## Testing SMS

### Test 1: Direct API Test
In browser DevTools console:
```javascript
fetch("https://reektickets-production.up.railway.app/api/sms/send", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    phone: "0273476701",
    message: "Test SMS from ReekTickets"
  })
})
.then(r => r.json())
.then(d => console.log(d))
.catch(e => console.error(e))
```

Expected response:
```json
{
  "success": true,
  "status": 200,
  "message": "SMS sent successfully",
  "data": {...}
}
```

### Test 2: OTP Component
1. Use OTPComponent in React
2. Enter phone: `0273476701`
3. Click "Send OTP"
4. Should show "OTP sent successfully!"
5. Check phone for the message

---

## Environment Configuration

### Railway Dashboard Setup
Make sure these variables are set in Railway:
- `SMS_API_KEY` = `c6f61e914257462812deaff55c412a213cbf61a6388761016a1b2263d347948b`
- `SMS_API_HOST` = `api.smsonlinegh.com`
- `SMS_SENDER_ID` = `ReekTickets`
- All other existing variables (MONGO_URI, JWT_SECRET, etc.)

---

## Usage in React Components

### Send OTP
```jsx
import { sendOTP } from './services/smsService';

// In component:
const handleSendOTP = async () => {
  const response = await sendOTP('0273476701', '123456');
  if (response.success) {
    console.log('OTP sent!');
  }
};
```

### Send SMS
```jsx
import { sendSMS } from './services/smsService';

const response = await sendSMS('0273476701', 'Your message here');
```

### In Backend (Node.js)
```javascript
const { sendSMS, sendOTP } = require('./services/smsService');

// Send SMS
const result = await sendSMS('0273476701', 'Hey there!');
if (result.success) {
  res.json({ message: 'SMS sent' });
}
```

---

## Troubleshooting

**Issue: "Cannot reach SMS backend"**
- Check Railway backend is running
- Verify `REACT_APP_SMS_BACKEND_URL` in `.env.local`
- Restart React dev server

**Issue: SMS not received**
- Verify phone format is `0XXXXXXXXX` (Ghana format)
- Check SMS Online GH account has credits
- Look at Railway logs for errors

**Issue: Invalid phone format error**
- Phone must start with 0
- Must be 10 digits total
- Example: `0273476701` ✓, `273476701` ✗

**Issue: healthcheck returns unconfigured**
- Verify `SMS_API_KEY` is set in Railway
- Redeploy after setting variables
- Check server/.env locally has the key

---

## API Reference

### POST /api/sms/send
Send custom SMS message

**Request**:
```json
{
  "phone": "0273476701",
  "message": "Your message text"
}
```

**Response**:
```json
{
  "success": true,
  "status": 200,
  "message": "SMS sent successfully",
  "data": "..."
}
```

---

### POST /api/sms/send-otp  
Send OTP code

**Request**:
```json
{
  "phone": "0273476701",
  "otp": "123456"
}
```

---

### POST /api/sms/send-ticket
Send ticket confirmation

**Request**:
```json
{
  "phone": "0273476701",
  "ticketCode": "TICKET-XXXXX-XXXXX"
}
```

---

### GET /api/sms/health
Check SMS service health

**Response**:
```json
{
  "status": "healthy",
  "host": "api.smsonlinegh.com",
  "sender_id": "ReekTickets",
  "configured": true
}
```

---

## Files Modified

- `server/services/smsService.js` - NEW
- `server/routes/sms.js` - NEW
- `server/index.js` - Added SMS route
- `server/.env` - Added SMS variables
- `src/services/smsService.js` - Updated endpoint URL
- `OTPComponent.jsx` - Already has SMS integration

---

## Next Steps

1. **Push to GitHub** and Railway will auto-deploy
2. **Test SMS** using the test commands above
3. **Integrate in your app**:
   - Use OTPComponent for phone verification
   - Call sendSMS/sendOTP from your components
   - Handle responses appropriately

---

## Questions?

If SMS still doesn't work:
1. Check Railway logs for errors
2. Verify all environment variables are set
3. Test the health endpoint
4. Try sending with a test phone number

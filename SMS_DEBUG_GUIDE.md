# SMS System Debugging Guide

## Quick Checklist

Before debugging, make sure:
- [ ] Railway backend is running: `https://reektickets-production.up.railway.app`
- [ ] `.env.local` has `REACT_APP_SMS_BACKEND_URL` set
- [ ] Python backend has `.env` with `API_KEY`, `API_HOST`, `SENDER_ID`
- [ ] Phone number is in Ghana format (0XXXXXXXXX)

---

## Step 1: Check Backend is Running

Open your browser and go to:
```
https://reektickets-production.up.railway.app/api/health
```

You should see:
```json
{
  "status": "healthy",
  "service": "SMS Backend",
  "host": "api.smsonlinegh.com",
  "sender_id": "ReekTickets"
}
```

**If you get an error:**
- Check Railway dashboard (logs tab)
- Verify environment variables are set in Railway
- Restart the Railway deployment

---

## Step 2: Check React Environment Variables

Open browser DevTools (F12) → Console, and run:
```javascript
console.log(process.env.REACT_APP_SMS_BACKEND_URL)
```

Should print: `https://reektickets-production.up.railway.app`

**If empty:**
- Add to `.env.local`:
  ```
  REACT_APP_SMS_BACKEND_URL=https://reektickets-production.up.railway.app
  ```
- Restart React dev server or redeploy to Vercel

---

## Step 3: Test SMS Backend Directly

Open browser DevTools (F12) → Console, paste:

```javascript
fetch("https://reektickets-production.up.railway.app/api/send-sms", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    phone: "0273476701",  // Use a real number
    message: "Test SMS from ReekTickets"
  })
})
.then(r => r.json())
.then(d => console.log(d))
.catch(e => console.error(e))
```

**Expected response:**
```json
{
  "success": true,
  "status": 200,
  "message": "SMS sent successfully",
  "data": "..."
}
```

---

## Step 4: Test OTP Component

In a React component, test the OTPComponent:

```jsx
import OTPComponent from './components/OTPComponent';

export default function TestOTP() {
  return (
    <OTPComponent 
      phone="0273476701"
      onVerifySuccess={() => alert('Success!')}
      onVerifyFail={() => alert('Failed!')}
    />
  );
}
```

Try sending OTP and check:
1. Browser Console (F12) for errors
2. Railway logs for backend errors
3. Your phone for the SMS

---

## Common Issues & Solutions

### Issue 1: "Cannot reach SMS backend"

**Cause:** Backend URL is wrong or backend is down

**Fix:**
1. Verify Railway backend is running
2. Check `.env.local` has correct URL
3. Restart React dev server
4. In Railway, check logs for crashes

### Issue 2: "Invalid phone number"

**Cause:** Phone number not in Ghana format

**Valid formats:**
- `0273476701` ✓
- `0505123456` ✓
- `0241234567` ✓
- `273476701` ✗ (missing leading 0)
- `+233273476701` ✗ (has +233)

**Fix:** Use format `0XXXXXXXXX` (10 digits starting with 0)

### Issue 3: "Authentication failed"

**Cause:** API key or credentials are wrong

**Fix:**
1. Check Railway environment variables:
   - `API_KEY` = `c6f61e914257462812deaff55c412a213cbf61a6388761016a1b2263d347948b`
   - `API_HOST` = `api.smsonlinegh.com`
   - `SENDER_ID` = `ReekTickets`
2. Redeploy Railway after updating

### Issue 4: SMS not received but says "sent"

**Cause:** SMS API received it but delivery failed

**Check:**
1. Verify phone number is correct
2. Check SMS Online GH dashboard for delivery status
3. Verify you have SMS credits

---

## Step 5: Check Flask Backend Locally

If you want to test locally:

```bash
cd /home/dosei1213/reektickets/python-backend
source .venv/bin/activate
python -m flask run --port 5001
```

Then test with:
```javascript
fetch("http://localhost:5001/api/send-sms", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    phone: "0273476701",
    message: "Test message"
  })
})
.then(r => r.json())
.then(d => console.log(d))
```

---

## Step 6: Check SMS Service Logs

The SMS service logs every request. Check:

**On Railway:**
- Go to Dashboard → Logs tab
- Search for "Sending SMS" or search the phone number

**Local Flask:**
- Look at terminal output where you ran `python -m flask run`

---

## Enable Debug Logging

To get more detailed logs in React:

Update `OTPComponent.jsx` or `smsService.js`:

```javascript
// In smsService.js
console.log(`[SMS] Sending to ${phone}...`);
console.log(`[SMS] Backend URL: ${BACKEND_BASE_URL}`);
console.log(`[SMS] Response:`, data);
```

This will show in browser DevTools Console.

---

## Railway Environment Variables Checklist

Go to Railway Dashboard → Variables and verify:

```
API_KEY=c6f61e914257462812deaff55c412a213cbf61a6388761016a1b2263d347948b
API_HOST=api.smsonlinegh.com
SENDER_ID=ReekTickets
PORT=3000
```

All 4 must be set!

---

## Still Having Issues?

1. **Check browser console** (F12) for frontend errors
2. **Check Railway logs** for backend errors
3. **Check SMS Online GH account** for credits/status
4. **Verify phone number format** - must be `0XXXXXXXXX`
5. **Clear cache** - Ctrl+Shift+Delete and refresh

---

## Test SMS Service Functions

```javascript
// In browser console:

// Import the service (adjust path as needed)
import { sendSMS, sendTicketSMS, checkSMSBackendHealth } from './services/smsService.js';

// Check if backend is healthy
checkSMSBackendHealth().then(healthy => {
  console.log('Backend healthy?', healthy);
});

// Send test SMS
sendSMS('0273476701', 'Test message').then(response => {
  console.log('SMS Response:', response);
}).catch(error => {
  console.error('SMS Error:', error);
});

// Send with ReekTickets prefix
sendTicketSMS('0273476701', 'Your booking confirmed!').then(response => {
  console.log('Ticket SMS sent:', response);
}).catch(error => {
  console.error('Error:', error);
});
```

---

## Success Indicators

✓ You'll know SMS is working when:
1. Backend health check returns status "healthy"
2. OTP component shows "OTP sent successfully!"
3. Phone receives the OTP text message
4. OTP verification works correctly
5. Browser console has no errors (only info logs)

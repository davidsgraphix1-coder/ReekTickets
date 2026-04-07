# ReekTickets SMS System Setup & Testing

## Overview
The SMS system uses SMSONLINEGH API with Zenoph SDK. It sends OTPs, ticket confirmations, and general messages to phone numbers in Ghana.

## Configuration

### Backend Environment Variables (Node.js)
Set these in your `.env` or Vercel environment variables:

```
SMS_API_KEY=c6f61e914257462812deaff55c412a213cbf61a6388761016a1b2263d347948b
SMS_API_HOST=api.smsonlinegh.com
SMS_SENDER_ID=ReekTickets
SMS_HOST=api.smsonlinegh.com
```

### Python Backend Environment Variables
Set these in `python-backend/.env`:

```
API_HOST=api.smsonlinegh.com
API_KEY=c6f61e914257462812deaff55c412a213cbf61a6388761016a1b2263d347948b
SENDER_ID=ReekTickets
```

## SMS Endpoints

### 1. Send General SMS
**POST** `/api/sms/send`

```json
{
  "phone": "0273476701",
  "message": "Your ReekTickets ticket is ready!"
}
```

Response:
```json
{
  "success": true,
  "status": 200,
  "message": "SMS sent successfully to 233273476701",
  "data": {...}
}
```

### 2. Send OTP
**POST** `/api/sms/send-otp`

```json
{
  "phone": "0273476701",
  "otp": "123456"
}
```

Response:
```json
{
  "success": true,
  "message": "SMS sent successfully to 233273476701"
}
```

### 3. Send Ticket Confirmation
**POST** `/api/sms/send-ticket`

```json
{
  "phone": "0273476701",
  "ticketCode": "TICKET123ABC"
}
```

### 4. Test SMS (Debug Endpoint)
**POST** `/api/sms/test`

```json
{
  "phone": "0273476701"
}
```

Sends: `Test SMS from ReekTickets. Timestamp: 2026-04-07T12:00:00.000Z`

### 5. Health Check
**GET** `/api/sms/health`

Response:
```json
{
  "success": true,
  "message": "SMS service is operational",
  "testResult": true
}
```

## Phone Number Format

The system automatically formats phone numbers:
- `0273476701` → `233273476701`
- `+233273476701` → `233273476701`
- `233273476701` → `233273476701`

All numbers are converted to the international format beginning with 233 (Ghana's country code).

## Frontend Integration

### Using sendNaloSms()
```javascript
import { sendNaloSms } from '../services/api';

// Send ticket SMS
const response = await sendNaloSms({
  to: "0273476701",
  message: "Your ticket code: ABC123"
});

if (response.success) {
  console.log("SMS sent!");
} else {
  console.log("SMS failed:", response.message);
}
```

### In PaymentSuccess Component
The system automatically sends SMS after tickets are purchased. The flow:
1. User purchases ticket
2. Payment verified
3. Ticket created with `smsCode`
4. SMS automatically sent with ticket details

## Testing & Debugging

### Local Testing
```bash
# Test SMS endpoint
curl -X POST http://localhost:5000/api/sms/send \
  -H 'Content-Type: application/json' \
  -d '{
    "phone": "0273476701",
    "message": "Test message"
  }'

# Check health
curl http://localhost:5000/api/sms/health
```

### Production Testing (Vercel)
```bash
# Test SMS endpoint
curl -X POST https://reektickets.com/api/sms/test \
  -H 'Content-Type: application/json' \
  -d '{"phone": "0273476701"}'
```

### Browser Console Testing
```javascript
// In browser dev tools
const response = await fetch('/api/sms/send', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    phone: '0273476701',
    message: 'Test from browser'
  })
});
const data = await response.json();
console.log(data);
```

## Troubleshooting

### Issue: SMS Not Sending
1. **Check API Key**: Verify `SMS_API_KEY` is set correctly
2. **Check Phone Number**: Ensure number is valid Ghana format
3. **Check Network**: Verify backend can reach `api.smsonlinegh.com`
4. **Check Logs**: Look for errors in server console

### Issue: SMSONLINEGH API Error
- Status 401: Invalid API key
- Status 400: Invalid request format
- Status 403: Insufficient SMS credits

### Issue: SMS Timeout
```
Error: ECONNREFUSED
```
- Network connectivity issue
- SMSONLINEGH API server down
- Firewall blocking requests

## SMS Credits
Check your SMSONLINEGH dashboard: https://api.smsonlinegh.com/

- Test phone: `0273476701`
- Current balance: Available in dashboard

## Python Backend (Optional)
Alternative SMS method using Zenoph SDK:

```bash
# Run Python backend
cd python-backend
python backend.py
```

Then send SMS via:
```bash
curl -X POST http://localhost:5001/api/send-sms \
  -H 'Content-Type: application/json' \
  -d '{
    "phone": "0273476701",
    "message": "Test via Python"
  }'
```

## SMS Flow Diagram

```
User Signs Up / Purchases Ticket
        ↓
Backend generates OTP or ticket code
        ↓
Route: /api/sms/send-otp or PaymentSuccess.js calls sendNaloSms()
        ↓
API Service: sendNaloSms() → fetch /api/sms/send
        ↓
Backend SMS Route: POST /api/sms/send
        ↓
SMS Service: sendSMS(phone, message)
        ↓
SMSONLINEGH API: https://api.smsonlinegh.com/sms/send/
        ↓
SMS Delivered to User's Phone
```

## Performance Notes
- SMS timeout: 20 seconds
- Retry logic: Attempts gateway first, then direct API
- No queue system: SMS sent synchronously

## Security Best Practices
1. Never log full phone numbers in production
2. Keep API keys in environment variables
3. Validate phone numbers before sending
4. Rate limit SMS endpoints in future versions

## Recent Changes
- Updated `sendNaloSms()` to use `/api/sms/send` endpoint (was `/api/sms/send-otp`)
- Added `/api/sms/test` debug endpoint
- Enhanced logging in all SMS routes
- Better error messages and phone number formatting

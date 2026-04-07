# SMS System Implementation & Fixes

## Summary of Changes

### 1. **Frontend API Fix** (`src/services/api.js`)
**Issue**: The `sendNaloSms()` function was using the wrong endpoint and parameter format.

**Fixed**:
- Changed endpoint from `/api/sms/send-otp` to `/api/sms/send`
- Updated payload: `{ phone: to, message: message }` (was passing `otp: message`)
- Added proper logging with `console.log()` for debugging
- Added `success: false` to error responses for consistency

### 2. **Backend SMS Routes Enhancement** (`server/routes/sms.js`)
**Improvements**:
- Added comprehensive logging to all endpoints for debugging
- Added `/api/sms/test` endpoint for quick testing without OTP logic
- Better error messages that include what went wrong
- Consistent response format with `success` field

**New Endpoint**:
```
POST /api/sms/test
Body: { "phone": "0273476701" }
Sends a timestamped test message
```

### 3. **SMS Service Backend** (`server/services/smsService.js`)
**Current Features**:
- Phone number auto-formatting (handles various formats)
- Gateway fallback: tries Render gateway, then SMSONLINEGH directly
- Proper error handling with detailed error messages
- Timeout: 20 seconds per request

### 4. **Documentation & Testing**
**Created**:
- `SMS_SETUP.md` - Comprehensive SMS system documentation
- `test-sms.sh` - Automated bash script for testing all SMS endpoints

## SMS Flow Architecture

```
PaymentSuccess.js (User buys ticket)
         ↓
   sendNaloSms({ to, message })
         ↓
   src/services/api.js
         ↓
   POST /api/sms/send
         ↓
   server/routes/sms.js
         ↓
   server/services/smsService.js
         ↓
   SMSONLINEGH API
         ↓
   SMS Delivered
```

## Environment Variables Required

Add to `.env.production` or Vercel environment:
```
SMS_API_KEY=c6f61e914257462812deaff55c412a213cbf61a6388761016a1b2263d347948b
SMS_API_HOST=api.smsonlinegh.com
SMS_SENDER_ID=ReekTickets
```

## Testing

### Quick Test (Local)
```bash
# 1. Start your server
npm run server

# 2. In another terminal
./test-sms.sh http://localhost:5000 0273476701
```

### Production Test
```bash
curl -X POST https://reektickets.com/api/sms/test \
  -H 'Content-Type: application/json' \
  -d '{"phone":"0273476701"}'
```

### Browser Console Test
```javascript
fetch('/api/sms/send', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    phone: '0273476701',
    message: 'Test message'
  })
}).then(r => r.json()).then(d => console.log(d))
```

## API Endpoints Available

| Method | Endpoint | Purpose | Body |
|--------|----------|---------|------|
| POST | `/api/sms/send` | Send any message | `{phone, message}` |
| POST | `/api/sms/send-otp` | Send OTP | `{phone, otp}` |
| POST | `/api/sms/send-ticket` | Send ticket confirm | `{phone, ticketCode}` |
| POST | `/api/sms/test` | Test SMS | `{phone}` |
| GET | `/api/sms/health` | Health check | - |

## Phone Number Formats Supported

All these formats are automatically converted to `233XXXXXXXXX`:
- `0273476701` → `233273476701`
- `+233273476701` → `233273476701`
- `233273476701` → `233273476701`

## Known Limitations

1. **No SMS Queue**: Messages are sent synchronously (good for small volume)
2. **No Retry Mechanism**: Failed SMS is attempted once with gateway fallback
3. **No Delivery Confirmation**: System doesn't confirm SMS actually reached phone
4. **Hard-coded 20s Timeout**: May need adjustment for slow networks

## Next Steps for Production

1. **Monitor SMS Logs**: Check server logs regularly for failures
2. **Track SMS Credits**: Keep eye on SMSONLINEGH dashboard balance
3. **Test with Real Numbers**: Use test numbers provided by SMSONLINEGH
4. **Add Queue System** (Future): For high volume, implement job queue
5. **Add Retry Logic** (Future): Exponential backoff for failed sends

## Debugging Checklist

If SMS isn't working:
- [ ] Check API key in `.env.production`
- [ ] Verify phone number format (should start with 233)
- [ ] Check server logs for error messages
- [ ] Test health endpoint: `GET /api/sms/health`
- [ ] Try test endpoint: `POST /api/sms/test`
- [ ] Check SMSONLINEGH dashboard for SMS credits
- [ ] Verify network connectivity to `api.smsonlinegh.com`

## Files Modified

1. `src/services/api.js` - Fixed sendNaloSms function
2. `server/routes/sms.js` - Added logging and test endpoint
3. `SMS_SETUP.md` (created) - Comprehensive documentation
4. `test-sms.sh` (created) - Automated testing script

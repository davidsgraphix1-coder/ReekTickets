# SMS Integration with Python Handler

## Overview

The ReekTickets SMS system now integrates a **Python SMS handler** that runs within the Node.js backend. This provides reliable SMS delivery via the SMSONLINEGH API with automatic fallback mechanisms.

## Architecture

```
React Frontend (https://reektickets.com)
    ↓ sends phone & message
Node.js Express Server (/api/sms/send)
    ↓ calls child process
Python Handler (sms_handler.py)
    ↓ sends via
SMSONLINEGH API (https://api.smsonlinegh.com)
```

## How It Works

### 1. Frontend Flow
- User submits phone number during signup
- React calls `POST /api/sms/send` with `{phone, message}`
- This is handled by the Node backend SMS route

### 2. Backend Flow (Node.js)
- SMS route receives request at `server/routes/sms.js`
- Calls `sendSMS()` from `server/services/smsService.js`
- Node.js spawns Python process via `child_process.spawn('python3', [sms_handler.py])`
- Passes JSON input via stdin: `{phone, message}`

### 3. Python Handler (sms_handler.py)
- Reads JSON from stdin
- Validates phone number format (Ghana format)
- Calls SMSONLINEGH API with credentials from environment variables
- Returns JSON result with success/error status
- Exits with code 0 (success) or 1 (failure)

### 4. Fallback Mechanism
- If Python handler fails → Node.js falls back to Direct API call
- If Direct API fails → Returns error to user

## File Structure

```
server/
├── routes/
│   └── sms.js                  # SMS API endpoints
├── services/
│   └── smsService.js           # SMS logic (calls Python handler)
└── sms_handler.py              # Python SMS handler script
```

## Configuration

### Environment Variables (server/.env)

```bash
# SMS API Configuration
SMS_API_HOST=api.smsonlinegh.com
SMS_API_KEY=c6f61e914257462812deaff55c412a213cbf61a6388761016a1b2263d347948b
SMS_SENDER_ID=ReekTickets

# Python path (optional, defaults to python3)
PYTHON_EXECUTABLE=python3
```

## API Endpoints

### Send SMS
```
POST /api/sms/send
Content-Type: application/json

Request Body:
{
  "phone": "0273476701",    // Ghana format: 0XXXXXXXXX or 233XXXXXXXXX
  "message": "Your OTP is 123456"
}

Success Response (200):
{
  "success": true,
  "status": 200,
  "data": { "status": "ok" },
  "message": "SMS sent successfully"
}

Error Response (500):
{
  "success": false,
  "status": 500,
  "error": "Invalid phone format",
  "message": "Invalid phone format. Use format like 0273476701"
}
```

### Send OTP
```
POST /api/sms/send-otp
Content-Type: application/json

Request Body:
{
  "phone": "0273476701",
  "otp": "123456"
}

Sends: "Your ReekTickets OTP is: 123456. Valid for 5 minutes."
```

### Send Ticket Confirmation
```
POST /api/sms/send-ticket-confirmation
Content-Type: application/json

Request Body:
{
  "phone": "0273476701",
  "ticketCode": "ABC123XYZ"
}

Sends: "Your ReekTickets ticket code: ABC123XYZ. View: https://reektickets.com/ticket/ABC123XYZ"
```

## Phone Number Formats

**Accepted Formats:**
- `0273476701` (10 digits, Ghana format)
- `233273476701` (12 digits, international)
- `+233273476701` (international with +)
- Phone numbers with spaces are automatically cleaned

**Validation:**
- Ghana numbers must start with 0 or 233
- Must be valid length (10 or 12 digits)
- Returns error for invalid formats

## Python Handler Details

### Input
```json
{
  "phone": "0273476701",
  "message": "Your OTP is 123456"
}
```

### Output (stdout)
```json
{
  "success": true,
  "status": 200,
  "data": { "status": "ok" },
  "message": "SMS sent successfully"
}
```

### Error Handling
- **Invalid JSON**: Returns 400 error
- **Missing fields**: Returns 400 error  
- **Invalid phone**: Returns 400 error
- **API timeout**: Returns 504 error
- **API failure**: Returns 500 with error message
- **Python crash**: Node catches error and returns 500

## Testing

### Local Testing

1. Start Node backend:
```bash
cd server
npm install
npm start
```

2. Test SMS endpoint:
```bash
curl -X POST http://localhost:5000/api/sms/send \
  -H "Content-Type: application/json" \
  -d '{"phone":"0273476701","message":"Test SMS"}'
```

3. Test Python handler directly:
```bash
echo '{"phone":"0273476701","message":"Test"}' | python3 sms_handler.py
```

### Production Testing

1. Test on deployed system:
```bash
curl -X POST https://reektickets.com/api/sms/send \
  -H "Content-Type: application/json" \
  -d '{"phone":"0273476701","message":"Test SMS"}'
```

2. Check logs:
```bash
tail -f /var/log/reektickets/server.log | grep SMS
```

## Logs and Debugging

### Node Backend Logs
```
[SMS] Attempting to send via Python handler...
[SMS] Python result: SUCCESS Your OTP is: 123456
[SMS] Response 200: { status: 'ok' }
```

### Python Handler Logs (stderr)
```
[SMS] Sending to 0273476701 via direct API
[SMS] Response 200: {'status': 'ok'}
```

### Troubleshooting

**Issue: "SMS handler error: spawn ENOENT"**
- Cause: Python3 not found in PATH
- Solution: Install Python3 or set PYTHON_EXECUTABLE env var

**Issue: "Failed to parse Python output"**
- Cause: Python script crashed before returning JSON
- Solution: Check Python logs, verify dependencies

**Issue: "Request timeout"**
- Cause: SMSONLINEGH API slow or unreachable
- Solution: Check internet connection, API status

**Issue: "Invalid phone format"**
- Cause: Phone number doesn't match Ghana format
- Solution: Use format 0273476701 or 233273476701

## Dependencies

### Node.js
- No additional packages needed (uses built-in `child_process`)
- Already included in package.json

### Python3
- Built-in modules only: `sys`, `json`, `os`, `urllib`
- No additional pip packages required

### External
- SMSONLINEGH API (must have valid API key)

## Deployment

### Vercel Deployment

1. Make sure Python3 is available (included in Vercel runtime)
2. Deploy Node backend normally:
```bash
cd server
vercel --prod
```

3. Set environment variables in Vercel dashboard:
```
SMS_API_KEY=your_api_key
SMS_SENDER_ID=ReekTickets
SMS_API_HOST=api.smsonlinegh.com
```

### Self-Hosted Deployment

1. Ensure Python3 installed:
```bash
sudo apt-get install python3
```

2. Deploy Node backend with environment file:
```bash
cd server
npm install
SM_API_KEY=your_key npm start
```

## Security Considerations

1. **API Key**: Stored in .env (not committed to git)
2. **Phone Numbers**: Validated before sending (prevents injection)
3. **Timeouts**: 15-second max wait prevents hanging
4. **Error Messages**: Don't expose internal details in production

## Performance

- **Direct calls**: ~2-3 seconds per SMS
- **Python spawn overhead**: ~0.5-1 second per request
- **Total latency**: ~3-4 seconds per SMS delivery
- **Concurrent**: Node queues requests naturally

## Future Improvements

1. Thread pool for Python handlers
2. Queue system (Redis) for batch SMS
3. Webhook notifications for delivery status
4. Multilingual message templates
5. SMS rate limiting
6. Sender ID rotation for deliverability

## Support

For SMS issues:
1. Check logs: `grep SMS /var/log/reektickets/server.log`
2. Test directly: `echo '{"phone":"0273476701","message":"Test"}' | python3 sms_handler.py`
3. Verify API key and sender ID
4. Check phone number format
5. Contact SMSONLINEGH support if API is down

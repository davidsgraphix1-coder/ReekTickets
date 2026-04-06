# SMS Production Setup for ReekTickets

## Overview
The SMS system now uses a Python backend (Zenoph SDK) to send SMS via SMSONLINEGH. Here's how to deploy it to production.

## Frontend Configuration (Vercel)

### Environment Variables
The frontend files have been updated with production URLs:

**`.env.production`** (for Vercel builds):
```
REACT_APP_API_BASE="https://reektickets.com/api"
REACT_APP_PYTHON_SMS_BACKEND="https://reektickets-sms-backend-production.up.railway.app"
```

**`.env`** (local development):
```
REACT_APP_API_BASE=https://reektickets.com/api
REACT_APP_PYTHON_SMS_BACKEND=https://reektickets-sms-backend-production.up.railway.app
```

## Python Backend Deployment (Railway)

### Step 1: Deploy Python SMS Backend to Railway

```bash
cd python-backend
railway link  # Link to existing Railway project or create new one
railway up   # Deploy to Railway
```

### Step 2: Get Railway URL
After deployment, Railway will provide a URL like:
```
https://reektickets-sms-backend-production.up.railway.app
```

### Step 3: Update Environment Variables
Update the frontend `.env` and `.env.production` with the actual Python backend Railway URL if different.

### Step 4: Verify Deployment
Railway health check endpoint:
```bash
curl https://reektickets-sms-backend-production.up.railway.app/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "service": "SMS Backend",
  "host": "api.smsonlinegh.com",
  "sender_id": "ReekTickets"
}
```

## SMS Flow in Production

1. **User Signup** → Phone number + OTP sent via SMS
2. **Frontend** (`/signup`) → Calls backend `/api/auth/signup`
3. **Backend** → Generates OTP, triggers SMS
4. **Frontend** (`/verify-email`) → Resend OTP button
5. **SMS Service** → 
   - Tries Python backend `/api/send-sms`
   - Falls back to direct SMSONLINEGH API if Python backend fails
6. **SMSONLINEGH** → Sends SMS via Zenoph SDK

## Testing Production SMS

### Test Direct API (No Python Backend)
```javascript
// In browser console
const response = await fetch('https://api.smsonlinegh.com/send', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    apikey: 'c6f61e914257462812deaff55c412a213cbf61a6388761016a1b2263d347948b',
    to: '233XXXXXXXXX',
    from: 'ReekTickets',
    msg: 'Test message',
    type: 0
  })
});
console.log(await response.json());
```

### Test Python Backend
```bash
curl -X POST https://reektickets-sms-backend-production.up.railway.app/api/send-sms \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "233XXXXXXXXX",
    "message": "Test message"
  }'
```

## Building for Production

### Build React App
```bash
npm run build
```

This will:
- Use `.env.production` environment variables
- Set `REACT_APP_PYTHON_SMS_BACKEND` to Railway URL
- Build optimized production bundle

### Deploy to Vercel
```bash
vercel --prod
```

## Debugging

### Check Frontend Logs
```
Vercel Dashboard → Reektickets Project → Deployments → View Logs
```

### Check Python Backend Logs
```
Railway Dashboard → SMS Backend project → Logs tab
```

### Test SMS from Frontend
1. Go to signup page
2. Try to sign up with a test phone number
3. Check browser Network tab for `/api/send-sms` requests
4. Check Python backend logs for SMS status

## SMS Credits
- API Provider: SMSONLINEGH
- API Key: `c6f61e914257462812deaff55c412a213cbf61a6388761016a1b2263d347948b`
- Sender ID: `ReekTickets`
- Fallback: Direct API if Python backend is down

## Production Checklist
- [ ] Python backend deployed to Railway
- [ ] Railway URL updated in `.env.production`
- [ ] React build tested locally with production URLs
- [ ] Deployed to Vercel with `vercel --prod`
- [ ] Test SMS signup flow on production
- [ ] Monitor Python backend health in Railway
- [ ] Monitor SMS costs in SMSONLINEGH dashboard

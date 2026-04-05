# SMS Gateway Deployment Guide

## Option 1: Deploy to Railway (Recommended - Free)

### Step 1: Create Railway Account
1. Go to https://railway.app
2. Sign up with GitHub

### Step 2: Deploy SMS Gateway
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Create a new project in the dashboard at https://railway.app
# Then run:
railway init

# Follow prompts and select Node.js
railway up
```

### Step 3: Get Gateway URL
1. Go to https://railway.app/dashboard
2. Click your SMS Gateway service
3. Copy the public URL (looks like: `https://sms-gateway-prod-xyz123.railway.app`)

### Step 4: Update Vercel Environment
```bash
vercel env add SMS_GATEWAY_URL
# Paste your Railway URL: https://sms-gateway-prod-xyz123.railway.app

vercel env add SMS_GATEWAY_PORT
# Leave empty (Railway will set it)

vercel --prod
```

---

## Option 2: Deploy to Render (Free)

1. Go to https://render.com
2. Sign up with GitHub
3. Click "New" → "Web Service"
4. Connect your GitHub repo
5. Set environment:
   - Runtime: Node
   - Build command: `npm ci`
   - Start command: `node server/sms-gateway.js`
6. Add environment variables (if needed):
   - SMS_API_KEY
   - SMS_SENDER_ID
   - SMS_API_HOST

---

## Option 3: Deploy to Heroku (Paid)

```bash
heroku login
heroku create your-app-name
git push heroku main
```

---

## Testing Gateway Deployment

```bash
# Test gateway health
curl https://your-gateway-url.railway.app/health

# Test SMS sending
curl -X POST https://your-gateway-url.railway.app/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phone":"0273476701","otp":"123456"}'
```

---

## Environment Variables Needed

Add these to Railway:
- `SMS_API_KEY` - Your SMS API key (from .env)
- `SMS_SENDER_ID` - Sender ID (from .env)
- `SMS_API_HOST` - API host (from .env)
- `SMS_LOG_FILE` - Path to log file (optional)

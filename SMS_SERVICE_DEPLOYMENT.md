# Zenoph SMS Service Deployment

This guide explains how to deploy the Zenoph SMS service for Vercel production.

## Problem

Vercel serverless functions cannot directly run Python code that requires the Zenoph SDK. We need a separate service for SMS delivery.

## Solution

Deploy a Flask SMS service to Railway (free tier available) and have your Vercel app call it via HTTP.

## Deployment Steps

### 1. Create Railway Account
- Go to https://railway.app
- Sign up with GitHub
- Create a new project

### 2. Prepare the SMS Service

Run this command in your project root:
```bash
bash deploy-sms-service.sh
```

This creates a `sms-service-railway/` folder with everything needed.

### 3. Deploy to Railway

**Option A: Using Railway CLI (Recommended)**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Navigate to SMS service folder
cd sms-service-railway

# Deploy
railway up
```

**Option B: Using GitHub Integration**
1. Push the `sms-service-railway/` folder to GitHub
2. In Railway dashboard, click "New Project"
3. Select "Deploy from GitHub"
4. Choose the repository
5. Set the root directory to `sms-service-railway`

### 4. Configure Environment Variables on Railway

In Railway project settings, add:
```
SMS_API_KEY=c6f61e914257462812deaff55c412a213cbf61a6388761016a1b2263d347948b
SMS_SENDER_ID=ReekTickets
```

### 5. Get Railway Service URL

- After deployment, Railway will give you a public URL
- Copy this URL (e.g., https://sms-service-railway.up.railway.app)

### 6. Update Vercel Environment

Add to Vercel project environment variables:
```
SMS_SERVICE_URL=https://sms-service-railway.up.railway.app
```

### 7. Redeploy Vercel

In Vercel dashboard, click "Redeploy" to apply the new environment variable.

## Testing

After deployment, test the SMS service:

```bash
curl -X POST https://sms-service-railway.up.railway.app/health

curl -X POST https://sms-service-railway.up.railway.app/send \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "0273476701",
    "message": "Test message from ReekTickets"
  }'
```

## Architecture

```
┌─────────────────┐
│  Vercel App     │
│  (Node.js)      │
└────────┬────────┘
         │ HTTP
         ▼
┌─────────────────┐
│  Railway SMS    │
│  Service        │
│  (Python Flask) │
└────────┬────────┘
         │ HTTP API
         ▼
┌─────────────────┐
│  SMSONLINEGH    │
│  Zenoph SDK     │
└─────────────────┘
```

## Troubleshooting

### SMS Service not responding
- Check Railway project logs
- Verify environment variables are set
- Test health endpoint: `https://your-railway-url/health`

### Vercel can't reach SMS service
- Ensure SMS_SERVICE_URL is set in Vercel
- Verify the full URL in Vercel logs
- Check Railway service is running

### SMS not being sent
- Check SMS_API_KEY is correct
- Verify SMSONLINEGH account has credit
- Check sender ID "ReekTickets" is whitelisted

## Free Tier Limits

**Railway:**
- Free $5/month credit (plenty for testing)
- Keep service alive with activity

**Vercel:**
- 100 serverless function invocations/month free

## Cost

If you exceed free tier:
- Railway: ~$7/month for 1GB RAM
- Vercel: Usage-based ($0 if under limits)

## Alternative: Host on Render

If Railway doesn't work, deploy to Render instead:
1. Go to https://render.com
2. Create new Web Service
3. Point to the `sms-service-railway` folder
4. Render will auto-detect Python and install requirements
5. Add same environment variables

Update SMS_SERVICE_URL in Vercel to your Render URL.

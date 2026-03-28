# 🚀 Complete Deployment Guide - Frontend & Backend

## Part 1: Deploy Backend to Railway.app ✅

### **Step 1: Create Railway Account**
1. Go to https://railway.app
2. Click "Start Project"
3. Sign up with GitHub (recommended)

### **Step 2: Deploy Backend using Railway CLI** (Easiest)

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Navigate to server folder
cd /home/dosei1213/reektickets/server

# Create new project
railway init

# Deploy
railway up --detach
```

**Alternative: Deploy via GitHub**
1. Push your code to GitHub
2. In Railway dashboard, click "GitHub Repo"
3. Select your repository
4. Railway auto-detects and deploys Node.js

### **Step 3: Configure Environment Variables in Railway**

In Railway Dashboard:
1. Go to your project
2. Click "Variables" tab  
3. Add these environment variables:

```
PORT=5000
NODE_ENV=production
MONGO_URI=mongodb://localhost:27017/reektickets
JWT_SECRET=supersecretjwtkey_change_this_in_production
PAYSTACK_SECRET_KEY=sk_test_xxxxxxxx
PAYSTACK_PUBLIC_KEY=pk_test_xxxxxxxx
CLIENT_URL=https://reektickets.vercel.app
```

**For MongoDB:** Get the URL from MongoDB Atlas if using cloud database.

### **Step 4: Get Your Backend URL**
After deployment completes, Railway gives you a URL like:
```
https://reektickets-production-xxxx.railway.app
```

Copy this URL - you'll need it next.

---

## Part 2: Update & Deploy Frontend to Vercel ✅

### **Step 1: Update API URLs (Easy Method)**

Use the provided setup script:

```bash
# Navigate to project root
cd /home/dosei1213/reektickets

# Make script executable
chmod +x setup-production.sh

# Run it with your Railway URL
./setup-production.sh https://your-railway-url-here
```

**Manual Method:**
Find and replace in all files:
- Replace: `http://localhost:5000/api`
- With: `https://your-railway-url/api`

Files to update:
- `src/dashboards/*.jsx`
- `src/pages/*.js`
- `src/components/**/*.js`
- `.env.production`

### **Step 2: Build & Deploy to Vercel**

```bash
# Rebuild
npm run build

# Deploy to production
npx vercel --prod

# Or redeploy existing project
npx vercel --prod --confirm
```

### **Step 3: Verify Deployment**

1. Visit https://reektickets.vercel.app
2. Try signing up or logging in
3. Check browser console for API errors
4. Verify backend health: `https://your-railway-url/api/health`

---

## 📊 Database Setup (MongoDB)

### **Option A: MongoDB Atlas (Cloud - Recommended)**
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create M0 free cluster
4. Create database user
5. Get connection string: `mongodb+srv://username:password@cluster.mongodb.net/reektickets`
6. Use this as `MONGO_URI` in Railway

### **Option B: Local MongoDB**
If you want to keep MongoDB local (for dev only):
- Ensure MongoDB is running
- Use: `mongodb://localhost:27017/reektickets`

---

## 🆘 Troubleshooting

### **API Returns 401 (Unauthorized)**
- Check `JWT_SECRET` is set in Railway
- JWT token might be invalid or expired
- Try logging out and logging back in

### **Can't Connect to Backend**
- Verify Railway URL is correct
- Check `CLIENT_URL` is set to Vercel frontend URL
- Check CORS is enabled in backend
- Backend might not be running - check Railway logs

### **Blank/White Page on Frontend**
- Check browser console (F12) for errors
- Check Vercel deployment logs
- Make sure API URLs were updated

### **Database Connection Failed**
- Verify `MONGO_URI` in Railway variables
- For Atlas: whitelist all IPs (0.0.0.0/0)
- Check MongoDB credentials are correct

### **Still Having Issues?**

Check logs:
```bash
# Railway logs
railway logs

# Vercel logs
vercel logs

# Browser console
F12 → Console tab
```

---

## ✅ Final Checklist

- [ ] Backend deployed to Railway
- [ ] All environment variables set in Railway
- [ ] Frontend API URLs updated to Railway URL
- [ ] Frontend built and deployed to Vercel
- [ ] Can access https://reektickets.vercel.app
- [ ] Can log in successfully
- [ ] Tickets page loads and shows data
- [ ] Admin dashboard functional

---

## 🎯 Your Live URLs

**Frontend:** https://reektickets.vercel.app
**Backend:** https://your-railway-url-here
**Health Check:** https://your-railway-url-here/api/health

Enjoy your deployed app! 🎉

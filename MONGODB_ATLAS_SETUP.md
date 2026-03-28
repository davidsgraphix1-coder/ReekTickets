# MongoDB Atlas Setup Guide

## 🚀 **Setup MongoDB Atlas (Cloud Database)**

MongoDB Atlas is a cloud-hosted MongoDB service that's perfect for production. Free tier includes 5GB storage.

---

## **Step 1: Create MongoDB Atlas Account**

1. Go to https://www.mongodb.com/cloud/atlas
2. Click **"Try Free"**
3. Sign up with email or Google
4. Verify your email

---

## **Step 2: Create Cluster**

1. In Dashboard, click **"Create a Deployment"**
2. Select **"M0" (Free Tier)**
3. Choose your region:
   - **US (N. Virginia)** - best for US users
   - **Europe (Ireland)** - best for EU users
   - **Asia Pacific (Singapore)** - best for Asia users
4. Click **"Create"**
5. Wait 2-3 minutes for cluster to initialize

---

## **Step 3: Create Database User**

1. Go to **"Database Access"** (left sidebar)
2. Click **"Add New Database User"**
3. Set credentials:
   - **Username:** reektickets_user
   - **Password:** Use auto-generated (save it!)
   - **Role:** Atlas admin (for simplicity)
4. Click **"Add User"**

---

## **Step 4: Add IP Whitelist**

1. Go to **"Network Access"** (left sidebar)
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (for development)
   - Or enter your IP: **0.0.0.0/0**
4. Click **"Confirm"**

---

## **Step 5: Get Connection String**

1. Go to **"Databases"** (main page)
2. Click **"Connect"** on your cluster
3. Select **"Drivers"** (Node.js)
4. Copy the connection string
5. It looks like:
   ```
   mongodb+srv://reektickets_user:PASSWORD@cluster0.mongodb.net/reektickets?retryWrites=true&w=majority
   ```

### **Replace placeholder with your password:**
```
mongodb+srv://reektickets_user:YOUR_PASSWORD_HERE@cluster0.mongodb.net/reektickets?retryWrites=true&w=majority
```

---

## **Step 6: Configure Railway Backend**

1. Go to Railway: https://railway.com/project/e1cb78f3-ba80-4901-87f9-b22f805eb556
2. Click your **reektickets service**
3. Go to **"Variables"** tab
4. Find **MONGO_URI** variable
5. Replace the value with your MongoDB Atlas connection string
6. Click **"Deploy"**

---

## **Example Connection String Format:**

```
mongodb+srv://reektickets_user:MyPassword123@cluster0.mongodb.net/reektickets?retryWrites=true&w=majority
```

---

## **Step 7: Test Connection**

After deployment, check if backend is working:

```bash
curl https://reektickets-production.up.railway.app/api/health
```

Should return:
```json
{"status":"ok"}
```

---

## **Verify Data is Saved**

1. Visit https://reektickets.vercel.app
2. Sign up a new user
3. Check MongoDB Atlas:
   - Go to **"Collections"**
   - Select **reektickets** database
   - Browse collections to see your data

---

## **Security Tips**

- ✅ String passwords saved securely in Railway Variables
- ✅ IP whitelist set to allow your traffic
- ✅ Database backups automatic (Atlas free tier)
- ✅ Never share connection string in code

---

## **Atlas Features You Get**

- 5GB free storage
- Auto backups
- 99.99% uptime SLA
- Easy scaling
- Real-time monitoring
- Free for first 3 months extra

---

## **Troubleshooting**

### Connection fails:
- Check password is correct
- Check IP whitelist includes your IP
- Check database name is "reektickets"

### Still local?
- Verify MONGO_URI was updated in Railway
- Wait for Railway to redeploy (5-10 min)
- Check logs: `railway logs`

---

You're all set! Your app now uses cloud MongoDB Atlas 🎉

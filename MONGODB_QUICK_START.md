# ⚡ Quick MongoDB Atlas Setup (5 Minutes)

## **Your Current Setup:**
- Frontend: https://reektickets.vercel.app ✅
- Backend: https://reektickets-production.up.railway.app ✅
- Database: Local MongoDB ⏳ → Need to upgrade to Atlas

---

## **🎯 Quick Steps:**

### **1. Create Atlas Account (2 min)**
- Go to https://www.mongodb.com/cloud/atlas
- Click "Try Free"
- Sign up with email
- Verify email

### **2. Create Cluster (3 min)**
- Click "Create Deployment"
- Select **M0 (Free Tier)**
- Choose region (pick closest to you)
- Wait for initialization

### **3. Create Database User (1 min)**
- Left sidebar → "Database Access"
- "Add New Database User"
- Username: `reektickets_user`
- Password: **auto-generate and save it**
- Role: "Atlas admin"
- Click "Add User"

### **4. Allow All IPs (1 min)**
- Left sidebar → "Network Access"
- "Add IP Address"
- Click "Allow Access from Anywhere"
- Or enter: 0.0.0.0/0
- Confirm

### **5. Get Connection String (1 min)**
- Click "Connect" on your cluster
- Select "Drivers" (Node.js)
- Copy the connection string
- Example: `mongodb+srv://reektickets_user:PASSWORD@cluster0.mongodb.net/reektickets?retryWrites=true&w=majority`
- **Replace PASSWORD with your user password**

---

## **🚀 Update Railway Backend:**

1. Go to: https://railway.com/project/e1cb78f3-ba80-4901-87f9-b22f805eb556
2. Click **reektickets** service
3. Click **Variables** tab
4. Find **MONGO_URI**
5. Replace value with your Atlas connection string
6. Click **Deploy** (top right)

---

## **✅ Test It Works:**

```bash
# Check health
curl https://reektickets-production.up.railway.app/api/health

# Should return: {"status":"ok"}
```

Then:
1. Visit https://reektickets.vercel.app
2. Sign up a test user
3. Check MongoDB Atlas Collections to see your data saved! 🎉

---

## **Your Credentials:**
- **Atlas Username:** reektickets_user
- **Password:** [Your auto-generated password - save it!]
- **Database:** reektickets
- **Cluster:** cluster0 (default)

---

**That's it! Your app now uses cloud MongoDB** 🎉

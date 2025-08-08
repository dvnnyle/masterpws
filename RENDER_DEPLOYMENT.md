# 🚀 Render Deployment Guide - PlayWorld Platform

## Architecture Overview
```
┌─────────────────────────────────────────────────────────────┐
│                    Render Deployment                        │
├─────────────────────────────────────────────────────────────┤
│  Backend (Web Service)                                      │
│  └── https://masterpws.onrender.com                        │
│                                                             │
│  Admin Console (Static Site)                               │
│  └── https://masterpwsadmin.onrender.com                   │
│                                                             │
│  Customer App (Static Site)                                │
│  └── https://masterpwspublic.onrender.com                  │
└─────────────────────────────────────────────────────────────┘
```

## 📋 Prerequisites
- Render account (free tier available)
- GitHub repository: `https://github.com/dvnnyle/masterpws.git`
- Firebase project credentials
- Vipps payment API credentials

## 🎯 Current Deployment Status

### ✅ **Live Services**

| Service | Name | URL | Status |
|---------|------|-----|--------|
| 🖥️ **Backend API** | `masterpws` | [masterpws.onrender.com](https://masterpws.onrender.com) | ✅ Active |
| 📱 **Customer App** | `masterpwspublic` | [masterpwspublic.onrender.com](https://masterpwspublic.onrender.com) | ✅ Active |
| 🔧 **Admin Console** | `masterpwsadmin` | [masterpwsadmin.onrender.com](https://masterpwsadmin.onrender.com) | ✅ Active |

## 🔧 Current Configuration

### **Backend Environment Variables**
```env
NODE_ENV=production
PORT=10000

# Vipps Configuration
VIPPS_CLIENT_ID=your_vipps_client_id
VIPPS_CLIENT_SECRET=your_vipps_client_secret
VIPPS_SUBSCRIPTION_KEY=your_vipps_subscription_key
VIPPS_MERCHANT_SERIAL_NUMBER=your_merchant_serial_number

# Firebase Configuration
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
REACT_APP_FIREBASE_APP_ID=your_firebase_app_id
```

### **Customer App Environment Variables**
```env
REACT_APP_BACKEND_URL=https://masterpws.onrender.com
REACT_APP_BASE_URL=https://masterpwspublic.onrender.com
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
REACT_APP_FIREBASE_APP_ID=your_firebase_app_id
```

### **Admin Console Environment Variables**
```env
REACT_APP_BACKEND_URL=https://masterpws.onrender.com
REACT_APP_BASE_URL=https://masterpwsadmin.onrender.com
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
REACT_APP_FIREBASE_APP_ID=your_firebase_app_id
```

## 🎯 Deployment Steps

### Step 1: Deploy Backend API (First!)

1. **Create Web Service on Render:**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New" → "Web Service"
   - Connect your GitHub repository: `dvnnyle/masterpws`
   - Settings:
     ```
     Name: masterpws
     Region: Frankfurt (EU Central)
     Branch: master
     Root Directory: backend
     Runtime: Node
     Build Command: npm install
     Start Command: npm start
     ```

2. **Environment Variables:**
   Add these in Render dashboard → Environment:
   ```
   NODE_ENV=production
   PORT=10000
   
   # Vipps Configuration
   VIPPS_CLIENT_ID=your_vipps_client_id
   VIPPS_CLIENT_SECRET=your_vipps_client_secret
   VIPPS_SUBSCRIPTION_KEY=your_vipps_subscription_key
   VIPPS_MERCHANT_SERIAL_NUMBER=your_merchant_serial_number
   
   # Firebase Configuration
   REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
   REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   REACT_APP_FIREBASE_PROJECT_ID=your_project_id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   REACT_APP_FIREBASE_APP_ID=your_firebase_app_id
   ```

3. **Deploy and note the URL**: `https://masterpws.onrender.com`

### Step 2: Deploy Admin Console (pws-con)

1. **Create Static Site on Render:**
   - Click "New" → "Static Site"
   - Connect your GitHub repository: `dvnnyle/masterpws`
   - Settings:
     ```
     Name: masterpwsadmin
     Branch: master
     Root Directory: pws-con
     Build Command: npm install && npm run build
     Publish Directory: build
     ```

2. **Environment Variables:**
   ```
   REACT_APP_BACKEND_URL=https://masterpws.onrender.com
   REACT_APP_BASE_URL=https://masterpwsadmin.onrender.com
   REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
   REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   REACT_APP_FIREBASE_PROJECT_ID=your_project_id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   REACT_APP_FIREBASE_APP_ID=your_firebase_app_id
   ```

3. **Deploy URL**: `https://masterpwsadmin.onrender.com`

### Step 3: Deploy Customer App (my-app)

1. **Create Static Site on Render:**
   - Click "New" → "Static Site"
   - Connect your GitHub repository: `dvnnyle/masterpws`
   - Settings:
     ```
     Name: masterpwspublic
     Branch: master
     Root Directory: my-app
     Build Command: npm install && npm run build
     Publish Directory: build
     ```

2. **Environment Variables:**
   ```
   REACT_APP_BACKEND_URL=https://masterpws.onrender.com
   REACT_APP_BASE_URL=https://masterpwspublic.onrender.com
   REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
   REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   REACT_APP_FIREBASE_PROJECT_ID=your_project_id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   REACT_APP_FIREBASE_APP_ID=your_firebase_app_id
   ```

3. **Deploy URL**: `https://masterpwspublic.onrender.com`

## 🔧 Post-Deployment Configuration

### Update CORS Configuration

After deployment, update the backend CORS settings:

1. In your local project, edit `backend/server.js`:
   ```javascript
   const allowedOrigins = [
     'http://localhost:3000',
     'http://localhost:3001', 
     'https://masterpwspublic.onrender.com',    // Customer app
     'https://masterpwsadmin.onrender.com',     // Admin console
     'https://masterpws.onrender.com'           // Backend (for self-references)
   ];
   ```

2. Commit and push the changes - Render will auto-redeploy.

### Firebase Security Rules
Update Firestore security rules to allow your production domains:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Allow public read access to news
    match /news/{document} {
      allow read: if true;
      allow write: if request.auth != null; // Only authenticated users can write
    }
    
    // Allow authenticated users to read coupons
    match /myCouponsFb/{document} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

### Environment Variables Management
- Never commit real credentials to GitHub
- Use Render's environment variables for all secrets
- Keep `.env.example` files for reference

## 🎯 Final URLs Structure

After deployment, you have:
```
🌐 Customer App: https://masterpwspublic.onrender.com
🔧 Admin Console: https://masterpwsadmin.onrender.com  
🖥️ Backend API: https://masterpws.onrender.com
```

## 🚨 Important Notes

1. **Deploy Backend First** - Frontend apps need the backend URL
2. **Free Tier Limitations** - Render free tier spins down after 15 min of inactivity
3. **Environment Variables** - Must be set in Render dashboard, not in code
4. **HTTPS Only** - All production URLs will be HTTPS
5. **Auto-Deploy** - Render automatically redeploys on GitHub pushes
6. **Build Cache** - Render caches dependencies for faster builds

## 🔍 Troubleshooting

### Common Issues

**Build Failures:**
- Check build logs in Render dashboard
- Verify all dependencies are in package.json
- Check for missing environment variables

**Environment Issues:**
- Verify all environment variables are set in Render dashboard
- Check spelling of variable names
- Ensure Firebase configuration is complete

**CORS Errors:**
- Ensure backend allowedOrigins includes your frontend URLs
- Check that requests are using HTTPS in production

**Firebase Errors:**
- Check Firebase configuration and security rules
- Verify Firebase project is active
- Check network requests in browser dev tools

**Payment Issues (Vipps):**
- Verify Vipps credentials are correct
- Check Vipps merchant configuration
- Monitor backend logs for payment errors

## 📊 Monitoring & Maintenance

### Log Monitoring
- Backend logs: Render dashboard → Services → masterpws → Logs
- Build logs: Render dashboard → Static Sites → Logs
- Firebase logs: Firebase Console → Functions → Logs

### Performance
- Monitor response times in Render dashboard
- Check Firebase usage in Firebase Console
- Use browser dev tools for frontend performance

## 📞 Support

If you encounter issues, check:
- 📊 Render build logs and runtime logs
- 🔍 Browser developer console for client-side errors
- 🖥️ Backend server logs in Render dashboard
- 🔥 Firebase console for database/auth issues
- 💳 Vipps merchant portal for payment issues

For additional help:
- 📖 [Render Documentation](https://render.com/docs)
- 🔥 [Firebase Documentation](https://firebase.google.com/docs)
- 💳 [Vipps Developer Portal](https://developer.vippsmobilepay.com/)

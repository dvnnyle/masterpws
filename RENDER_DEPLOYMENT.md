# 🚀 Render Deployment Guide

## Architecture Overview
```
┌─────────────────────────────────────────────────────────────┐
│                    Render Deployment                        │
├─────────────────────────────────────────────────────────────┤
│  Backend (Web Service)                                      │
│  └── https://your-backend.onrender.com                     │
│                                                             │
│  Admin Console (Static Site)                               │
│  └── https://admin.yourdomain.com (pws-con)               │
│                                                             │
│  Customer App (Static Site)                                │
│  └── https://yourdomain.com (my-app)                      │
└─────────────────────────────────────────────────────────────┘
```

## 📋 Prerequisites
- Render account (free tier available)
- GitHub repository: `https://github.com/dvnnyle/masterpws.git`
- Firebase project credentials
- Vipps payment API credentials

## 🎯 Deployment Steps

### Step 1: Deploy Backend API (First!)

1. **Create Web Service on Render:**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New" → "Web Service"
   - Connect your GitHub repository: `dvnnyle/masterpws`
   - Settings:
     ```
     Name: playworld-backend
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
   VIPPS_CLIENT_ID=your_actual_vipps_client_id
   VIPPS_CLIENT_SECRET=your_actual_vipps_client_secret
   VIPPS_SUBSCRIPTION_KEY=your_actual_vipps_subscription_key
   VIPPS_MERCHANT_SERIAL_NUMBER=your_actual_merchant_serial_number
   
   # Firebase Admin SDK
   FIREBASE_TYPE=service_account
   FIREBASE_PROJECT_ID=your_firebase_project_id
   FIREBASE_PRIVATE_KEY_ID=your_private_key_id
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_ACTUAL_PRIVATE_KEY\n-----END PRIVATE KEY-----\n"
   FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
   FIREBASE_CLIENT_ID=your_client_id
   FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
   FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
   FIREBASE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
   FIREBASE_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40your-project.iam.gserviceaccount.com
   ```

3. **Deploy and note the URL** (e.g., `https://playworld-backend.onrender.com`)

### Step 2: Deploy Admin Console (pws-con)

1. **Create Static Site on Render:**
   - Click "New" → "Static Site"
   - Connect your GitHub repository: `dvnnyle/masterpws`
   - Settings:
     ```
     Name: playworld-admin
     Branch: master
     Root Directory: pws-con
     Build Command: npm install && npm run build
     Publish Directory: build
     ```

2. **Environment Variables:**
   ```
   REACT_APP_BACKEND_URL=https://playworld-backend.onrender.com
   REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
   REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   REACT_APP_FIREBASE_PROJECT_ID=your_project_id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   REACT_APP_FIREBASE_APP_ID=your_app_id
   ```

3. **Custom Domain (Optional):**
   - Add custom domain: `admin.yourdomain.com`

### Step 3: Deploy Customer App (my-app)

1. **Create Static Site on Render:**
   - Click "New" → "Static Site"
   - Connect your GitHub repository: `dvnnyle/masterpws`
   - Settings:
     ```
     Name: playworld-customer
     Branch: master
     Root Directory: my-app
     Build Command: npm install && npm run build
     Publish Directory: build
     ```

2. **Environment Variables:**
   ```
   REACT_APP_BACKEND_URL=https://playworld-backend.onrender.com
   REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
   REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   REACT_APP_FIREBASE_PROJECT_ID=your_project_id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   REACT_APP_FIREBASE_APP_ID=your_app_id
   ```

3. **Custom Domain (Optional):**
   - Add custom domain: `yourdomain.com`

### Step 4: Update CORS Configuration

After deployment, update the backend CORS settings:

1. In your local project, edit `backend/server.js`:
   ```javascript
   const allowedOrigins = [
     'http://localhost:3000',
     'http://localhost:3001', 
     'https://your-customer-app.onrender.com',  // Update with actual URL
     'https://your-admin-app.onrender.com',     // Update with actual URL
     'https://yourdomain.com',                  // Your custom domain
     'https://admin.yourdomain.com'             // Admin custom domain
   ];
   ```

2. Commit and push the changes - Render will auto-redeploy.

## 🔧 Post-Deployment Configuration

### Firebase Security Rules
Update Firestore security rules to allow your production domains:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Your existing rules
  }
}
```

### Environment Variables Management
- Never commit real credentials to GitHub
- Use Render's environment variables for all secrets
- Keep `.env.example` files for reference

## 🎯 Final URLs Structure

After deployment, you'll have:
```
🌐 Customer App: https://yourdomain.com (or playworld-customer.onrender.com)
🔧 Admin Console: https://admin.yourdomain.com (or playworld-admin.onrender.com)
🖥️ Backend API: https://playworld-backend.onrender.com
```

## 🚨 Important Notes

1. **Deploy Backend First** - Frontend apps need the backend URL
2. **Free Tier Limitations** - Render free tier spins down after 15 min of inactivity
3. **Environment Variables** - Must be set in Render dashboard, not in code
4. **HTTPS Only** - All production URLs will be HTTPS
5. **Auto-Deploy** - Render automatically redeploys on GitHub pushes

## 🔍 Troubleshooting

- **Build Failures**: Check build logs in Render dashboard
- **Environment Issues**: Verify all environment variables are set
- **CORS Errors**: Ensure backend allowedOrigins includes your frontend URLs
- **Firebase Errors**: Check Firebase configuration and security rules

## 📞 Support
If you encounter issues, check:
- Render build logs
- Browser developer console
- Backend server logs in Render dashboard

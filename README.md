# 🎮 PlayWorld - Complete Gaming Experience Platform

<div align="center">

![PlayWorld Logo](https://img.shields.io/badge/PlayWorld-Gaming%20Platform-orange?style=for-the-badge&logo=gamepad)

**A full-stack React application for gaming venue management with integrated payment systems**

[![React](https://img.shields.io/badge/React-18.2.0-61DAFB?style=flat-square&logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=node.js)](https://nodejs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-Database-FFCA28?style=flat-square&logo=firebase)](https://firebase.google.com/)
[![Render](https://img.shields.io/badge/Deployed-Render-46E3B7?style=flat-square&logo=render)](https://render.com/)

</div>

---

## 🏗️ **Architecture Overview**

```
┌─────────────────────────────────────────────────────────────┐
│                    PlayWorld Platform                       │
├─────────────────────────────────────────────────────────────┤
│  🖥️ Backend API                                             │
│  └── https://masterpws.onrender.com                        │
│                                                             │
│  🔧 Admin Console                                           │
│  └── https://masterpwsadmin.onrender.com                   │
│                                                             │
│  📱 Customer App                                            │
│  └── https://masterpwspublic.onrender.com                  │
└─────────────────────────────────────────────────────────────┘
```

## 📂 **Project Structure**

```
referie/
├── 📁 backend/              # Express.js API Server
│   ├── server.js           # Main server file
│   ├── package.json        # Backend dependencies
│   └── ...
├── 📁 my-app/              # Customer React App
│   ├── public/             # Static assets
│   ├── src/                # React components
│   ├── package.json        # Customer app dependencies
│   └── ...
├── 📁 pws-con/             # Admin Console React App
│   ├── public/             # Admin static assets
│   ├── src/                # Admin components
│   ├── package.json        # Admin app dependencies
│   └── ...
├── 📄 README.md            # This file
└── 📄 RENDER_DEPLOYMENT.md # Deployment guide
```

## ✨ **Features**

### 🎯 **Customer App (`my-app`)**
- 🏠 **Home & Navigation** - Intuitive user interface
- 🎮 **Park Booking** - Reserve gaming stations
- 🛒 **E-commerce** - Purchase gaming products
- 💳 **Vipps Integration** - Secure Norwegian payment system
- 🎫 **Ticket System** - Digital tickets and passes
- 🎟️ **Coupon Management** - Redeem and use coupons
- 👤 **User Profiles** - Account management
- 📱 **Mobile Responsive** - Works on all devices

### 🔧 **Admin Console (`pws-con`)**
- 📊 **Dashboard** - Overview of all operations
- 👥 **User Management** - View and manage customers
- 🎟️ **Coupon Creation** - Create and track coupons
- 📰 **News Management** - Publish news and updates
- 📋 **Order Tracking** - Monitor all transactions
- 🎛️ **Admin Navigation** - Consistent admin interface

### ⚙️ **Backend (`backend`)**
- 🔐 **Firebase Authentication** - Secure user management
- 💾 **Firestore Database** - Real-time data storage
- 💰 **Vipps Payment API** - Norwegian payment processing
- 🌐 **CORS Configuration** - Secure cross-origin requests
- 📊 **Order Management** - Complete transaction handling

## 🚀 **Live Deployment**

| Service | URL | Purpose |
|---------|-----|---------|
| 📱 **Customer App** | [masterpwspublic.onrender.com](https://masterpwspublic.onrender.com) | Public-facing customer interface |
| 🔧 **Admin Console** | [masterpwsadmin.onrender.com](https://masterpwsadmin.onrender.com) | Administrative management |
| 🖥️ **Backend API** | [masterpws.onrender.com](https://masterpws.onrender.com) | Core API services |

## 🛠️ **Tech Stack**

### **Frontend**
- ⚛️ **React 18.2.0** - Component-based UI
- 🎨 **Framer Motion** - Smooth animations
- 🧭 **React Router 6** - Client-side routing
- 🔥 **Firebase SDK** - Real-time database
- 📱 **Responsive Design** - Mobile-first approach

### **Backend**
- 🟢 **Node.js** - JavaScript runtime
- 🚀 **Express.js** - Web framework
- 🔥 **Firebase Admin** - Server-side Firebase
- 💳 **Vipps API** - Payment processing
- 🌐 **CORS** - Cross-origin resource sharing

### **Database & Storage**
- 🔥 **Firestore** - NoSQL document database
- 🔐 **Firebase Auth** - User authentication
- ☁️ **Firebase Storage** - File storage

### **Deployment**
- 🚀 **Render** - Cloud platform
- 🔄 **Auto-deploy** - GitHub integration
- 🌍 **CDN** - Global content delivery

## 🔧 **Environment Configuration**

### **Customer App Environment**
```env
REACT_APP_BACKEND_URL=https://masterpws.onrender.com
REACT_APP_BASE_URL=https://masterpwspublic.onrender.com
REACT_APP_FIREBASE_API_KEY=***
REACT_APP_FIREBASE_AUTH_DOMAIN=***
REACT_APP_FIREBASE_PROJECT_ID=***
```

### **Admin Console Environment**
```env
REACT_APP_BACKEND_URL=https://masterpws.onrender.com
REACT_APP_BASE_URL=https://masterpwsadmin.onrender.com
REACT_APP_FIREBASE_API_KEY=***
REACT_APP_FIREBASE_AUTH_DOMAIN=***
REACT_APP_FIREBASE_PROJECT_ID=***
```

## 📋 **Development Setup**

### **Prerequisites**
- Node.js 16+ 
- npm or yarn
- Firebase project
- Vipps merchant account

### **Local Development**

1. **Clone the repository**
   ```bash
   git clone https://github.com/dvnnyle/masterpws.git
   cd referie
   ```

2. **Install dependencies**
   ```bash
   # Backend
   cd backend && npm install
   
   # Customer App
   cd ../my-app && npm install
   
   # Admin Console
   cd ../pws-con && npm install
   ```

3. **Configure environment variables**
   ```bash
   # Copy example files and update with your credentials
   cp .env.example .env
   ```

4. **Start development servers**
   ```bash
   # Terminal 1 - Backend
   cd backend && npm start
   
   # Terminal 2 - Customer App
   cd my-app && npm start
   
   # Terminal 3 - Admin Console
   cd pws-con && npm start
   ```

## 🎯 **Key Features Implemented**

- ✅ **React Router** - Client-side routing with 404 handling
- ✅ **Vipps Payments** - Norwegian payment integration
- ✅ **Firebase Integration** - Real-time data and authentication
- ✅ **Admin Dashboard** - Complete management interface
- ✅ **Mobile Responsive** - Works on all devices
- ✅ **CORS Security** - Secure API communication
- ✅ **Static Site Deployment** - Fast, reliable hosting

## 🚨 **Important Notes**

- 🔒 **Security**: All sensitive data handled via environment variables
- 🚀 **Performance**: Static site generation for optimal speed
- 📱 **Mobile-First**: Responsive design for all screen sizes
- 🔄 **Auto-Deploy**: Automatic deployments on code changes
- 🛡️ **Error Handling**: Comprehensive error boundaries

## 📞 **Support & Documentation**

- 📖 **Deployment Guide**: See [RENDER_DEPLOYMENT.md](RENDER_DEPLOYMENT.md)
- 🐛 **Issues**: Check browser console and server logs
- 🔧 **Configuration**: Verify environment variables in Render dashboard

---

<div align="center">

**Built with ❤️ for the gaming community**

[![GitHub](https://img.shields.io/badge/GitHub-Repository-181717?style=flat-square&logo=github)](https://github.com/dvnnyle/masterpws)
[![Render](https://img.shields.io/badge/Deployed%20on-Render-46E3B7?style=flat-square&logo=render)](https://render.com/)

*Last updated: December 2024*

</div>
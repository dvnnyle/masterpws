# 🎪 PlayWorld - Indoor Playground Ticketing Platform � PlayWorld - Indoor Play- 🏠 **Home & Navigation** - Intuitive user interface
- 🎪 **Activity Booking** - Reserve playground activities (trampolines, mini golf, climbing)
- 🛒 *- 📖 **Deployment Guide**: See [RENDER_DEPLOYMENT.md](RENDER_DEPLOYMENT.md)
- 🎪 **PlayWorld Website**: [playworld.no](https://playworld.no/)
- 📞 **Contact**: 944 67 290 | post@playworld.nocket Shop** - Purchase tickets and activity passesund Ticketing Platform

<div align="center">

![PlayWorld Logo](https://img.shields.io/badge/PlayWorld-Playground%20Platform-orange?style=for-the-badge&logo=playground)

**A full-stack React application for indoor playground ticket management with integrated Vipps payments**

[![React](https://img.shields.io/badge/React-18.2.0-61DAFB?style=flat-square&logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=node.js)](https://nodejs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-Database-FFCA28?style=flat-square&logo=firebase)](https://firebase.google.com/)
[![Render](https://img.shields.io/badge/Deployed-Render-46E3B7?style=flat-square&logo=render)](https://render.com/)

</div>

---

##  **About PlayWorld Sørlandet**

**PlayWorld Sørlandet** is Kristiansand's most exciting indoor playground, located at Sørlandssenteret. We offer a variety of activities for all ages:

### 🏃‍♂️ **Our Activities**
- 🤸 **Trampolines** - Various trampoline activities and courses
- ⛳ **Mini Golf** - Professional indoor mini golf course  
- 🧗 **Climbing & Ninja Course** - Build confidence and strength
- 🎈 **Birthday Parties** - Complete party packages
- 👶 **Fryd Area** - Safe play area for the youngest children
- 🎯 **Adrenalize** - High-energy activities for thrill seekers

### 💰 **Pricing Examples**
- **Mini Golf:** 99 kr (children 4-6) | 129 kr (adults 13+) | 299 kr (group of 4)
- **Playground Time:** 129 kr (30 min) | 169 kr (1 hour) | 249 kr (2 hours) | 299 kr (unlimited)

📍 **Location:** Sørlandssenteret, Barstølveien 35, Kristiansand  
📞 **Phone:** 944 67 290  
📧 **Email:** post@playworld.no | booking@playworld.no  

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
- � **Activity Booking** - Reserve playground activities (trampolines, mini golf, climbing)
- 🛒 **Ticket Shop** - Purchase tickets and activity passes
- 💳 **Vipps Integration** - Secure Norwegian payment system
- 🎫 **Digital Tickets** - QR code tickets and monthly passes
- 🎟️ **Coupon System** - Redeem discount coupons
- 👤 **User Profiles** - Account and booking management
- 📱 **Mobile Responsive** - Perfect for on-the-go bookings

### 🔧 **Admin Console (`pws-con`)**
- 📊 **Dashboard** - Overview of playground operations
- 👥 **Customer Management** - View and manage customers
- 🎟️ **Coupon Creation** - Create and track discount coupons
- 📰 **News Management** - Publish announcements and updates
- 📋 **Booking Tracking** - Monitor all ticket sales and bookings
- 🎛️ **Admin Navigation** - Streamlined management interface

### ⚙️ **Backend (`backend`)**
- 🔐 **Firebase Authentication** - Secure customer management
- 💾 **Firestore Database** - Real-time booking and customer data
- 💰 **Vipps Payment API** - Norwegian payment processing for tickets
- 🌐 **CORS Configuration** - Secure cross-origin requests
- 📊 **Order Management** - Complete transaction handling

## 🚀 **Live Deployment**

| Service | URL | Purpose |
|---------|-----|---------|
| 📱 **Customer App** | [masterpwspublic.onrender.com](https://masterpwspublic.onrender.com) | Public-facing customer interface |
| 🔧 **Admin Console** | admin.playworld-internal.com | Administrative management |
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
REACT_APP_BASE_URL=https://admin.playworld-internal.com
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

- ✅ **Digital Ticketing** - QR code tickets and monthly passes
- ✅ **Vipps Payments** - Norwegian payment integration for playground activities
- ✅ **Firebase Integration** - Real-time booking data and customer management
- ✅ **Admin Dashboard** - Complete playground management interface
- ✅ **Mobile Responsive** - Perfect for customers booking on mobile devices
- ✅ **Activity Management** - Handle trampolines, mini golf, climbing courses
- ✅ **Customer Profiles** - Track visits, purchases, and loyalty

## 🏆 **Business Benefits**

- 📱 **Digital Transformation** - Paperless ticketing system
- 💰 **Revenue Optimization** - Real-time pricing and coupon management
- 👥 **Customer Insights** - Track popular activities and peak times
- 🎯 **Marketing Tools** - News updates and promotional coupons
- ⚡ **Operational Efficiency** - Streamlined booking and check-in process
- 📊 **Data Analytics** - Comprehensive reporting on playground usage

## 🚨 **Important Notes**

- 🔒 **Security**: All customer data and payments handled securely
- 🚀 **Performance**: Fast loading times for busy playground environments
- 📱 **Mobile-First**: Optimized for customers using smartphones
- 🔄 **Real-time**: Live booking availability and instant confirmations
- 🛡️ **Error Handling**: Reliable system for high-traffic periods

## 📞 **Support & Documentation**

- 📖 **Deployment Guide**: See [RENDER_DEPLOYMENT.md](RENDER_DEPLOYMENT.md)
- 🎪 **PlayWorld Website**: [playworld.no](https://playworld.no/)
- � **Contact**: 944 67 290 | post@playworld.no

---

<div align="center">

**Built with ❤️ for PlayWorld Sørlandet**

[![GitHub](https://img.shields.io/badge/GitHub-Repository-181717?style=flat-square&logo=github)](https://github.com/dvnnyle/masterpws)
[![Render](https://img.shields.io/badge/Deployed%20on-Render-46E3B7?style=flat-square&logo=render)](https://render.com/)

*Digital playground management made simple*

</div>
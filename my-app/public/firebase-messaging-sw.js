// Firebase service worker for background notifications
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Initialize Firebase in service worker
firebase.initializeApp({
  apiKey: "AIzaSyAtB2_FDK2Vje5RWyjqFQkPFtxmC1CDKXA",
  authDomain: "playworldapp-4d326.firebaseapp.com",
  projectId: "playworldapp-4d326",
  storageBucket: "playworldapp-4d326.appspot.com",
  messagingSenderId: "135145634033",
  appId: "1:135145634033:web:2b6ef9b24f09d9ba321150"
});

// Retrieve an instance of Firebase Messaging
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('Background message received:', payload);
  
  const notificationTitle = payload.notification.title || 'PlayWorld Update';
  const notificationOptions = {
    body: payload.notification.body || 'New announcement from PlayWorld',
    icon: '/logo192.png',
    badge: '/logo192.png',
    tag: 'playworld-notification',
    requireInteraction: true,
    actions: [
      {
        action: 'view',
        title: 'View Details'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ]
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'view') {
    // Open the app
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

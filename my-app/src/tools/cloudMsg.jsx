// File deleted
import React, { useEffect, useState } from 'react';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { app } from '../firebase';
import { toast } from 'react-hot-toast';

const CloudMessaging = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState(Notification.permission);
  const [token, setToken] = useState(null);

  useEffect(() => {
    // Check if notifications are supported
    if ('serviceWorker' in navigator && 'Notification' in window) {
      setIsSupported(true);
      initializeMessaging();
    }
  }, []);

  const initializeMessaging = async () => {
    try {
      // Register service worker
      const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      console.log('Service Worker registered:', registration);

      // Initialize messaging
      const messaging = getMessaging(app);

      // Listen for foreground messages
      onMessage(messaging, (payload) => {
        console.log('Foreground message received:', payload);
        // Detect if running as standalone (PWA installed to homescreen)
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
        if (isStandalone) {
          // Do not show notification in foreground; let service worker handle background/standalone notifications
        } else {
          // Show toast notification when app is open in browser tab
          toast.success(
            `PlayWorld: ${payload.notification.body}`,
            {
              duration: 6000,
              icon: '🎪',
              style: {
                background: '#fc8c0b',
                color: '#white',
              },
            }
          );
        }
      });

    } catch (error) {
      console.error('Error initializing messaging:', error);
    }
  };

  const requestPermission = async () => {
    try {
      const permission = await Notification.requestPermission();
      setPermission(permission);

      if (permission === 'granted') {
        const messaging = getMessaging(app);
        
        // Get FCM token
        const fcmToken = await getToken(messaging, {
          vapidKey: 'BKbx-g_oGi-2UN4NEbM9x6G63GbcxsNf7zi6lOVBjdAWraoWaAMRa6EEaCKtYu-wnDDasV5W2Te74DLgRoz76Uc'
        });

        if (fcmToken) {
          setToken(fcmToken);
          console.log('FCM Token:', fcmToken);
          
          // TODO: Save token to Firestore for sending notifications
          await saveTokenToDatabase(fcmToken);
          
          toast.success('Notifications enabled! You\'ll receive PlayWorld updates.', {
            icon: '🔔',
            duration: 4000,
          });
        }
      } else {
        toast.error('Notification permission denied');
      }
    } catch (error) {
      console.error('Error requesting permission:', error);
      toast.error('Error enabling notifications');
    }
  };

  const saveTokenToDatabase = async (fcmToken) => {
    try {
      // Save token to Firestore so admin can send notifications
      // This saves to a 'fcmTokens' collection with the token as the document ID
      const { getFirestore, doc, setDoc } = await import('firebase/firestore');
      const db = getFirestore(app);
      await setDoc(doc(db, 'fcmTokens', fcmToken), { created: Date.now() });
      console.log('Token saved to Firestore:', fcmToken);
    } catch (error) {
      console.error('Error saving token:', error);
    }
  };

  if (!isSupported) {
    return null; // Don't show anything if not supported
  }

  return (
    <div style={styles.container}>
      {permission === 'default' && (
        <div style={styles.card}>
          <div style={styles.icon}>🔔</div>
          <h3 style={styles.title}>Stay Updated!</h3>
          <p style={styles.description}>
            Get instant notifications about PlayWorld closures, special events, and important announcements.
          </p>
          <button 
            onClick={requestPermission}
            style={styles.button}
          >
            Enable Notifications
          </button>
        </div>
      )}

      {permission === 'granted' && token && (
        <div style={styles.successCard}>
          <div style={styles.icon}>✅</div>
          <p style={styles.successText}>
            Notifications enabled! You'll receive PlayWorld updates.
          </p>
        </div>
      )}

      {permission === 'denied' && (
        <div style={styles.deniedCard}>
          <div style={styles.icon}>❌</div>
          <p style={styles.deniedText}>
            Notifications blocked. You can enable them in your browser settings.
          </p>
        </div>
      )}

      {/* Always show the FCM token generator at the bottom */}
      <div style={{marginTop: 24, textAlign: 'center'}}>
        <button
          style={{...styles.button, background: '#fff', color: '#27ae60'}}
          onClick={async () => {
            try {
              const messaging = getMessaging(app);
              const fcmToken = await getToken(messaging, {
                vapidKey: 'BKbx-g_oGi-2UN4NEbM9x6G63GbcxsNf7zi6lOVBjdAWraoWaAMRa6EEaCKtYu-wnDDasV5W2Te74DLgRoz76Uc'
              });
              setToken(fcmToken);
              toast.success('FCM Token generated!');
            } catch (err) {
              toast.error('Failed to generate FCM token');
            }
          }}
        >
          Generate FCM Token
        </button>
        {token && (
          <div style={{marginTop: 16}}>
            <p style={{color: '#333'}}>FCM Token:</p>
            <textarea value={token} readOnly rows={3} cols={40} style={{width: '100%'}} />
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    margin: '20px 0',
  },
  card: {
    background: 'linear-gradient(135deg, #fc8c0b 0%, #e67e22 100%)',
    borderRadius: '15px',
    padding: '20px',
    color: 'white',
    textAlign: 'center',
    boxShadow: '0 8px 25px rgba(252, 140, 11, 0.3)',
  },
  successCard: {
    background: 'linear-gradient(135deg, #27ae60 0%, #2ecc71 100%)',
    borderRadius: '15px',
    padding: '15px',
    color: 'white',
    textAlign: 'center',
    boxShadow: '0 8px 25px rgba(39, 174, 96, 0.3)',
  },
  deniedCard: {
    background: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',
    borderRadius: '15px',
    padding: '15px',
    color: 'white',
    textAlign: 'center',
    boxShadow: '0 8px 25px rgba(231, 76, 60, 0.3)',
  },
  icon: {
    fontSize: '2rem',
    marginBottom: '10px',
  },
  title: {
    margin: '0 0 10px 0',
    fontSize: '1.3rem',
    fontWeight: '600',
  },
  description: {
    margin: '0 0 20px 0',
    fontSize: '1rem',
    opacity: 0.9,
    lineHeight: '1.4',
  },
  button: {
    background: 'white',
    color: '#fc8c0b',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '25px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  successText: {
    margin: '0',
    fontSize: '1rem',
  },
  deniedText: {
    margin: '0',
    fontSize: '0.9rem',
  },
};

export default CloudMessaging;
import React, { useState, useEffect } from 'react';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth, signOut } from 'firebase/auth';
import { app } from '../../firebase';
import './NotificationSender.css';

const NotificationSender = () => {
  // On mount, sign out any logged-in Firebase user (cleanup from CloudMsg usage)
  useEffect(() => {
    const auth = getAuth(app);
    if (auth.currentUser) {
      signOut(auth).then(() => {
        console.log('Signed out from Firebase Auth.');
      }).catch((err) => {
        console.warn('Sign out error:', err);
      });
    }
  }, []);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastSent, setLastSent] = useState(null);

  // Debug: Log state changes
  React.useEffect(() => {
    console.log('[NotificationSender] title:', title);
  }, [title]);
  React.useEffect(() => {
    console.log('[NotificationSender] message:', message);
  }, [message]);
  React.useEffect(() => {
    console.log('[NotificationSender] isLoading:', isLoading);
  }, [isLoading]);
  React.useEffect(() => {
    if (lastSent) console.log('[NotificationSender] lastSent:', lastSent);
  }, [lastSent]);

  // Quick message templates for common playground notifications
  const quickMessages = [
    {
      title: 'Stengt i dag',
      message: 'PlayWorld Sørlandet er stengt i dag på grunn av dårlig vær. Vi beklager bryderiet!'
    },
    {
      title: 'Reduserte åpningstider',
      message: 'I dag har vi reduserte åpningstider på grunn av vedlikehold. Vi åpner kl. 12:00.'
    },
    {
      title: 'Spesielle arrangementer',
      message: 'I dag arrangerer vi bursdagsfest! Noen områder kan være opptatt.'
    },
    {
      title: 'Værvarsel',
      message: 'På grunn av kraftig regn er utendørsaktivitetene stengt i dag.'
    }
  ];

  const sendNotification = async () => {
    if (!title.trim() || !message.trim()) {
      alert('Vennligst fyll ut både tittel og melding');
      console.log('[NotificationSender] Validation failed: missing title or message');
      return;
    }

    setIsLoading(true);
    console.log('[NotificationSender] Sending announcement to Firestore:', { title, message });

    try {
      const db = getFirestore(app);
      await addDoc(collection(db, 'announcements'), {
        title: title.trim(),
        message: message.trim(),
        createdAt: serverTimestamp(),
      });
      setLastSent({
        title,
        message,
        timestamp: new Date().toLocaleString('no-NO')
      });
      setTitle('');
      setMessage('');
      alert('Varsel sendt til alle kunder!');
    } catch (error) {
      console.error('[NotificationSender] Error sending announcement:', error);
      alert('Feil ved sending av varsel: ' + error.message);
    }

    setIsLoading(false);
  };

  const selectQuickMessage = (quickMsg) => {
    console.log('[NotificationSender] Quick message selected:', quickMsg);
    setTitle(quickMsg.title);
    setMessage(quickMsg.message);
  };

  return (
    <div className="notification-sender">
      <div className="sender-header">
        <h2>📢 Send Kundevarsel</h2>
        <p>Send viktige meldinger til alle PlayWorld-kunder</p>
      </div>

      {/* Quick Message Templates */}
      <div className="quick-messages">
        <h3>Hurtigmeldinger</h3>
        <div className="quick-buttons">
          {quickMessages.map((msg, index) => (
            <button
              key={index}
              className="quick-btn"
              onClick={() => selectQuickMessage(msg)}
            >
              {msg.title}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Message Form */}
      <div className="message-form">
        <div className="form-group">
          <label htmlFor="title">Tittel</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="F.eks: Stengt i dag"
            maxLength={50}
          />
          <small>{title.length}/50 tegn</small>
        </div>

        <div className="form-group">
          <label htmlFor="message">Melding</label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="F.eks: Vi er stengt i dag på grunn av dårlig vær. Vi beklager bryderiet!"
            maxLength={200}
            rows={4}
          />
          <small>{message.length}/200 tegn</small>
        </div>

        <button
          className={`send-btn ${isLoading ? 'loading' : ''}`}
          onClick={sendNotification}
          disabled={isLoading || !title.trim() || !message.trim()}
        >
          {isLoading ? 'Sender...' : '📤 Send Varsel til Alle'}
        </button>
      </div>

      {/* Last Sent Message */}
      {lastSent && (
        <div className="last-sent">
          <h4>Sist sendte varsel</h4>
          <div className="last-sent-content">
            <strong>{lastSent.title}</strong>
            <p>{lastSent.message}</p>
            <small>Sendt: {lastSent.timestamp}</small>
          </div>
        </div>
      )}

      {/* Usage Guidelines */}
      <div className="guidelines">
        <h4>⚠️ Retningslinjer for varsling</h4>
        <ul>
          <li>Bruk kun for viktige meldinger (stenging, endrede åpningstider, etc.)</li>
          <li>Hold meldinger korte og klare</li>
          <li>Unngå for mange varsler per dag</li>
          <li>Alle varsler sendes til ALLE registrerte kunder</li>
        </ul>
      </div>
    </div>
  );
};

export default NotificationSender;
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { app } from '../../firebase';
import './NotificationSender.css';

const NotificationSender = () => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastSent, setLastSent] = useState(null);

  // Debug: Log state changes
  React.useEffect(() => {
    console.log('[NotificationSender] title:', title);
  }, [title]);
  React.useEffect(() => {
    console.log('[NotificationSender] message:', message);
  }, [message]);
  React.useEffect(() => {
    console.log('[NotificationSender] isLoading:', isLoading);
  }, [isLoading]);
  React.useEffect(() => {
    if (lastSent) console.log('[NotificationSender] lastSent:', lastSent);
  }, [lastSent]);

  // Quick message templates for common playground notifications
  const quickMessages = [
    {
      title: 'Stengt i dag',
      message: 'PlayWorld Sørlandet er stengt i dag på grunn av dårlig vær. Vi beklager bryderiet!'
    },
    {
      title: 'Reduserte åpningstider',
      message: 'I dag har vi reduserte åpningstider på grunn av vedlikehold. Vi åpner kl. 12:00.'
    },
    {
      title: 'Spesielle arrangementer',
      message: 'I dag arrangerer vi bursdagsfest! Noen områder kan være opptatt.'
    },
    {
      title: 'Værvarsel',
      message: 'På grunn av kraftig regn er utendørsaktivitetene stengt i dag.'
    }
  ];

  const sendNotification = async () => {
    if (!title.trim() || !message.trim()) {
      alert('Vennligst fyll ut både tittel og melding');
      console.log('[NotificationSender] Validation failed: missing title or message');
      return;
    }

    setIsLoading(true);
    console.log('[NotificationSender] Sending announcement to Firestore:', { title, message });

    try {
      const db = getFirestore(app);
      await addDoc(collection(db, 'announcements'), {
        title: title.trim(),
        message: message.trim(),
        createdAt: serverTimestamp(),
      });
      setLastSent({
        title,
        message,
        timestamp: new Date().toLocaleString('no-NO')
      });
      setTitle('');
      setMessage('');
      alert('Varsel sendt til alle kunder!');
    } catch (error) {
      console.error('[NotificationSender] Error sending announcement:', error);
      alert('Feil ved sending av varsel: ' + error.message);
    }

    setIsLoading(false);
  };

  const selectQuickMessage = (quickMsg) => {
    console.log('[NotificationSender] Quick message selected:', quickMsg);
    setTitle(quickMsg.title);
    setMessage(quickMsg.message);
  };

  return (
    <div className="notification-sender">
      <div className="sender-header">
        <h2>📢 Send Kundevarsel</h2>
        <p>Send viktige meldinger til alle PlayWorld-kunder</p>
      </div>

      {/* Quick Message Templates */}
      <div className="quick-messages">
        <h3>Hurtigmeldinger</h3>
        <div className="quick-buttons">
          {quickMessages.map((msg, index) => (
            <button
              key={index}
              className="quick-btn"
              onClick={() => selectQuickMessage(msg)}
            >
              {msg.title}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Message Form */}
      <div className="message-form">
        <div className="form-group">
          <label htmlFor="title">Tittel</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="F.eks: Stengt i dag"
            maxLength={50}
          />
          <small>{title.length}/50 tegn</small>
        </div>

        <div className="form-group">
          <label htmlFor="message">Melding</label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="F.eks: Vi er stengt i dag på grunn av dårlig vær. Vi beklager bryderiet!"
            maxLength={200}
            rows={4}
          />
          <small>{message.length}/200 tegn</small>
        </div>

        <button
          className={`send-btn ${isLoading ? 'loading' : ''}`}
          onClick={sendNotification}
          disabled={isLoading || !title.trim() || !message.trim()}
        >
          {isLoading ? 'Sender...' : '📤 Send Varsel til Alle'}
        </button>
      </div>

      {/* Last Sent Message */}
      {lastSent && (
        <div className="last-sent">
          <h4>Sist sendte varsel</h4>
          <div className="last-sent-content">
            <strong>{lastSent.title}</strong>
            <p>{lastSent.message}</p>
            <small>Sendt: {lastSent.timestamp}</small>
          </div>
        </div>
      )}

      {/* Usage Guidelines */}
      <div className="guidelines">
        <h4>⚠️ Retningslinjer for varsling</h4>
        <ul>
          <li>Bruk kun for viktige meldinger (stenging, endrede åpningstider, etc.)</li>
          <li>Hold meldinger korte og klare</li>
          <li>Unngå for mange varsler per dag</li>
          <li>Alle varsler sendes til ALLE registrerte kunder</li>
        </ul>
      </div>
    </div>
  );
};

export default NotificationSender;

import React, { useState } from 'react';
import { sendEmailVerification, reload } from 'firebase/auth';
import './CreateUser.css';

export default function EmailVerification({ user, onVerified }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const resendVerification = async () => {
    setLoading(true);
    try {
      await sendEmailVerification(user);
      setMessage('Verifiseringslink sendt på nytt! Sjekk e-posten din.');
    } catch (error) {
      setMessage('Feil ved sending: ' + error.message);
    }
    setLoading(false);
  };

  const checkVerification = async () => {
    setLoading(true);
    try {
      await reload(user);
      if (user.emailVerified) {
        setMessage('E-post verifisert! Du kan nå fortsette.');
        onVerified();
      } else {
        setMessage('E-posten er ikke verifisert ennå. Sjekk innboksen din.');
      }
    } catch (error) {
      setMessage('Feil ved sjekking: ' + error.message);
    }
    setLoading(false);
  };

  return (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <h3>Verifiser e-posten din</h3>
      <p>Vi har sendt en verifiseringslink til: <strong>{user.email}</strong></p>
      <p>Klikk på linken i e-posten for å verifisere kontoen din.</p>
      
      <div style={{ marginTop: '20px' }}>
        <button 
          onClick={checkVerification}
          disabled={loading}
          style={{ marginRight: '10px', padding: '10px 20px' }}
        >
          {loading ? 'Sjekker...' : 'Jeg har verifisert'}
        </button>
        
        <button 
          onClick={resendVerification}
          disabled={loading}
          style={{ padding: '10px 20px' }}
        >
          {loading ? 'Sender...' : 'Send på nytt'}
        </button>
      </div>
      
      {message && <p style={{ marginTop: '15px', color: '#20b14c' }}>{message}</p>}
    </div>
  );
}
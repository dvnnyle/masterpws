import React, { useState } from 'react';
import { auth } from '../firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import './CreateUser.css'; // Reuse existing styles
import pwsLogo from "../assets/logo.png";

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage('Tilbakestillingslink sendt! Sjekk e-posten din og følg instruksjonene for å tilbakestille passordet.');
    } catch (error) {
      let errorMessage = '';
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'Ingen bruker funnet med denne e-postadressen.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Ugyldig e-postadresse.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'For mange forespørsler. Vennligst vent noen minutter før du prøver igjen.';
          break;
        default:
          errorMessage = 'Det oppstod en feil. Prøv igjen senere.';
      }
      setError(errorMessage);
    }

    setLoading(false);
  };

  return (
    <div>
      <div className="global-rectangle">
        <h1 className="global-title">GLEMT PASSORD</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <img
          src={pwsLogo}
          alt="PWS logo"
          style={{ width: "80px", display: "block", margin: "0 auto 16px auto" }}
        />
        <h2 style={{ textAlign: "center" }}>Tilbakestill passord</h2>
        
        <p style={{ textAlign: "center", color: "#666", marginBottom: "20px" }}>
          Skriv inn e-postadressen din, så sender vi deg en link for å tilbakestille passordet.
        </p>

        <input
          type="email"
          placeholder="E-postadresse"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ marginBottom: "16px" }}
        />

        <button
          type="submit"
          className="create-user-btn"
          disabled={loading}
        >
          {loading ? "Sender..." : "Send tilbakestillingslink"}
        </button>

        {message && (
          <div style={{
            padding: '12px',
            backgroundColor: '#d4edda',
            color: '#155724',
            borderRadius: '8px',
            marginTop: '16px',
            border: '1px solid #c3e6cb',
            textAlign: 'center'
          }}>
            {message}
          </div>
        )}

        {error && (
          <div style={{
            padding: '12px',
            backgroundColor: '#f8d7da',
            color: '#721c24',
            borderRadius: '8px',
            marginTop: '16px',
            border: '1px solid #f5c6cb',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <button
            type="button"
            onClick={() => navigate('/login')}
            style={{
              background: 'none',
              border: 'none',
              color: '#20b14c',
              textDecoration: 'underline',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Tilbake til innlogging
          </button>
        </div>

        {message && (
          <div style={{ textAlign: 'center', marginTop: '15px' }}>
            <button
              type="button"
              onClick={() => {
                setEmail('');
                setMessage('');
                setError('');
              }}
              style={{
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Send til annen e-post
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
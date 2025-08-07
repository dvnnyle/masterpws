import React, { useState, useEffect } from "react";
import { auth } from "../firebase";
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { useNavigate, useLocation } from "react-router-dom";
import EmailVerification from "./EmailVerification";
import pwsLogo from "../assets/logo.png";
import "./LogIn.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [unverifiedUser, setUnverifiedUser] = useState(null);
  const [registrationMessage, setRegistrationMessage] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check for registration message from CreateUser
    if (location.state?.message) {
      setRegistrationMessage(location.state.message);
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.emailVerified) {
        navigate("/profile");
      }
    });

    return () => unsubscribe();
  }, [navigate, location]);

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      if (user.emailVerified) {
        navigate("/profile");
      } else {
        setUnverifiedUser(user);
        setErrorMsg("Du må verifisere e-posten din før du kan logge inn.");
      }
    } catch (error) {
      let message = "";
      switch (error.code) {
        case "auth/invalid-email":
          message = "Ugyldig e-postadresse.";
          break;
        case "auth/user-disabled":
          message = "Brukerkontoen er deaktivert.";
          break;
        case "auth/user-not-found":
          message = "Ingen bruker funnet med denne e-posten.";
          break;
        case "auth/wrong-password":
          message = "Feil passord.";
          break;
        default:
          message = error.message;
      }
      setErrorMsg(message);
    }

    setLoading(false);
  }

  const handleVerificationComplete = () => {
    setUnverifiedUser(null);
    navigate("/profile");
  };

  // Show email verification component if user is not verified
  if (unverifiedUser) {
    return (
      <>
        <div className="global-rectangle">
          <h1 className="global-title">VERIFISER E-POST</h1>
        </div>
        <EmailVerification 
          user={unverifiedUser} 
          onVerified={handleVerificationComplete}
        />
      </>
    );
  }

  return (
    <>

    
      <div className="global-rectangle">
        <h1 className="global-title">BRUKER</h1>
      </div>


      <form className="login-form" onSubmit={handleLogin}>
        <img
          src={pwsLogo}
          alt="PWS logo"
          style={{ width: "80px", display: "block", margin: "0 auto 16px auto" }}
        />
        <h2>Login</h2>
        
        {registrationMessage && (
          <div style={{ 
            padding: '12px', 
            backgroundColor: '#d4edda', 
            color: '#155724', 
            borderRadius: '8px', 
            marginBottom: '16px',
            border: '1px solid #c3e6cb'
          }}>
            {registrationMessage}
          </div>
        )}
        
        <input
          className="login-input"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className="login-input"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button className="login-button" type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Logg inn"}
        </button>
        
        {errorMsg && <p className="error-message">{errorMsg}</p>}

        <div style={{ textAlign: 'center', marginTop: '15px' }}>
          <button
            type="button"
            onClick={() => navigate('/forgot-password')}
            style={{
              background: 'none',
              border: 'none',
              color: '#20b14c',
              textDecoration: 'underline',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Glemt passord?
          </button>
        </div>

        <div className="create-account-container">
          <p className="create-account-text">
            Ingen bruker?{" "}
            <button
              type="button"
              className="create-account-button"
              onClick={() => navigate("/CreateUser")}
            >
              Opprett bruker her
            </button>
          </p>
        </div>
      </form>
    </>
  );
}

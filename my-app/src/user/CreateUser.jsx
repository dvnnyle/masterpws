import React, { useState } from "react";
import './CreateUser.css';

import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification
} from "firebase/auth";
import {
  doc,
  setDoc,
  serverTimestamp
} from "firebase/firestore";
import pwsLogo from "../assets/logo.png"; // Make sure the path is correct

export default function CreateUser() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [userCreated, setUserCreated] = useState(null);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMsg("");

    try {
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update displayName in Auth profile
      await updateProfile(user, { displayName: name });

      // Reference to Firestore document using user's email
      const userDocRef = doc(db, "users", user.email.toLowerCase());

      // Store additional user info in Firestore under user UID as document ID
      await setDoc(userDocRef, {
        name,
        email: email.toLowerCase(),
        phone,
        createdAt: serverTimestamp(),
        emailVerified: false, // Track verification status
      });

      // Send email verification
      try {
        console.log("🔄 Attempting to send email verification to:", user.email);
        console.log("🔄 User emailVerified status:", user.emailVerified);
        console.log("🔄 User object:", user);
        
        const actionCodeSettings = {
          url: window.location.origin + '/login',
          handleCodeInApp: false,
        };
        
        await sendEmailVerification(user, actionCodeSettings);
        console.log("✅ Email verification sent successfully to:", user.email);
        setMsg("Bruker opprettet! Sjekk e-posten din for verifiseringslink.");
        setUserCreated(user);
      } catch (emailError) {
        console.error("❌ Email verification failed:", emailError);
        console.error("❌ Error code:", emailError.code);
        console.error("❌ Error message:", emailError.message);
        setMsg("Bruker opprettet, men e-postverifisering feilet: " + emailError.message);
        setUserCreated(user);
      }

      setName("");
      setEmail("");
      setPhone("");
      setPassword("");

      // Don't auto-redirect, let user manually resend if needed
    } catch (error) {
      setMsg("Error: " + error.message);
    }

    setLoading(false);
  }

  // Manual email verification send
  const resendVerificationEmail = async () => {
    if (!userCreated) {
      console.log("❌ No user to resend email to");
      return;
    }
    
    try {
      console.log("🔄 Manually resending email verification to:", userCreated.email);
      console.log("🔄 User auth state:", {
        uid: userCreated.uid,
        email: userCreated.email,
        emailVerified: userCreated.emailVerified,
        isAnonymous: userCreated.isAnonymous
      });
      
      await sendEmailVerification(userCreated);
      console.log("✅ Manual email verification sent successfully");
      setMsg("Verifiseringslink sendt på nytt! Sjekk e-posten din.");
    } catch (error) {
      console.error("❌ Manual email verification failed:", error);
      console.error("❌ Full error object:", {
        code: error.code,
        message: error.message,
        stack: error.stack
      });
      setMsg("Feil ved sending av e-post: " + error.message);
    }
  };

  return (
    <div>
      <div className="global-rectangle">
        <h1 className="global-title">NY BRUKER</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <img
          src={pwsLogo}
          alt="PWS logo"
          style={{ width: "80px", display: "block", margin: "0 auto 16px auto" }}
        />
        <h2 style={{ textAlign: "center" }}>Opprett ny bruker</h2>
        
        <input
          placeholder="Navn"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="E-post"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          placeholder="Telefon"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <input
          type="password"
          placeholder="Passord"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
<button
  type="submit"
  className="create-user-btn"
  disabled={loading}
>
  {loading ? "Lagrer..." : "Opprett bruker"}
</button>

{userCreated && (
  <div style={{ marginTop: '15px' }}>
    <button
      type="button"
      onClick={resendVerificationEmail}
      style={{ 
        backgroundColor: '#20b14c',
        color: 'white',
        border: 'none',
        padding: '10px 20px',
        borderRadius: '8px',
        cursor: 'pointer',
        marginRight: '10px'
      }}
    >
      Send verifiseringslink på nytt
    </button>
    
    <button
      type="button"
      onClick={() => navigate("/login")}
      style={{ 
        backgroundColor: '#6c757d',
        color: 'white',
        border: 'none',
        padding: '10px 20px',
        borderRadius: '8px',
        cursor: 'pointer'
      }}
    >
      Gå til innlogging
    </button>
  </div>
)}

        {msg && <p>{msg}</p>}
      </form>
    </div>
  );
}
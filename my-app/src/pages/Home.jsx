import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdConfirmationNumber, MdEventSeat, MdPerson } from 'react-icons/md';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import '../style/global.css';
import '../style/Home.css';
import pwsImage from '../assets/pws.png';
import pwsTri from '../assets/Triaden.webp';


function ProfileCardButton({ emoji, label, to, vibrate = 10 }) {
  const navigate = useNavigate();
  return (
    <div
      className="profile-card-button"
      onClick={() => {
        window.navigator.vibrate?.(vibrate);
        navigate(to);
      }}
      tabIndex={0}
      role="button"
      onKeyPress={e => {
        if (e.key === "Enter" || e.key === " ") {
          window.navigator.vibrate?.(vibrate);
          navigate(to);
        }
      }}
    >
      <div className="emoji-square">{emoji}</div>
      <h3>{label}</h3>
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          const userDocRef = doc(db, "users", currentUser.email.toLowerCase());
          const docSnap = await getDoc(userDocRef);
          if (docSnap.exists()) {
            setUserName(docSnap.data().name || 'Bruker');
          } else {
            setUserName('Bruker');
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          setUserName('Bruker');
        }
      } else {
        setUser(null);
        setUserName('');
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="home-wrapper">
           <div className="global-rectangle">
        <h1 className="global-title">VÅRE PARKER</h1>
      </div>

      {/* Welcome Card */}
      <div className={`welcome-card ${user ? 'logged-in' : ''}`}>
        {user ? (
          <>
            <h2 className="welcome-title">Velkommen, {userName.toUpperCase()}!</h2>
            <p className="welcome-desc">Klar for en ny dag med moro? 💜</p>
            <button 
              className="front-login-btn"
              onClick={() => navigate('/profile')}
            >
              GÅ TIL PROFIL
            </button>
          </>
        ) : (
          <>
            <h2 className="welcome-title">Velkommen til Playworld!</h2>
            <p className="welcome-desc">Logg inn for full opplevelse 💜</p>
            <button 
              className="front-login-btn"
              onClick={() => navigate('/login')}
            >
              Logg inn
            </button>
          </>
        )}
      </div>

      <div className="centered-divider"><span>PARKER</span></div>

 
  
      <div className="park-section">
        <div 
          className="rectangle-card" 
          onClick={() => navigate('/sor')} 
          style={{ cursor: 'pointer' }}
          role="button" 
          tabIndex={0}
          onKeyPress={(e) => { if (e.key === 'Enter') navigate('/sor') }}
        >
          <img 
            src={pwsImage} 
            alt="PWS building" 
            className="rectangle-image" 
            draggable={false}
            onContextMenu={e => e.preventDefault()}
            style={{ userSelect: 'none' }}
          />
          <h2
            className="image-title"
            draggable={false}
            tabIndex={-1}
            style={{ userSelect: "none", pointerEvents: "none" }}
            onContextMenu={e => e.preventDefault()}
          >
            SØRLANDET 
             <p className='image-subtitle'>KRISTIANSAND</p>
          </h2>
        </div>

        <div 
          className="rectangle-card" 
          onClick={() => navigate('/triaden')} 
          style={{ cursor: 'pointer' }}
          role="button" 
          tabIndex={0}
          onKeyPress={(e) => { if (e.key === 'Enter') navigate('/triaden') }}
        >
          <img 
            src={pwsTri} 
            alt="Triaden building" 
            className="rectangle-image" 
            draggable={false}
            onContextMenu={e => e.preventDefault()}
            style={{ userSelect: 'none' }}
          />
          <h2
            className="image-title"
            draggable={false}
            tabIndex={-1}
            style={{ userSelect: "none", pointerEvents: "none" }}
            onContextMenu={e => e.preventDefault()}
          >
            TRIADEN 
            <p className='image-subtitle'>LØRENSKOG</p>
            
          </h2>
        </div>
      </div>
      <div className="centered-divider"><span>SNARVEIER</span></div>

      <div className='quick-section'>
        <div className='quick-card'>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
            <MdConfirmationNumber size={28} style={{ display: 'inline-block' }} />
            <h3 style={{ margin: 0 }}>MINE BILLETTER</h3>
          </div>
        </div>
        <div className='quick-card-row'>
          <div className='quick-card' onClick={() => navigate('/loyalty')} style={{ cursor: 'pointer' }}>
            <MdEventSeat size={60}/>
            <h3 style={{ fontSize: '1rem', fontWeight: 400 }}>MINE PRODUKTER</h3>
          </div>
          <div className='quick-card'>
            <MdPerson size={60}/>
            <h3 style={{ fontSize: '1rem', fontWeight: 400 }}>MIN PROFIL</h3>
          </div>
        </div>
      </div>

      {/* Profile-style card buttons on Home page */}
      <div className="centered-divider"><span>HJELP</span></div>
              <ProfileCardButton emoji="💬" label="KUNDESERVICE" to="/SUPPORT" vibrate={20} />

      <div className="home-cards-wrapper" style={{ marginTop: 20 }}>
      </div>
    </div>
  );
}

import React, { useEffect, useState, useCallback } from "react";
import "./MonthPass.css";
import pwLogo from "./Playworld-Extended.png";
import { db, auth } from "../firebase";
import { doc, collection, getDocs, setDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";

export default function MonthPass() {
  const [passes, setPasses] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Memoized helper functions to prevent re-creation on every render
  const getDaysRemaining = useCallback((pass) => {
    if (!pass.datePurchased || !pass.dayDuration) return null;
    
    // Calculate the expiry date (purchase date + duration in days - 1 because purchase day is day 1)
    const purchasedDate = new Date(pass.datePurchased);
    const expiryDate = new Date(purchasedDate.getTime() + (pass.dayDuration - 1) * 24 * 60 * 60 * 1000);
    
    // Get today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset to start of day
    expiryDate.setHours(23, 59, 59, 999); // Set to end of expiry day
    
    // Calculate days remaining
    const diffInMs = expiryDate.getTime() - today.getTime();
    const daysRemaining = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));
    
    // Return 0 if expired, otherwise return days remaining
    return Math.max(0, daysRemaining);
  }, []);

  const getLastDay = useCallback((pass) => {
    if (!pass.datePurchased || !pass.dayDuration) return null;
    const purchasedDate = new Date(pass.datePurchased);
    // Subtract 1 from dayDuration because purchase day counts as day 1
    const expiryDate = new Date(purchasedDate.getTime() + (pass.dayDuration - 1) * 24 * 60 * 60 * 1000);
    const day = String(expiryDate.getDate()).padStart(2, "0");
    const month = String(expiryDate.getMonth() + 1).padStart(2, "0");
    const year = expiryDate.getFullYear();
    return `${day}.${month}.${year}`;
  }, []);

  // Memoized passes with calculated values to prevent recalculation
  const processedPasses = React.useMemo(() => {
    return passes.map(pass => ({
      ...pass,
      daysRemaining: getDaysRemaining(pass),
      lastDay: getLastDay(pass),
      isActive: getDaysRemaining(pass) > 0
    }));
  }, [passes, getDaysRemaining, getLastDay]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setLoading(true);
      
      if (!currentUser) {
        setPasses([]);
        setLoading(false);
        return;
      }
      
      try {
        const userDocRef = doc(db, "users", currentUser.email.toLowerCase());
        const ordersColRef = collection(userDocRef, "newOrders");
        const ordersSnap = await getDocs(ordersColRef);
        let allPasses = [];
        let passIds = new Set();
        
        // Optimized parallel processing
        const myPassesPromises = ordersSnap.docs.map(async (orderDoc) => {
          const [myPassesSnap, orderData] = await Promise.all([
            getDocs(collection(orderDoc.ref, "myPasses")),
            Promise.resolve(orderDoc.data())
          ]);
          
          // Process myPasses subcollection
          myPassesSnap.forEach((passDoc) => {
            const passData = passDoc.data();
            if (passData.id && !passIds.has(passData.id)) {
              allPasses.push(passData);
              passIds.add(passData.id);
            }
          });
          
          // Process monthPass directly under order
          if (orderData.monthPass && orderData.monthPass.category === "månedskort" && 
              orderData.monthPass.id && !passIds.has(orderData.monthPass.id)) {
            allPasses.push(orderData.monthPass);
            passIds.add(orderData.monthPass.id);
          }
        });
        
        await Promise.all(myPassesPromises);
        setPasses(allPasses);
      } catch (err) {
        console.error("Error fetching passes:", err);
        setPasses([]);
      } finally {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Scroll to top on mount
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Memoized WalletCard component to prevent unnecessary re-renders
  const WalletCard = React.memo(({ pass, onCardClick }) => (
    <div 
      className="wallet-card" 
      onClick={onCardClick}
      style={{ cursor: 'pointer' }}
    >
      <div className="wallet-card-corner"></div>
      <div className={`wallet-status-text ${pass.isActive ? 'active-status' : 'inactive-status'}`}>
        {pass.isActive ? 'Aktiv' : 'Inaktiv'}
      </div>
      <div className="wallet-card-header"></div>
      <img src={pwLogo} alt="Playworld Logo" className="wallet-card-logo" />
      <div className="wallet-card-details-group">
        <p className="wallet-card-detail" style={{textAlign: 'left'}}>
          <strong>Korteier:</strong> {pass.passHolderName || "-"}
        </p>
        <p className="wallet-card-detail" style={{textAlign: 'left'}}>
          <strong>Type:</strong> {pass.category === "gavekort" ? "Gavekort" : "Månedskort"}
        </p>
        <p className="wallet-card-detail" style={{textAlign: 'left'}}>
          <strong>Varighet:</strong> {pass.name || "Ukjent"}
        </p>
        <p className="wallet-card-detail" style={{textAlign: 'left'}}>
          <strong>Dager igjen:</strong> {pass.daysRemaining !== null ? pass.daysRemaining : '-'} 
          {pass.daysRemaining === 0 ? ' (Siste dag)' : ''} 
          <span className="last-day">Siste dag: {pass.lastDay || '-'}</span>
        </p>
      </div>
      <p className="wallet-card-id"><strong>ID:</strong> {pass.id}</p>
    </div>
  ));

  // Memoized card click handler
  const handleCardClick = useCallback((pass) => {
    if (window.navigator.vibrate) window.navigator.vibrate(20);
    navigate('/monthpassdetails', { state: { pass } });
  }, [navigate]);

  // Optimized status update effect with debouncing
  useEffect(() => {
    if (!processedPasses.length || !user) return;
    
    const updateStatuses = async () => {
      const updates = processedPasses
        .filter(pass => pass.status !== (pass.isActive ? 'active' : 'inactive'))
        .map(async pass => {
          try {
            const userDocRef = doc(db, "users", user.email.toLowerCase());
            const ordersColRef = collection(userDocRef, "newOrders");
            const ordersSnap = await getDocs(ordersColRef);
            
            for (const orderDoc of ordersSnap.docs) {
              const myPassesCol = collection(orderDoc.ref, "myPasses");
              const passRef = doc(myPassesCol, pass.id);
              await setDoc(passRef, {
                status: pass.isActive ? 'active' : 'inactive',
                daysRemaining: pass.daysRemaining,
                lastDay: pass.lastDay
              }, { merge: true });
            }
          } catch (error) {
            console.error(`Failed to update status for pass ${pass.id}:`, error);
          }
        });
      
      if (updates.length > 0) {
        await Promise.all(updates);
      }
    };

    // Debounce status updates
    const timeoutId = setTimeout(updateStatuses, 1000);
    return () => clearTimeout(timeoutId);
  }, [processedPasses, user, getDaysRemaining, getLastDay]);

  // Show loading state
  if (loading) {
    return (
      <div className="wallet-page">
        <h1 className="wallet-title">Mine Pass & Gavekort</h1>
        <div style={{ textAlign: 'center', padding: '40px', color: '#7a5af5' }}>
          Laster pass...
        </div>
      </div>
    );
  }

  return (
    <div className="wallet-page">
      <h1 className="wallet-title">Mine Pass & Gavekort</h1>
      {processedPasses.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#7a5af5' }}>
          Ingen pass eller gavekort funnet.
        </div>
      ) : (
        processedPasses.map((pass, idx) => (
          <WalletCard 
            key={pass.id || idx} 
            pass={pass} 
            onCardClick={() => handleCardClick(pass)}
          />
        ))
      )}
    </div>
  );
}

import React, { useEffect, useState } from "react";
import "./MonthPass.css";
import pwLogo from "./Playworld-Extended.png";
import { db, auth } from "../firebase";
import { doc, collection, getDocs, setDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";

export default function MonthPass() {
  const [passes, setPasses] = useState([]);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setPasses([]);
        return;
      }
      try {
        const userDocRef = doc(db, "users", currentUser.email.toLowerCase());
        const ordersColRef = collection(userDocRef, "newOrders");
        const ordersSnap = await getDocs(ordersColRef);
        let allPasses = [];
        let passIds = new Set();
        // Fetch all myPasses in parallel
        const myPassesPromises = ordersSnap.docs.map(async (orderDoc) => {
          const myPassesCol = collection(orderDoc.ref, "myPasses");
          const passesSnap = await getDocs(myPassesCol);
          passesSnap.forEach((passDoc) => {
            const passData = passDoc.data();
            if (passData.id && !passIds.has(passData.id)) {
              allPasses.push({ ...passData, daysRemaining: passData.daysRemaining });
              passIds.add(passData.id);
            }
          });
          // Also fetch monthPass directly under the order document
          const orderData = orderDoc.data();
          if (orderData.monthPass && orderData.monthPass.category === "månedskort" && orderData.monthPass.id && !passIds.has(orderData.monthPass.id)) {
            allPasses.push({ ...orderData.monthPass, daysRemaining: orderData.monthPass.daysRemaining });
            passIds.add(orderData.monthPass.id);
          }
        });
        await Promise.all(myPassesPromises);
        setPasses(allPasses);
      } catch (err) {
        setPasses([]);
      }
    });
    return () => unsubscribe();
  }, []);

  // Scroll to top on mount
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Helper to calculate days remaining
  function getDaysRemaining(pass) {
    if (!pass.datePurchased || !pass.dayDuration) return null;
    const purchasedDate = new Date(pass.datePurchased);
    const now = new Date();
    const expiryDate = new Date(purchasedDate.getTime() + pass.dayDuration * 24 * 60 * 60 * 1000);
    const diff = Math.floor((expiryDate - now) / (1000 * 60 * 60 * 24));
    return diff >= 0 ? diff : 0;
  }

  // Helper to get last day of usage
  function getLastDay(pass) {
    if (!pass.datePurchased || !pass.dayDuration) return null;
    const purchasedDate = new Date(pass.datePurchased);
    const expiryDate = new Date(purchasedDate.getTime() + pass.dayDuration * 24 * 60 * 60 * 1000);
    const day = String(expiryDate.getDate()).padStart(2, "0");
    const month = String(expiryDate.getMonth() + 1).padStart(2, "0");
    const year = expiryDate.getFullYear();
    return `${day}.${month}.${year}`;
  }

  // Update status based on days remaining
  useEffect(() => {
    if (!passes.length) return;
    passes.forEach(async pass => {
      const daysLeft = getDaysRemaining(pass);
      if (pass.status !== (daysLeft > 0 ? 'active' : 'inactive') || pass.daysRemaining !== daysLeft) {
        if (user && pass.id) {
          const userDocRef = doc(db, "users", user.email.toLowerCase());
          const ordersColRef = collection(userDocRef, "newOrders");
          const ordersSnap = await getDocs(ordersColRef);
          for (const orderDoc of ordersSnap.docs) {
            const myPassesCol = collection(orderDoc.ref, "myPasses");
            const passRef = doc(myPassesCol, pass.id);
            await setDoc(passRef, {
              status: daysLeft >= 0 ? 'active' : 'inactive',
              daysRemaining: daysLeft,
              lastDay: getLastDay(pass)
            }, { merge: true });
          }
        }
      }
    });
  }, [passes, user]);

  return (
    <div className="wallet-page">
      <h1 className="wallet-title">Mine Pass & Gavekort</h1>
      {/* Existing cards for passes */}
      {passes.map((pass, idx) => (
        <div className="wallet-card" key={idx} onClick={() => {
          if (window.navigator.vibrate) window.navigator.vibrate(20);
          navigate('/monthpassdetails', { state: { pass } });
        }} style={{ cursor: 'pointer' }}>
          <div className="wallet-card-corner"></div>
          <div className={`wallet-status-text ${pass.status === 'active' ? 'active-status' : 'inactive-status'}`}>{pass.status === 'active' ? 'Aktiv' : 'Inaktiv'}</div>
          <div className="wallet-card-header"></div>
          <img src={pwLogo} alt="Playworld Logo" className="wallet-card-logo" />
          <div className="wallet-card-details-group">
            <p className="wallet-card-detail" style={{textAlign: 'left'}}><strong>Korteier:</strong> {pass.passHolderName || "-"}</p>
            <p className="wallet-card-detail" style={{textAlign: 'left'}}><strong>Type:</strong> {pass.category === "gavekort" ? "Gavekort" : "Månedskort"}</p>
            <p className="wallet-card-detail" style={{textAlign: 'left'}}><strong>Varighet:</strong> {pass.name || "Ukjent"}</p>
            <p className="wallet-card-detail" style={{textAlign: 'left'}}><strong>Dager igjen:</strong> {getDaysRemaining(pass) !== null ? getDaysRemaining(pass) : '-'} {getDaysRemaining(pass) === 0 ? '(Siste dag)' : ''} <span className="last-day">Siste dag: {getLastDay(pass) || '-'}</span></p>
          </div>
          <p className="wallet-card-id"><strong>ID:</strong> {pass.id}</p>
          {/* Update status in Firestore if missing or incorrect */}
          {user && pass.id && (!pass.status || (pass.status !== 'active' && pass.status !== 'inactive')) && (
            <React.Fragment>
              {(() => {
                const updateStatus = async () => {
                  const userDocRef = doc(db, "users", user.email.toLowerCase());
                  const ordersColRef = collection(userDocRef, "newOrders");
                  const ordersSnap = await getDocs(ordersColRef);
                  for (const orderDoc of ordersSnap.docs) {
                    const myPassesCol = collection(orderDoc.ref, "myPasses");
                    const passRef = doc(myPassesCol, pass.id);
                    await setDoc(passRef, { status: pass.status || 'active' }, { merge: true });
                  }
                };
                updateStatus();
              })()}
            </React.Fragment>
          )}
        </div>
      ))}
    </div>
  );
}

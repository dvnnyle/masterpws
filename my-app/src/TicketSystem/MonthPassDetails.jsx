import React from "react";
import { useLocation } from "react-router-dom";
import { doc, collection, getDocs, setDoc } from "firebase/firestore";
import pwLogo from "./Playworld-Extended.png";
import "./MonthPass.css";
import { db } from "../firebase"; // Adjust the import based on your project structure

export default function MonthPassDetails() {
  const location = useLocation();
  const pass = location.state?.pass;

  const [editMode, setEditMode] = React.useState(false);
  const [korteier, setKorteier] = React.useState(pass.passHolderName || "");
  const [guardianName, setGuardianName] = React.useState(pass.guardianName || "");
  const [guardianPhone, setGuardianPhone] = React.useState(pass.guardianPhone || "");
  const [guardianEmail, setGuardianEmail] = React.useState(pass.guardianEmail || "");

  function handleSave() {
    // Update Firestore with the new data
    const userEmail = pass.userEmail || (pass.orderReference ? pass.orderReference.split('-')[0] : null);
    if (userEmail && pass.id) {
      const userDocRef = doc(db, "users", userEmail.toLowerCase());
      const ordersColRef = collection(userDocRef, "newOrders");
      getDocs(ordersColRef).then(ordersSnap => {
        ordersSnap.forEach(orderDoc => {
          const myPassesCol = collection(orderDoc.ref, "myPasses");
          const passRef = doc(myPassesCol, pass.id);
          setDoc(passRef, {
            passHolderName: korteier,
            guardianName,
            guardianPhone,
            guardianEmail
          }, { merge: true });
        });
      });
    }
    setEditMode(false);
    // Optionally show a success message
  }

  if (!pass) {
    return <div className="wallet-page"><h2>Ingen data for månedskort funnet.</h2></div>;
  }

  // Helper to format kjøpsdato
  function formatDateOslo(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('nb-NO', { timeZone: 'Europe/Oslo', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false });
  }

  return (
    <div className="wallet-page">
      <h1 className="wallet-title">Månedskort Detaljer</h1>
      <div className="wallet-card">
        <div className="wallet-card-corner"></div>
        <div className={`wallet-status-text ${pass.status === 'active' ? 'active-status' : 'inactive-status'}`}>{pass.status === 'active' ? 'Aktiv' : 'Inaktiv'}</div>
        <div className="wallet-card-header"></div>
        <img src={pwLogo} alt="Playworld Logo" className="wallet-card-logo" />
        <div className="wallet-card-details-group">
          <p className="wallet-card-detail" style={{textAlign: 'left'}}><strong>Korteier:</strong> {korteier || "-"}</p>
          <p className="wallet-card-detail" style={{textAlign: 'left'}}><strong>Type:</strong> {pass.category === "gavekort" ? "Gavekort" : "Månedskort"}</p>
          <p className="wallet-card-detail" style={{textAlign: 'left'}}><strong>Varighet:</strong> {pass.name || "Ukjent"}</p>
          <p className="wallet-card-detail" style={{textAlign: 'left'}}><strong>Dager igjen:</strong> {pass.daysRemaining !== undefined ? pass.daysRemaining : '-'} {pass.daysRemaining === 0 ? '(Siste dag)' : ''} <span className="last-day">Siste dag: {pass.lastDay || '-'}</span></p>
        </div>
        <p className="wallet-card-id"><strong>ID:</strong> {pass.id}</p>
      </div>

      <div className="centered-divider"><span>DETALJER</span></div>

      <div className="pass-info-card">
        <h3 style={{textAlign: 'left'}}>Fullstendige detaljer</h3>
        <div style={{textAlign: 'left'}}>
          <p><strong>Korteier:</strong> {korteier || "-"}</p>
          <p><strong>Kategori:</strong> {pass.category}</p>
          <p><strong>Varighet (dager):</strong> {pass.dayDuration}</p>
          <p><strong>OrderRef:</strong> {pass.orderReference}</p>
          <p><strong>Siste bruksdag:</strong> {pass.lastDay || '-'} </p>
          <p><strong>Kjøpsdato:</strong> {formatDateOslo(pass.datePurchased)}</p>
        </div>
      </div>
      <div className="pass-info-card" style={{marginTop: 18}}>
        <h3 style={{textAlign: 'left'}}>Foresatte / Guardian</h3>
        <div style={{textAlign: 'left'}}>
          {editMode ? (
            <>
              <label>Korteier navn:</label>
              <input value={korteier} onChange={e => setKorteier(e.target.value)} style={{width:'100%',marginBottom:8}} />
              <label>Foresatte navn:</label>
              <input value={guardianName} onChange={e => setGuardianName(e.target.value)} style={{width:'100%',marginBottom:8}} />
              <label>Telefon:</label>
              <input value={guardianPhone} onChange={e => setGuardianPhone(e.target.value)} style={{width:'100%',marginBottom:8}} />
              <label>E-post:</label>
              <input value={guardianEmail} onChange={e => setGuardianEmail(e.target.value)} style={{width:'100%',marginBottom:8}} />
              <button onClick={handleSave} style={{marginTop:10}}>Lagre</button>
            </>
          ) : (
            <>
              <p><strong>Korteier:</strong> {korteier || '-'}</p>
              <p><strong>Foresatte:</strong> {guardianName || '-'}</p>
              <p><strong>Telefon:</strong> {guardianPhone || '-'}</p>
              <p><strong>E-post:</strong> {guardianEmail || '-'}</p>
              <button onClick={() => setEditMode(true)} style={{marginTop:10}}>Rediger</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

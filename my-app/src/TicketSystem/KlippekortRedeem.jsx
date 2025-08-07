import React, { useState, useCallback, useMemo } from "react";
import { db, auth } from "../firebase";
import { doc, collection, getDocs, updateDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import './KlippekortRedeem.css';
import pwLogo from "./Playworld-Extended.png";

export default function KlippekortRedeem({ onRedeem }) {
  // Load klippekort from localStorage and Firestore if logged in
  const [klippekortList, setKlippekortList] = useState([]);
  const [selected, setSelected] = useState(null);
  const [stamps, setStamps] = useState(1);
  const [user, setUser] = useState(null);
  const [showArchive, setShowArchive] = useState(false);
  // Store all klippekort (active and deactivated) for archive modal
  const [allKlippekort, setAllKlippekort] = useState([]);
  const [showGoToTicketsModal, setShowGoToTicketsModal] = useState(false);
  const [reloadTrigger, setReloadTrigger] = useState(0);
  const [localLoaded, setLocalLoaded] = useState(false);

  // Memoized calculations for better performance
  const archiveList = useMemo(() => 
    allKlippekort.filter(k => (k.status === 'deactivated' || k.stampAmounts === 0 || k.stampsLeft === 0)),
    [allKlippekort]
  );

  // Memoized date formatter for reuse
  const formatDate = useCallback((date) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = String(d.getFullYear());
    const hour = String(d.getHours()).padStart(2, "0");
    const min = String(d.getMinutes()).padStart(2, "0");
    return `${day}.${month}.${year} kl.${hour}:${min}`;
  }, []);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setAllKlippekort([]);
        setKlippekortList([]);
        setLocalLoaded(true);
        return;
      }
      
      try {
        const userDocRef = doc(db, "users", currentUser.email.toLowerCase());
        const ordersColRef = collection(userDocRef, "newOrders");
        const ordersSnapshot = await getDocs(ordersColRef);
        let allKlippekort = [];
        let klippekortIds = new Set();
        
        // Fetch all myKlippekort in parallel (optimized pattern)
        const myKlippekortPromises = ordersSnapshot.docs.map(async (orderDoc) => {
          const myKlippekortCol = collection(orderDoc.ref, "myKlippekort");
          const klippekortSnap = await getDocs(myKlippekortCol);
          const orderKlippekort = [];
          const orderRef = orderDoc.data().orderReference;
          
          klippekortSnap.forEach(docSnap => {
            const item = docSnap.data();
            const uniqueId = item.id || docSnap.id;
            if (uniqueId && !klippekortIds.has(uniqueId)) {
              const stampUsed = item.stampUsed || 0;
              const stampAmounts = item.stampAmounts || 0;
              const stampsLeft = typeof item.stampsLeft === 'number' ? item.stampsLeft : stampAmounts;
              let status = "active";
              if (stampsLeft <= 0) status = "deactivated";
              
              orderKlippekort.push({
                ...item,
                stampUsed,
                stampsLeft,
                status,
                _uniqueId: docSnap.id,
                orderReference: orderRef,
                stampTotal: item.stampTotal || item.stampAmounts || 0
              });
              klippekortIds.add(uniqueId);
            }
          });
          return orderKlippekort;
        });
        
        const results = await Promise.all(myKlippekortPromises);
        allKlippekort = results.flat();
        
        setAllKlippekort(allKlippekort);
        setKlippekortList(allKlippekort.filter(k => k.status === 'active' && k.stampAmounts > 0));
        setSelected(prevSelected => updateSelectedAfterChange(allKlippekort, prevSelected));
      } catch (err) {
        console.error("Firestore fetch error:", err);
        setAllKlippekort([]);
        setKlippekortList([]);
      }
      setLocalLoaded(true);
    });
    return () => unsubscribe();
  }, [reloadTrigger]);

  // Memoized components for better performance
  const ArchiveItem = React.memo(({ k, idx }) => (
    <li key={k.id || k._uniqueId || idx} className="kr-archive-item archive-card">
      <div className="kr-archive-header">
        <span className="kr-archive-name">{k.name}</span>
        <span className="kr-archive-id">ID: {k.id && String(k.id).startsWith('KLK') ? k.id : (k.productId || k._uniqueId || 'Ukjent')}</span>
      </div>
      <div className="kr-archive-details-grid">
        <div><span className="kr-archive-label">Totalt</span><b>{k.stampTotal || ((k.stampUsed || 0) + (k.stampAmounts || 0))}</b></div>
        <div><span className="kr-archive-label">Brukt</span><b>{k.stampUsed || 0}</b></div>
        <div><span className="kr-archive-label">Ordre</span><b>{k.orderReference || '—'}</b></div>
        <div><span className="kr-archive-label">Status</span><b className={k.status === 'deactivated' ? 'kr-status-deactivated' : ''}>{k.status === 'active' ? 'Aktiv' : 'Deaktivert'}</b></div>
      </div>
      {Array.isArray(k.usedDates) && k.usedDates.length > 0 && (
        <div className="kr-archive-date-list"><strong>Datoer utløst:</strong>
          <ul style={{margin: '6px 0 0 0', padding: 0, listStyle: 'none'}}>
            {k.usedDates.map((date, i) => (
              <li key={i}>{formatDate(date)}</li>
            ))}
          </ul>
        </div>
      )}
      {k.datePurchased && <div className="kr-archive-date">Kjøpt: {formatDate(k.datePurchased)}</div>}
    </li>
  ));

  const UsedDatesList = React.memo(({ usedDates }) => (
    <div><strong>Datoer utløst:</strong>
      <ul style={{margin: '6px 0 0 0', padding: 0, listStyle: 'none'}}>
        {usedDates.map((date, idx) => (
          <li key={idx}>{formatDate(date)}</li>
        ))}
      </ul>
    </div>
  ));

  // Only show 'Ingen klippekort funnet.' if there are truly no active klippekort in the dropdown
  if (klippekortList.length === 0) return (
    <div className="klippekort-redeem-container">
      {localLoaded && (
        <div className="kr-card archive-header-card kr-archive-header-margin">
          <div className="kr-card-content">

          </div>
        </div>
      )}
      {showArchive && (
        <div className="kr-modal-overlay" onClick={() => setShowArchive(false)}>
          <div className="kr-modal" onClick={e => e.stopPropagation()}>
            <button className="kr-modal-close" onClick={() => setShowArchive(false)}>&times;</button>
            <h2 className="kr-archive-title">Dine klippekort</h2>
            <div className="kr-archive-list-wrapper">
              {archiveList.length === 0 ? (
                <div className="kr-archive-empty">Ingen brukte klippekort funnet.</div>
              ) : (
                <ul className="kr-archive-list">
                  {archiveList.map((k, idx) => (
                    <ArchiveItem key={k.id || k._uniqueId || idx} k={k} idx={idx} />
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  function updateSelectedAfterChange(updatedList, previousSelected) {
    const stillExists = updatedList.find(k => k._uniqueId === previousSelected?._uniqueId);
    return stillExists || updatedList[0] || null;
  }

  const handleRedeem = async () => {
    if (!selected || stamps < 1 || stamps > selected.stampAmounts) return;
    // Clean up name to avoid double (X klipp) or (X klipp igjen)
    const baseName = selected.name.replace(/\s*\(\d+\s*klipp( igjen)?\)/gi, '').trim();
    const nowDate = new Date().toISOString();
    // Add new used date to array
    const usedDates = Array.isArray(selected.usedDates) ? [...selected.usedDates, nowDate] : [nowDate];
    const newTicket = {
      ...selected,
      id: `${selected.productId || selected.orderReference || Date.now()}-redeem-${Date.now()}`,
      name: `${baseName} (${stamps} klipp)`,
      duration: stamps * 60, // duration in minutes
      usedStamps: stamps,
      datePurchased: nowDate,
      productId: selected.productId,
      orderReference: selected.orderReference || selected.orderReference || 'Ukjent',
      customerName: selected.customerName || selected.buyerName || '',
      category: 'klippekort',
      type: 'stampCardTicket',
      stampAmounts: 0,
      stampUsed: (selected.stampUsed || 0) + stamps,
      usedDates
    };
    // Save to localStorage (or call onRedeem)
    const redeemed = JSON.parse(localStorage.getItem("klippekortRedeemed") || "[]");
    redeemed.push(newTicket);
    localStorage.setItem("klippekortRedeemed", JSON.stringify(redeemed));
    console.log("Redeemed klippekort ticket added:", newTicket);
    
    // If logged in, update Firestore
    if (user && selected.orderReference) {
      try {
        const userDocRef = doc(db, "users", user.email.toLowerCase());
        const ordersColRef = collection(userDocRef, "newOrders");
        const querySnapshot = await getDocs(ordersColRef);
        for (const docSnap of querySnapshot.docs) {
          const orderData = docSnap.data();
          if (orderData.orderReference === selected.orderReference) {
            // Update the klippekort document in myKlippekort subcollection
            const myKlippekortCol = collection(docSnap.ref, "myKlippekort");
            const klippekortDocRef = doc(myKlippekortCol, selected.id || selected._uniqueId);
            const newStampUsed = (selected.stampUsed || 0) + stamps;
            const newStampsLeft = (selected.stampAmounts || 0) - stamps;
            let newStatus = "active";
            if (newStampsLeft <= 0) newStatus = "deactivated";
            // Update usedDates in Firestore
            await updateDoc(klippekortDocRef, {
              stampUsed: newStampUsed,
              stampsLeft: newStampsLeft,
              status: newStatus,
              usedDates
            });
            // Optionally, also update the items array for legacy support
            const updatedItems = Array.isArray(orderData.items) ? orderData.items.map(item => {
              if (item.productId === selected.productId) {
                const newStampAmounts = (item.stampAmounts || 0) - stamps;
                const updatedUsedDates = Array.isArray(item.usedDates) ? [...item.usedDates, nowDate] : [nowDate];
                return {
                  ...item,
                  stampAmounts: newStampAmounts,
                  stampUsed: (item.stampUsed || 0) + stamps,
                  status: newStampAmounts > 0 ? "active" : "deactivated",
                  usedDates: updatedUsedDates
                };
              }
              return item;
            }) : [];
            await updateDoc(docSnap.ref, { items: updatedItems });
            // Store redemption in Firestore under the specific klippekort document
            const redeemedKlippekortCol = collection(klippekortDocRef, "redeemedKlippekort");
            // Remove undefined fields from newTicket before saving
            const cleanedTicket = Object.fromEntries(Object.entries(newTicket).filter(([_, v]) => v !== undefined));
            await (await import("firebase/firestore")).addDoc(redeemedKlippekortCol, cleanedTicket);
            console.log("Redemption stored in Firestore under klippekort:", cleanedTicket);
          }
        }
      } catch (err) {
        console.error("Failed to update klippekort in Firestore or store redemption:", err);
      }
    }
    if (onRedeem) onRedeem(newTicket);
    setShowGoToTicketsModal(true);
    setReloadTrigger(prev => prev + 1); // Trigger reload after redeeming
    // Show confirmation with navigation option
    alert(`Billett på ${stamps} klipp (${stamps * 60} min) er laget!`);
  };

  if (!localLoaded) return null;

  return (
    
    <div className="klippekort-redeem-container">
                 <div className="global-rectangle">
        <h1 className="global-title">KLIPPEKORT</h1>
      </div>
      <div className="kr-card selected-klippekort-card">
        {selected && (
          <img src={pwLogo} alt="Playworld Logo" className="wallet-card-logo" style={{marginBottom: 10, marginTop: -10}} />
        )}
        {selected && (
          <div className={`kr-status-text ${selected.status === 'active' ? 'active-status' : 'inactive-status'}`}> 
            {selected.status === 'active' ? 'Aktiv' : 'Deaktivert'}
          </div>
        )}
        <h2 className="kr-title">{selected ? selected.name : 'Ingen klippekort valgt'}</h2>
        {selected && (
          <div className="kr-card-content">
            <div><strong>Antall klipp totalt:</strong> {selected.stampTotal || selected.stampAmounts}</div>
            <div style={{marginTop: '2px'}}><strong>Utløpsdato:</strong> {selected.lastDayOfUse || "Ingen utløpsdato"}</div>
            <div><strong>Klipp igjen:</strong> {(selected.stampTotal || selected.stampAmounts) - (selected.stampUsed || 0)}/{selected.stampTotal || selected.stampAmounts}</div>
            <span className="klippekort-id">
              ID: {selected.id && String(selected.id).startsWith('KLK') ? selected.id : (selected.productId || selected._uniqueId || 'Ukjent')}
            </span>
          </div>
        )}
      </div>
      {klippekortList.length > 0 && (
        <div className="kr-card redeem-card">
          <h2 className="kr-title">Løs ut klippekort</h2>
          <div className="kr-card-content">
            <div className="kr-field">
              <label>Klippekort:</label>
              <select value={selected?._uniqueId} onChange={e => {
                const found = klippekortList.find(k => k._uniqueId === e.target.value);
                setSelected(found);
                setStamps(1);
              }}>
                {klippekortList.map(k => (
                  <option key={k._uniqueId} value={k._uniqueId}>
                    {k.name} ({k.stampAmounts > 0 ? `${k.stampAmounts} klipp igjen` : 'ingen klipp igjen'})
                  </option>
                ))}
              </select>
              {selected && (
                <div className="kr-details">
                  <div><strong>Antall klipp totalt:</strong> {selected.stampTotal || selected.stampAmounts}</div>
                  <div><strong>Klipp igjen:</strong> {(selected.stampTotal || selected.stampAmounts) - (selected.stampUsed || 0)}/{selected.stampTotal || selected.stampAmounts}</div>
                  <div><strong>Klipp brukt:</strong> {selected.stampUsed || 0}</div>
                  <div><strong>Status:</strong> <span style={{color: selected.status === 'active' ? '#2ecc40' : '#b1a7d6', fontWeight: 700}}>{selected.status === 'active' ? 'Aktiv' : 'Deaktivert'}</span></div>
                  <div><strong>Klippekort-ID:</strong> {
                    selected.id && String(selected.id).startsWith('KLK') ? selected.id : (selected.productId || selected._uniqueId || 'Ukjent')
                  }</div>
                  {Array.isArray(selected.usedDates) && selected.usedDates.length > 0 && (
                    <UsedDatesList usedDates={selected.usedDates} />
                  )}
                </div>
              )}
            </div>
            <div className="kr-field">
              <label>Antall klipp å bruke:</label>
              <select
                value={stamps}
                onChange={e => setStamps(Number(e.target.value))}
                disabled={!selected || selected.stampAmounts < 1}
              >
                {Array.from({ length: selected?.stampAmounts || 1 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>{i + 1}</option>
                ))}
              </select>
            </div>
            <button className="kr-redeem-btn" onClick={handleRedeem} disabled={!selected || selected.stampAmounts < 1 || stamps > selected.stampAmounts}>
              Løs ut {stamps} klipp <span className="kr-minutes">({stamps * 60} min)</span>
            </button>
          </div>

        </div>
      )}
      {klippekortList.length > 0 && (
        <>
          <div className="centered-divider"><span>ARKIV</span></div>
          <div className="kr-card archive-header-card kr-archive-header-margin">
            <div className="kr-card-content">
              <button className="kr-redeem-btn archive-button" onClick={() => setShowArchive(true)}>
                Åpne klippekort-arkiv
              </button>
            </div>
          </div>
        </>
      )}
      {showArchive && (
        <div className="kr-modal-overlay" onClick={() => setShowArchive(false)}>
          <div className="kr-modal" onClick={e => e.stopPropagation()}>
            <button className="kr-modal-close" onClick={() => setShowArchive(false)}>&times;</button>
            <h2 className="kr-archive-title">Dine klippekort</h2>
            <div className="kr-archive-list-wrapper">
              {archiveList.length === 0 ? (
                <div className="kr-archive-empty">Ingen brukte klippekort funnet.</div>
              ) : (
                <ul className="kr-archive-list">
                  {archiveList.map((k, idx) => (
                    <ArchiveItem key={k.id || k._uniqueId || idx} k={k} idx={idx} />
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
      {showGoToTicketsModal && (
        <div className="kr-modal-overlay" onClick={() => setShowGoToTicketsModal(false)}>
          <div className="kr-modal" onClick={e => e.stopPropagation()}>
            <button className="kr-modal-close" onClick={() => setShowGoToTicketsModal(false)}>&times;</button>
            <h2 className="kr-archive-title">Billett laget!</h2>
            <div className="kr-card-content" style={{marginBottom: 16}}>
              <p>Billett på {stamps} klipp ({stamps * 60} min) er laget.</p>
            </div>
            <button className="kr-redeem-btn" style={{marginTop: 10, fontSize: 16}} onClick={() => window.location.href = '/tickets'}>
              Gå til mine billetter
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

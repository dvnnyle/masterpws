import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./PaymentReturn.css";
import { db, auth } from "../firebase";
import { doc, collection, addDoc, getDocs, updateDoc, setDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { captureVippsPayment } from "../vipps/vipps";

export default function PaymentReturn() {
  const [orderReference, setOrderReference] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [buyerName, setBuyerName] = useState("");
  const [email, setEmail] = useState("");
  const [cartItems, setCartItems] = useState([]);
  const [products] = useState([]);
  const [pspReference, setPspReference] = useState("");
  const navigate = useNavigate();

  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // Load order info from localStorage on mount
  useEffect(() => {
    const storedReference = localStorage.getItem("orderReference");
    const storedPhone = localStorage.getItem("phoneNumber");
    const storedName = localStorage.getItem("buyerName");
    const storedEmail = localStorage.getItem("email");
    const storedCart = localStorage.getItem("cartItems");

    if (storedReference) setOrderReference(storedReference);
    if (storedPhone) setPhoneNumber(storedPhone);
    if (storedName) setBuyerName(storedName);
    if (storedEmail) setEmail(storedEmail);

    if (storedCart) {
      const parsedCart = JSON.parse(storedCart);
      setCartItems(parsedCart);

      const now = new Date().toISOString();

      // Update cart items with orderReference and datePurchased
      const updatedCart = parsedCart.map(item => {
        let newItem = { ...item, orderReference: storedReference, datePurchased: now };
        // If item is a gavekort or monthpass, ensure name is set
        if ((item.category === "gavekort" || item.category === "monthpass" || item.name?.toLowerCase().includes("månedskort")) && !item.name) {
          newItem.name = item.category === "gavekort" ? "Gavekort" : "Månedskort";
        }
        // Ensure klippekort has correct stampAmounts and stampTotal
        if (item.category === "klippekort" && item.type === "stampCardTicket") {
          newItem.stampAmounts = item.stampAmounts ?? item.stampTotal ?? item.quantity ?? 0;
          newItem.stampTotal = item.stampTotal ?? item.stampAmounts ?? item.quantity ?? 0;
        }
        return newItem;
      });
      localStorage.setItem("cartItems", JSON.stringify(updatedCart));

      // Store order in localStorage orders array (for offline use)
      const storedOrders = JSON.parse(localStorage.getItem("orders") || "[]");
      const alreadyExists = storedOrders.some(
        o => o.orderReference === storedReference
      );
      if (!alreadyExists) {
        const newOrder = {
          orderReference: storedReference || "",
          buyerName: storedName || "",
          phoneNumber: storedPhone || "",
          email: storedEmail || "",
          datePurchased: now,
          items: updatedCart,
          totalPrice: updatedCart.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
          ),
        };
        localStorage.setItem("orders", JSON.stringify([newOrder, ...storedOrders]));
      }
    }
  }, []);

  // Note: Auto-capture removed - payments must be manually captured in admin panel
  useEffect(() => {
    if (orderReference) {
      // Set a placeholder pspReference so the order can be saved
      // The actual pspReference will be updated when payment is manually captured
      setPspReference(orderReference);
    }
  }, [orderReference]);

  // Save order to Firestore after pspReference is set
  useEffect(() => {
    if (!pspReference) return;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      const storedReference = localStorage.getItem("orderReference");
      const storedPhone = localStorage.getItem("phoneNumber");
      const storedName = localStorage.getItem("buyerName");
      const storedEmail = localStorage.getItem("email");
      const storedCart = localStorage.getItem("cartItems");
      const storedPspReference = pspReference;
      const now = new Date().toISOString();

      if (!user) {
        // Guest order: store in /guests/{guestKey}/NewGuestOrders/{orderReference}
        if (storedCart && storedReference) {
          const parsedCart = JSON.parse(storedCart);
          // Use email as guestKey if available, else fallback to phone, else 'guest'
          let guestKey = 'guest';
          if (storedEmail && storedEmail.trim()) {
            guestKey = storedEmail.trim().toLowerCase().replace(/[.#$[\]]/g, '_');
          } else if (storedPhone && storedPhone.trim()) {
            guestKey = storedPhone.trim().replace(/[.#$[\]]/g, '_');
          }
          const guestDocRef = doc(db, "guests", guestKey);
          const guestOrderRef = doc(db, "guests", guestKey, "NewGuestOrders", storedReference);
          try {
            // Store guest profile (merge)
            await setDoc(guestDocRef, {
              email: storedEmail,
              emailVerified: false,
              name: storedName,
              phone: storedPhone,
            }, { merge: true });
            console.log('✅ Guest profile added/updated:', guestKey);
            // Store the order
            await setDoc(guestOrderRef, {
              orderReference: storedReference,
              buyerName: storedName,
              phoneNumber: storedPhone,
              email: storedEmail,
              datePurchased: now,
              items: parsedCart,
              totalPrice: parsedCart.reduce((sum, item) => sum + item.price * item.quantity, 0),
            });
            console.log('✅ Guest order saved to Firestore:', guestKey, storedReference);
          } catch (err) {
            console.error('❌ Failed to save guest order/profile:', err);
          }
        }
        return;
      }

      if (storedCart && storedReference) {
        const parsedCart = JSON.parse(storedCart);
        const now = new Date().toISOString();

        const newOrder = {
          orderReference: storedReference,
          buyerName: storedName || "",
          phoneNumber: storedPhone || "",
          email: storedEmail || "",
          datePurchased: now,
          totalPrice: parsedCart.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
          ),
          pspReference: storedPspReference || "",
          vippsCaptureResponse: null,
          captureStatus: "PENDING", // Will be updated to CAPTURED after auto-capture
        };

        try {
          const userDocRef = doc(db, "users", user.email.toLowerCase());
          const ordersColRef = collection(userDocRef, "newOrders");

          const querySnapshot = await getDocs(ordersColRef);
          const alreadyExists = querySnapshot.docs.some(
            (doc) => doc.data().orderReference === newOrder.orderReference
          );

          let orderDocRef;
          if (!alreadyExists) {
            orderDocRef = await addDoc(ordersColRef, newOrder);
            console.log("✅ Order added to newOrders subcollection!");
          } else {
            // Find the existing order docRef
            orderDocRef = querySnapshot.docs.find(
              (doc) => doc.data().orderReference === newOrder.orderReference
            ).ref;
          }

          // Store tickets and klippekort in their own subcollections
          for (const item of parsedCart) {
            if (item.category === "klippekort" && item.type === "stampCardTicket") {
              await setDoc(doc(orderDocRef, "myKlippekort", item.id), item);
            } else if (item.category === "lek" && item.type === "ticket") {
              await addDoc(collection(orderDocRef, "myTickets"), item);
            }
            // Store månedskort in both subcollection and directly under the order document
            if (item.category === "månedskort" || item.type === "monthlyPass") {
              // Generate unique id for månedskort
              const generateUniquePassId = async () => {
                const baseId = `MK${Math.floor(100000 + Math.random() * 900000)}`;
                let attempts = 0;
                
                while (attempts < 10) {
                  const suffix = String.fromCharCode(65 + Math.floor(Math.random() * 26)) + String.fromCharCode(65 + Math.floor(Math.random() * 26));
                  const candidateId = baseId + suffix;
                  attempts++;
                  
                  // Check if this ID is unique
                  const existingPasses = await getDocs(collection(orderDocRef, "myPasses"));
                  const idExists = existingPasses.docs.some(doc => doc.id === candidateId);
                  
                  if (!idExists) {
                    return candidateId;
                  }
                }
                
                // Fallback if all attempts failed
                return baseId + String.fromCharCode(65 + Math.floor(Math.random() * 26)) + String.fromCharCode(65 + Math.floor(Math.random() * 26));
              };
              
              const passId = await generateUniquePassId();
              const passData = {
                category: item.category || "månedskort",
                dayDuration: item.dayDuration || 30,
                duration: item.duration || "unlimited",
                location: item.location || "park1",
                name: item.name || "30 Dager",
                price: item.price || 0,
                type: item.type || "monthlyPass",
                passHolderName: item.passHolderName || "",
                orderReference: storedReference,
                datePurchased: now,
                id: passId,
              };
              await setDoc(doc(collection(orderDocRef, "myPasses"), passId), passData);
              await setDoc(orderDocRef, { ...newOrder, monthPass: passData }, { merge: true });
            }
            // Store gavekort in both subcollection and directly under the order document
            if (item.category === "gavekort") {
              await setDoc(doc(collection(orderDocRef, "myPasses"), item.id || `${item.name}-${Date.now()}`), item);
              await setDoc(orderDocRef, { ...newOrder, giftCard: item }, { merge: true });
            }
          }

          // NOW trigger auto-capture after order is saved
          if (!alreadyExists) {
            setTimeout(async () => {
              try {
                console.log('🔄 Starting auto-capture for:', storedReference);
                const captureResult = await captureVippsPayment({
                  reference: storedReference,
                  amountValue: Math.round(newOrder.totalPrice * 100),
                });
                console.log('✅ Auto-capture successful:', captureResult);
                await updateDoc(orderDocRef, {
                  captureStatus: "CAPTURED",
                  capturedAt: new Date().toISOString(),
                  capturedAmount: Math.round(newOrder.totalPrice * 100),
                  vippsCaptureResponse: captureResult,
                  pspReference: captureResult.pspReference || storedReference
                });
                console.log("✅ Auto-capture: Updated order status to CAPTURED");
              } catch (captureError) {
                console.error('❌ Auto-capture failed:', captureError);
              }
            }, 2000); // 2 second delay after order is saved
          }
        } catch (err) {
          console.error("Failed to add order to newOrders subcollection:", err);
        }
      }
    });

    return () => unsubscribe();
  }, [pspReference]);

  function formatDurationFromMinutes(minutes) {
    if (!minutes || minutes <= 0) return "Ukjent varighet";
    if (minutes < 60) return `${minutes} minutter`;
    const hours = minutes / 60;
    return hours % 1 === 0 ? `${hours} timer` : `${hours.toFixed(1)} timer`;
  }

  // Only show klippekort as a single item, do not split into 1-hour tickets
  const tickets = cartItems
    .filter((item) =>
      (item.category === "lek" && item.type === "ticket") ||
      (item.category === "klippekort" && item.type === "stampCardTicket")
    )
    .map((item) => {
      const product = products.find((p) => p.id === item.productId);
      return {
        ...item,
        duration: product?.duration ?? item.duration,
        stampAmounts: item.stampAmounts ?? item.stampTotal ?? item.quantity ?? 0 // Ensure stampAmounts is set
      };
    });

  return (
    <div>
      <div className="global-rectangle">
        <h1 className="global-title">VÅRE PARKER</h1>
      </div>

      <div className="payment-return-container">
        <h1>Takk for din bestilling!</h1>

        <div className="left-align">
          <div>
            <strong>Navn:</strong> <span>{buyerName || "N/A"}</span>
          </div>
          <div>
            <strong>E-post:</strong> <span>{email || "N/A"}</span>
          </div>
          <div>
            <strong>Ordre Referanse:</strong>{" "}
            <span>{orderReference || "N/A"}</span>
          </div>
          <div>
            <strong>Kjøpsdato:</strong>{" "}
            <span>
              {cartItems[0]?.datePurchased
                ? (() => {
                    const d = new Date(cartItems[0].datePurchased);
                    const day = String(d.getDate()).padStart(2, "0");
                    const month = String(d.getMonth() + 1).padStart(2, "0");
                    const year = String(d.getFullYear()).slice(-2);
                    const hour = String(d.getHours()).padStart(2, "0");
                    const min = String(d.getMinutes()).padStart(2, "0");
                    return `${day}.${month}.${year} kl.${hour}:${min}`;
                  })()
                : "Ukjent"}
            </span>
          </div>
          <div>
            <strong>Telefonnummer:</strong> <span>{phoneNumber || "N/A"}</span>
          </div>
        </div>

        <div className="receipt-box">
          <h2>Ordre Sammendrag:</h2>
          <ul className="order-summary-list">
            {cartItems.map((item) => (
              <li key={item.productId}>
                {item.quantity}x {item.name} = {item.price * item.quantity} kr
                {item.category === "klippekort" && item.stampAmounts && (
                  <span style={{ color: '#7a5af5', marginLeft: 8 }}>
                    ({item.stampAmounts} klipp)
                  </span>
                )}
              </li>
            ))}
          </ul>
          <p>
            <strong>Total:</strong> {totalPrice} kr
          </p>

          {tickets.length > 0 && (
            <div className="ticket-box" style={{ marginTop: 24 }}>
              <h2>Dine Billetter:</h2>
              <ul>
                {tickets.map((ticket, idx) => (
                  <li key={idx}>
                    <strong>
                      {ticket.quantity}x {ticket.name}
                    </strong>{" "}
                    – Gyldig i {formatDurationFromMinutes(ticket.duration)}
                  </li>
                ))}
              </ul>
              <button
                className="show-tickets-btn"
                style={{ marginTop: 20 }}
                onClick={() => navigate("/klippekort-redeem")}
                type="button"
              >
                Løs ut klippekort
              </button>
              {/* Remove auto navigation to tickets page after redeem, user must manually click to view tickets */}
              <button
                className="show-tickets-btn"
                style={{ marginTop: 10, marginLeft: 10 }}
                onClick={() => navigate("/tickets")}
                type="button"
              >
                Vis mine billetter
              </button>
              <button
                className="show-tickets-btn"
                style={{ marginTop: 10, marginLeft: 10 }}
                onClick={() => navigate("/monthpass")}
                type="button"
              >
                Gå til mine månedskort
              </button>
            </div>
          )}
          {/* Show button to monthpass if user bought a monthpass */}
          {cartItems.some(item => item.category === "månedskort" || item.type === "monthlyPass") && (
            <button
              className="show-tickets-btn"
              style={{ marginTop: 18, marginLeft: 0, width: '100%' }}
              onClick={() => navigate("/monthpass")}
              type="button"
            >
              Se månedskortet ditt
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

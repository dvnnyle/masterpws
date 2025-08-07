import React, { useEffect, useState } from "react";
import { createVippsPayment } from "../vipps/vipps";
import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import "./MyCart.css";

export default function MyCart() {
  const [cartItems, setCartItems] = useState([]);
  const [phoneNumber, setPhoneNumber] = useState(""); // after "47"
  const [buyerName, setBuyerName] = useState(""); // new buyer name state
  const [email, setEmail] = useState(""); // Add this line with your other useState hooks
  const [loading, setLoading] = useState(false);
  const [passHolderName, setPassHolderName] = useState("");

  // Use environment variable for base URL - will be your actual frontend URL when deployed
  const baseUrl = process.env.REACT_APP_BASE_URL || "http://localhost:3000";

  useEffect(() => {
    const storedCart = localStorage.getItem("cartItems");
    if (storedCart) {
      setCartItems(JSON.parse(storedCart));
    }
    // Autofill fields if user is logged in
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setEmail(user.email || "");
        // Optionally fetch name/phone from Firestore user profile:
        try {
          const userDoc = await getDoc(doc(db, "users", user.email.toLowerCase()));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setBuyerName(data.name || "");
            setPhoneNumber((data.phone || "").replace(/^47/, ""));
          }
        } catch (err) {
          // ignore
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  if (cartItems.length === 0) {
    return <div className="empty-cart">Handlekurven er tom.</div>;
  }

  const isValidPhone = (phone) => /^47\d{8}$/.test(phone);

  const handlePhoneChange = (e) => {
    let val = e.target.value;
    val = val.replace(/\D/g, "").slice(0, 8);
    setPhoneNumber(val);
  };

  // Check if there is a monthpass in the cart
  const hasMonthPass = cartItems.some(item => item.category === "monthpass" || item.name?.toLowerCase().includes("månedskort"));

  const handlePayNow = async (e) => {
    e.preventDefault();

    const fullPhoneNumber = "47" + phoneNumber;

    if (!buyerName.trim()) {
      alert("Vennligst skriv inn ditt navn.");
      return;
    }
    if (!email.trim()) {
      alert("Vennligst skriv inn din e-post.");
      return;
    }
    if (!phoneNumber.trim()) {
      alert("Vennligst skriv inn telefonnummeret etter '47'.");
      return;
    }
    if (!isValidPhone(fullPhoneNumber)) {
      alert("Vennligst skriv inn et gyldig norsk telefonnummer som starter med 47");
      return;
    }
    if (hasMonthPass && !passHolderName.trim()) {
      alert("Vennligst skriv inn navnet på brukeren av månedskortet.");
      return;
    }

    setLoading(true);

    // Generate the payment reference once here
    const reference = Date.now().toString().slice(-8);

    const paymentData = {
      amountValue: Math.round(totalPrice * 100), // Ensure integer, no decimals
      phoneNumber: fullPhoneNumber,
      buyerName: buyerName.trim(),
      email: email.trim(),
      reference: reference, // pass this unique reference
      returnUrl: `${baseUrl}/PaymentReturn`,
      paymentDescription: `Betaling for ${cartItems.length} varer`,
    };

    try {
      // Store guest info in Firestore (for non-logged-in users)
      if (!auth.currentUser) {
        // Always use email as guestKey if provided, fallback to phone if not
        let guestKey = 'guest';
        if (email && email.trim()) {
          guestKey = email.trim().toLowerCase().replace(/[.#$\[\]]/g, "_");
        } else if (fullPhoneNumber && fullPhoneNumber.trim()) {
          guestKey = fullPhoneNumber.trim();
        }
        const guestDocRef = doc(db, "guests", guestKey);
        await setDoc(guestDocRef, {
          email: email.trim(),
          emailVerified: false,
          name: buyerName.trim(),
          phone: fullPhoneNumber,
        }, { merge: true });
        console.log('✅ Guest profile added/updated:', guestKey);
      } else {
        console.log('User is logged in, not storing guest profile.');
      }
      // Before payment, add passHolderName to monthpass items
      const updatedCartItems = cartItems.map(item => {
        if (item.category === "monthpass" || item.name?.toLowerCase().includes("månedskort")) {
          return { ...item, passHolderName: passHolderName.trim() };
        }
        return item;
      });
      localStorage.setItem("cartItems", JSON.stringify(updatedCartItems));
      const vippsResponse = await createVippsPayment(paymentData);
      if (vippsResponse?.url) {
        // Store the reference and other info locally to track this payment/order
        localStorage.setItem("orderReference", reference);
        localStorage.setItem("phoneNumber", fullPhoneNumber);
        localStorage.setItem("buyerName", buyerName.trim());
        localStorage.setItem("email", email.trim());

        // Redirect to Vipps payment page
        console.log('✅ Vipps payment URL received, redirecting:', vippsResponse.url);
        window.location.href = vippsResponse.url;
      } else {
        alert("Vipps betalings-URL mottatt ikke.");
        console.error('❌ Vipps betalings-URL mottatt ikke.');
      }
    } catch (error) {
      alert("Betaling feilet: " + (error.message || error));
      console.error("Payment error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
          <div className="global-rectangle">
        <h1 className="global-title">Handlekurv</h1>
      </div>
      <div className="mycart-wrapper">
        <h1>Sammendrag</h1>
        <ul className="cart-summary-list">
          {cartItems.map((item, idx) => (
            <li key={item.id || item.productId || idx} className="cart-summary-item">
              {item.quantity}x {item.name} = {item.price * item.quantity} kr
              {item.category === 'klippekort' && item.type === 'stampCardTicket' && item.id && String(item.id).startsWith('KLK') && (
                <span style={{ color: '#7a5af5', marginLeft: 8 }}>[ID: {item.id}]</span>
              )}
            </li>
          ))}
        </ul>

        <div className="cart-summary-total">
          <h2>Totalsum: {totalPrice} kr</h2>
        </div>
      </div>

      <form onSubmit={handlePayNow} className="phone-pay-form">
        <label htmlFor="buyerName" className="phone-label">
          Navn:
        </label>
        <input
          type="text"
          id="buyerName"
          className="phone-input"
          value={buyerName}
          onChange={(e) => setBuyerName(e.target.value)}
          placeholder="Ditt navn"
          required
        />

        {/* Add email input field */}
        <label htmlFor="email" className="phone-label">
          E-post:
        </label>
        <input
          type="email"
          id="email"
          className="phone-input"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="din@email.no"
          required
        />

        <label htmlFor="phone" className="phone-label">
          Telefonnummer for betalingsvarsling:
        </label>
        <div className="phone-input-wrapper">
          <input
            type="tel"
            id="phone"
            className="phone-input"
            value={phoneNumber}
            onChange={handlePhoneChange}
            placeholder="12345678"
            required
            maxLength={8}
          />
        </div>

        {hasMonthPass && (
          <>
            <label htmlFor="passHolderName" className="phone-label">
              Navn på bruker av månedskort:
            </label>
            <input
              type="text"
              id="passHolderName"
              className="phone-input"
              value={passHolderName}
              onChange={e => setPassHolderName(e.target.value)}
              placeholder="Navn på bruker"
              required
            />
          </>
        )}

        <button type="submit" className="pay-now-btn" disabled={loading}>
          {loading ? "Behandler..." : "Betal med Vipps"}
        </button>
      </form>
    </>
  );
}

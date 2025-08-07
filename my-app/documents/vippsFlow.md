# Vipps Payment Flow Documentation

## Overview
This document explains how the Vipps payment system works in our application, including the different payment states and capture process.

## Payment Flow States

### 1. **INITIATE** - Payment Creation
```
Customer clicks "Betal med Vipps" → API creates payment → Vipps redirect URL generated
```
- **What happens**: Our backend calls Vipps API to create a payment intent
- **Customer sees**: Redirect to Vipps app/website
- **Payment status**: `CREATED`
- **Money status**: No money moved yet

### 2. **AUTHORIZE** - Customer Pays in Vipps
```
Customer opens Vipps → Enters PIN/biometrics → Confirms payment → Returns to our app
```
- **What happens**: Vipps verifies customer identity and "reserves" the money
- **Customer sees**: "Payment successful" in Vipps, redirected back to our site
- **Payment status**: `AUTHORIZED`
- **Money status**: Money is **reserved** (held) in customer's account, not transferred yet

### 3. **CAPTURE** - We Take the Money
```
Our system (auto or manual) → Calls capture API → Money transferred to our account
```
- **What happens**: We tell Vipps "yes, take the money from customer and give it to us"
- **Customer sees**: Money deducted from their account
- **Payment status**: `CAPTURED`
- **Money status**: Money **transferred** to our merchant account

## Our Implementation

### Auto-Capture Flow
```javascript
// In PaymentReturn.jsx
setTimeout(async () => {
  // Wait 2 seconds for Vipps to fully process authorization
  const captureResult = await captureVippsPayment({
    reference: orderReference,
    amountValue: totalPriceInOre
  });
  
  // Update order status to CAPTURED
  await updateDoc(orderDoc, {
    captureStatus: "CAPTURED",
    capturedAt: new Date().toISOString()
  });
}, 2000); // 2 second delay for safety
```

### Manual Capture Flow
```javascript
// In CustomerOrderList.jsx admin panel
const handleCapture = async (orderReference, totalPrice) => {
  const response = await fetch('/capture-payment', {
    method: 'POST',
    body: JSON.stringify({
      reference: orderReference,
      amountValue: Math.round(totalPrice * 100) // Convert NOK to øre
    })
  });
};
```

## Payment States Explained

### CREATED
- Payment intent exists in Vipps system
- Customer has not paid yet
- Can be cancelled without consequences
- **Money**: No impact on customer account

### AUTHORIZED (Reserved)
- Customer has successfully authenticated and approved payment
- Money is "held" or "reserved" in customer's account
- Customer cannot spend this money elsewhere
- **Money**: Reserved but not transferred
- **Timeout**: Usually expires after 7-30 days if not captured

### CAPTURED
- Money has been transferred from customer to merchant
- Payment is complete and final
- Cannot be undone (only refunded)
- **Money**: Transferred to our account

### CANCELLED
- Payment was cancelled before capture
- Money released back to customer immediately
- **Money**: Fully available to customer again

### REFUNDED
- Money returned to customer after capture
- Creates a new transaction (not reversal)
- **Money**: Returned to customer account

## Why We Use Auto-Capture

### Traditional Flow (Manual Capture)
```
1. Customer pays → AUTHORIZED (reserved)
2. Admin manually clicks "Capture" → CAPTURED
3. Money transferred to us
```
**Problems:**
- ❌ Requires manual work
- ❌ Risk of forgetting to capture
- ❌ Customer confusion (money reserved but not taken)
- ❌ Reservations can expire

### Our Auto-Capture Flow
```
1. Customer pays → AUTHORIZED (reserved)
2. Auto-capture after 2 seconds → CAPTURED
3. Money immediately transferred to us
```
**Benefits:**
- ✅ Fully automated
- ✅ Immediate payment completion
- ✅ No expired reservations
- ✅ Clear customer experience

## Technical Implementation

### Backend API Endpoints

#### Create Payment
```javascript
POST /create-payment
{
  "amountValue": 1000,        // 10.00 NOK in øre
  "phoneNumber": "99999999",
  "buyerName": "John Doe",
  "returnUrl": "https://oursite.com/payment-return"
}
```

#### Capture Payment
```javascript
POST /capture-payment
{
  "reference": "order-123",
  "amountValue": 1000         // Amount to capture in øre
}
```

#### Check Payment Status
```javascript
GET /payment-details/order-123
```

### Frontend Flow

#### 1. Payment Creation (MyCart.jsx)
```javascript
const paymentData = {
  amountValue: totalPrice * 100,  // Convert NOK to øre
  phoneNumber: phoneNumber,
  buyerName: buyerName,
  email: email,
  returnUrl: `${baseUrl}/PaymentReturn`
};

const response = await createVippsPayment(paymentData);
window.location.href = response.url; // Redirect to Vipps
```

#### 2. Payment Return (PaymentReturn.jsx)
```javascript
// Customer returns from Vipps
useEffect(() => {
  // Save order to Firestore
  const order = { /* order data */ };
  await addDoc(ordersCollection, order);
  
  // Auto-capture after 2 seconds
  setTimeout(async () => {
    await captureVippsPayment({ reference, amountValue });
    
    // Update order status
    await updateDoc(orderDoc, { captureStatus: "CAPTURED" });
  }, 2000);
}, []);
```

#### 3. Admin Panel (CustomerOrderList.jsx)
```javascript
// Display capture status
<div>
  <strong>Capture Status:</strong>
  <span style={{ color: order.captureStatus === "CAPTURED" ? "green" : "orange" }}>
    {order.captureStatus || "PENDING"}
  </span>
</div>

// Manual capture button (backup)
<button 
  onClick={() => handleCapture(order.orderReference, order.totalPrice)}
  disabled={order.captureStatus === "CAPTURED"}
>
  {order.captureStatus === "CAPTURED" ? "Payment Captured" : "Capture Payment"}
</button>
```

## Currency Handling

### Norwegian Øre (Minor Units)
Vipps uses **øre** (1/100 of NOK) for all amounts:
- 1 NOK = 100 øre
- 10.50 NOK = 1050 øre
- 0.50 NOK = 50 øre

### Conversion in Code
```javascript
// Frontend: NOK to øre
const amountInOre = Math.round(priceInNOK * 100);

// Display: øre to NOK
const priceInNOK = (amountInOre / 100).toFixed(2);
```

## Error Handling

### Common Capture Errors
```javascript
try {
  await captureVippsPayment({ reference, amountValue });
} catch (error) {
  if (error.message.includes('already captured')) {
    // Payment was already captured
  } else if (error.message.includes('not found')) {
    // Payment doesn't exist or wrong reference
  } else if (error.message.includes('insufficient funds')) {
    // Customer account issues
  }
}
```

### Retry Logic
```javascript
// Auto-capture with retry
const captureWithRetry = async (reference, amount, maxRetries = 3) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await captureVippsPayment({ reference, amountValue: amount });
    } catch (error) {
      if (attempt === maxRetries) throw error;
      
      // Wait before retry (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, attempt * 1000));
    }
  }
};
```

## Security Considerations

### Environment Variables
```javascript
// Production URLs
VIPPS_OAUTH_URL=https://api.vipps.no/accesstoken/get
VIPPS_PAYMENT_URL=https://api.vipps.no/epayment/v1/payments

// Test URLs
VIPPS_OAUTH_URL=https://apitest.vipps.no/accesstoken/get
VIPPS_PAYMENT_URL=https://apitest.vipps.no/epayment/v1/payments
```

### API Keys Protection
```javascript
// Backend only - never in frontend
const VIPPS_CLIENT_SECRET = process.env.VIPPS_CLIENT_SECRET;
const VIPPS_SUBSCRIPTION_KEY = process.env.VIPPS_SUBSCRIPTION_KEY;
```

## Monitoring & Logging

### Success Logs
```javascript
console.log('✅ Payment created:', { reference, amount });
console.log('✅ Auto-capture successful:', { reference, captureResult });
console.log('✅ Order status updated to CAPTURED');
```

### Error Logs
```javascript
console.error('❌ Auto-capture failed:', error.message);
console.error('❌ Firestore update failed:', error);
```

## Customer Experience Timeline

### Successful Payment Flow
```
1. [0s] Customer clicks "Betal med Vipps"
2. [1s] Redirected to Vipps app/website  
3. [30s] Customer authenticates and confirms payment
4. [31s] Redirected back to our PaymentReturn page
5. [33s] Auto-capture completes (2s delay)
6. [33s] Order saved with CAPTURED status
7. [33s] Customer sees "Takk for din bestilling!" page
```

### Total Time: ~33 seconds from click to completed payment

This auto-capture flow ensures a smooth, fully automated payment experience for
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();

// Enable CORS for production domains
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001', 
  'https://your-customer-app.onrender.com', // Replace with your my-app URL
  'https://your-admin-app.onrender.com'     // Replace with your pws-con URL
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Parse JSON bodies
const admin = require('firebase-admin');

// Debug: Log environment variables (remove in production)
console.log('Firebase Project ID:', process.env.FIREBASE_PROJECT_ID);
console.log('Firebase Client Email:', process.env.FIREBASE_CLIENT_EMAIL);

if (!admin.apps.length) {
  const serviceAccountConfig = {
    type: process.env.FIREBASE_TYPE,
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: process.env.FIREBASE_AUTH_URI,
    token_uri: process.env.FIREBASE_TOKEN_URI,
    auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
    client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
    universe_domain: process.env.FIREBASE_UNIVERSE_DOMAIN,
  };
  
  // Debug: Check if all required fields are present
  console.log('Service account config:', JSON.stringify(serviceAccountConfig, null, 2));
  
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccountConfig),
  });
}
const firestore = admin.firestore();
app.use(express.json());

// Load env variables - TEST URLS
const {
  VIPPS_CLIENT_ID,
  VIPPS_CLIENT_SECRET,
  VIPPS_SUBSCRIPTION_KEY,
  VIPPS_MERCHANT_SERIAL_NUMBER,
  VIPPS_SYSTEM_NAME,
  VIPPS_SYSTEM_VERSION,
  VIPPS_PLUGIN_NAME,
  VIPPS_PLUGIN_VERSION,
  // TEST ENDPOINTS
  VIPPS_OAUTH_URL = 'https://apitest.vipps.no/accesstoken/get',
  VIPPS_PAYMENT_URL = 'https://apitest.vipps.no/epayment/v1/payments',
} = process.env;

// Function to get Vipps access token
async function getAccessToken() {
  try {
    const response = await axios.post(
      VIPPS_OAUTH_URL,
      {},
      {
        headers: {
          'Content-Type': 'application/json',
          client_id: VIPPS_CLIENT_ID,
          client_secret: VIPPS_CLIENT_SECRET,
          'Ocp-Apim-Subscription-Key': VIPPS_SUBSCRIPTION_KEY,
          'Merchant-Serial-Number': VIPPS_MERCHANT_SERIAL_NUMBER,
        },
      }
    );
    return response.data.access_token;
  } catch (error) {
    console.error('Error getting Vipps access token:', error.response?.data || error.message);
    throw error;
  }
}

// API endpoint to create payment
app.post('/create-payment', async (req, res) => {
  const { amountValue, phoneNumber, reference, returnUrl, paymentDescription } = req.body;

  try {
    const accessToken = await getAccessToken();

    const paymentPayload = {
      amount: { currency: 'NOK', value: amountValue },
      paymentMethod: { type: 'WALLET' },
      customer: { phoneNumber },
      reference,
      returnUrl,
      userFlow: 'WEB_REDIRECT',
      paymentDescription,
    };

    const idempotencyKey = `order-${Date.now()}`;

    const response = await axios.post(VIPPS_PAYMENT_URL, paymentPayload, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Ocp-Apim-Subscription-Key': VIPPS_SUBSCRIPTION_KEY,
        'Merchant-Serial-Number': VIPPS_MERCHANT_SERIAL_NUMBER,
        'Vipps-System-Name': VIPPS_SYSTEM_NAME,
        'Vipps-System-Version': VIPPS_SYSTEM_VERSION,
        'Vipps-System-Plugin-Name': VIPPS_PLUGIN_NAME,
        'Vipps-System-Plugin-Version': VIPPS_PLUGIN_VERSION,
        'Idempotency-Key': idempotencyKey,
        'Content-Type': 'application/json',
      },
    });

    // Log the full Vipps payment response (no masking)
    console.log('Vipps payment response:', JSON.stringify(response.data, null, 2));

    const vippsResponse = response.data;
    let vippsRedirectUrl = vippsResponse.url || vippsResponse.redirectUrl;
    const pspReference = vippsResponse.pspReference;

    if (!vippsRedirectUrl) {
      const token =
        vippsResponse.token ||
        vippsResponse.paymentToken ||
        vippsResponse.data?.token ||
        null;

      if (!token) {
        console.warn('Vipps payment token or redirect URL not found in response');
        return res.status(500).json({ error: 'Vipps payment token not found' });
      }

      vippsRedirectUrl = `https://api.vipps.no/dwo-api-application/v1/deeplink/vippsgateway?v=2&token=${token}`;
    }

    // Log the actual Vipps redirect URL to the terminal
    console.log('Vipps redirect URL:', vippsRedirectUrl);

    return res.json({ url: vippsRedirectUrl, reference, pspReference });
  } catch (error) {
    console.error('Error creating Vipps payment:', error.response?.data || error.message);
    return res.status(500).json({
      error: 'Failed to create Vipps payment',
      details: error.response?.data || error.message,
    });
  }
});

// Capture payment endpoint - CHANGE TO TEST URL
app.post('/capture-payment', async (req, res) => {
  const { reference, amountValue, userId } = req.body;
  try {
    const accessToken = await getAccessToken();
    const capturePayload = {
      modificationAmount: { currency: 'NOK', value: amountValue }
    };
    // CHANGE TO TEST URL
    const url = `https://apitest.vipps.no/epayment/v1/payments/${reference}/capture`;
    const response = await axios.post(
      url,
      capturePayload,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Ocp-Apim-Subscription-Key': VIPPS_SUBSCRIPTION_KEY,
          'Merchant-Serial-Number': VIPPS_MERCHANT_SERIAL_NUMBER,
          'Content-Type': 'application/json',
          'Idempotency-Key': uuidv4(),
        },
      }
    );
    console.log(`🧪 TEST: Vipps payment captured for reference: ${reference}, amount: ${(amountValue / 100).toFixed(2)} NOK`);
    
    // --- UPDATE FIRESTORE ORDER DOC ---
    try {
      if (userId && reference) {
        const ordersCol = firestore.collection('users').doc(userId).collection('newOrders');
        const orderSnap = await ordersCol.where('orderReference', '==', reference).get();
        if (!orderSnap.empty) {
          const orderDoc = orderSnap.docs[0];
          const orderRef = orderDoc.ref;
          const orderData = orderDoc.data();
          
          // Update capture status and timestamp
          await orderRef.update({
            captureStatus: 'CAPTURED',
            capturedAt: new Date().toISOString(),
            capturedAmount: amountValue / 100 // Store in NOK
          });
          
          // ALSO update the vippsCaptureResponse.aggregate.capturedAmount to keep it in sync
          if (orderData.vippsCaptureResponse && orderData.vippsCaptureResponse.aggregate) {
            await orderRef.update({
              'vippsCaptureResponse.aggregate.capturedAmount.value': amountValue
            });
            
            console.log(`💰 Updated Vipps capturedAmount: ${amountValue} øre`);
          }
          
          console.log(`✅ Firestore updated successfully for capture ${reference}`);
        }
      }
    } catch (firestoreError) {
      console.error('⚠️ Firestore update failed (capture still processed by Vipps):', firestoreError.message);
      // Don't fail the capture if Firestore update fails
    }
    
    res.json(response.data);
  } catch (error) {
    console.error('Error capturing Vipps payment:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Failed to capture Vipps payment',
      details: error.response?.data || error.message,
    });
  }
});

// Get payment details endpoint - CHANGE TO TEST URL
app.get('/payment-details/:reference', async (req, res) => {
  const { reference } = req.params;
  try {
    const accessToken = await getAccessToken();
    // CHANGE TO TEST URL
    const url = `https://apitest.vipps.no/epayment/v1/payments/${reference}`;
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Ocp-Apim-Subscription-Key': VIPPS_SUBSCRIPTION_KEY,
        'Merchant-Serial-Number': VIPPS_MERCHANT_SERIAL_NUMBER,
        'Content-Type': 'application/json',
      },
    });
    console.log(`🧪 TEST: Payment details for ${reference}:`, JSON.stringify(response.data, null, 2));
    res.json(response.data);
  } catch (error) {
    console.error('Error getting payment details:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Failed to get payment details',
      details: error.response?.data || error.message,
    });
  }
});

// Refund payment endpoint - CHANGE TO TEST URL
app.post('/refund-payment', async (req, res) => {
  const { reference, amountValue, userId, itemName, refundQty } = req.body;
  try {
    const accessToken = await getAccessToken();
    const refundPayload = {
      modificationAmount: { currency: 'NOK', value: amountValue }
    };
    // CHANGE TO TEST URL
    const url = `https://apitest.vipps.no/epayment/v1/payments/${reference}/refund`;
    const response = await axios.post(
      url,
      refundPayload,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Ocp-Apim-Subscription-Key': VIPPS_SUBSCRIPTION_KEY,
          'Merchant-Serial-Number': VIPPS_MERCHANT_SERIAL_NUMBER,
          'Content-Type': 'application/json',
          'Idempotency-Key': uuidv4(),
        },
      }
    );
    console.log(
      `🧪 TEST: Vipps payment refunded for reference: ${reference}, amount: ${amountValue} øre, conversion: ${(amountValue / 100).toFixed(2)} NOK`
    );

    // --- UPDATE FIRESTORE ORDER DOC ---
    // Find the user and order doc by reference
    try {
      if (userId && reference) {
        const ordersCol = firestore.collection('users').doc(userId).collection('newOrders');
        const orderSnap = await ordersCol.where('orderReference', '==', reference).get();
        if (!orderSnap.empty) {
          const orderDoc = orderSnap.docs[0];
          const orderRef = orderDoc.ref;
          const orderData = orderDoc.data();
          
          // Update our custom tracking fields
          if (itemName && refundQty) {
            // Partial item refund: update refundedItems
            const prevRefunded = orderData.refundedItems || {};
            const key = `${reference}_${itemName}`;
            const prevQty = prevRefunded[key] || 0;
            prevRefunded[key] = prevQty + refundQty;
            await orderRef.update({ refundedItems: prevRefunded });
          } else {
            // Full order refund
            await orderRef.update({ fullyRefunded: true });
          }
          
          // ALSO update the vippsCaptureResponse.aggregate.refundedAmount to keep it in sync
          if (orderData.vippsCaptureResponse && orderData.vippsCaptureResponse.aggregate) {
            const currentRefunded = orderData.vippsCaptureResponse.aggregate.refundedAmount?.value || 0;
            const newRefundedAmount = currentRefunded + amountValue;
            
            await orderRef.update({
              'vippsCaptureResponse.aggregate.refundedAmount.value': newRefundedAmount
            });
            
            console.log(`💰 Updated Vipps refundedAmount: ${currentRefunded} + ${amountValue} = ${newRefundedAmount} øre`);
          }
          
          console.log(`✅ Firestore updated successfully for refund ${reference}`);
        }
      }
    } catch (firestoreError) {
      console.error('⚠️ Firestore update failed (refund still processed by Vipps):', firestoreError.message);
      // Don't fail the refund if Firestore update fails
    }

    res.json(response.data);
  } catch (error) {
    console.error('Error refunding Vipps payment:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Failed to refund Vipps payment',
      details: error.response?.data || error.message,
    });
  }
});

// Optionally serve static files for both frontends
// Uncomment and adjust the following if you want to serve both builds from the backend
// const myAppBuildPath = path.resolve(__dirname, '../my-app/build');
// const pwsConBuildPath = path.resolve(__dirname, '../pws-con/build');
// app.use('/my-app', express.static(myAppBuildPath));
// app.use('/pws-con', express.static(pwsConBuildPath));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🧪 Vipps TESTING backend listening on port ${PORT}`);
});

const express = require('express');
const router = express.Router();
const { sendReceiptEmail } = require('../services/emailService');

// Send receipt email
router.post('/send-receipt', async (req, res) => {
  console.log('📧 Backend: Email route hit - /api/email/send-receipt');
  console.log('📧 Backend: Request body:', req.body);
  
  try {
    const { recipientEmail, orderDetails } = req.body;

    if (!recipientEmail || !orderDetails) {
      console.log('❌ Backend: Missing required fields');
      return res.status(400).json({ 
        success: false, 
        error: 'Missing recipientEmail or orderDetails' 
      });
    }

    console.log('📧 Backend: Calling sendReceiptEmail...');
    const result = await sendReceiptEmail(recipientEmail, orderDetails);

    if (result.success) {
      console.log('✅ Backend: Email sent successfully');
      res.json({ success: true, message: 'Email sent successfully', data: result.data });
    } else {
      console.log('❌ Backend: Email failed to send');
      res.status(500).json({ success: false, error: result.error });
    }
  } catch (error) {
    console.error('❌ Backend: Email route error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;

const sendReceiptEmail = async (recipientEmail, orderDetails) => {
  console.log('📧 Frontend: sendReceiptEmail called with:', {
    recipient: recipientEmail,
    orderDetails: orderDetails
  });
  
  try {
    const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:4000';
    console.log('📧 Frontend: Using backend URL:', backendUrl);
    
    const payload = {
      recipientEmail,
      orderDetails
    };
    console.log('📧 Frontend: Sending payload:', payload);
    
    const response = await fetch(`${backendUrl}/api/email/send-receipt`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    console.log('📧 Frontend: Response status:', response.status);
    console.log('📧 Frontend: Response ok:', response.ok);
    
    const result = await response.json();
    console.log('📧 Frontend: Response data:', result);

    if (result.success) {
      console.log('Receipt email sent successfully');
      return { success: true };
    } else {
      console.error('Failed to send email:', result.error);
      return { success: false, error: result.error };
    }
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
};

export { sendReceiptEmail };

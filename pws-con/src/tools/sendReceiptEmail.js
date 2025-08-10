const sendReceiptEmail = async (recipientEmail, orderDetails) => {
  try {
    const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:4000';
    
    const response = await fetch(`${backendUrl}/api/email/send-receipt`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        recipientEmail,
        orderDetails
      }),
    });

    const result = await response.json();

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

const sendCustomEmail = async (recipientEmail, subject, message) => {
  try {
    const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:4000';
    
    const response = await fetch(`${backendUrl}/api/email/send-custom`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        recipientEmail,
        subject,
        message
      }),
    });

    const result = await response.json();

    if (result.success) {
      console.log('Custom email sent successfully');
      return { success: true };
    } else {
      console.error('Failed to send custom email:', result.error);
      return { success: false, error: result.error };
    }
  } catch (error) {
    console.error('Error sending custom email:', error);
    return { success: false, error: error.message };
  }
};

export { sendReceiptEmail, sendCustomEmail };
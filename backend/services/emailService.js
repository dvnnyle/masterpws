const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const sendReceiptEmail = async (recipientEmail, orderDetails) => {
  console.log('📧 Backend: sendReceiptEmail called with:', {
    recipient: recipientEmail,
    orderNumber: orderDetails.orderNumber,
    totalAmount: orderDetails.totalAmount
  });
  
  try {
    console.log('📧 Backend: Attempting to send email via Resend...');
    const { data, error } = await resend.emails.send({
      from: 'Acme <onboarding@resend.dev>', // Using Resend's verified domain for testing
      to: [recipientEmail],
      subject: `Kvittering for din bestilling - Ordrenummer: ${orderDetails.orderNumber}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>PlayWorld - Kvittering</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f5f7fa; font-family: 'Poppins', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);">
            
            <!-- Header with gradient background -->
            <div style="background: linear-gradient(135deg, #010f3c 0%, #1a237e 100%); padding: 40px 30px; text-align: center; border-radius: 0;">
              <h1 style="color: #ffffff; font-size: 32px; margin: 0; font-weight: 600; text-shadow: 0 2px 4px rgba(0,0,0,0.2); font-family: 'Poppins', sans-serif;">PlayWorld</h1>
              <p style="color: #e8eaf6; font-size: 18px; margin: 8px 0 0 0; font-weight: 400;">Takk for din bestilling!</p>
              <div style="width: 60px; height: 3px; background-color: #fcca0b; margin: 15px auto; border-radius: 2px;"></div>
            </div>

            <div style="padding: 30px;">
              
              <!-- Success Message -->
              <div style="background: linear-gradient(135deg, #20b14c 0%, #1b5e20 100%); color: white; padding: 20px; border-radius: 12px; margin-bottom: 25px; text-align: center; box-shadow: 0 4px 12px rgba(32, 177, 76, 0.2);">
                <h2 style="margin: 0; font-size: 20px; font-weight: 600; font-family: 'Poppins', sans-serif;">✅ Bestilling bekreftet</h2>
                <p style="margin: 8px 0 0 0; opacity: 0.9; font-size: 14px;">Din betaling er mottatt og behandlet</p>
              </div>

              <!-- Customer Information -->
              <div style="background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%); padding: 25px; border-radius: 12px; margin-bottom: 25px; border-left: 5px solid #010f3c; box-shadow: 0 2px 8px rgba(1, 15, 60, 0.1);">
                <h2 style="color: #010f3c; font-size: 18px; margin: 0 0 15px 0; font-weight: 600; font-family: 'Poppins', sans-serif;">
                  👤 Kundeinformasjon
                </h2>
                <div style="display: grid; gap: 8px;">
                  ${orderDetails.buyerName ? `
                  <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid rgba(1, 15, 60, 0.1);">
                    <span style="font-weight: 600; color: #010f3c;">Navn:</span>
                    <span style="color: #010f3c;">${orderDetails.buyerName}</span>
                  </div>` : ''}
                  <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid rgba(1, 15, 60, 0.1);">
                    <span style="font-weight: 600; color: #010f3c;">E-post:</span>
                    <span style="color: #010f3c;">${recipientEmail}</span>
                  </div>
                  ${orderDetails.phoneNumber ? `
                  <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0;">
                    <span style="font-weight: 600; color: #010f3c;">Telefon:</span>
                    <span style="color: #010f3c;">${orderDetails.phoneNumber}</span>
                  </div>` : ''}
                </div>
              </div>

              <!-- Order Details -->
              <div style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); padding: 25px; border-radius: 12px; margin-bottom: 25px; border-left: 5px solid #fcca0b; box-shadow: 0 2px 8px rgba(252, 202, 11, 0.1);">
                <h2 style="color: #010f3c; font-size: 18px; margin: 0 0 15px 0; font-weight: 600; font-family: 'Poppins', sans-serif;">
                  📋 Bestillingsdetaljer
                </h2>
                <div style="display: grid; gap: 8px;">
                  <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid rgba(252, 202, 11, 0.1);">
                    <span style="font-weight: 600; color: #010f3c;">Ordrenummer:</span>
                    <span style="color: #fcca0b; font-weight: 600; font-family: monospace; background: #010f3c; padding: 4px 8px; border-radius: 4px;">#${orderDetails.orderNumber}</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid rgba(252, 202, 11, 0.1);">
                    <span style="font-weight: 600; color: #010f3c;">Dato:</span>
                    <span style="color: #010f3c;">${new Date(orderDetails.purchaseDate).toLocaleDateString('no-NO', { 
                      day: '2-digit',
                      month: '2-digit', 
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}</span>
                  </div>
                  ${orderDetails.pspReference ? `
                  <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid rgba(252, 202, 11, 0.1);">
                    <span style="font-weight: 600; color: #010f3c;">Betalingsref:</span>
                    <span style="color: #010f3c; font-family: monospace; font-size: 12px;">${orderDetails.pspReference}</span>
                  </div>` : ''}
                  ${orderDetails.paymentMethod ? `
                  <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid rgba(252, 202, 11, 0.1);">
                    <span style="font-weight: 600; color: #010f3c;">Betalingsmetode:</span>
                    <span style="color: #010f3c;">${orderDetails.paymentMethod}</span>
                  </div>` : ''}
                  <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; background: linear-gradient(135deg, #20b14c 0%, #1b5e20 100%); margin: 8px -8px 0 -8px; padding-left: 16px; padding-right: 16px; border-radius: 8px;">
                    <span style="font-weight: 700; color: #ffffff; font-size: 16px;">💰 Totalt betalt:</span>
                    <span style="color: #fcca0b; font-weight: 700; font-size: 18px;">${orderDetails.totalAmount} kr</span>
                  </div>
                </div>
              </div>

              <!-- Products -->
              <div style="background: #ffffff; border: 2px solid #e2e8f0; border-radius: 12px; overflow: hidden; margin-bottom: 25px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);">
                <div style="background: linear-gradient(135deg, #fcca0b 0%, #f9a825 100%); padding: 20px; color: #010f3c;">
                  <h3 style="margin: 0; font-size: 18px; font-weight: 600; font-family: 'Poppins', sans-serif;">
                    🛍️ Produkter
                  </h3>
                </div>
                <div style="padding: 0;">
                  ${orderDetails.items.map((item, index) => `
                    <div style="padding: 20px; border-bottom: ${index < orderDetails.items.length - 1 ? '1px solid #e2e8f0' : 'none'}; background: ${index % 2 === 0 ? '#ffffff' : '#f8fafc'};">
                      <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                          <h4 style="margin: 0 0 5px 0; color: #010f3c; font-size: 16px; font-weight: 600; font-family: 'Poppins', sans-serif;">${item.name}</h4>
                          <p style="margin: 0; color: #64748b; font-size: 14px;">Antall: ${item.quantity} stk</p>
                        </div>
                        <div style="text-align: right;">
                          <div style="color: #010f3c; font-weight: 600; font-size: 16px;">${item.quantity * item.price} kr</div>
                          <div style="color: #64748b; font-size: 12px;">${item.price} kr/stk</div>
                        </div>
                      </div>
                    </div>
                  `).join('')}
                </div>
              </div>

              <!-- Footer -->
              <div style="text-align: center; padding: 25px 0; border-top: 2px solid #e2e8f0; margin-top: 30px;">
                <div style="background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%); padding: 20px; border-radius: 12px; margin-bottom: 20px; border: 1px solid #010f3c;">
                  <h3 style="margin: 0 0 10px 0; color: #010f3c; font-size: 16px; font-weight: 600; font-family: 'Poppins', sans-serif;">📞 Trenger du hjelp?</h3>
                  <p style="margin: 0; color: #010f3c; font-size: 14px; line-height: 1.5;">
                    Kontakt oss på PlayWorld Norge<br>
                    Vi er her for å hjelpe deg!
                  </p>
                </div>
                <p style="color: #94a3b8; font-size: 11px; margin: 0; font-style: italic;">
                  Dette er en automatisk generert kvittering fra PlayWorld<br>
                  (Test email - sent via Resend verified domain)
                </p>
              </div>

            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error('Resend email error:', error);
      return { success: false, error };
    }

    console.log('Email sent successfully:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Email service error:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendReceiptEmail
};

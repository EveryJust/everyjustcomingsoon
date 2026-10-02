import nodemailer from 'nodemailer';

interface SendOrderEmailParams {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  shippingAddress: {
    fullName: string;
    phone: string;
    alternatePhone?: string;
    street: string;
    city: string;
    state: string;
    pincode: string;
    landmark?: string;
  };
  items: Array<{
    name: string;
    image?: string;
    price: number;
    qty: number;
  }>;
  subtotal: number;
  shippingAmount: number;
  totalAmount: number;
  paymentMethod: string;
}

export async function sendOrderConfirmationEmail(params: SendOrderEmailParams) {
  try {
    const user = process.env.APP_EMAIL || 'everyjustofficial@gmail.com';
    const rawPass = process.env.APP_PASSWORD || '';
    const pass = rawPass.replace(/\s+/g, '');

    if (!user || !pass) {
      console.warn('Email credentials not configured in environment variables.');
      return { success: false, error: 'Email credentials missing' };
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user,
        pass,
      },
    });

    const itemsRows = params.items.map(item => `
      <tr style="border-bottom: 1px solid #f0f0f0;">
        <td style="padding: 12px 8px; vertical-align: middle;">
          ${item.image ? `<img src="${item.image.startsWith('http') ? item.image : `https://everyjust.com${item.image}`}" alt="${item.name}" width="50" height="50" style="object-fit: contain; border-radius: 6px; border: 1px solid #eee; margin-right: 10px; vertical-align: middle;" />` : ''}
          <strong style="color: #222; font-size: 14px;">${item.name}</strong>
        </td>
        <td style="padding: 12px 8px; text-align: center; color: #555; font-size: 14px;">${item.qty}</td>
        <td style="padding: 12px 8px; text-align: right; color: #111; font-weight: bold; font-size: 14px;">₹${(item.price * item.qty).toFixed(2)}</td>
      </tr>
    `).join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Confirmation - ${params.orderNumber}</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f7f9fa; margin: 0; padding: 20px 10px; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05); border: 1px solid #eee;">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #1A1C29 0%, #2A2D3E 100%); padding: 32px 24px; text-align: center; color: #ffffff;">
            <h1 style="margin: 0; font-size: 26px; font-weight: 900; letter-spacing: 1px; color: #90b800;">EveryJust</h1>
            <p style="margin: 8px 0 0; font-size: 14px; color: #d0d4dc;">Order Confirmed & Being Prepared</p>
          </div>

          <!-- Hero Greeting -->
          <div style="padding: 28px 24px 16px;">
            <div style="display: inline-block; background-color: #E8F5E9; color: #2E7D32; font-size: 12px; font-weight: bold; padding: 4px 12px; border-radius: 20px; margin-bottom: 12px;">
              ✓ Cash on Delivery (Free Delivery)
            </div>
            <h2 style="margin: 0 0 10px; font-size: 20px; color: #111;">Thank you for your order, ${params.customerName}!</h2>
            <p style="margin: 0; font-size: 14px; color: #666; line-height: 1.5;">
              We have received your order <strong>#${params.orderNumber}</strong>. You do not need to pay anything right now. Please keep cash or UPI ready when our delivery executive arrives.
            </p>
          </div>

          <!-- Order Summary Details -->
          <div style="padding: 0 24px 20px;">
            <div style="background-color: #fcfcfc; border: 1px solid #eef0f2; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
              <table style="width: 100%; font-size: 13px; color: #555;">
                <tr>
                  <td style="padding: 4px 0;"><strong>Order Number:</strong></td>
                  <td style="padding: 4px 0; text-align: right; color: #111; font-family: monospace; font-weight: bold;">${params.orderNumber}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0;"><strong>Order Date:</strong></td>
                  <td style="padding: 4px 0; text-align: right;">${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0;"><strong>Payment Method:</strong></td>
                  <td style="padding: 4px 0; text-align: right; color: #90b800; font-weight: bold;">Cash on Delivery (Free)</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0;"><strong>Est. Delivery:</strong></td>
                  <td style="padding: 4px 0; text-align: right; font-weight: bold; color: #333;">3 - 5 Business Days</td>
                </tr>
              </table>
            </div>

            <!-- Items Table -->
            <h3 style="margin: 0 0 12px; font-size: 16px; color: #111;">Items Ordered</h3>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
              <thead>
                <tr style="border-bottom: 2px solid #eee; text-align: left; font-size: 12px; color: #888; text-transform: uppercase;">
                  <th style="padding: 8px;">Product</th>
                  <th style="padding: 8px; text-align: center;">Qty</th>
                  <th style="padding: 8px; text-align: right;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsRows}
              </tbody>
            </table>

            <!-- Financial Summary -->
            <div style="border-top: 1px solid #eee; padding-top: 12px; margin-bottom: 24px;">
              <table style="width: 100%; font-size: 14px;">
                <tr>
                  <td style="padding: 6px 0; color: #666;">Subtotal</td>
                  <td style="padding: 6px 0; text-align: right; font-weight: 500;">₹${params.subtotal.toFixed(2)}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #666;">Shipping Fee</td>
                  <td style="padding: 6px 0; text-align: right; color: #2E7D32; font-weight: bold;">FREE</td>
                </tr>
                <tr style="border-top: 2px solid #111;">
                  <td style="padding: 12px 0 4px; font-size: 16px; font-weight: 900; color: #111;">Total Payable at Delivery</td>
                  <td style="padding: 12px 0 4px; text-align: right; font-size: 18px; font-weight: 900; color: #111;">₹${params.totalAmount.toFixed(2)}</td>
                </tr>
              </table>
            </div>

            <!-- Delivery Address Card -->
            <div style="background-color: #f9f9fb; border-radius: 12px; padding: 18px; border: 1px solid #eceff1; margin-bottom: 20px;">
              <h4 style="margin: 0 0 8px; font-size: 14px; text-transform: uppercase; color: #666; letter-spacing: 0.5px;">Shipping Address</h4>
              <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #222;">
                <strong>${params.shippingAddress.fullName}</strong><br/>
                ${params.shippingAddress.street}${params.shippingAddress.landmark ? `, ${params.shippingAddress.landmark}` : ''}<br/>
                ${params.shippingAddress.city}, ${params.shippingAddress.state} - ${params.shippingAddress.pincode}<br/>
                <strong>Phone:</strong> ${params.shippingAddress.phone}${params.shippingAddress.alternatePhone ? `<br/><strong>Alt Phone:</strong> ${params.shippingAddress.alternatePhone}` : ''}
              </p>
            </div>
          </div>

          <!-- Footer -->
          <div style="background-color: #fafafa; border-top: 1px solid #eeeeee; padding: 20px; text-align: center; font-size: 12px; color: #888;">
            <p style="margin: 0 0 6px;">Need help with your order? Reply directly to this email or reach us at ${user}.</p>
            <p style="margin: 0; color: #aaa;">© ${new Date().getFullYear()} EveryJust Official. All rights reserved.</p>
          </div>

        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: `"EveryJust Store" <${user}>`,
      to: params.customerEmail,
      bcc: user, // Also send a copy to merchant
      subject: `Order Confirmed: #${params.orderNumber} - EveryJust`,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Order email sent successfully! MessageId:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (err: any) {
    console.error('Failed to send order email:', err);
    return { success: false, error: err?.message || 'Error sending email' };
  }
}

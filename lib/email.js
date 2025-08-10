import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

export const sendOrderConfirmationEmail = async (to, orderDetails) => {
  const mailOptions = {
    from: process.env.MAIL_USER,
    to,
    subject: 'Order Confirmation - Hafiz Tech',
    html: `
      <h2>Thank you for your order!</h2>
      <p>Order ID: ${orderDetails.id}</p>
      <p>Total Amount: $${orderDetails.totalAmount}</p>
      <p>Status: ${orderDetails.status}</p>
      <p>We'll notify you when your order ships.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};
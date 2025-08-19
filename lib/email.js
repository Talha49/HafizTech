// Send admin notification for new order
export const sendAdminNewOrderEmail = async (adminEmail, orderDetails) => {
  const { id, totalAmount, status, items = [], shippingAddress = {}, user = {} } = orderDetails;
  const itemsTable = items.length
    ? `<table border="1" cellpadding="8" cellspacing="0" style="border-collapse:collapse; width:100%;">
        <thead>
          <tr>
            <th>Image</th>
            <th>Title</th>
            <th>Quantity</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>
          ${items.map(item => `
            <tr>
              <td><img src="${item.image}" alt="${item.title}" width="60" style="border-radius:8px;" /></td>
              <td>${item.title}</td>
              <td>${item.quantity}</td>
              <td>$${item.price}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>`
    : '<p>No items found in this order.</p>';

  const shippingInfo = shippingAddress.name || shippingAddress.address
    ? `<h3>Shipping Address</h3>
        <p>
          ${shippingAddress.name ? shippingAddress.name + '<br/>' : ''}
          ${shippingAddress.address ? shippingAddress.address + '<br/>' : ''}
          ${shippingAddress.contact ? 'Contact: ' + shippingAddress.contact : ''}
        </p>`
    : '';

  const userInfo = user.name || user.email
    ? `<h3>Customer Info</h3>
        <p>
          ${user.name ? 'Name: ' + user.name + '<br/>' : ''}
          ${user.email ? 'Email: ' + user.email + '<br/>' : ''}
        </p>`
    : '';

  const mailOptions = {
    from: process.env.MAIL_USER,
    to: adminEmail,
    subject: `New Order Placed - Hafiz Tech (Order #${id})`,
    html: `
      <h2>New Order Received</h2>
      <p>Order ID: <b>${id}</b></p>
      <p>Status: <b>${status}</b></p>
      ${userInfo}
      ${itemsTable}
      <p><b>Total Amount:</b> $${totalAmount}</p>
      ${shippingInfo}
      <p>Login to the admin panel for more details.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};
// Send order status update email
export const sendOrderStatusUpdateEmail = async (to, orderDetails) => {
  const { id, totalAmount, status, items = [], shippingAddress = {}, user = {} } = orderDetails;
  const itemsTable = items.length
    ? `<table border="1" cellpadding="8" cellspacing="0" style="border-collapse:collapse; width:100%;">
        <thead>
          <tr>
            <th>Image</th>
            <th>Title</th>
            <th>Quantity</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>
          ${items.map(item => `
            <tr>
              <td><img src="${item.image}" alt="${item.title}" width="60" style="border-radius:8px;" /></td>
              <td>${item.title}</td>
              <td>${item.quantity}</td>
              <td>$${item.price}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>`
    : '<p>No items found in your order.</p>';

  const shippingInfo = shippingAddress.name || shippingAddress.address
    ? `<h3>Shipping Address</h3>
        <p>
          ${shippingAddress.name ? shippingAddress.name + '<br/>' : ''}
          ${shippingAddress.address ? shippingAddress.address + '<br/>' : ''}
          ${shippingAddress.contact ? 'Contact: ' + shippingAddress.contact : ''}
        </p>`
    : '';

  const mailOptions = {
    from: process.env.MAIL_USER,
    to,
    subject: `Order Status Updated - Hafiz Tech (Order #${id})`,
    html: `
      <h2>Hello${user.name ? ' ' + user.name : ''},</h2>
      <p>The status of your order <b>${id}</b> has been updated to: <b>${status}</b>.</p>
      ${itemsTable}
      <p><b>Total Amount:</b> $${totalAmount}</p>
      ${shippingInfo}
      <p>If you have any questions, please contact our support team.</p>
      <p>Thank you for shopping with Hafiz Tech!</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

export const sendOrderConfirmationEmail = async (to, orderDetails) => {
  const { id, totalAmount, status, items = [], shippingAddress = {}, user = {} } = orderDetails;
  const itemsTable = items.length
    ? `<table border="1" cellpadding="8" cellspacing="0" style="border-collapse:collapse; width:100%;">
        <thead>
          <tr>
            <th>Image</th>
            <th>Title</th>
            <th>Quantity</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>
          ${items.map(item => `
            <tr>
              <td><img src="${item.image}" alt="${item.title}" width="60" style="border-radius:8px;" /></td>
              <td>${item.title}</td>
              <td>${item.quantity}</td>
              <td>$${item.price}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>`
    : '<p>No items found in your order.</p>';

  const shippingInfo = shippingAddress.name || shippingAddress.address
    ? `<h3>Shipping Address</h3>
        <p>
          ${shippingAddress.name ? shippingAddress.name + '<br/>' : ''}
          ${shippingAddress.address ? shippingAddress.address + '<br/>' : ''}
          ${shippingAddress.contact ? 'Contact: ' + shippingAddress.contact : ''}
        </p>`
    : '';

  const mailOptions = {
    from: process.env.MAIL_USER,
    to,
    subject: 'Order Confirmation - Hafiz Tech',
    html: `
      <h2>Thank you for your order${user.name ? ', ' + user.name : ''}!</h2>
      <p>Order ID: <b>${id}</b></p>
      <p>Status: <b>${status}</b></p>
      ${itemsTable}
      <p><b>Total Amount:</b> $${totalAmount}</p>
      ${shippingInfo}
      <p>We'll notify you when your order ships.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};
/// <reference path="../pb_data/types.d.ts" />
onRecordAfterCreateSuccess((e) => {
  const message = new MailerMessage({
    from: {
      address: $app.settings().meta.senderAddress,
      name: $app.settings().meta.senderName
    },
    to: [{ address: e.record.get("customer_email") }],
    subject: "Order Confirmation #" + e.record.id,
    html: "<h1>Thank you for your order!</h1><p><strong>Order ID:</strong> " + e.record.id + "</p><p><strong>Customer Name:</strong> " + e.record.get("customer_name") + "</p><p><strong>Status:</strong> " + e.record.get("status") + "</p><p><strong>Total:</strong> $" + (e.record.get("total") || "0.00") + "</p><p>We will notify you when your order ships.</p>"
  });
  $app.newMailClient().send(message);
  e.next();
}, "orders");
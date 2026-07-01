/// <reference path="../pb_data/types.d.ts" />
onRecordUpdate((e) => {
  const newStatus = e.record.get("status");
  const oldStatus = e.record.original().get("status");
  
  if (newStatus === "Shipped" && oldStatus !== "Shipped") {
    const message = new MailerMessage({
      from: {
        address: $app.settings().meta.senderAddress,
        name: $app.settings().meta.senderName
      },
      to: [{ address: e.record.get("customer_email") }],
      subject: "Your Order Has Shipped! #" + e.record.id,
      html: "<h1>Your order has shipped!</h1><p><strong>Order ID:</strong> " + e.record.id + "</p><p><strong>Customer Name:</strong> " + e.record.get("customer_name") + "</p>" + (e.record.get("tracking_url") ? "<p><strong>Tracking:</strong> <a href=\"" + e.record.get("tracking_url") + "\">Click here to track your package</a></p>" : "") + "<p>Thank you for your purchase!</p>"
    });
    $app.newMailClient().send(message);
  }
  
  e.next();
}, "orders");